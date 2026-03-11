import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ResetPassword — Page where users land after clicking the password reset link
 * from their email. Supabase auto-exchanges the recovery token in the URL hash,
 * so we just need to present a new-password form and call updateUser().
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword, user, loading } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // If user is not in a recovery session after loading completes,
  // they may have navigated here directly — redirect to login
  useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: updateError } = await updatePassword(password);
    setIsSubmitting(false);

    if (updateError) {
      setError(
        updateError.message || "Failed to update password. Please try again.",
      );
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#102218] font-['Manrope',sans-serif] text-slate-800 dark:text-slate-100 min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav
        className={`w-full z-20 px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between transition-all duration-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none"
        >
          <img src="./applogo.png" alt="CarbonX Logo" className="h-9" />
          <span className="text-xl font-extrabold tracking-tight text-[#0c2e1e] dark:text-white">
            Carbon<span className="text-[#13ec6d]">X</span>
          </span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div
            className={`text-center mb-10 transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
              <span className="material-icons-round text-4xl text-[#13ec6d]">
                lock_open
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#0c2e1e] dark:text-white tracking-tight">
              Set New Password
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Enter your new password below
            </p>
          </div>

          {success ? (
            /* Success State */
            <div
              className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/5 p-8 text-center transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <div className="w-16 h-16 bg-[#13ec6d]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="material-icons-round text-[#13ec6d] text-3xl">
                  check_circle
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Password Updated!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Your password has been successfully changed. You can now sign in
                with your new password.
              </p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="w-full py-4 bg-[#13ec6d] hover:bg-[#0fb955] text-[#102218] font-bold text-lg rounded-2xl transition-all shadow-lg shadow-[#13ec6d]/30 cursor-pointer active:scale-[0.97]"
              >
                Go to Login
              </button>
            </div>
          ) : !loading && !user ? (
            /* No recovery session */
            <div
              className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/5 p-8 text-center transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="material-icons-round text-amber-500 text-3xl">
                  warning
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Invalid or Expired Link
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full py-4 bg-[#13ec6d] hover:bg-[#0fb955] text-[#102218] font-bold text-lg rounded-2xl transition-all shadow-lg shadow-[#13ec6d]/30 cursor-pointer active:scale-[0.97]"
              >
                Request New Link
              </button>
            </div>
          ) : (
            /* Form */
            <div
              className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/5 p-6 sm:p-8 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              {error && (
                <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
                  <span className="material-icons-round text-red-500 text-xl">
                    error_outline
                  </span>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 flex-1">
                    {error}
                  </p>
                </div>
              )}

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="relative">
                  <label
                    className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${
                      focusedField === "password"
                        ? "text-[#13ec6d]"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                    htmlFor="new-password"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span
                        className={`material-icons-round transition-colors duration-200 ${focusedField === "password" ? "text-[#13ec6d]" : "text-slate-400 dark:text-slate-500"}`}
                      >
                        lock
                      </span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-12 py-4 bg-[#f6f8f7] dark:bg-[#1a402d]/30 border-2 border-slate-200 dark:border-[#1a402d] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#13ec6d] focus:ring-0 transition-all"
                      id="new-password"
                      placeholder="Min 6 characters"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      required
                      minLength={6}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#13ec6d] transition-colors cursor-pointer bg-transparent border-none"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-icons-round text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label
                    className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${
                      focusedField === "confirm"
                        ? "text-[#13ec6d]"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                    htmlFor="confirm-password"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span
                        className={`material-icons-round transition-colors duration-200 ${focusedField === "confirm" ? "text-[#13ec6d]" : "text-slate-400 dark:text-slate-500"}`}
                      >
                        lock
                      </span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-4 bg-[#f6f8f7] dark:bg-[#1a402d]/30 border-2 border-slate-200 dark:border-[#1a402d] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#13ec6d] focus:ring-0 transition-all"
                      id="confirm-password"
                      placeholder="Re-enter new password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError(null);
                      }}
                      onFocus={() => setFocusedField("confirm")}
                      onBlur={() => setFocusedField(null)}
                      required
                      minLength={6}
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    password.length < 6 ||
                    isSubmitting
                  }
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-[0.97] cursor-pointer ${
                    password &&
                    confirmPassword &&
                    password === confirmPassword &&
                    password.length >= 6 &&
                    !isSubmitting
                      ? "bg-[#13ec6d] hover:bg-[#0fb955] text-[#102218] shadow-lg shadow-[#13ec6d]/30"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#102218]/30 border-t-[#102218] rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <span className="material-icons-round text-lg">
                        check
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Back to Login */}
          <div
            className={`mt-6 text-center transition-all duration-700 delay-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            <button
              onClick={() => navigate("/login")}
              className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#13ec6d] transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 mx-auto"
            >
              <span className="material-icons-round text-sm">arrow_back</span>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
