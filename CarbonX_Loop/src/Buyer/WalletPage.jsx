import React, { useState, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { formatAddress, copyToClipboard } from "../blockchain/walletUtils";

export default function WalletPage() {
  const { wallet, walletLoading, transactions, deposit, withdraw } =
    useWallet();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCopy = async () => {
    if (!wallet?.wallet_address) return;
    await copyToClipboard(wallet.wallet_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      showToast("Enter a valid amount", true);
      return;
    }
    setProcessing(true);
    const result = await deposit(val);
    setProcessing(false);
    if (result.success) {
      showToast(`₹${val.toLocaleString("en-IN")} deposited successfully!`);
      setAmount("");
      setShowDeposit(false);
    } else {
      showToast(result.error || "Deposit failed", true);
    }
  };

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      showToast("Enter a valid amount", true);
      return;
    }
    if (val > wallet.balance) {
      showToast("Insufficient balance", true);
      return;
    }
    setProcessing(true);
    const result = await withdraw(val);
    setProcessing(false);
    if (result.success) {
      showToast(`₹${val.toLocaleString("en-IN")} withdrawn successfully!`);
      setAmount("");
      setShowWithdraw(false);
    } else {
      showToast(result.error || "Withdrawal failed", true);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "deposit":
        return "arrow_downward";
      case "withdraw":
        return "arrow_upward";
      case "purchase":
        return "shopping_cart";
      case "sale":
        return "sell";
      default:
        return "swap_horiz";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "deposit":
      case "sale":
        return "#13ec6d";
      case "withdraw":
      case "purchase":
        return "#f59e0b";
      default:
        return "#718b7c";
    }
  };

  if (walletLoading) {
    return (
      <div className="px-5 py-12 text-center animate-slide-up">
        <span className="material-icons-round block text-4xl text-[#13ec6d] mb-3 animate-spin">
          progress_activity
        </span>
        <p className="text-[#718b7c]">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="px-5 flex flex-col gap-5 animate-slide-up pb-8">
      {/* ── Wallet Card ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 border relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0c1f14 0%, #102a1a 50%, #0a1e12 100%)",
          borderColor: "rgba(19, 236, 109, 0.2)",
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #13ec6d, transparent)" }}
        />
        <div
          className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #13ec6d, transparent)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="material-icons-round"
              style={{ color: "#13ec6d", fontSize: "1.25rem" }}
            >
              account_balance_wallet
            </span>
            <span className="text-[#9db0a5] text-xs font-bold uppercase tracking-wider">
              CarbonX Wallet
            </span>
          </div>

          {/* Address */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 mt-2 mb-4 bg-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.08)] hover:border-[#13ec6d]/40 transition-colors cursor-pointer w-fit"
          >
            <span className="font-mono text-sm text-[#e0e8e3] tracking-wide">
              {wallet?.wallet_address || "—"}
            </span>
            <span
              className="material-icons-round"
              style={{
                fontSize: "0.875rem",
                color: copied ? "#13ec6d" : "#9db0a5",
              }}
            >
              {copied ? "check" : "content_copy"}
            </span>
          </button>

          {/* Balance */}
          <p className="text-[#9db0a5] text-xs font-bold uppercase tracking-wider mb-1">
            Available Balance
          </p>
          <h2 className="text-4xl font-black text-white tracking-tight">
            ₹
            {Number(wallet?.balance || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </h2>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setAmount("");
            setShowDeposit(true);
          }}
          className="bg-[#13ec6d] hover:bg-[#0fc85d] text-[#0c1510] font-black py-4 rounded-xl transition-all hover:shadow-lg text-sm cursor-pointer border-none font-[Manrope] flex items-center justify-center gap-2"
        >
          <span className="material-icons-round" style={{ fontSize: "1.25rem" }}>
            arrow_downward
          </span>
          Deposit
        </button>
        <button
          onClick={() => {
            setAmount("");
            setShowWithdraw(true);
          }}
          className="bg-white dark:bg-[#1a2b21] hover:bg-[#f0f4f2] dark:hover:bg-[#2d4235] text-[#0c1510] dark:text-[#f0f4f2] font-black py-4 rounded-xl transition-all text-sm cursor-pointer border border-[#e3e8e5] dark:border-[#2d4235] font-[Manrope] flex items-center justify-center gap-2"
        >
          <span className="material-icons-round" style={{ fontSize: "1.25rem" }}>
            arrow_upward
          </span>
          Withdraw
        </button>
      </div>

      {/* ── Transaction History ──────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-[#0c1510] dark:text-[#f0f4f2] mb-3">
          Recent Transactions
        </h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-[#1a2b21] rounded-xl border border-[#e3e8e5] dark:border-[#2d4235]">
            <span className="material-icons-round block text-4xl text-[#c7d1cc] dark:text-[#4a6354] mb-2">
              receipt_long
            </span>
            <p className="text-[#718b7c] text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white dark:bg-[#1a2b21] rounded-xl p-4 border border-[#e3e8e5] dark:border-[#2d4235] flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${getTypeColor(tx.type)}15`,
                  }}
                >
                  <span
                    className="material-icons-round"
                    style={{
                      fontSize: "1.25rem",
                      color: getTypeColor(tx.type),
                    }}
                  >
                    {getTypeIcon(tx.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#0c1510] dark:text-[#f0f4f2] truncate">
                    {tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </p>
                  <p className="text-xs text-[#9db0a5]">
                    {new Date(tx.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    •{" "}
                    {new Date(tx.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p
                  className="font-black text-sm flex-shrink-0"
                  style={{
                    color:
                      tx.type === "deposit" || tx.type === "sale"
                        ? "#13ec6d"
                        : "#f59e0b",
                  }}
                >
                  {tx.type === "deposit" || tx.type === "sale" ? "+" : "−"}₹
                  {Number(tx.amount).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Deposit Modal ───────────────────────────────────────────── */}
      {showDeposit && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDeposit(false)}
        >
          <div
            className="bg-white dark:bg-[#1a2b21] rounded-2xl max-w-sm w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#13ec6d]/10 flex items-center justify-center">
                  <span
                    className="material-icons-round"
                    style={{ color: "#13ec6d" }}
                  >
                    arrow_downward
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#0c1510] dark:text-[#f0f4f2]">
                  Deposit Funds
                </h3>
              </div>
              <button
                onClick={() => setShowDeposit(false)}
                className="w-8 h-8 rounded-full bg-[#f0f4f2] dark:bg-[#2d4235] flex items-center justify-center cursor-pointer border-none text-[#0c1510] dark:text-[#f0f4f2]"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-[#9db0a5] uppercase tracking-wider mb-2 block">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                className="w-full bg-[#f6f8f7] dark:bg-[#102218] border border-[#e3e8e5] dark:border-[#2d4235] rounded-xl py-4 px-4 text-lg font-bold text-[#0c1510] dark:text-[#f0f4f2] outline-none focus:ring-2 focus:ring-[#13ec6d] font-[Manrope]"
              />
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[500, 1000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(String(val))}
                  className="py-2 rounded-lg border border-[#e3e8e5] dark:border-[#2d4235] text-xs font-bold text-[#0c1510] dark:text-[#f0f4f2] bg-transparent hover:border-[#13ec6d] hover:text-[#13ec6d] transition-colors cursor-pointer font-[Manrope]"
                >
                  ₹{val.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={handleDeposit}
              disabled={processing}
              className="w-full bg-[#13ec6d] hover:bg-[#0fc85d] text-[#0c1510] font-black py-4 rounded-xl transition-colors cursor-pointer border-none font-[Manrope] text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Confirm Deposit"}
            </button>
          </div>
        </div>
      )}

      {/* ── Withdraw Modal ───────────────────────────────────────────── */}
      {showWithdraw && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowWithdraw(false)}
        >
          <div
            className="bg-white dark:bg-[#1a2b21] rounded-2xl max-w-sm w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                  <span
                    className="material-icons-round"
                    style={{ color: "#f59e0b" }}
                  >
                    arrow_upward
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#0c1510] dark:text-[#f0f4f2]">
                  Withdraw Funds
                </h3>
              </div>
              <button
                onClick={() => setShowWithdraw(false)}
                className="w-8 h-8 rounded-full bg-[#f0f4f2] dark:bg-[#2d4235] flex items-center justify-center cursor-pointer border-none text-[#0c1510] dark:text-[#f0f4f2]"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <p className="text-sm text-[#9db0a5] mb-4">
              Available:{" "}
              <span className="font-bold text-[#0c1510] dark:text-[#f0f4f2]">
                ₹{Number(wallet?.balance || 0).toLocaleString("en-IN")}
              </span>
            </p>

            <div className="mb-6">
              <label className="text-xs font-bold text-[#9db0a5] uppercase tracking-wider mb-2 block">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={wallet?.balance || 0}
                className="w-full bg-[#f6f8f7] dark:bg-[#102218] border border-[#e3e8e5] dark:border-[#2d4235] rounded-xl py-4 px-4 text-lg font-bold text-[#0c1510] dark:text-[#f0f4f2] outline-none focus:ring-2 focus:ring-[#13ec6d] font-[Manrope]"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#0c1510] font-black py-4 rounded-xl transition-colors cursor-pointer border-none font-[Manrope] text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 right-5 px-6 py-3 rounded-xl shadow-lg font-bold text-sm z-[200] animate-notif max-w-[300px]"
          style={{
            background: toast.isError ? "#ef4444" : "#13ec6d",
            color: toast.isError ? "white" : "#0c1510",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
