import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * If the user isn't logged in, they get redirected to /login.
 * Optionally checks accountType for role-based access (BUG-13 fix).
 *
 * @param {string} [requiredType] - 'buyer' or 'farmer' to restrict by role
 */
export default function ProtectedRoute({ children, requiredType }) {
  const { user, loading, profileLoading, accountType } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout fallback: if accountType is still null after 5s, stop waiting
  useEffect(() => {
    if (!requiredType || accountType || loading || profileLoading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [requiredType, accountType, loading, profileLoading]);

  // While Supabase checks the session or profile is being loaded, show spinner
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7] dark:bg-[#102218]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#13ec6d]/30 border-t-[#13ec6d] rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login, save where they came from
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for account type to be determined before checking role
  if (requiredType && !accountType && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7] dark:bg-[#102218]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#13ec6d]/30 border-t-[#13ec6d] rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm animate-pulse">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Timed out waiting for account type — redirect to login
  if (requiredType && !accountType && timedOut) {
    return <Navigate to="/login" replace />;
  }

  // BUG-13 fix: check account type when requiredType is specified
  if (requiredType && accountType && accountType !== requiredType) {
    const redirect =
      accountType === "farmer" ? "/seller/dashboard" : "/marketplace";
    return <Navigate to={redirect} replace />;
  }

  return children;
}
