import React, { useCallback } from "react";
import { formatAddress } from "../blockchain/walletUtils";

/**
 * InvoicePage — Displayed after successful checkout.
 * Shows complete purchase details, wallet addresses, and offers PDF download.
 */
export default function InvoicePage({ invoiceData, onBackToMarket, onViewHistory }) {
  const {
    order,
    orderItems,
    txHash,
    paymentMethod,
    buyerName,
    buyerWallet,
    sellerWallets,
  } = invoiceData || {};

  const invoiceId = order?.id?.slice(0, 8).toUpperCase() || "—";
  const orderDate = order?.created_at
    ? new Date(order.created_at)
    : new Date();

  // ─── PDF Invoice Generator ────────────────────────────────────────────────
  const handleDownloadInvoice = useCallback(async () => {
    const W = 1200;
    const H = 1400;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#f8faf9");
    bg.addColorStop(1, "#eef2f0");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = "#13ec6d";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = "rgba(19,236,109,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#0c1510";
    ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("CARBONX", W / 2, 80);

    ctx.fillStyle = "#0c1510";
    ctx.font = "bold 34px 'Segoe UI', system-ui, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("PURCHASE INVOICE", W / 2, 125);

    // Divider
    ctx.strokeStyle = "#13ec6d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 150, 145);
    ctx.lineTo(W / 2 + 150, 145);
    ctx.stroke();

    // Helper
    const drawField = (x, y, label, value, maxW = 450) => {
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(12,21,16,0.5)";
      ctx.font = "600 12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(label.toUpperCase(), x, y);
      ctx.fillStyle = "#0c1510";
      ctx.font = "bold 17px 'Segoe UI', system-ui, sans-serif";
      let display = String(value);
      while (ctx.measureText(display).width > maxW && display.length > 3) {
        display = display.slice(0, -4) + "…";
      }
      ctx.fillText(display, x, y + 22);
    };

    const colL = 80;
    const colR = W / 2 + 40;
    let y = 185;

    // Invoice details
    drawField(colL, y, "Invoice No.", `INV-${invoiceId}`);
    drawField(colR, y, "Date", orderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }));
    y += 65;

    drawField(colL, y, "Buyer", buyerName || "—");
    drawField(colR, y, "Payment Method", paymentMethod === "metamask" ? "MetaMask Wallet" : "CarbonX Wallet");
    y += 65;

    drawField(colL, y, "Buyer Wallet", buyerWallet || "—", W - 160);
    y += 65;

    drawField(colL, y, "Transaction Hash", txHash || "—", W - 160);
    y += 65;

    // Line items header
    ctx.fillStyle = "#13ec6d10";
    ctx.fillRect(60, y, W - 120, 35);
    ctx.textAlign = "left";
    ctx.fillStyle = "#0c1510";
    ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("ITEM", 80, y + 23);
    ctx.fillText("QTY", 550, y + 23);
    ctx.fillText("PRICE", 680, y + 23);
    ctx.fillText("SELLER WALLET", 820, y + 23);
    ctx.fillText("SUBTOTAL", 1050, y + 23);
    y += 50;

    // Line items
    if (orderItems) {
      for (const item of orderItems) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#0c1510";
        ctx.font = "15px 'Segoe UI', system-ui, sans-serif";

        const itemName = item.name || item.farmer_projects?.project_name || "Carbon Credit";
        ctx.fillText(itemName.slice(0, 35), 80, y);
        ctx.fillText(String(item.quantity), 550, y);
        ctx.fillText(`₹${Number(item.price_per_credit || item.price || 0).toLocaleString("en-IN")}`, 680, y);

        const sellerAddr = item.farmer_wallet_address || (item.farmer_id && sellerWallets?.[item.farmer_id]) || "";
        ctx.fillStyle = "#718b7c";
        ctx.font = "12px monospace";
        ctx.fillText(sellerAddr ? formatAddress(sellerAddr) : "—", 820, y);

        const subtotal = (item.quantity || 0) * (item.price_per_credit || item.price || 0);
        ctx.fillStyle = "#0c1510";
        ctx.font = "bold 15px 'Segoe UI', system-ui, sans-serif";
        ctx.fillText(`₹${subtotal.toLocaleString("en-IN")}`, 1050, y);

        y += 35;
      }
    }

    // Total
    y += 20;
    ctx.strokeStyle = "#e3e8e5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 60, y);
    ctx.stroke();
    y += 35;

    ctx.textAlign = "left";
    ctx.fillStyle = "#0c1510";
    ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("TOTAL AMOUNT", 80, y);
    ctx.fillStyle = "#0ba048";
    ctx.font = "bold 28px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(`₹${Number(order?.total_amount || 0).toLocaleString("en-IN")}`, 1020, y);

    y += 25;
    ctx.fillStyle = "#0c1510";
    ctx.font = "bold 16px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("TOTAL CREDITS", 80, y);
    ctx.fillStyle = "#0ba048";
    ctx.font = "bold 22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(`${order?.total_credits || 0} tCO₂e`, 1020, y);

    // Status badge
    y += 60;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(19,236,109,0.1)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 80, y - 5, 160, 35, 18);
    ctx.fill();
    ctx.fillStyle = "#0ba048";
    ctx.font = "bold 14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("✓ PAYMENT COMPLETE", W / 2, y + 18);

    // Footer
    y = H - 60;
    ctx.fillStyle = "rgba(12,21,16,0.4)";
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "This invoice is digitally generated by CarbonX — India's premier carbon credit marketplace.",
      W / 2,
      y,
    );
    ctx.fillText(
      `Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} • Ref: CX-${invoiceId}`,
      W / 2,
      y + 18,
    );

    // Download as PDF
    const { jsPDF } = await import("jspdf");
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [W, H] });
    pdf.addImage(imgData, "PNG", 0, 0, W, H);
    pdf.save(`CarbonX-Invoice-${invoiceId}.pdf`);
  }, [order, orderItems, txHash, paymentMethod, buyerName, buyerWallet, sellerWallets, invoiceId, orderDate]);

  if (!invoiceData || !order) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-[#718b7c]">No invoice data available.</p>
      </div>
    );
  }

  return (
    <div className="px-5 flex flex-col gap-5 animate-slide-up pb-8">
      {/* Success Header */}
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-full bg-[#13ec6d]/10 mx-auto flex items-center justify-center mb-4">
          <span
            className="material-icons-round"
            style={{ fontSize: "2.5rem", color: "#13ec6d" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#0c1510] dark:text-[#f0f4f2]">
          Payment Successful!
        </h1>
        <p className="text-[#718b7c] text-sm mt-1">
          Your carbon credits have been purchased
        </p>
      </div>

      {/* Invoice Card */}
      <div className="bg-white dark:bg-[#1a2b21] rounded-2xl border border-[#e3e8e5] dark:border-[#2d4235] overflow-hidden">
        {/* Invoice Header */}
        <div className="p-4 border-b border-[#e3e8e5] dark:border-[#2d4235] flex justify-between items-center">
          <div>
            <p className="text-xs text-[#9db0a5] font-bold uppercase">
              Invoice
            </p>
            <p className="font-mono font-bold text-[#0c1510] dark:text-[#f0f4f2]">
              INV-{invoiceId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#9db0a5]">
              {orderDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-[#9db0a5]">
              {orderDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="p-4 border-b border-[#f0f4f2] dark:border-[#2d4235]/50">
          <p className="text-[10px] text-[#9db0a5] font-bold uppercase mb-1">
            Buyer
          </p>
          <p className="font-bold text-sm text-[#0c1510] dark:text-[#f0f4f2]">
            {buyerName}
          </p>
          <p className="text-xs text-[#9db0a5] font-mono mt-1">
            {buyerWallet || "—"}
          </p>
        </div>

        {/* Payment Info */}
        <div className="p-4 border-b border-[#f0f4f2] dark:border-[#2d4235]/50 flex gap-4">
          <div className="flex-1">
            <p className="text-[10px] text-[#9db0a5] font-bold uppercase mb-1">
              Payment Method
            </p>
            <div className="flex items-center gap-2">
              <span
                className="material-icons-round"
                style={{
                  fontSize: "0.875rem",
                  color:
                    paymentMethod === "metamask" ? "#f59e0b" : "#13ec6d",
                }}
              >
                {paymentMethod === "metamask"
                  ? "link"
                  : "account_balance_wallet"}
              </span>
              <p className="font-bold text-sm text-[#0c1510] dark:text-[#f0f4f2]">
                {paymentMethod === "metamask"
                  ? "MetaMask"
                  : "CarbonX Wallet"}
              </p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-[#9db0a5] font-bold uppercase mb-1">
              Tx Hash
            </p>
            <p className="text-xs text-[#718b7c] font-mono truncate">
              {txHash || "—"}
            </p>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-4 border-b border-[#f0f4f2] dark:border-[#2d4235]/50">
          <p className="text-[10px] text-[#9db0a5] font-bold uppercase mb-3">
            Items Purchased
          </p>
          {orderItems?.map((item, idx) => {
            const itemName = item.name || "Carbon Credits";
            const farmAddr = item.farmer_wallet_address || (item.farmer_id && sellerWallets?.[item.farmer_id]) || "";
            return (
              <div
                key={idx}
                className="py-3 border-b border-[#f6f8f7] dark:border-[#2d4235]/30 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-[#0c1510] dark:text-[#f0f4f2]">
                      {itemName}
                    </p>
                    <p className="text-xs text-[#718b7c]">
                      {item.quantity} credits × ₹
                      {Number(item.price_per_credit || item.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="font-black text-sm text-[#0c1510] dark:text-[#f0f4f2]">
                    ₹
                    {(
                      (item.quantity || 0) *
                      (item.price_per_credit || item.price || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
                {farmAddr && (
                  <p className="text-[10px] text-[#9db0a5] font-mono mt-1">
                    Seller: {farmAddr}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="p-4 bg-[#f6f8f7] dark:bg-[#102218]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[#718b7c]">Total Credits</span>
            <span className="font-bold text-sm text-[#0c1510] dark:text-[#f0f4f2]">
              {order.total_credits} tCO₂e
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#0c1510] dark:text-[#f0f4f2]">
              Total Amount
            </span>
            <span className="text-xl font-black text-[#13ec6d]">
              ₹{Number(order.total_amount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownloadInvoice}
          className="w-full bg-[#13ec6d] hover:bg-[#0fc85d] text-[#0c1510] font-black py-4 rounded-xl transition-colors cursor-pointer border-none font-[Manrope] text-sm flex items-center justify-center gap-2"
        >
          <span className="material-icons-round" style={{ fontSize: "1.25rem" }}>
            download
          </span>
          Download Invoice (PDF)
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onViewHistory}
            className="bg-white dark:bg-[#1a2b21] text-[#0c1510] dark:text-[#f0f4f2] font-bold py-3 rounded-xl border border-[#e3e8e5] dark:border-[#2d4235] cursor-pointer hover:border-[#13ec6d] transition-colors font-[Manrope] text-sm"
          >
            View History
          </button>
          <button
            onClick={onBackToMarket}
            className="bg-white dark:bg-[#1a2b21] text-[#0c1510] dark:text-[#f0f4f2] font-bold py-3 rounded-xl border border-[#e3e8e5] dark:border-[#2d4235] cursor-pointer hover:border-[#13ec6d] transition-colors font-[Manrope] text-sm"
          >
            Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
