import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// ─── Certificate Generator ─────────────────────────────────────────────────
async function generateCertificate(order, buyerName) {
  const W = 1200;
  const H = 850;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Load logo image
  const logoImg = new Image();
  logoImg.src = "/applogo.png";
  await new Promise((resolve) => {
    logoImg.onload = resolve;
    logoImg.onerror = resolve;
  });

  // ── Background ────────────────────────────────────────────────────────────
  // Light gradient background for white theme
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#b7b5b5ff");
  bg.addColorStop(1, "#9da4a0ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative borders ────────────────────────────────────────────────────
  // Outer border
  ctx.strokeStyle = "#304338ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // Inner border (double-line effect)
  ctx.strokeStyle = "rgba(52, 71, 60, 0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(34, 34, W - 68, H - 68);

  // Corner accents (top-left)
  ctx.strokeStyle = "#404c45ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 60);
  ctx.lineTo(24, 24);
  ctx.lineTo(60, 24);
  ctx.stroke();
  // Corner accents (top-right)
  ctx.beginPath();
  ctx.moveTo(W - 60, 24);
  ctx.lineTo(W - 24, 24);
  ctx.lineTo(W - 24, 60);
  ctx.stroke();
  // Corner accents (bottom-left)
  ctx.beginPath();
  ctx.moveTo(24, H - 60);
  ctx.lineTo(24, H - 24);
  ctx.lineTo(60, H - 24);
  ctx.stroke();
  // Corner accents (bottom-right)
  ctx.beginPath();
  ctx.moveTo(W - 60, H - 24);
  ctx.lineTo(W - 24, H - 24);
  ctx.lineTo(W - 24, H - 60);
  ctx.stroke();

  // ── Header text & Logo ────────────────────────────────────────────────────
  ctx.textAlign = "center";

  // Draw Logo
  if (logoImg.complete && logoImg.naturalHeight > 0) {
    const logoHeight = 60;
    const logoWidth =
      (logoImg.naturalWidth / logoImg.naturalHeight) * logoHeight;
    ctx.drawImage(logoImg, W / 2 - logoWidth / 2, 45, logoWidth, logoHeight);
  }

  // Brand name
  ctx.fillStyle = "#304639ff";
  ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("CARBONX", W / 2, 138);

  // Title
  ctx.fillStyle = "#070c09ff";
  ctx.font = "bold 34px 'Segoe UI', system-ui, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("CERTIFICATE OF CARBON CREDIT PURCHASE", W / 2, 184);

  // Decorative divider line
  const divW = 300;
  const divGrad = ctx.createLinearGradient(
    W / 2 - divW / 2,
    0,
    W / 2 + divW / 2,
    0,
  );
  divGrad.addColorStop(0, "rgba(19,236,109,0)");
  divGrad.addColorStop(0.3, "rgba(19,236,109,0.8)");
  divGrad.addColorStop(0.5, "#13ec6d");
  divGrad.addColorStop(0.7, "rgba(19,236,109,0.8)");
  divGrad.addColorStop(1, "rgba(19,236,109,0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - divW / 2, 198);
  ctx.lineTo(W / 2 + divW / 2, 198);
  ctx.stroke();
  // Small diamond in center of divider
  ctx.fillStyle = "#13ec6d";
  ctx.beginPath();
  ctx.moveTo(W / 2, 192);
  ctx.lineTo(W / 2 + 6, 198);
  ctx.lineTo(W / 2, 204);
  ctx.lineTo(W / 2 - 6, 198);
  ctx.closePath();
  ctx.fill();

  // ── Confirmation text ─────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(12, 21, 16, 0.7)";
  ctx.font = "italic 16px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(
    "This certifies that the following carbon credit transaction has been completed.",
    W / 2,
    240,
  );

  // ── Transaction Details Grid ──────────────────────────────────────────────
  const gridTop = 280;
  const colLeft = 120;
  const colRight = W / 2 + 60;
  const rowH = 68;

  function drawField(x, y, label, value, maxWidth = 420) {
    ctx.textAlign = "left";
    // Label
    ctx.fillStyle = "rgba(12, 21, 16, 0.6)";
    ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(label.toUpperCase(), x, y);
    // Value
    ctx.fillStyle = "#0c1510";
    ctx.font = "bold 20px 'Segoe UI', system-ui, sans-serif";
    // Truncate long values
    let displayVal = String(value);
    while (
      ctx.measureText(displayVal).width > maxWidth &&
      displayVal.length > 3
    ) {
      displayVal = displayVal.slice(0, -4) + "…";
    }
    ctx.fillText(displayVal, x, y + 26);
  }

  // Row 1
  const txnId = order.id.slice(0, 8).toUpperCase();
  drawField(colLeft, gridTop, "Transaction ID", txnId);
  const dateObj = new Date(order.created_at);
  const dateStr = dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  drawField(colRight, gridTop, "Date", dateStr);

  // Row 2
  drawField(colLeft, gridTop + rowH, "Buyer", buyerName || "—");
  const timeStr = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  drawField(colRight, gridTop + rowH, "Time", timeStr);

  // Row 3
  const projectNames =
    order.order_items
      ?.map((i) => i.farmer_projects?.project_name)
      .filter(Boolean)
      .join(", ") || "Carbon Offset Project";
  drawField(colLeft, gridTop + rowH * 2, "Project / Seller", projectNames, 420);

  // Row 4 — big numbers
  const creditsY = gridTop + rowH * 3 + 10;

  // Credits purchased — card style
  const cardW = 220;
  const cardH = 90;
  const cardX1 = colLeft - 10;
  const cardX2 = colRight - 10;

  // Card 1: Credits
  ctx.fillStyle = "rgba(19,236,109,0.06)";
  ctx.beginPath();
  ctx.roundRect(cardX1, creditsY - 10, cardW, cardH, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(19,236,109,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(12, 21, 16, 0.7)";
  ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("CARBON CREDITS", cardX1 + 18, creditsY + 16);
  ctx.fillStyle = "#0ba048";
  ctx.font = "bold 36px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(String(order.total_credits), cardX1 + 18, creditsY + 58);

  // Card 2: Amount
  ctx.fillStyle = "rgba(19,236,109,0.06)";
  ctx.beginPath();
  ctx.roundRect(cardX2, creditsY - 10, cardW, cardH, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(19,236,109,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(12, 21, 16, 0.7)";
  ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("TOTAL AMOUNT", cardX2 + 18, creditsY + 16);
  ctx.fillStyle = "#0ba048";
  ctx.font = "bold 36px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(
    `₹${Number(order.total_amount).toLocaleString("en-IN")}`,
    cardX2 + 18,
    creditsY + 58,
  );

  // ── Status badge ──────────────────────────────────────────────────────────
  const statusY = creditsY + cardH + 20;
  const statusLabel = (order.status || "completed").toUpperCase();
  ctx.textAlign = "center";

  // Pill background
  const pillW = 140;
  const pillH = 30;
  ctx.fillStyle = "rgba(19,236,109,0.15)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - pillW / 2, statusY, pillW, pillH, 15);
  ctx.fill();
  ctx.strokeStyle = "rgba(19,236,109,0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#0ba048";
  ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(`✓ ${statusLabel}`, W / 2, statusY + 20);

  // ── Footer ────────────────────────────────────────────────────────────────
  // Divider
  ctx.strokeStyle = "rgba(12, 21, 16, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, H - 80);
  ctx.lineTo(W - 80, H - 80);
  ctx.stroke();

  ctx.fillStyle = "rgba(12, 21, 16, 0.5)";
  ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "This certificate is digitally generated by CarbonX — India's premier carbon credit marketplace.",
    W / 2,
    H - 52,
  );
  ctx.fillText(
    `Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} • Ref: CX-${txnId}`,
    W / 2,
    H - 34,
  );

  // ── Download PDF (via jsPDF) ──────────────────────────────────────────────
  const { jsPDF } = await import("jspdf");
  const imgData = canvas.toDataURL("image/png", 1.0);

  // Create jsPDF instance (landscape)
  // 1200 x 850 in pixels translates to a proper aspect ratio
  // We'll map our canvas to the PDF size natively or standard A4/A5
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [W, H],
  });

  pdf.addImage(imgData, "PNG", 0, 0, W, H);
  pdf.save(`CarbonX-Certificate-${txnId}.pdf`);
}

// ─── Component ──────────────────────────────────────────────────────────────
export const TransactionHistory = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            id,
            total_amount,
            total_credits,
            created_at,
            status,
            buyer_wallet_address,
            payment_method,
            order_items (
              id,
              quantity,
              price_per_credit,
              farmer_wallet_address,
              farmer_projects (
                project_name
              )
            )
          `,
          )
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const handleDownload = useCallback(
    (order) => {
      const buyerName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email ||
        "Buyer";
      generateCertificate(order, buyerName);
    },
    [profile, user],
  );

  return (
    <div className="p-5 h-full min-h-[50vh]">
      <h1 className="text-center font-bold text-2xl text-[#13ec6d] transaction mb-6">
        Transaction History
      </h1>
      <div className="mt-5 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center py-8 text-[#718b7c]">
            Loading transactions...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 bg-[#f6f8f7] dark:bg-[#1a2b21] rounded-xl border border-[#e3e8e5] dark:border-[#2d4235]">
            <span className="material-icons-round block text-4xl text-[#c7d1cc] dark:text-[#4a6354] mb-2">
              receipt_long
            </span>
            <p className="text-[#718b7c]">No past transactions found.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#f6f8f7] dark:bg-[#1a2b21] p-4 rounded-xl border border-[#e3e8e5] dark:border-[#2d4235]"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm text-[#718b7c]">Order ID</p>
                  <p className="font-mono text-xs text-[#0c1510] dark:text-[#f0f4f2]">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-[#718b7c]">Date</p>
                    <p className="text-sm font-bold text-[#0c1510] dark:text-[#f0f4f2]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(order)}
                    title="Download Certificate"
                    aria-label="Download transaction certificate"
                    className="w-9 h-9 rounded-full bg-[#13ec6d]/10 hover:bg-[#13ec6d]/25 flex items-center justify-center cursor-pointer border border-[#13ec6d]/30 hover:border-[#13ec6d]/60 transition-all duration-200 hover:scale-110 active:scale-95 group"
                  >
                    <span
                      className="material-icons-round text-[#13ec6d] group-hover:text-[#0fc85d]"
                      style={{ fontSize: "18px" }}
                    >
                      download
                    </span>
                  </button>
                </div>
              </div>

              {/* Wallet & Payment Info */}
              {(order.buyer_wallet_address || order.payment_method) && (
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {order.payment_method && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.payment_method === 'metamask'
                        ? 'bg-[#f59e0b]/10 text-[#f59e0b]'
                        : 'bg-[#13ec6d]/10 text-[#13ec6d]'
                    }`}>
                      <span className="material-icons-round" style={{ fontSize: "0.75rem" }}>
                        {order.payment_method === 'metamask' ? 'link' : 'account_balance_wallet'}
                      </span>
                      {order.payment_method === 'metamask' ? 'MetaMask' : 'CarbonX Wallet'}
                    </span>
                  )}
                  {order.buyer_wallet_address && (
                    <span className="text-[10px] font-mono text-[#9db0a5] truncate max-w-[200px]">
                      From: {order.buyer_wallet_address.slice(0, 6)}...{order.buyer_wallet_address.slice(-4)}
                    </span>
                  )}
                </div>
              )}

              <div className="bg-white dark:bg-[#102218] rounded-lg p-3 mb-3 border border-[#e3e8e5] dark:border-[#2d4235]">
                {order.order_items?.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex justify-between items-center py-2 border-b border-[#e3e8e5] dark:border-[#2d4235] last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#0c1510] dark:text-[#f0f4f2]">
                        {item.farmer_projects?.project_name ||
                          "Carbon Offset Project"}
                      </p>
                      <p className="text-xs text-[#718b7c]">
                        {item.quantity} Credits × ₹{item.price_per_credit}
                      </p>
                      {item.farmer_wallet_address && (
                        <p className="text-[10px] font-mono text-[#9db0a5] mt-0.5">
                          Seller: {item.farmer_wallet_address.slice(0, 6)}...{item.farmer_wallet_address.slice(-4)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0c1510] dark:text-[#f0f4f2]">
                        ₹
                        {(item.quantity * item.price_per_credit).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#e3e8e5] dark:border-[#2d4235]">
                <p className="font-bold text-[#0c1510] dark:text-[#f0f4f2]">
                  Total Amount
                </p>
                <p className="font-black text-lg text-[#13ec6d]">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
