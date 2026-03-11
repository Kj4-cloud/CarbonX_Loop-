import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TransactionHistory } from "./Transaction-History";

const menuItems = [
  { icon: "receipt_long", label: "Transaction History" },
  { icon: "settings", label: "Settings" },
  { icon: "help", label: "Help & Support" },
];

export default function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] =
    useState(false);

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || "User";
  const displayEmail = user?.email || "—";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="px-5 flex flex-col gap-6 animate-slide-up">
      {/* Profile card */}
      <div className="bg-white dark:bg-[#1a2b21] rounded-2xl p-6 border border-[#e3e8e5] dark:border-[#2d4235] text-center">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-[#13ec6d] bg-[#e3e8e5] dark:bg-[#2d4235] flex items-center justify-center">
          {user?.user_metadata?.avatar_url ? (
            <img
              className="w-full h-full object-cover"
              src={user.user_metadata.avatar_url}
              alt="Profile"
            />
          ) : (
            <span className="material-icons-round text-5xl text-[#13ec6d]">
              person
            </span>
          )}
        </div>
        <h2 className="text-xl font-black text-[#0c1510] dark:text-[#f0f4f2] mb-1">
          {displayName}
        </h2>
        <p className="text-[#718b7c] text-sm">{displayEmail}</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[rgba(19,236,109,0.1)] text-[#13ec6d] rounded-full text-sm font-bold">
          <span
            className="material-icons-round"
            style={{ fontSize: "0.875rem" }}
          >
            verified
          </span>
          Verified Buyer
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.label === "Transaction History") {
                setIsTransactionHistoryOpen(true);
              }
            }}
            className="w-full bg-white dark:bg-[#1a2b21] rounded-xl p-4 border border-[#e3e8e5] dark:border-[#2d4235] flex items-center justify-between hover:border-[#13ec6d] transition-colors cursor-pointer font-[Manrope] text-[#0c1510] dark:text-[#f0f4f2]"
          >
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-[#13ec6d]">
                {item.icon}
              </span>
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            <span className="material-icons-round text-[#9db0a5]">
              chevron_right
            </span>
          </button>
        ))}

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-900/30 flex items-center justify-between hover:border-red-400 transition-colors cursor-pointer font-[Manrope] text-red-600 dark:text-red-400 mt-2"
        >
          <div className="flex items-center gap-3">
            <span className="material-icons-round">
              {isSigningOut ? "hourglass_empty" : "logout"}
            </span>
            <span className="font-bold text-sm">
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </span>
          </div>
          <span className="material-icons-round text-red-300 dark:text-red-700">
            chevron_right
          </span>
        </button>
      </div>

      {/* Transaction History Modal Overlay */}
      {isTransactionHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4 ">
          <div className=" m-6 bg-white dark:bg-[#102218] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative  h-[500px] overflow-y-auto scroll-hidden ">
            <button
              onClick={() => setIsTransactionHistoryOpen(false)}
              className="absolute top-4 right-4 text-[#718b7c] hover:text-[#0c1510] dark:hover:text-[#f0f4f2] transition-colors z-10"
            >
              
              <span className="material-icons-round">close</span>
            </button>

            <div className=" w-full h-full">
              <TransactionHistory />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
