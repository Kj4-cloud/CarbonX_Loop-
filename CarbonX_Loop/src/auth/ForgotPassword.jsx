import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState(location.state?.email || "");
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);

    const { error: resetError } = await resetPassword(email);

    setIsSubmitting(false);

    if (resetError) {
      setError(
        resetError.message || "Failed to send reset email. Please try again.",
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
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10">
              <span className="material-icons-round text-4xl text-amber-500">
                lock_reset
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#0c2e1e] dark:text-white tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {success ? (
            /* Success State */
            <div
              className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/5 p-8 text-center transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <div className="w-16 h-16 bg-[#13ec6d]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="material-icons-round text-[#13ec6d] text-3xl">
                  mark_email_read
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Email Sent!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                We've sent a password reset link to{" "}
                <strong className="text-slate-700 dark:text-slate-200">
                  {email}
                </strong>
                . Check your inbox and follow the instructions.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 bg-[#13ec6d] hover:bg-[#0fb955] text-[#102218] font-bold text-lg rounded-2xl transition-all shadow-lg shadow-[#13ec6d]/30 cursor-pointer active:scale-[0.97]"
              >
                Back to Login
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
                <div className="relative">
                  <label
                    className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${
                      focusedField === "email"
                        ? "text-[#13ec6d]"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                    htmlFor="reset-email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span
                        className={`material-icons-round transition-colors duration-200 ${focusedField === "email" ? "text-[#13ec6d]" : "text-slate-400 dark:text-slate-500"}`}
                      >
                        email
                      </span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-4 bg-[#f6f8f7] dark:bg-[#1a402d]/30 border-2 border-slate-200 dark:border-[#1a402d] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#13ec6d] focus:ring-0 transition-all"
                      id="reset-email"
                      placeholder="you@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!email || isSubmitting}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-[0.97] cursor-pointer ${
                    email && !isSubmitting
                      ? "bg-[#13ec6d] hover:bg-[#0fb955] text-[#102218] shadow-lg shadow-[#13ec6d]/30"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#102218]/30 border-t-[#102218] rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <span className="material-icons-round text-lg">send</span>
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

export default ForgotPassword;
