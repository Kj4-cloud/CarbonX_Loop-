import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

// ─── Auth Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [accountType, setAccountType] = useState(null); // 'buyer' | 'farmer' | null
  // Ref to prevent double-calling detectAccountType from both signIn and onAuthStateChange
  const detectingRef = useRef(false);
  // Ref to track whether initSession is still running (prevents onAuthStateChange race)
  const initializingRef = useRef(true);
  // Ref to prevent state updates after unmount (React StrictMode cleanup)
  const isMountedRef = useRef(true);

  // ─── Initialize: get session & listen for auth changes ─────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    initializingRef.current = true;

    const initSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (!isMountedRef.current) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          await detectAccountType(currentSession.user.id, currentSession.user);
        }
      } catch (err) {
        console.error("Session init error:", err);
      } finally {
        if (isMountedRef.current) {
          initializingRef.current = false;
          setLoading(false);
        }
      }
    };
    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMountedRef.current) return;
      // Skip if initSession is still running — it will handle detection
      if (initializingRef.current) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        if (!detectingRef.current) {
          await detectAccountType(newSession.user.id, newSession.user);
        }
      } else {
        setProfile(null);
        setFarmerProfile(null);
        setAccountType(null);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  // ─── Detect account type by checking both profile tables ──
  const detectAccountType = async (userId, sessionUser = null) => {
    // Prevent concurrent calls
    if (detectingRef.current) return null;
    detectingRef.current = true;
    setProfileLoading(true);
    try {
      // Run both profile queries in parallel to cut login latency in half
      const [buyerResult, farmerResult] = await Promise.all([
        supabase
          .from("buyer_profiles")
          .select("id, full_name, email, mobile_number, account_type")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("farmer_profiles")
          .select(
            "id, full_name, email, farm_id, avatar_url, tier_level, tier_name, tier_progress, portfolio_credits, total_revenue, location, account_type",
          )
          .eq("id", userId)
          .maybeSingle(),
      ]);

      if (buyerResult.data && !buyerResult.error) {
        setProfile(buyerResult.data);
        setFarmerProfile(null);
        setAccountType("buyer");
        return "buyer";
      }

      if (farmerResult.data && !farmerResult.error) {
        setFarmerProfile(farmerResult.data);
        setProfile(null);
        setAccountType("farmer");
        return "farmer";
      }

      // No profile found — use metadata from the passed sessionUser (avoids stale state)
      const currentUser = sessionUser || user;
      const metaType = currentUser?.user_metadata?.account_type ?? null;
      setAccountType(metaType);
      return metaType;
    } catch (err) {
      console.error("Account type detection error:", err);
      // Explicitly set to null so ProtectedRoute doesn't wait forever
      if (isMountedRef.current) setAccountType(null);
      return null;
    } finally {
      detectingRef.current = false;
      setProfileLoading(false);
    }
  };

  // ─── Fetch buyer profile from `buyer_profiles` table ───────────────────────
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("buyer_profiles")
        .select(
          "id, full_name, email, mobile_number, aadhaar_number, account_type, created_at",
        )
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }
      setProfile(data || null);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setProfile(null);
    }
  };

  // ─── Fetch farmer profile ──────────────────────────────────────────────────
  const fetchFarmerProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("farmer_profiles")
        .select(
          "id, full_name, email, mobile_number, farm_id, avatar_url, tier_level, tier_name, tier_progress, portfolio_credits, total_revenue, location, farm_size, primary_crop, account_type, created_at",
        )
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching farmer profile:", error);
      }
      setFarmerProfile(data || null);
    } catch (err) {
      console.error("Farmer profile fetch error:", err);
      setFarmerProfile(null);
    }
  };

  // ─── Sign Up (Buyer Registration) ─────────────────────────────────────────
  // All fields are stored in user_metadata so the database trigger
  // (handle_new_user) can create the profile even without an active session.
  const signUp = async ({ email, password, fullName, aadhaar, mobile }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: "buyer",
            aadhaar_number: aadhaar ? aadhaar.replace(/\s/g, "") : "",
            mobile_number: mobile || "",
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Fallback: try client-side insert in case the trigger didn't fire
        // (e.g. user already existed). Non-blocking — don't fail on error.
        const { error: profileError } = await supabase
          .from("buyer_profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            aadhaar_number: aadhaar ? aadhaar.replace(/\s/g, "") : "",
            mobile_number: mobile || "",
            account_type: "buyer",
          });

        if (profileError && profileError.code !== "23505") {
          // 23505 = unique_violation (profile already created by trigger)
          console.warn(
            "Fallback profile insert skipped:",
            profileError.message,
          );
        }
        setAccountType("buyer");
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // ─── Sign Up (Farmer Registration) ────────────────────────────────────────
  // All fields are stored in user_metadata so the database trigger
  // (handle_new_user) can create the farmer_profile even without an active session.
  const signUpFarmer = async ({
    email,
    password,
    fullName,
    farmerId,
    farmSize,
    primaryCrop,
    mobile,
    location,
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: "farmer",
            farm_id: farmerId || "",
            farm_size: farmSize ? String(farmSize) : "0",
            primary_crop: primaryCrop || "",
            mobile_number: mobile || "",
            location: location || "",
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Fallback: try client-side insert in case the trigger didn't fire.
        // Non-blocking — the trigger should have already created the profile.
        const { error: profileError } = await supabase
          .from("farmer_profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            farm_id: farmerId || "",
            farm_size: farmSize ? parseFloat(farmSize) : 0,
            primary_crop: primaryCrop || "",
            mobile_number: mobile || "",
            location: location || "",
            account_type: "farmer",
          });

        if (profileError && profileError.code !== "23505") {
          // 23505 = unique_violation (profile already created by trigger)
          console.warn(
            "Fallback farmer profile insert skipped:",
            profileError.message,
          );
        }
        setAccountType("farmer");
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // ─── Sign In ───────────────────────────────────────────────────────────────
  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Detect account type after login
      let type = null;
      if (data.user) {
        type = await detectAccountType(data.user.id, data.user);
      }

      return { data, error: null, accountType: type };
    } catch (error) {
      return { data: null, error, accountType: null };
    }
  };

  // ─── Sign In with Google OAuth — BUG-04 fix: use /auth/callback ────────────
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // ─── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
      setFarmerProfile(null);
      setAccountType(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // ─── Reset Password ───────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // ─── Update Password (for reset-password page) ────────────────────────────
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    profile,
    farmerProfile,
    accountType,
    loading,
    profileLoading,
    signUp,
    signUpFarmer,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    fetchFarmerProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Custom Hook ────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
