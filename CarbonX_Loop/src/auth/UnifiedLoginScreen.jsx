import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UnifiedLoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, user, accountType } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Where to redirect after login (default: marketplace)
  const from = location.state?.from?.pathname || "/marketplace";

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // If user becomes authenticated, redirect based on account type
  useEffect(() => {
    if (user && accountType) {
      if (accountType === "farmer") {
        navigate("/seller/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, accountType, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identity || !password) return;

    setIsSubmitting(true);
    setError(null);

    const { error: signInError, accountType: detectedType } = await signIn({
      email: identity,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      // Provide user-friendly error messages
      let errorMsg = signInError.message;
      if (errorMsg.includes("Invalid login credentials")) {
        errorMsg = "Invalid email or password. Please try again.";
      } else if (errorMsg.includes("Email not confirmed")) {
        errorMsg =
          "Please confirm your email address first. Check your inbox for a confirmation link.";
      }
      setError(errorMsg);
    }
    // On success, the useEffect above will handle redirect
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      let msg =
        googleError.message || "Google sign-in failed. Please try again.";
      if (
        msg.includes("provider is not enabled") ||
        msg.includes("Unsupported provider")
      ) {
        msg =
          "Google sign-in is not yet enabled. Please use email and password to log in, or contact support.";
      }
      setError(msg);
    }
  };

  const handleForgotPassword = async () => {
    if (!identity) {
      setError(
        "Please enter your email address first, then click Forgot Password.",
      );
      return;
    }
    navigate("/forgot-password", { state: { email: identity } });
  };

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#102218] font-['Manrope',sans-serif] text-slate-800 dark:text-slate-100 min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav
        className={`w-full z-20 px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between transition-all duration-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <button
          id="btn-nav-home"
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none"
        >
          <img src="./applogo.png" alt="CarbonX Logo" className="h-9" />
          <span className="text-xl font-extrabold tracking-tight text-[#0c2e1e] dark:text-white">
            Carbon<span className="text-[#13ec6d]">X</span>
          </span>
        </button>
        <button
          id="btn-nav-register"
          onClick={() => navigate("/select-account")}
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#13ec6d] transition-colors cursor-pointer bg-transparent border-none"
        >
          Create Account
          <span className="material-icons-round text-lg">arrow_forward</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div
            className={`text-center mb-10 transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <img
              src="./applogo.png"
              alt="CarbonX Logo"
              className="h-16 mx-auto mb-6"
            />
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#0c2e1e] dark:text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Sign in to your CarbonX account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 animate-fade-in-up">
              <span className="material-icons-round text-red-500 text-xl shrink-0 mt-0.5">
                error_outline
              </span>
              <p className="text-sm font-medium text-red-700 dark:text-red-300 flex-1">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none shrink-0"
              >
                <span className="material-icons-round text-sm">close</span>
              </button>
            </div>
          )}

          {/* Login Card */}
          <div
            className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/5 p-6 sm:p-8 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="relative group">
                <label
                  className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${
                    focusedField === "identity"
                      ? "text-[#13ec6d]"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                  htmlFor="identity"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span
                      className={`material-icons-round transition-colors duration-200 ${focusedField === "identity" ? "text-[#13ec6d]" : "text-slate-400 dark:text-slate-500"}`}
                    >
                      email
                    </span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-4 bg-[#f6f8f7] dark:bg-[#1a402d]/30 border-2 border-slate-200 dark:border-[#1a402d] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#13ec6d] focus:ring-0 transition-all hover:border-slate-300 dark:hover:border-[#23503b]"
                    id="identity"
                    placeholder="you@example.com"
                    type="email"
                    value={identity}
                    onChange={(e) => {
                      setIdentity(e.target.value);
                      setError(null);
                    }}
                    onFocus={() => setFocusedField("identity")}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                      focusedField === "password"
                        ? "text-[#13ec6d]"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                    htmlFor="password"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span
                      className={`material-icons-round transition-colors duration-200 ${focusedField === "password" ? "text-[#13ec6d]" : "text-slate-400 dark:text-slate-500"}`}
                    >
                      lock
                    </span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-12 py-4 bg-[#f6f8f7] dark:bg-[#1a402d]/30 border-2 border-slate-200 dark:border-[#1a402d] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#13ec6d] focus:ring-0 transition-all hover:border-slate-300 dark:hover:border-[#23503b]"
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#13ec6d] transition-colors cursor-pointer bg-transparent border-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <span className="material-icons-round text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <div className="flex justify-end mt-2.5">
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#13ec6d] hover:text-[#0fb955] transition-colors cursor-pointer bg-transparent border-none"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Primary Action */}
              <button
                id="btn-login-submit"
                className={`mt-1 w-full py-4 rounded-xl shadow-lg transition-all duration-200 transform active:scale-[0.97] flex items-center justify-center gap-2 font-bold text-lg relative overflow-hidden group cursor-pointer ${
                  identity && password && !isSubmitting
                    ? "bg-[#13ec6d] hover:bg-[#0fb955] text-[#0c2e1e] shadow-[#13ec6d]/25 hover:shadow-xl hover:shadow-[#13ec6d]/30"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                }`}
                type="submit"
                disabled={!identity || !password || isSubmitting}
              >
                {identity && password && !isSubmitting && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                )}
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#102218]/30 border-t-[#102218] rounded-full animate-spin"></div>
                    <span className="relative z-10">Signing In...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Log In</span>
                    <span className="material-icons-round text-lg relative z-10 group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-[#1a402d]"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Or login with
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-[#1a402d]"></div>
            </div>

            {/* Social Login Options */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-google-login"
                className="group flex-1 relative bg-[#f6f8f7] dark:bg-[#1a402d]/30 border-2 border-slate-200 dark:border-[#1a402d] hover:border-[#13ec6d]/50 text-slate-700 dark:text-slate-200 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-md cursor-pointer"
                type="button"
                onClick={handleGoogleLogin}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <span className="material-icons-round text-blue-600 dark:text-blue-400 text-lg">
                    login
                  </span>
                </div>
                <span className="text-sm">Continue with Google</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`mt-8 text-center transition-all duration-700 delay-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?
              <button
                id="btn-register-now"
                onClick={() => navigate("/select-account")}
                className="text-[#13ec6d] font-bold hover:text-[#0fb955] ml-1.5 transition-colors cursor-pointer bg-transparent border-none"
              >
                Register Now
              </button>
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-600">
              <span className="material-icons-round text-sm">
                verified_user
              </span>
              <span>Secured by Polygon Blockchain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#13ec6d]/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-emerald-500/10 dark:bg-emerald-900/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
};

export default UnifiedLoginScreen;
