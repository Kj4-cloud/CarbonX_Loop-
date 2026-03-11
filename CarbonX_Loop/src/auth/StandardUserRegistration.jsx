import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StandardUserRegistration = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    aadhaar: "",
    mobile: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // If user becomes authenticated, redirect to marketplace
  useEffect(() => {
    if (user && !successMessage) {
      navigate("/marketplace");
    }
  }, [user, navigate, successMessage]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null); // clear errors on input
  };

  const handleAadhaarChange = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 12);
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    handleInputChange("aadhaar", formatted);
  };

  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.password &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    formData.aadhaar.replace(/\s/g, "").length === 12 &&
    formData.mobile;

  const passwordsMatch =
    formData.confirmPassword === "" ||
    formData.password === formData.confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    const { data, error: signUpError } = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      aadhaar: formData.aadhaar,
      mobile: formData.mobile,
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message || "Registration failed. Please try again.");
      return;
    }

    // If email confirmation is required, Supabase won't auto-login the user
    if (data?.user && !data.session) {
      setSuccessMessage(
        "Account created! Please check your email to confirm your account, then log in.",
      );
    }
    // If auto-confirmed (e.g. email confirmation disabled), user state change
    // will trigger the redirect via the useEffect above
  };

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#102218] font-['Manrope',sans-serif] text-gray-800 dark:text-gray-100 min-h-screen flex flex-col">
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
          <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Carbon<span className="text-[#13ec6d]">X</span>
          </span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#13ec6d]">
            Buyer Registration
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
              id="btn-back-standard"
              onClick={() => navigate("/select-account")}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer active:scale-95 mb-6 bg-white dark:bg-[#1e382a] shadow-sm border border-slate-200 dark:border-transparent"
            >
              <span className="material-icons-round">arrow_back_ios_new</span>
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#13ec6d]/10 flex items-center justify-center">
                <span className="material-icons-round text-[#13ec6d] text-xl">
                  person
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Create Buyer Account
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              Join the secure carbon credit network. Fill in your details to
              start trading.
            </p>
          </div>

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

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 animate-fade-in-up">
              <span className="material-icons-round text-red-500 text-xl">
                error_outline
              </span>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none"
              >
                <span className="material-icons-round text-sm">close</span>
              </button>
            </div>
          )}

          {/* Form Card */}
          {!successMessage && (
            <div
              className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/5 p-6 sm:p-8 lg:p-10 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <form className="space-y-6" onSubmit={handleRegister}>
                {/* Two Column Layout on Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name Field */}
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${focusedField === "fullName" ? "text-[#13ec6d]" : "text-gray-500 dark:text-gray-400"}`}
                      htmlFor="fullName"
                    >
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-[#f6f8f7] dark:bg-[#1c2e24] border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 pr-12 text-base focus:border-[#13ec6d] focus:ring-0 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                        id="fullName"
                        placeholder="e.g. Rahul Sharma"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <span
                        className={`material-icons-round absolute right-3.5 top-3.5 transition-colors duration-200 pointer-events-none ${focusedField === "fullName" ? "text-[#13ec6d]" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        person_outline
                      </span>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${focusedField === "email" ? "text-[#13ec6d]" : "text-gray-500 dark:text-gray-400"}`}
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-[#f6f8f7] dark:bg-[#1c2e24] border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 pr-12 text-base focus:border-[#13ec6d] focus:ring-0 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                        id="email"
                        placeholder="you@example.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <span
                        className={`material-icons-round absolute right-3.5 top-3.5 transition-colors duration-200 pointer-events-none ${focusedField === "email" ? "text-[#13ec6d]" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        email
                      </span>
                    </div>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${focusedField === "password" ? "text-[#13ec6d]" : "text-gray-500 dark:text-gray-400"}`}
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-[#f6f8f7] dark:bg-[#1c2e24] border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 pr-12 text-base focus:border-[#13ec6d] focus:ring-0 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                        id="password"
                        placeholder="Min. 6 characters"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#13ec6d] transition-colors cursor-pointer bg-transparent border-none p-0"
                        tabIndex={-1}
                      >
                        <span className="material-icons-round text-xl">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {formData.password && formData.password.length < 6 && (
                      <p className="text-xs text-amber-500 mt-1.5 ml-1 flex items-center gap-1">
                        <span className="material-icons-round text-[14px]">
                          info
                        </span>
                        Must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${focusedField === "confirmPassword" ? "text-[#13ec6d]" : "text-gray-500 dark:text-gray-400"}`}
                      htmlFor="confirmPassword"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full bg-[#f6f8f7] dark:bg-[#1c2e24] border-2 rounded-xl px-4 py-3.5 pr-12 text-base focus:ring-0 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-600 ${
                          !passwordsMatch
                            ? "border-red-400 focus:border-red-400"
                            : "border-gray-200 dark:border-gray-700 focus:border-[#13ec6d]"
                        }`}
                        id="confirmPassword"
                        placeholder="Re-enter password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#13ec6d] transition-colors cursor-pointer bg-transparent border-none p-0"
                        tabIndex={-1}
                      >
                        <span className="material-icons-round text-xl">
                          {showConfirmPassword
                            ? "visibility_off"
                            : "visibility"}
                        </span>
                      </button>
                    </div>
                    {!passwordsMatch && (
                      <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">
                        <span className="material-icons-round text-[14px]">
                          error
                        </span>
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                {/* Aadhaar Number Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${focusedField === "aadhaar" ? "text-[#13ec6d]" : "text-gray-500 dark:text-gray-400"}`}
                      htmlFor="aadhaar"
                    >
                      Aadhaar Number
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-[#f6f8f7] dark:bg-[#1c2e24] border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 pr-12 text-base font-medium tracking-wide focus:border-[#13ec6d] focus:ring-0 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                        id="aadhaar"
                        maxLength="14"
                        placeholder="XXXX XXXX XXXX"
                        type="tel"
                        value={formData.aadhaar}
                        onChange={(e) => handleAadhaarChange(e.target.value)}
                        onFocus={() => setFocusedField("aadhaar")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <span
                        className={`material-icons-round absolute right-3.5 top-3.5 transition-colors duration-200 pointer-events-none ${focusedField === "aadhaar" ? "text-[#13ec6d]" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        fingerprint
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-1 flex items-center">
                      <span className="material-icons-round text-[14px] mr-1 text-[#13ec6d]">
                        lock
                      </span>
                      Encrypted & stored securely
                    </p>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider transition-colors duration-200 ${focusedField === "mobile" ? "text-[#13ec6d]" : "text-gray-500 dark:text-gray-400"}`}
                      htmlFor="mobile"
                    >
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-[#f6f8f7] dark:bg-[#1c2e24] border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 pr-12 text-base focus:border-[#13ec6d] focus:ring-0 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                        id="mobile"
                        placeholder="+91 98765 43210"
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) =>
                          handleInputChange("mobile", e.target.value)
                        }
                        onFocus={() => setFocusedField("mobile")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <span
                        className={`material-icons-round absolute right-3.5 top-3.5 transition-colors duration-200 pointer-events-none ${focusedField === "mobile" ? "text-[#13ec6d]" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        phone_android
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upload Identity Proof */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wider">
                    Identity Proof{" "}
                    <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">
                      (optional)
                    </span>
                  </label>
                  {uploadedFile ? (
                    <div className="w-full border-2 border-[#13ec6d] bg-[#13ec6d]/5 rounded-xl p-4 flex items-center gap-3 animate-scale-in">
                      <div className="w-12 h-12 rounded-xl bg-[#13ec6d]/15 flex items-center justify-center">
                        <span className="material-icons-round text-[#13ec6d] text-xl">
                          description
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {uploadedFile}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <span className="material-icons-round text-[#13ec6d] text-xs">
                            check_circle
                          </span>
                          Uploaded successfully
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-icons-round text-red-400 text-sm">
                          close
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`relative w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group overflow-hidden ${
                        dragOver
                          ? "border-[#13ec6d] bg-[#13ec6d]/10 scale-[1.01]"
                          : "border-gray-300 dark:border-gray-600 bg-[#f6f8f7] dark:bg-[#1c2e24] hover:border-[#13ec6d] hover:bg-[#13ec6d]/5"
                      }`}
                      onClick={() => setUploadedFile("aadhaar_card_front.jpg")}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        setUploadedFile("aadhaar_card_front.jpg");
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-[#102218] shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-[#13ec6d]/10 transition-all duration-300 z-10">
                        <span className="material-icons-round text-xl text-[#13ec6d]">
                          photo_camera
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        JPG, PNG, PDF • Max 5MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    id="btn-register-standard"
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] font-bold text-lg relative overflow-hidden group cursor-pointer ${
                      isFormValid && !isSubmitting
                        ? "bg-[#13ec6d] hover:bg-[#0fb955] text-[#102218] shadow-lg shadow-[#13ec6d]/30 hover:shadow-xl hover:shadow-[#13ec6d]/40"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {isFormValid && !isSubmitting && (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                    )}
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="relative z-10">
                          Creating Account...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">Create Account</span>
                        <span className="material-icons-round text-xl relative z-10 group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Trust Badges */}
          <div
            className={`mt-6 transition-all duration-700 delay-400 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="flex justify-center items-center gap-4 opacity-70">
              <div className="flex items-center gap-1.5">
                <span className="material-icons-round text-[#13ec6d] text-sm">
                  verified_user
                </span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Bank Grade Security
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1.5">
                <span className="material-icons-round text-[#13ec6d] text-sm">
                  storage
                </span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Blockchain Verified
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center mt-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Already have an account?
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#13ec6d] font-bold hover:text-[#0fb955] ml-1.5 transition-colors cursor-pointer bg-transparent border-none"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardUserRegistration;
