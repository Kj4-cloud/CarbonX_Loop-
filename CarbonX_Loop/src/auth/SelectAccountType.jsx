import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SelectAccountType = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (accountType === "standard") {
      navigate("/register/standard");
    } else if (accountType === "farmer") {
      navigate("/register/farmer");
    }
  };

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#102218] min-h-screen flex flex-col font-['Manrope',sans-serif] text-slate-800 dark:text-slate-100">
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
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Carbon<span className="text-[#13ec6d]">X</span>
          </span>
        </button>
        <button
          id="btn-nav-login"
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#13ec6d] transition-colors cursor-pointer bg-transparent border-none"
        >
          <span className="material-icons-round text-lg">login</span>
          <span className="hidden sm:inline">Sign In</span>
        </button>
      </nav>

      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#13ec6d]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none animate-float"></div>
      <div
        className="absolute bottom-0 left-0 w-48 h-48 bg-[#13ec6d]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none animate-float"
        style={{ animationDelay: "3s" }}
      ></div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg relative z-10">
          {/* Header */}
          <div
            className={`text-center mb-10 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <img
              src="./applogo.png"
              alt="CarbonX Logo"
              className="h-14 mx-auto mb-6"
            />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              Choose Your Path
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
              How would you like to participate in the carbon credit revolution?
            </p>
          </div>

          {/* Selection Cards */}
          <div className="space-y-4 mb-8">
            {/* Standard User Card */}
            <label
              className={`cursor-pointer group relative block transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
            >
              <input
                className="peer sr-only"
                name="account_type"
                type="radio"
                value="standard"
                checked={accountType === "standard"}
                onChange={() => setAccountType("standard")}
              />
              <div
                className={`w-full p-5 sm:p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border-2 rounded-2xl shadow-lg shadow-black/5 transition-all duration-300 ease-out hover:shadow-xl group-hover:scale-[1.01] ${
                  accountType === "standard"
                    ? "border-[#13ec6d] bg-[#13ec6d]/5 shadow-[0_4px_20px_-2px_rgba(19,236,109,0.2)]"
                    : "border-white/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${accountType === "standard" ? "bg-[#13ec6d]/20 scale-110" : "bg-[#f6f8f7] dark:bg-[#102218] group-hover:bg-[#13ec6d]/10"}`}
                  >
                    <span
                      className={`material-icons-round text-3xl transition-colors duration-300 ${accountType === "standard" ? "text-[#13ec6d]" : "text-slate-400 group-hover:text-[#13ec6d]"}`}
                    >
                      person
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold transition-colors duration-300 ${accountType === "standard" ? "text-[#13ec6d]" : "text-slate-900 dark:text-white group-hover:text-[#13ec6d]"}`}
                    >
                      Standard User
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Buy, trade & offset carbon credits
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#13ec6d] bg-[#13ec6d]/10 px-2 py-1 rounded-lg">
                        <span className="material-icons-round text-[14px]">
                          verified_user
                        </span>
                        Aadhaar Verified
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${accountType === "standard" ? "bg-[#13ec6d] border-[#13ec6d] text-[#102218] scale-110" : "border-slate-200 dark:border-slate-600"}`}
                  >
                    <span
                      className={`material-icons-round text-sm transition-all duration-300 ${accountType === "standard" ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                    >
                      check
                    </span>
                  </div>
                </div>
              </div>
            </label>

            {/* Farmer Card */}
            <label
              className={`cursor-pointer group relative block transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
            >
              <input
                className="peer sr-only"
                name="account_type"
                type="radio"
                value="farmer"
                checked={accountType === "farmer"}
                onChange={() => setAccountType("farmer")}
              />
              <div
                className={`w-full p-5 sm:p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border-2 rounded-2xl shadow-lg shadow-black/5 transition-all duration-300 ease-out hover:shadow-xl group-hover:scale-[1.01] ${
                  accountType === "farmer"
                    ? "border-[#13ec6d] bg-[#13ec6d]/5 shadow-[0_4px_20px_-2px_rgba(19,236,109,0.2)]"
                    : "border-white/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${accountType === "farmer" ? "bg-[#13ec6d]/20 scale-110" : "bg-[#f6f8f7] dark:bg-[#102218] group-hover:bg-[#13ec6d]/10"}`}
                  >
                    <span
                      className={`material-icons-round text-3xl transition-colors duration-300 ${accountType === "farmer" ? "text-[#13ec6d]" : "text-slate-400 group-hover:text-[#13ec6d]"}`}
                    >
                      agriculture
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold transition-colors duration-300 ${accountType === "farmer" ? "text-[#13ec6d]" : "text-slate-900 dark:text-white group-hover:text-[#13ec6d]"}`}
                    >
                      Farmer
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Earn & sell verified carbon credits
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#13ec6d] bg-[#13ec6d]/10 px-2 py-1 rounded-lg">
                        <span className="material-icons-round text-[14px]">
                          badge
                        </span>
                        Farmer ID Verified
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-lg">
                        <span className="material-icons-round text-[14px]">
                          stars
                        </span>
                        Premium
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${accountType === "farmer" ? "bg-[#13ec6d] border-[#13ec6d] text-[#102218] scale-110" : "border-slate-200 dark:border-slate-600"}`}
                  >
                    <span
                      className={`material-icons-round text-sm transition-all duration-300 ${accountType === "farmer" ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                    >
                      check
                    </span>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Continue Button */}
          <div
            className={`transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <button
              id="btn-continue-select"
              onClick={handleContinue}
              disabled={!accountType}
              className={`w-full py-4 px-6 font-bold text-lg rounded-2xl transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 group cursor-pointer relative overflow-hidden ${
                accountType
                  ? "bg-[#13ec6d] hover:bg-[#0fb955] text-[#102218] shadow-lg shadow-[#13ec6d]/30 hover:shadow-xl hover:shadow-[#13ec6d]/40"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              {accountType && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              )}
              <span className="relative z-10">Continue</span>
              <span className="material-icons-round relative z-10 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            {/* Footer Link */}
            <div className="text-center mt-6">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Already have an account?
                <button
                  id="btn-login-link"
                  onClick={() => navigate("/login")}
                  className="text-slate-900 dark:text-white font-bold hover:text-[#13ec6d] dark:hover:text-[#13ec6d] transition-colors underline decoration-2 decoration-[#13ec6d]/50 underline-offset-4 ml-1.5 cursor-pointer bg-transparent border-none"
                >
                  Log In
                </button>
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex justify-center items-center gap-2 mt-4 opacity-60">
              <span className="material-icons-round text-slate-400 text-sm">
                lock
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Secured by Blockchain
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectAccountType;
