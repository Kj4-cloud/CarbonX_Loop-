import React from "react";

const NAV_ITEMS = [
  { key: "marketplace", icon: "explore", label: "Market" },
  { key: "portfolio", icon: "pie_chart", label: "Portfolio" },
  { key: "blockchain_proof", icon: "verified_user", label: "Proof" },
  { key: "wallet", icon: "account_balance_wallet", label: "Wallet" },
  { key: "impact", icon: "eco", label: "Impact" },
  { key: "account", icon: "person", label: "Account" },
];

export default function BottomNav({
  currentPage,
  onNavigate,
  onCartOpen,
  totalItems,
}) {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[rgba(12,21,16,0.85)] backdrop-blur-xl border-t border-[#e3e8e5] dark:border-[#1a2b21] px-6 py-3 pb-8 z-50"
    >
      <div className="flex justify-between items-center max-w-md mx-auto">
        {/* Left side: Market + Portfolio + Proof */}
        {NAV_ITEMS.slice(0, 3).map((item) => (
          <button
            key={item.key}
            data-page={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer border-none bg-transparent font-[Manrope]
              ${currentPage === item.key ? "text-[#13ec6d]" : "text-[#9db0a5] hover:text-[#13ec6d]"}`}
          >
            <span className="material-icons-round">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {item.label}
            </span>
          </button>
        ))}

        {/* Cart FAB */}
        <div className="relative -top-6">
          <button
            id="cart-btn"
            onClick={onCartOpen}
            aria-label="Open cart"
            className="w-14 h-14 bg-[#13ec6d] text-[#0c1510] rounded-full shadow-lg flex items-center justify-center border-4 border-[#f6f8f7] dark:border-[#102218] animate-pulse-ring hover:scale-110 transition-transform cursor-pointer relative"
          >
            <span
              className="material-icons-round"
              style={{ fontSize: "1.875rem" }}
            >
              add_shopping_cart
            </span>
            {totalItems > 0 && (
              <span
                id="cart-count"
                className="cart-badge bg-[#13ec6d] text-[#0c1510] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black"
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Right side: Wallet + Impact + Account */}
        {NAV_ITEMS.slice(3).map((item) => (
          <button
            key={item.key}
            data-page={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer border-none bg-transparent font-[Manrope]
              ${currentPage === item.key ? "text-[#13ec6d]" : "text-[#9db0a5] hover:text-[#13ec6d]"}`}
          >
            <span className="material-icons-round">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
