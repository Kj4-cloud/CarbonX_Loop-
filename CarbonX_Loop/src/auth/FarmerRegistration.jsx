import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FarmerRegistration = () => {
  const navigate = useNavigate();
  const { signUpFarmer, user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    aadhaarId: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // ─── Aadhaar OTP Verification State ───────────────────────────────────
  const DEMO_OTP = "123456";
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [demoOtpToast, setDemoOtpToast] = useState(false);

  // Resend timer countdown
  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpResendTimer]);

  // Format Aadhaar as XXXX XXXX XXXX
  const formatAadhaar = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleAadhaarChange = (value) => {
    const formatted = formatAadhaar(value);
    setFormData((prev) => ({ ...prev, aadhaarId: formatted }));
    // Reset verification if Aadhaar is changed after verification
    if (aadhaarVerified) {
      setAadhaarVerified(false);
      setOtpSent(false);
      setOtp("");
      setOtpError(null);
    }
    if (error) setError(null);
  };

  const isAadhaarValid = formData.aadhaarId.replace(/\s/g, "").length === 12;

  const handleSendOtp = async () => {
    if (!isAadhaarValid) return;
    setOtpSending(true);
    setOtpError(null);
    // Simulate API call to send OTP
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setOtpSent(true);
    setOtpSending(false);
    setOtpResendTimer(30);
    // Show demo OTP toast
    setDemoOtpToast(true);
    setTimeout(() => setDemoOtpToast(false), 5000);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
    setOtpVerifying(true);
    setOtpError(null);
    // Simulate API call to verify OTP
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (otp === DEMO_OTP) {
      setAadhaarVerified(true);
      setOtpError(null);
    } else {
      setOtpError("Invalid OTP. Please try again. (Demo OTP: 123456)");
    }
    setOtpVerifying(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };


  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.password &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    aadhaarVerified;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { data, error: signUpError } = await signUpFarmer({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      farmerId: formData.aadhaarId.replace(/\s/g, ""),
      farmSize: "",
      primaryCrop: "",
      mobile: "",
      location: "",
    });

    setIsSubmitting(false);

    if (signUpError) {
      let errorMsg = signUpError.message;
      if (errorMsg.includes("already registered")) {
        errorMsg = "This email is already registered. Please log in instead.";
      }
      setError(errorMsg);
    } else if (data?.user && !data.session) {
      // Email confirmation required — show success message
      setSuccessMessage(
        "Account created! Please check your email to confirm your account, then log in.",
      );
    } else {
      // Auto-confirmed — navigate to seller dashboard
      navigate("/seller/dashboard", { replace: true });
    }
  };

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#102218] font-['Manrope',sans-serif] text-[#1a3324] dark:text-gray-100 antialiased min-h-screen flex flex-col">
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
          <span className="text-xl font-extrabold tracking-tight text-[#1a3324] dark:text-white">
            Carbon<span className="text-[#13ec6d]">X</span>
          </span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#13ec6d]">
            Farmer Registration
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-6 md:py-10">
        <div className="w-full max-w-2xl">
          {/* Back Button + Header */}
          <div
            className={`mb-8 transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <button
              id="btn-back-farmer"
              onClick={() => navigate("/select-account")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1e382a] text-[#1a3324] dark:text-white hover:bg-[#13ec6d]/20 transition-all duration-200 cursor-pointer active:scale-95 mb-6 shadow-sm border border-slate-200 dark:border-transparent"
            >
              <span className="material-icons-round">arrow_back</span>
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#13ec6d]/10 flex items-center justify-center">
                <span className="material-icons-round text-[#13ec6d] text-xl">
                  agriculture
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3324] dark:text-white">
                Farmer Registration
              </h1>
            </div>
            <p className="text-[#4d6b59] dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              Start earning carbon credits. Create your account and tell us
              about your land.
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

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-5 bg-[#13ec6d]/10 border-2 border-[#13ec6d]/30 rounded-2xl animate-fade-in-up">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#13ec6d]/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-[#13ec6d] text-xl">
                    check_circle
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[#13ec6d] mb-1">
                    Registration Successful!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {successMessage}
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-3 text-sm font-bold text-[#13ec6d] hover:text-[#0fb955] underline underline-offset-4 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    Go to Login →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          {!successMessage && (
            <div
              className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/5 p-6 sm:p-8 lg:p-10 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* ─── Account Details ──────────────────────────────────── */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons-round text-[#13ec6d] text-lg">
                    account_circle
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#13ec6d]">
                    Account Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-200 ${focusedField === "fullName" ? "text-[#13ec6d]" : "text-[#1a3324] dark:text-gray-200"}`}
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span
                          className={`material-icons-round transition-colors duration-200 ${focusedField === "fullName" ? "text-[#13ec6d]" : "text-[#4d6b59] dark:text-gray-500"}`}
                        >
                          person
                        </span>
                      </div>
                      <input
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#f6f8f7] dark:bg-[#1e382a] border-2 border-transparent rounded-xl text-[#1a3324] dark:text-white placeholder-[#4d6b59]/60 focus:outline-none focus:ring-0 focus:border-[#13ec6d] focus:bg-white dark:focus:bg-[#152a1f] transition-all"
                        placeholder="Enter your full name"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-200 ${focusedField === "email" ? "text-[#13ec6d]" : "text-[#1a3324] dark:text-gray-200"}`}
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span
                          className={`material-icons-round transition-colors duration-200 ${focusedField === "email" ? "text-[#13ec6d]" : "text-[#4d6b59] dark:text-gray-500"}`}
                        >
                          email
                        </span>
                      </div>
                      <input
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#f6f8f7] dark:bg-[#1e382a] border-2 border-transparent rounded-xl text-[#1a3324] dark:text-white placeholder-[#4d6b59]/60 focus:outline-none focus:ring-0 focus:border-[#13ec6d] focus:bg-white dark:focus:bg-[#152a1f] transition-all"
                        placeholder="farmer@example.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-200 ${focusedField === "password" ? "text-[#13ec6d]" : "text-[#1a3324] dark:text-gray-200"}`}
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span
                          className={`material-icons-round transition-colors duration-200 ${focusedField === "password" ? "text-[#13ec6d]" : "text-[#4d6b59] dark:text-gray-500"}`}
                        >
                          lock
                        </span>
                      </div>
                      <input
                        className="block w-full pl-11 pr-12 py-3.5 bg-[#f6f8f7] dark:bg-[#1e382a] border-2 border-transparent rounded-xl text-[#1a3324] dark:text-white placeholder-[#4d6b59]/60 focus:outline-none focus:ring-0 focus:border-[#13ec6d] focus:bg-white dark:focus:bg-[#152a1f] transition-all"
                        placeholder="Min 6 characters"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        required
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
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-200 ${focusedField === "confirmPassword" ? "text-[#13ec6d]" : "text-[#1a3324] dark:text-gray-200"}`}
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span
                          className={`material-icons-round transition-colors duration-200 ${focusedField === "confirmPassword" ? "text-[#13ec6d]" : "text-[#4d6b59] dark:text-gray-500"}`}
                        >
                          lock
                        </span>
                      </div>
                      <input
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#f6f8f7] dark:bg-[#1e382a] border-2 border-transparent rounded-xl text-[#1a3324] dark:text-white placeholder-[#4d6b59]/60 focus:outline-none focus:ring-0 focus:border-[#13ec6d] focus:bg-white dark:focus:bg-[#152a1f] transition-all"
                        placeholder="Re-enter password"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                    {formData.confirmPassword &&
                      formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                </div>

                {/* ─── Farm Details ─────────────────────────────────────── */}
                <div className="flex items-center gap-2 pt-4 mb-2">
                  <span className="material-icons-round text-[#13ec6d] text-lg">
                    agriculture
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#13ec6d]">
                    Farm Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Aadhaar ID */}
                  <div className="space-y-2 sm:col-span-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-200 ${focusedField === "aadhaarId" ? "text-[#13ec6d]" : "text-[#1a3324] dark:text-gray-200"}`}
                    >
                      Aadhaar Number *{" "}
                      <span className="text-xs font-normal text-[#4d6b59]">
                        (12-digit Aadhaar ID)
                      </span>
                    </label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <span
                            className={`material-icons-round transition-colors duration-200 ${focusedField === "aadhaarId" ? "text-[#13ec6d]" : "text-[#4d6b59] dark:text-gray-500"}`}
                          >
                            credit_card
                          </span>
                        </div>
                        <input
                          className={`block w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-[#1a3324] dark:text-white placeholder-[#4d6b59]/60 focus:outline-none focus:ring-0 transition-all ${
                            aadhaarVerified
                              ? "bg-[#13ec6d]/5 border-[#13ec6d] dark:bg-[#13ec6d]/10"
                              : "bg-[#f6f8f7] dark:bg-[#1e382a] border-transparent focus:border-[#13ec6d] focus:bg-white dark:focus:bg-[#152a1f]"
                          }`}
                          placeholder="XXXX XXXX XXXX"
                          type="text"
                          inputMode="numeric"
                          maxLength={14}
                          value={formData.aadhaarId}
                          onChange={(e) => handleAadhaarChange(e.target.value)}
                          onFocus={() => setFocusedField("aadhaarId")}
                          onBlur={() => setFocusedField(null)}
                          disabled={aadhaarVerified}
                          required
                        />
                        {aadhaarVerified && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <span className="material-icons-round text-[#13ec6d] text-xl">verified</span>
                          </div>
                        )}
                      </div>
                      {!aadhaarVerified && !otpSent && (
                        <button
                          type="button"
                          disabled={!isAadhaarValid || otpSending}
                          onClick={handleSendOtp}
                          className={`px-5 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-none ${
                            isAadhaarValid && !otpSending
                              ? "bg-[#13ec6d] hover:bg-[#0fb955] text-[#1a3324] shadow-md shadow-[#13ec6d]/20 active:scale-95"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {otpSending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-[#1a3324]/30 border-t-[#1a3324] rounded-full animate-spin"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <span className="material-icons-round text-lg">send</span>
                              Verify
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* OTP Input Section */}
                    {otpSent && !aadhaarVerified && (
                      <div className="mt-3 p-4 bg-[#13ec6d]/5 dark:bg-[#13ec6d]/10 border-2 border-[#13ec6d]/20 rounded-2xl space-y-3 animate-fade-in-up">
                        <div className="flex items-center gap-2">
                          <span className="material-icons-round text-[#13ec6d] text-lg">sms</span>
                          <p className="text-sm font-semibold text-[#1a3324] dark:text-white">
                            OTP sent to Aadhaar-linked mobile
                          </p>
                        </div>
                        <p className="text-xs text-[#4d6b59] dark:text-gray-400">
                          Enter the 6-digit OTP. <span className="font-semibold text-[#13ec6d]">Demo OTP: 123456</span>
                        </p>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <input
                              className="block w-full px-4 py-3.5 bg-white dark:bg-[#1e382a] border-2 border-transparent rounded-xl text-[#1a3324] dark:text-white placeholder-[#4d6b59]/60 focus:outline-none focus:ring-0 focus:border-[#13ec6d] transition-all text-center text-lg font-bold tracking-[0.5em]"
                              placeholder="● ● ● ● ● ●"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={otp}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setOtp(val);
                                if (otpError) setOtpError(null);
                              }}
                              autoFocus
                            />
                          </div>
                          <button
                            type="button"
                            disabled={otp.length !== 6 || otpVerifying}
                            onClick={handleVerifyOtp}
                            className={`px-5 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-none ${
                              otp.length === 6 && !otpVerifying
                                ? "bg-[#13ec6d] hover:bg-[#0fb955] text-[#1a3324] shadow-md shadow-[#13ec6d]/20 active:scale-95"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            {otpVerifying ? (
                              <>
                                <div className="w-4 h-4 border-2 border-[#1a3324]/30 border-t-[#1a3324] rounded-full animate-spin"></div>
                                Verifying...
                              </>
                            ) : (
                              <>
                                <span className="material-icons-round text-lg">check_circle</span>
                                Submit
                              </>
                            )}
                          </button>
                        </div>
                        {otpError && (
                          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <span className="material-icons-round text-sm">error_outline</span>
                            {otpError}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            disabled={otpResendTimer > 0}
                            onClick={handleSendOtp}
                            className={`text-xs font-semibold transition-colors cursor-pointer bg-transparent border-none ${
                              otpResendTimer > 0
                                ? "text-[#4d6b59]/50 cursor-not-allowed"
                                : "text-[#13ec6d] hover:text-[#0fb955]"
                            }`}
                          >
                            {otpResendTimer > 0 ? `Resend OTP in ${otpResendTimer}s` : "Resend OTP"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtp("");
                              setOtpError(null);
                            }}
                            className="text-xs font-semibold text-[#4d6b59] hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none"
                          >
                            Change Aadhaar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Verification Success */}
                    {aadhaarVerified && (
                      <div className="mt-2 flex items-center gap-2 text-[#13ec6d] animate-fade-in-up">
                        <span className="material-icons-round text-lg">check_circle</span>
                        <span className="text-sm font-bold">Aadhaar verified successfully</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="btn-register-farmer"
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-4 rounded-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-2 font-bold text-lg relative overflow-hidden group cursor-pointer ${
                    isFormValid && !isSubmitting
                      ? "bg-[#13ec6d] hover:bg-[#0fb955] text-[#1a3324] shadow-lg shadow-[#13ec6d]/30 hover:shadow-xl hover:shadow-[#13ec6d]/40"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isFormValid && !isSubmitting && (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                  )}
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#102218]/30 border-t-[#102218] rounded-full animate-spin"></div>
                      <span className="relative z-10">Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Register & Verify</span>
                      <span className="material-icons-round text-lg relative z-10 group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div
            className={`mt-6 text-center transition-all duration-700 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <p className="text-[#4d6b59] dark:text-gray-400 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#13ec6d] font-bold hover:text-[#0fb955] transition-colors cursor-pointer bg-transparent border-none"
              >
                Sign In
              </button>
            </p>
            <div className="flex items-center justify-center gap-1 mt-4 opacity-70">
              <span className="material-icons-round text-xs text-[#13ec6d]">
                verified_user
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#4d6b59] dark:text-slate-300">
                Secured by Blockchain
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Demo OTP Toast Popup */}
      {demoOtpToast && (
        <div className="fixed top-6 right-6 z-[999] animate-fade-in-up">
          <div className="bg-[#1a3324] dark:bg-[#0c1510] text-white px-6 py-4 rounded-2xl shadow-2xl shadow-black/30 border border-[#13ec6d]/30 flex items-start gap-3 max-w-xs">
            <div className="w-10 h-10 rounded-xl bg-[#13ec6d]/20 flex items-center justify-center shrink-0">
              <span className="material-icons-round text-[#13ec6d] text-xl">sms</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#13ec6d] mb-0.5">OTP Sent!</p>
              <p className="text-xs text-gray-300">Your demo OTP is:</p>
              <p className="text-2xl font-black tracking-[0.3em] text-white mt-1">123456</p>
            </div>
            <button
              onClick={() => setDemoOtpToast(false)}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer bg-transparent border-none shrink-0 mt-0.5"
            >
              <span className="material-icons-round text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerRegistration;
