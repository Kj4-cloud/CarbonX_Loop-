import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AuthCallback — Landing page after Google OAuth redirect.
 * Detects account type and redirects to the correct dashboard.
 * If no profile exists (new Google user), redirects to account setup.
 */
export default function AuthCallback() {
  const { user, accountType, loading, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for both session AND profile detection to finish
    if (loading || profileLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Once account type is detected, redirect accordingly
    if (accountType === "farmer") {
      navigate("/seller/dashboard", { replace: true });
    } else if (accountType === "buyer") {
      navigate("/marketplace", { replace: true });
    } else {
      // No profile found — new Google user, send to account type selection
      navigate("/select-account", { replace: true });
    }
  }, [user, accountType, loading, profileLoading, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f8f7",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: "4px solid rgba(19,236,109,0.3)",
            borderTop: "4px solid #13ec6d",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "#64748b", fontSize: 14 }}>Signing you in...</p>
      </div>
    </div>
  );
}
