import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { copyToClipboard } from "../../blockchain/walletUtils";

export default function SellerWalletPage() {
  const { wallet, walletLoading, transactions, deposit, withdraw, fetchTransactions } =
    useWallet();
  const { user } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [visibleSalesCount, setVisibleSalesCount] = useState(5);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch sales history — orders where this farmer sold credits
  useEffect(() => {
    const fetchSalesHistory = async () => {
      if (!user) return;
      setSalesLoading(true);

      try {
        // Step 1: Get all order_items for this farmer
        const { data: items, error: itemsErr } = await supabase
          .from("order_items")
          .select(`
            id,
            quantity,
            price_per_credit,
            credits_purchased,
            farmer_wallet_address,
            order_id,
            created_at,
            farmer_projects ( project_name )
          `)
          .eq("farmer_id", user.id)
          .order("created_at", { ascending: false });

        if (itemsErr || !items || items.length === 0) {
          setSalesHistory([]);
          setSalesLoading(false);
          return;
        }

        // Step 2: Fetch all related orders in one query
        const orderIds = [...new Set(items.map((i) => i.order_id).filter(Boolean))];
        let ordersMap = {};

        if (orderIds.length > 0) {
          const { data: ordersData } = await supabase
            .from("orders")
            .select("id, buyer_id, total_amount, created_at, status, buyer_wallet_address, payment_method")
            .in("id", orderIds);

          if (ordersData) {
            ordersData.forEach((o) => {
              ordersMap[o.id] = o;
            });
          }
        }

        // Step 3: Merge and ensure descending sort
        const merged = items.map((item) => ({
          ...item,
          orders: ordersMap[item.order_id] || null,
        }));

        console.log("DEBUG: Merged items before sort:", merged);

        merged.sort((a, b) => {
          const dateA = new Date(a.created_at || a.orders?.created_at || 0).getTime();
          const dateB = new Date(b.created_at || b.orders?.created_at || 0).getTime();
          
          if (dateA === 0 || dateB === 0) {
            console.warn("DEBUG: Missing created_at for sorting!", { a, b, dateA, dateB });
          }

          return dateB - dateA; // newest first (descending)
        });

        console.log("DEBUG: Merged items after sort:", merged);

        setSalesHistory(merged);
      } catch (err) {
        console.error("Sales history error:", err);
        setSalesHistory([]);
      }
      setSalesLoading(false);
    };
    fetchSalesHistory();
  }, [user]);

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
      showToast(`₹${val.toLocaleString("en-IN")} deposited!`);
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
      showToast(`₹${val.toLocaleString("en-IN")} withdrawn!`);
      setAmount("");
      setShowWithdraw(false);
    } else {
      showToast(result.error || "Withdrawal failed", true);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "deposit": return "arrow_downward";
      case "withdraw": return "arrow_upward";
      case "purchase": return "shopping_cart";
      case "sale": return "sell";
      default: return "swap_horiz";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "deposit": case "sale": return "#13ec6d";
      case "withdraw": case "purchase": return "#f59e0b";
      default: return "#718b7c";
    }
  };

  // Calculate total earnings from sales
  const totalEarnings = salesHistory.reduce(
    (sum, item) => sum + (item.quantity * item.price_per_credit),
    0
  );
  const totalCreditsSold = salesHistory.reduce(
    (sum, item) => sum + (item.credits_purchased || item.quantity),
    0
  );

  if (walletLoading) {
    return (
      <div className="p-6 md:p-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined block text-5xl text-[#13ec6d] mb-3 animate-spin">
            progress_activity
          </span>
          <p className="text-[#718b7c] font-medium">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl font-[Manrope] animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0c1510] tracking-tight">
          Wallet
        </h1>
        <p className="text-[#718b7c] text-sm mt-1">
          Manage your earnings and transactions
        </p>
      </div>

      {/* ── Top Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* Wallet Card (spans 2 cols on lg) */}
        <div
          className="lg:col-span-2 rounded-2xl p-7 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0c1f14 0%, #102a1a 50%, #0a1e12 100%)",
            border: "1px solid rgba(19, 236, 109, 0.2)",
          }}
        >
          {/* Decorations */}
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #13ec6d, transparent)" }} />
          <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full opacity-5"
            style={{ background: "radial-gradient(circle, #13ec6d, transparent)" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined" style={{ color: "#13ec6d", fontSize: "1.25rem" }}>
                account_balance_wallet
              </span>
              <span className="text-[#9db0a5] text-xs font-bold uppercase tracking-widest">
                CarbonX Farmer Wallet
              </span>
            </div>

            {/* Address */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 mt-3 mb-5 bg-white/[0.06] rounded-lg px-3 py-2 border border-white/[0.08] hover:border-[#13ec6d]/40 transition-colors cursor-pointer w-fit"
            >
              <span className="font-mono text-sm text-[#e0e8e3] tracking-wide break-all">
                {wallet?.wallet_address || "—"}
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: "0.85rem", color: copied ? "#13ec6d" : "#9db0a5" }}>
                {copied ? "check" : "content_copy"}
              </span>
            </button>

            {/* Balance */}
            <p className="text-[#9db0a5] text-xs font-bold uppercase tracking-widest mb-1">
              Available Balance
            </p>
            <h2 className="text-4xl font-black text-white tracking-tight">
              ₹{Number(wallet?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-2xl border border-[#e3e8e5] p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-[#9db0a5] uppercase tracking-widest mb-4">
              Sales Overview
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-black text-[#0c1510]">
                  ₹{totalEarnings.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-[#718b7c]">Total Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0c1510]">
                  {totalCreditsSold}
                </p>
                <p className="text-xs text-[#718b7c]">Credits Sold</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0c1510]">
                  {salesHistory.length}
                </p>
                <p className="text-xs text-[#718b7c]">Total Sales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button
          onClick={() => { setAmount(""); setShowDeposit(true); }}
          className="bg-[#13ec6d] hover:bg-[#0fc85d] text-[#0c1510] font-black py-4 rounded-xl transition-all hover:shadow-lg text-sm cursor-pointer border-none font-[Manrope] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>arrow_downward</span>
          Deposit
        </button>
        <button
          onClick={() => { setAmount(""); setShowWithdraw(true); }}
          className="bg-white hover:bg-[#f6f8f7] text-[#0c1510] font-black py-4 rounded-xl transition-all text-sm cursor-pointer border border-[#e3e8e5] hover:border-[#13ec6d] font-[Manrope] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>arrow_upward</span>
          Withdraw
        </button>
        <button
          className="bg-white hover:bg-[#f6f8f7] text-[#0c1510] font-black py-4 rounded-xl transition-all text-sm cursor-pointer border border-[#e3e8e5] font-[Manrope] flex items-center justify-center gap-2 opacity-60 cursor-default"
          disabled
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>swap_horiz</span>
          Transfer
        </button>
        <button
          className="bg-white hover:bg-[#f6f8f7] text-[#0c1510] font-black py-4 rounded-xl transition-all text-sm cursor-pointer border border-[#e3e8e5] font-[Manrope] flex items-center justify-center gap-2 opacity-60 cursor-default"
          disabled
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>qr_code_2</span>
          Receive
        </button>
      </div>

      {/* ── Two-column: Wallet Txns + Sales History ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Wallet Transactions */}
        <div>
          <h3 className="text-lg font-bold text-[#0c1510] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: "#13ec6d" }}>
              receipt_long
            </span>
            Wallet Activity
          </h3>
          {transactions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-[#e3e8e5]">
              <span className="material-symbols-outlined block text-4xl text-[#c7d1cc] mb-2">
                receipt_long
              </span>
              <p className="text-[#718b7c] text-sm">No wallet transactions yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-xl p-4 border border-[#e3e8e5] flex items-center gap-3 hover:border-[#13ec6d]/30 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${getTypeColor(tx.type)}15` }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: getTypeColor(tx.type) }}>
                      {getTypeIcon(tx.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#0c1510] truncate">
                      {tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </p>
                    <p className="text-xs text-[#9db0a5]">
                      {new Date(tx.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      {" • "}
                      {new Date(tx.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {tx.tx_hash && (
                      <p className="text-[10px] font-mono text-[#9db0a5] mt-1 truncate">
                        Tx: {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-6)}
                      </p>
                    )}
                  </div>
                  <p className="font-black text-sm flex-shrink-0" style={{ color: getTypeColor(tx.type) }}>
                    {tx.type === "deposit" || tx.type === "sale" ? "+" : "−"}
                    ₹{Number(tx.amount).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales History — Credits Sold to Buyers */}
        <div>
          <h3 className="text-lg font-bold text-[#0c1510] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: "#13ec6d" }}>
              storefront
            </span>
            Sales History
          </h3>
          {salesLoading ? (
            <div className="text-center py-10 bg-white rounded-xl border border-[#e3e8e5]">
              <span className="material-symbols-outlined block text-3xl text-[#13ec6d] animate-spin mb-2">
                progress_activity
              </span>
              <p className="text-[#718b7c] text-sm">Loading sales…</p>
            </div>
          ) : salesHistory.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-[#e3e8e5]">
              <span className="material-symbols-outlined block text-4xl text-[#c7d1cc] mb-2">
                storefront
              </span>
              <p className="text-[#718b7c] text-sm">No sales yet — your credits are waiting for buyers!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {salesHistory.slice(0, visibleSalesCount).map((item) => {
                const itemTotal = item.quantity * item.price_per_credit;
                const projectName = item.farmer_projects?.project_name || "Carbon Credits";
                const orderDate = item.orders?.created_at ? new Date(item.orders.created_at) : null;
                const payMethod = item.orders?.payment_method;
                const buyerAddr = item.orders?.buyer_wallet_address;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-4 border border-[#e3e8e5] hover:border-[#13ec6d]/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#13ec6d]/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: "#13ec6d" }}>
                          sell
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm text-[#0c1510] truncate">
                            {projectName}
                          </p>
                          <p className="font-black text-sm text-[#13ec6d] flex-shrink-0">
                            +₹{itemTotal.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <p className="text-xs text-[#718b7c] mt-0.5">
                          {item.quantity} credits × ₹{Number(item.price_per_credit).toLocaleString("en-IN")}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {orderDate && (
                            <span className="text-[10px] text-[#9db0a5]">
                              {orderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              {" • "}
                              {orderDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                          {payMethod && (
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              payMethod === "metamask"
                                ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                                : "bg-[#13ec6d]/10 text-[#13ec6d]"
                            }`}>
                              <span className="material-symbols-outlined" style={{ fontSize: "0.6rem" }}>
                                {payMethod === "metamask" ? "link" : "account_balance_wallet"}
                              </span>
                              {payMethod === "metamask" ? "MetaMask" : "CarbonX"}
                            </span>
                          )}
                        </div>
                        {buyerAddr && (
                          <p className="text-[10px] font-mono text-[#9db0a5] mt-1 truncate">
                            Buyer: {buyerAddr.slice(0, 6)}…{buyerAddr.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Show More / Show Less Buttons */}
              {salesHistory.length > 5 && (
                <div className="mt-2 flex items-center justify-center gap-4 border-t border-[#e3e8e5] pt-4">
                  {visibleSalesCount < salesHistory.length && (
                    <button
                      onClick={() => setVisibleSalesCount((prev) => prev + 5)}
                      className="text-[#13ec6d] font-bold text-sm bg-transparent border-none cursor-pointer hover:underline flex items-center gap-1"
                    >
                      Show More <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>expand_more</span>
                    </button>
                  )}
                  {visibleSalesCount > 5 && (
                    <button
                      onClick={() => setVisibleSalesCount(5)}
                      className="text-[#718b7c] font-bold text-sm bg-transparent border-none cursor-pointer hover:underline flex items-center gap-1"
                    >
                      Show Less <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>expand_less</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Deposit Modal ─────────────────────────────────────── */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDeposit(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#13ec6d]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ color: "#13ec6d" }}>arrow_downward</span>
                </div>
                <h3 className="text-lg font-black text-[#0c1510]">Deposit Funds</h3>
              </div>
              <button onClick={() => setShowDeposit(false)}
                className="w-8 h-8 rounded-full bg-[#f0f4f2] flex items-center justify-center cursor-pointer border-none text-[#0c1510] hover:bg-[#e3e8e5] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <label className="text-xs font-bold text-[#9db0a5] uppercase tracking-widest mb-2 block">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              className="w-full bg-[#f6f8f7] border border-[#e3e8e5] rounded-xl py-4 px-4 text-lg font-bold text-[#0c1510] outline-none focus:ring-2 focus:ring-[#13ec6d] font-[Manrope] box-border"
            />

            <div className="grid grid-cols-4 gap-2 mt-3 mb-6">
              {[500, 1000, 5000, 10000].map((val) => (
                <button key={val} onClick={() => setAmount(String(val))}
                  className="py-2 rounded-lg border border-[#e3e8e5] text-xs font-bold text-[#0c1510] bg-transparent hover:border-[#13ec6d] hover:text-[#13ec6d] transition-colors cursor-pointer font-[Manrope]">
                  ₹{val.toLocaleString()}
                </button>
              ))}
            </div>

            <button onClick={handleDeposit} disabled={processing}
              className="w-full bg-[#13ec6d] hover:bg-[#0fc85d] text-[#0c1510] font-black py-4 rounded-xl transition-colors cursor-pointer border-none font-[Manrope] text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {processing ? "Processing..." : "Confirm Deposit"}
            </button>
          </div>
        </div>
      )}

      {/* ── Withdraw Modal ────────────────────────────────────── */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowWithdraw(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ color: "#f59e0b" }}>arrow_upward</span>
                </div>
                <h3 className="text-lg font-black text-[#0c1510]">Withdraw Funds</h3>
              </div>
              <button onClick={() => setShowWithdraw(false)}
                className="w-8 h-8 rounded-full bg-[#f0f4f2] flex items-center justify-center cursor-pointer border-none text-[#0c1510] hover:bg-[#e3e8e5] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-[#9db0a5] mb-4">
              Available: <span className="font-bold text-[#0c1510]">₹{Number(wallet?.balance || 0).toLocaleString("en-IN")}</span>
            </p>

            <label className="text-xs font-bold text-[#9db0a5] uppercase tracking-widest mb-2 block">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={wallet?.balance || 0}
              className="w-full bg-[#f6f8f7] border border-[#e3e8e5] rounded-xl py-4 px-4 text-lg font-bold text-[#0c1510] outline-none focus:ring-2 focus:ring-[#13ec6d] font-[Manrope] box-border"
            />

            <div className="mt-6">
              <button onClick={handleWithdraw} disabled={processing}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#0c1510] font-black py-4 rounded-xl transition-colors cursor-pointer border-none font-[Manrope] text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {processing ? "Processing..." : "Confirm Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 px-6 py-3 rounded-xl shadow-lg font-bold text-sm z-[200] animate-slide-up max-w-[300px]"
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
