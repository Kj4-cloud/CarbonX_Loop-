import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeLoginSelection = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#102218] font-['Manrope',sans-serif] text-[#1f2923] dark:text-white antialiased min-h-screen w-full overflow-x-hidden flex flex-col relative">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[120%] h-[60%] rounded-full bg-gradient-to-b from-[#13ec6d]/10 to-transparent blur-3xl opacity-60 dark:opacity-20 animate-float"></div>
        <div
          className="absolute top-[40%] -left-[20%] w-[100%] h-[60%] rounded-full bg-gradient-to-t from-blue-400/10 to-transparent blur-3xl opacity-40 dark:opacity-10"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          }}
        ></div>
        <div
          className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-[#13ec6d]/30 animate-float"
          style={{ animationDelay: "0.5s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-[35%] right-[20%] w-3 h-3 rounded-full bg-[#13ec6d]/20 animate-float"
          style={{ animationDelay: "1.5s", animationDuration: "5s" }}
        ></div>
        <div
          className="absolute top-[60%] left-[70%] w-1.5 h-1.5 rounded-full bg-[#13ec6d]/25 animate-float"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>
      </div>

      {/* Top Navigation Bar */}
      <nav
        className={`w-full z-20 px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="flex items-center gap-2.5">
          {/* <div className="w-9 h-9 bg-gradient-to-br from-[#13ec6d] to-[#0eb553] rounded-xl flex items-center justify-center shadow-lg shadow-[#13ec6d]/20">
            <span className="material-icons-round text-white text-xl">eco</span>
          </div> */}
          <img src="./applogo.png" alt="CarbonX Logo" className="h-10" />
          <span className="text-xl font-extrabold tracking-tight">
            Carbon<span className="text-[#13ec6d]">X</span>
          </span>
        </div>
        <button
          id="btn-nav-login"
          onClick={() => navigate("/login")}
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#13ec6d] transition-colors cursor-pointer"
        >
          <span className="material-icons-round text-lg">login</span>
          Sign In
        </button>
      </nav>

      {/* Main Content — Desktop: side-by-side, Mobile: stacked */}
      <div className="flex-1 z-10 flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 lg:px-20 py-8 lg:py-0 gap-10 lg:gap-20">
        {/* Left Side: Hero Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
          {/* Animated Logo */}
          {/* <div
            className={`mb-8 relative group transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="absolute inset-0 bg-[#13ec6d]/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-white to-[#f6f8f7] dark:from-neutral-800 dark:to-[#102218] rounded-3xl shadow-xl shadow-[#13ec6d]/10 flex items-center justify-center border border-white/50 dark:border-white/5 group-hover:shadow-2xl group-hover:shadow-[#13ec6d]/20 transition-all duration-500">
              <span className="material-icons-round text-5xl lg:text-6xl text-[#13ec6d] transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                eco
              </span>
              <div className="absolute inset-0 rounded-3xl animate-pulse-glow"></div>
              <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-[#13ec6d] rounded-full flex items-center justify-center border-2 border-white dark:border-[#102218] shadow-lg">
                <span className="material-icons-round text-white text-xs">
                  check
                </span>
              </div>
            </div>
          </div> */}
          <img src="./applogo.png" alt="CarbonX Logo" className="h-30 ml-4" />

          {/* Typography */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 transition-all duration-700 delay-150 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            Carbon<span className="text-[#13ec6d]">X</span>
          </h1>
          <p
            className={`text-[#94a39b] text-lg lg:text-xl font-medium leading-relaxed max-w-md transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            Empowering farmers. Enabling corporations. Verified by blockchain.
          </p>

          {/* Trust Indicators */}
          <div
            className={`mt-8 flex flex-wrap items-center gap-3 justify-center lg:justify-start transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {[
              { icon: "verified_user", label: "ISO 14064" },
              { icon: "link", label: "Polygon Chain" },
              { icon: "shield", label: "Secure" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="h-9 px-4 rounded-full bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 flex items-center gap-2 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-default shadow-sm"
              >
                <span className="material-icons-round text-sm text-[#13ec6d]">
                  {badge.icon}
                </span>
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Action Card */}
        <div
          className={`w-full max-w-sm lg:max-w-md transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        >
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/5 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-center mb-2">
              Get Started Today
            </h2>
            <p className="text-sm text-[#94a39b] text-center mb-8">
              Join the carbon credit revolution
            </p>

            <div className="flex flex-col gap-4">
              {/* Primary Button: Get Started */}
              <button
                id="btn-get-started"
                onClick={() => navigate("/select-account")}
                className="w-full h-14 bg-[#13ec6d] hover:bg-[#0fb955] active:scale-[0.97] transition-all duration-200 rounded-2xl shadow-lg shadow-[#13ec6d]/25 hover:shadow-xl hover:shadow-[#13ec6d]/30 flex items-center justify-center group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="text-[#102218] font-bold text-lg relative z-10 mr-2">
                  Create Account
                </span>
                <span className="material-icons-round text-[#102218] relative z-10 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>

              {/* Secondary Button: Log In */}
              <button
                id="btn-login"
                onClick={() => navigate("/login")}
                className="w-full h-14 bg-transparent border-2 border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 hover:border-[#13ec6d]/50 active:scale-[0.97] transition-all duration-200 rounded-2xl flex items-center justify-center group cursor-pointer"
              >
                <span className="text-neutral-800 dark:text-white font-bold text-lg group-hover:text-[#13ec6d] transition-colors">
                  Log In
                </span>
              </button>
            </div>

            {/* Footer Terms */}
            <p className="text-center text-xs text-[#94a39b] mt-6 leading-relaxed">
              By continuing, you agree to our
              <a
                className="text-neutral-800 dark:text-white font-semibold underline decoration-[#13ec6d]/50 decoration-2 underline-offset-2 mx-1 hover:decoration-[#13ec6d] transition-all"
                href="#"
              >
                Terms
              </a>
              &
              <a
                className="text-neutral-800 dark:text-white font-semibold underline decoration-[#13ec6d]/50 decoration-2 underline-offset-2 mx-1 hover:decoration-[#13ec6d] transition-all"
                href="#"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={`z-10 w-full px-6 md:px-12 lg:px-20 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94a39b] transition-all duration-700 delay-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      >
        <span>© 2026 CarbonX. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-[#13ec6d] transition-colors">
            About
          </a>
          <a href="#" className="hover:text-[#13ec6d] transition-colors">
            Contact
          </a>
          <a href="#" className="hover:text-[#13ec6d] transition-colors">
            Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default WelcomeLoginSelection;
