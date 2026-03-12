import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   AuditReport — Ultra-Premium Blockchain Certificate
   Dark Forest-Green · Luxury Certificate Aesthetic
   Playfair Display + DM Sans + DM Mono
   ═══════════════════════════════════════════════════════════════════ */

const txData = {
  hash: "0x4f92b3a91cd7f2e84acd0192837465fb2190a8e1d3c5b7f09a2e416d8c70ba95",
  hashShort: "0x4f92...a8e1",
  status: "Confirmed",
  network: "Polygon PoS",
  block: "51,847,203",
  confirmations: 128,
  timestamp: "2024-01-15 · 09:42:31 UTC",
  gasConsumed: "0.0023 MATIC",
  gasCostUSD: "~$0.002",
  batchId: "#4402",
  batchName: "Vantara Forest Reserve",
  creditType: "REDD+ Avoided Deforestation",
  quantity: 1,
  pricePerCredit: "₹500",
  standard: "Verra VCS",
  vintage: "2023",
  country: "India",
  methodology: "VM0015",
  seller: "0xb56d...5d62",
  sellerFull: "0xb56d7e3a19c8f042d890ef2a7bb8c15d62",
  buyer: "0x9658...b545",
  buyerFull: "0x9658c74f1a2e83b0d7654a9fcde018b545",
  co2Tonnes: 1,
  treeEquiv: 16,
  carMilesEquiv: "2,400",
  flightHoursEquiv: "4 hrs",
};

const CONFETTI_COLORS = [
  "#4ade80","#a3e635","#16a34a","#34d399","#fbbf24",
  "#86efac","#22c55e","#d4a030","#6ee7b7",
];

/* ── SVG Icons ─────────────────────────────────────────────── */
const I = {
  check: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  stepCheck: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  copy: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  shield: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  ext: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  dl: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
};

/* ── Copy Button ───────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  const go = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2200); };
  return (
    <button onClick={go} style={{
      background: ok ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${ok ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.08)"}`,
      color: ok ? "#4ade80" : "rgba(255,255,255,0.45)",
      borderRadius: "8px", padding: "5px 12px", fontSize: "11px",
      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px",
      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
      fontFamily: "'DM Mono', monospace", letterSpacing: "0.02em", flexShrink: 0,
      backdropFilter: "blur(8px)",
    }}>
      {ok ? "✓ Copied" : <>{I.copy} Copy</>}
    </button>
  );
}

/* ── Animated Section Wrapper ─────────────────────────────── */
function Reveal({ children, delay = 0, y = 24 }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      opacity: v ? 1 : 0, transform: v ? "translateY(0)" : `translateY(${y}px)`,
      transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  );
}

/* ── Info Row ──────────────────────────────────────────────── */
function Row({ label, value, mono, accent }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.035)",
    }}>
      <span style={{
        fontSize: "11.5px", color: "rgba(255,255,255,0.35)", fontWeight: "600",
        letterSpacing: "0.07em", textTransform: "uppercase",
      }}>{label}</span>
      <span style={{
        fontSize: "13px",
        color: accent ? "#a3e635" : "rgba(255,255,255,0.82)",
        fontFamily: mono ? "'DM Mono',monospace" : "inherit",
        fontWeight: mono ? "400" : "600",
        background: accent ? "rgba(163,230,53,0.08)" : "transparent",
        padding: accent ? "3px 12px" : "0",
        borderRadius: accent ? "6px" : "0",
        border: accent ? "1px solid rgba(163,230,53,0.18)" : "none",
      }}>{value}</span>
    </div>
  );
}

/* ── Impact Card ──────────────────────────────────────────── */
function Impact({ icon, value, label, color, delay }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay || 500); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px", padding: "22px 12px 18px", textAlign: "center", flex: 1,
      opacity: v ? 1 : 0, transform: v ? "translateY(0) scale(1)" : "translateY(14px) scale(0.92)",
      transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
      position: "relative", overflow: "hidden",
    }}>
      {/* subtle inner glow */}
      <div style={{
        position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)",
        width: "60px", height: "40px", borderRadius: "50%",
        background: `radial-gradient(ellipse, ${color}15 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ fontSize: "28px", marginBottom: "8px", position: "relative" }}>{icon}</div>
      <div style={{
        fontSize: "22px", fontWeight: "800", color, marginBottom: "4px",
        fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.02em", position: "relative",
      }}>{value}</div>
      <div style={{
        fontSize: "9px", color: "rgba(255,255,255,0.28)", textTransform: "uppercase",
        letterSpacing: "0.12em", fontWeight: "700", position: "relative",
      }}>{label}</div>
    </div>
  );
}

/* ── Verification Step ────────────────────────────────────── */
function Step({ step, label, sub, done, delay, last }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "16px",
      opacity: v ? 1 : 0, transform: v ? "translateX(0)" : "translateX(-18px)",
      transition: "all 0.65s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: done ? "linear-gradient(145deg, #16a34a, #4ade80)" : "rgba(255,255,255,0.03)",
          border: done ? "none" : "1.5px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", color: done ? "#fff" : "#374151", fontWeight: "700", flexShrink: 0,
          boxShadow: done ? "0 0 20px rgba(74,222,128,0.3), 0 0 6px rgba(74,222,128,0.15)" : "none",
        }}>
          {done ? I.stepCheck : step}
        </div>
        {!last && (
          <div style={{
            width: "2px", height: "36px",
            background: done
              ? "linear-gradient(to bottom, rgba(74,222,128,0.3), rgba(74,222,128,0.05))"
              : "rgba(255,255,255,0.03)",
            borderRadius: "1px",
          }} />
        )}
      </div>
      <div style={{ paddingTop: "6px", paddingBottom: last ? "0" : "8px" }}>
        <div style={{
          fontSize: "14px", color: done ? "#e5e7eb" : "#4b5563",
          fontWeight: "600", marginBottom: "3px", letterSpacing: "-0.01em",
        }}>{label}</div>
        <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.25)", lineHeight: 1.4 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function AuditReport() {
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [confirmCount, setConfirmCount] = useState(0);

  // stable confetti
  const confettiRef = useRef(null);
  if (!confettiRef.current) {
    confettiRef.current = Array.from({ length: 50 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      dur: `${2 + Math.random() * 2.8}s`,
      del: `${Math.random() * 0.7}s`,
      w: `${3 + Math.random() * 8}px`,
      h: `${3 + Math.random() * 8}px`,
      r: Math.random() > 0.5 ? "50%" : `${1 + Math.random() * 3}px`,
    }));
  }

  useEffect(() => {
    setMounted(true);
    let i = 0;
    const iv = setInterval(() => {
      i += 3;
      if (i >= txData.confirmations) { setConfirmCount(txData.confirmations); clearInterval(iv); }
      else setConfirmCount(i);
    }, 22);
    const ct = setTimeout(() => setShowConfetti(false), 4200);
    return () => { clearInterval(iv); clearTimeout(ct); };
  }, []);

  const barW = Math.min((confirmCount / 150) * 100, 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');

        .ar *, .ar *::before, .ar *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ar {
          min-height: 100vh;
          background: #060d08;
          background-image:
            radial-gradient(ellipse 70% 50% at 50% -5%, rgba(22,163,74,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 85% 85%, rgba(74,222,128,0.04) 0%, transparent 55%),
            radial-gradient(ellipse 35% 25% at 8% 55%, rgba(163,230,53,0.025) 0%, transparent 50%);
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #e5e7eb;
          padding: 0 0 72px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Ambient grid ─────────────────── */
        .ar::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(74,222,128,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,222,128,0.015) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
          mask-image: radial-gradient(ellipse 60% 60% at 50% 30%, black 0%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 30%, black 0%, transparent 70%);
        }

        /* ── Topbar ───────────────────────── */
        .ar-top {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          position: sticky; top: 0; z-index: 50;
          background: rgba(6,13,8,0.82);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
        }
        .ar-back {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.4); border-radius: 10px; padding: 8px 10px;
          cursor: pointer; display: flex; align-items: center;
          transition: all 0.25s; font-family: inherit;
        }
        .ar-back:hover { background: rgba(255,255,255,0.07); color: #e5e7eb; }

        .ar-top-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px; color: #f9fafb; font-weight: 600; letter-spacing: -0.01em;
        }

        .ar-badge {
          margin-left: auto;
          background: rgba(74,222,128,0.07);
          border: 1px solid rgba(74,222,128,0.18);
          color: #4ade80;
          font-size: 10px; font-weight: 700; padding: 5px 14px;
          border-radius: 100px; display: flex; align-items: center; gap: 7px;
          letter-spacing: 0.08em; text-transform: uppercase;
        }

        .ar-pulse {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74,222,128,0.7);
          animation: arPulse 2s ease-in-out infinite;
        }
        @keyframes arPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.6); }
        }

        /* ── Hero ─────────────────────────── */
        .ar-hero { padding: 56px 24px 36px; text-align: center; position: relative; z-index: 1; }

        .ar-seal {
          width: 82px; height: 82px; border-radius: 50%;
          background: linear-gradient(145deg, #16a34a 0%, #4ade80 60%, #a3e635 100%);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          box-shadow:
            0 0 0 5px rgba(74,222,128,0.07),
            0 0 0 12px rgba(74,222,128,0.035),
            0 0 0 22px rgba(74,222,128,0.015),
            0 10px 50px rgba(74,222,128,0.35),
            0 2px 12px rgba(0,0,0,0.3);
          animation: arSeal 4s ease-in-out infinite;
          position: relative;
        }
        .ar-seal::after {
          content: '';
          position: absolute; inset: -8px; border-radius: 50%;
          border: 1px dashed rgba(74,222,128,0.12);
          animation: arSealRing 20s linear infinite;
        }
        @keyframes arSeal {
          0%,100% { box-shadow: 0 0 0 5px rgba(74,222,128,0.07),0 0 0 12px rgba(74,222,128,0.035),0 0 0 22px rgba(74,222,128,0.015),0 10px 50px rgba(74,222,128,0.35),0 2px 12px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 0 7px rgba(74,222,128,0.1),0 0 0 16px rgba(74,222,128,0.05),0 0 0 28px rgba(74,222,128,0.02),0 14px 60px rgba(74,222,128,0.45),0 2px 12px rgba(0,0,0,0.3); }
        }
        @keyframes arSealRing { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .ar-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: 34px; font-weight: 700; color: #f9fafb;
          margin-bottom: 10px; letter-spacing: -0.03em; line-height: 1.1;
        }
        .ar-hero-sub {
          font-size: 13px; color: rgba(255,255,255,0.3);
          letter-spacing: 0.04em; font-weight: 400;
        }

        .ar-cert-divider {
          display: flex; align-items: center; gap: 16px;
          width: fit-content; margin: 16px auto 0;
        }
        .ar-cert-divider::before, .ar-cert-divider::after {
          content: ''; width: 40px; height: 1px;
        }
        .ar-cert-divider::before { background: linear-gradient(to right, transparent, rgba(212,160,48,0.25)); }
        .ar-cert-divider::after { background: linear-gradient(to left, transparent, rgba(212,160,48,0.25)); }

        .ar-cert-text {
          font-size: 9.5px; color: rgba(212,160,48,0.45);
          letter-spacing: 0.16em; font-weight: 700; text-transform: uppercase;
        }

        /* ── Content ──────────────────────── */
        .ar-content {
          padding: 0 16px; max-width: 520px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 16px;
          position: relative; z-index: 1;
        }

        /* ── Card ─────────────────────────── */
        .ar-card {
          background: linear-gradient(165deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.012) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; overflow: hidden;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          position: relative;
        }
        /* shimmer edge */
        .ar-card::before {
          content: '';
          position: absolute; top: 0; left: -100%; width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(74,222,128,0.2), transparent);
          animation: arShimmer 6s ease-in-out infinite;
        }
        @keyframes arShimmer {
          0%,100% { left: -100%; }
          50% { left: 100%; }
        }

        .ar-card-h {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex; align-items: center; gap: 9px;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.10em; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }
        .ar-card-dot {
          width: 5px; height: 5px; border-radius: 50%;
          box-shadow: 0 0 6px currentColor;
        }
        .ar-card-b { padding: 4px 20px; }

        /* ── Hash ─────────────────────────── */
        .ar-hash-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; gap: 14px;
        }
        .ar-hash-val {
          font-family: 'DM Mono', monospace; font-size: 11.5px;
          color: #a3e635; word-break: break-all; flex: 1;
          line-height: 1.7; letter-spacing: 0.015em;
        }

        .ar-net-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 20px 14px; gap: 10px;
        }
        .ar-net-badge {
          display: flex; align-items: center; gap: 6px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.14);
          padding: 5px 14px; border-radius: 100px;
          font-size: 11.5px; color: #a78bfa; font-weight: 500;
        }
        .ar-net-dot { width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; box-shadow: 0 0 5px rgba(139,92,246,0.6); }

        .ar-status {
          background: rgba(74,222,128,0.08);
          border: 1px solid rgba(74,222,128,0.14);
          color: #4ade80; font-size: 11.5px; font-weight: 600;
          padding: 5px 14px; border-radius: 100px;
          display: flex; align-items: center; gap: 5px;
        }

        /* ── Confirmation bar ─────────────── */
        .ar-conf-row {
          padding: 2px 20px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .ar-conf-track {
          flex: 1; height: 4px;
          background: rgba(255,255,255,0.04);
          border-radius: 4px; overflow: hidden;
          position: relative;
        }
        .ar-conf-fill {
          height: 100%;
          background: linear-gradient(90deg, #16a34a, #4ade80, #a3e635);
          border-radius: 4px;
          transition: width 0.08s linear;
          position: relative;
        }
        /* shimmer on bar */
        .ar-conf-fill::after {
          content: ''; position: absolute; top: 0; right: 0;
          width: 30px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: arBarShimmer 2s ease-in-out infinite;
        }
        @keyframes arBarShimmer {
          0%,100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .ar-conf-label {
          font-size: 11px; color: #4ade80;
          font-family: 'DM Mono', monospace; white-space: nowrap; font-weight: 500;
        }

        /* ── Impact grid ──────────────────── */
        .ar-impact-grid { display: flex; gap: 10px; padding: 16px 20px 20px; }

        .ar-impact-desc {
          padding: 0 20px 18px; font-size: 11.5px;
          color: rgba(255,255,255,0.22); line-height: 1.7;
        }
        .ar-impact-desc strong { color: rgba(255,255,255,0.40); font-weight: 600; }

        /* ── Wallet ───────────────────────── */
        .ar-wallet-sec { padding: 14px 20px 18px; }
        .ar-wallet-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 0;
        }
        .ar-wallet-lbl {
          font-size: 10px; color: rgba(255,255,255,0.28);
          text-transform: uppercase; letter-spacing: 0.08em;
          font-weight: 700; margin-bottom: 5px;
        }
        .ar-wallet-addr {
          font-family: 'DM Mono', monospace; font-size: 13px;
          color: rgba(255,255,255,0.7);
          display: flex; align-items: center; gap: 8px;
        }
        .ar-role {
          font-size: 9px; padding: 3px 12px;
          border-radius: 100px; font-weight: 800;
          letter-spacing: 0.08em; text-transform: uppercase;
        }

        /* ── Steps ────────────────────────── */
        .ar-steps { padding: 18px 20px; }

        /* ── Actions ──────────────────────── */
        .ar-actions { display: flex; gap: 10px; padding-top: 4px; }
        .ar-btn1 {
          flex: 1;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          border: none; color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 600;
          padding: 15px; border-radius: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 4px 24px rgba(22,163,74,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative; overflow: hidden;
        }
        .ar-btn1::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .ar-btn1:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(22,163,74,0.45), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .ar-btn2 {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500;
          padding: 15px 20px; border-radius: 14px;
          cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          transition: all 0.25s;
        }
        .ar-btn2:hover { background: rgba(255,255,255,0.06); color: #e5e7eb; border-color: rgba(255,255,255,0.12); }

        .ar-footer {
          text-align: center; font-size: 10px;
          color: rgba(255,255,255,0.15); padding-top: 18px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          letter-spacing: 0.04em;
        }

        /* ── Confetti ─────────────────────── */
        .ar-confetti {
          position: fixed; inset: 0;
          pointer-events: none; z-index: 100; overflow: hidden;
          transition: opacity 1.5s ease 2.5s;
        }
        .ar-cp {
          position: absolute;
          animation: arFall linear forwards;
        }
        @keyframes arFall {
          0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
          60% { opacity: 0.9; }
          100% { transform: translateY(100vh) rotate(1080deg) scale(0.2); opacity: 0; }
        }

        /* ── Certificate Ornament ─────────── */
        .ar-ornament {
          position: absolute;
          width: 100%; height: 4px; bottom: 0; left: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(212,160,48,0.08) 20%,
            rgba(212,160,48,0.15) 50%,
            rgba(212,160,48,0.08) 80%,
            transparent 100%
          );
        }

        /* ── Responsive ───────────────────── */
        @media (max-width: 480px) {
          .ar-hero h1 { font-size: 28px; }
          .ar-content { padding: 0 12px; }
          .ar-card-b { padding: 4px 16px; }
          .ar-hash-row, .ar-net-row, .ar-conf-row { padding-left: 16px; padding-right: 16px; }
          .ar-wallet-sec { padding-left: 16px; padding-right: 16px; }
          .ar-impact-grid { padding-left: 16px; padding-right: 16px; }
          .ar-impact-desc { padding-left: 16px; padding-right: 16px; }
          .ar-steps { padding-left: 16px; padding-right: 16px; }
        }
      `}</style>

      {/* ═══ Confetti ═══ */}
      <div className="ar-confetti" style={{ opacity: showConfetti ? 1 : 0 }}>
        {confettiRef.current.map((p, i) => (
          <div key={i} className="ar-cp" style={{
            left: p.left, background: p.color,
            animationDuration: p.dur, animationDelay: p.del,
            width: p.w, height: p.h, borderRadius: p.r,
          }} />
        ))}
      </div>

      <div className="ar">
        {/* ═══ Sticky Topbar ═══ */}
        <div className="ar-top">
          <button className="ar-back" onClick={() => window.history.back()}>{I.back}</button>
          <span className="ar-top-title">Audit Report</span>
          <div className="ar-badge">
            <div className="ar-pulse" />
            On-Chain Verified
          </div>
        </div>

        {/* ═══ Hero ═══ */}
        <div className="ar-hero" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(28px)",
          transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div className="ar-seal">{I.check}</div>
          <h1>Transaction Verified</h1>
          <div className="ar-hero-sub">Carbon Credit Issuance · Authentic &amp; On-Chain</div>
          <div className="ar-cert-divider">
            <span className="ar-cert-text">VERRA VCS · REDD+ CERTIFIED</span>
          </div>
        </div>

        <div className="ar-content">

          {/* ═══ Transaction Hash ═══ */}
          <Reveal delay={100}>
            <div className="ar-card">
              <div className="ar-card-h">
                <div className="ar-card-dot" style={{ color: "#16a34a", background: "#16a34a" }} />
                Transaction Hash
              </div>
              <div className="ar-hash-row">
                <div className="ar-hash-val">{txData.hash}</div>
                <CopyBtn text={txData.hash} />
              </div>
              <div className="ar-net-row">
                <div className="ar-net-badge">
                  <div className="ar-net-dot" /> {txData.network}
                </div>
                <div className="ar-status">
                  <span>✓</span> {txData.status}
                </div>
              </div>
              <div className="ar-conf-row">
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "600" }}>
                  Confirmations
                </span>
                <div className="ar-conf-track">
                  <div className="ar-conf-fill" style={{ width: `${barW}%` }} />
                </div>
                <span className="ar-conf-label">{confirmCount} / 128+</span>
              </div>
              <div className="ar-ornament" />
            </div>
          </Reveal>

          {/* ═══ Block Details ═══ */}
          <Reveal delay={200}>
            <div className="ar-card">
              <div className="ar-card-h">
                <div className="ar-card-dot" style={{ color: "#16a34a", background: "#16a34a" }} />
                Block Details
              </div>
              <div className="ar-card-b">
                <Row label="Block Number" value={txData.block} mono />
                <Row label="Timestamp" value={txData.timestamp} />
                <Row label="Gas Consumed" value={txData.gasConsumed} mono />
                <Row label="Gas Cost (USD)" value={txData.gasCostUSD} />
              </div>
              <div className="ar-ornament" />
            </div>
          </Reveal>

          {/* ═══ Carbon Credit Details ═══ */}
          <Reveal delay={300}>
            <div className="ar-card">
              <div className="ar-card-h">
                <div className="ar-card-dot" style={{ color: "#a3e635", background: "#a3e635" }} />
                Carbon Credit Details
              </div>
              <div className="ar-card-b">
                <Row label="Project" value={txData.batchName} />
                <Row label="Batch ID" value={`Carbon Credit Batch ${txData.batchId}`} mono />
                <Row label="Credit Type" value={txData.creditType} />
                <Row label="Standard" value={txData.standard} accent />
                <Row label="Methodology" value={txData.methodology} mono />
                <Row label="Vintage Year" value={txData.vintage} />
                <Row label="Country" value={txData.country} />
                <Row label="Quantity" value={`${txData.quantity} tCO₂e`} accent />
                <Row label="Price Paid" value={txData.pricePerCredit} />
              </div>
              <div className="ar-ornament" />
            </div>
          </Reveal>

          {/* ═══ Participants ═══ */}
          <Reveal delay={400}>
            <div className="ar-card">
              <div className="ar-card-h">
                <div className="ar-card-dot" style={{ color: "#a78bfa", background: "#a78bfa" }} />
                Participants
              </div>
              <div className="ar-wallet-sec">
                <div className="ar-wallet-item">
                  <div>
                    <div className="ar-wallet-lbl">Seller</div>
                    <div className="ar-wallet-addr">
                      {txData.seller}
                      <CopyBtn text={txData.sellerFull} />
                    </div>
                  </div>
                  <span className="ar-role" style={{
                    background: "rgba(167,139,250,0.08)", color: "#a78bfa",
                    border: "1px solid rgba(167,139,250,0.18)",
                  }}>Issuer</span>
                </div>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.03)" }} />
                <div className="ar-wallet-item">
                  <div>
                    <div className="ar-wallet-lbl">Buyer</div>
                    <div className="ar-wallet-addr">
                      {txData.buyer}
                      <CopyBtn text={txData.buyerFull} />
                    </div>
                  </div>
                  <span className="ar-role" style={{
                    background: "rgba(74,222,128,0.08)", color: "#4ade80",
                    border: "1px solid rgba(74,222,128,0.18)",
                  }}>You</span>
                </div>
              </div>
              <div className="ar-ornament" />
            </div>
          </Reveal>

          {/* ═══ Verification Trail ═══ */}
          <Reveal delay={600}>
            <div className="ar-card">
              <div className="ar-card-h">
                <div className="ar-card-dot" style={{ color: "#fbbf24", background: "#fbbf24" }} />
                Verification Trail
              </div>
              <div className="ar-steps">
                <Step step={1} label="Smart Contract Executed" sub="Marketplace contract call confirmed" done delay={800} />
                <Step step={2} label="Token Minted to Buyer" sub={`1 CARB token → ${txData.buyer}`} done delay={1100} />
                <Step step={3} label="Verra Registry Cross-Check" sub="VCS Batch #4402 validated against registry" done delay={1400} />
                <Step step={4} label="Supabase Record Updated" sub="Off-chain metadata synced & indexed" done delay={1700} last />
              </div>
              <div className="ar-ornament" />
            </div>
          </Reveal>

          {/* ═══ Actions ═══ */}
          <Reveal delay={750}>
            <div className="ar-actions">
              <button className="ar-btn1">
                {I.dl} Download Certificate
              </button>
              <button className="ar-btn2" onClick={() => window.open(`https://polygonscan.com/tx/${txData.hash}`, "_blank")}>
                {I.ext} PolygonScan
              </button>
            </div>
            <div className="ar-footer" style={{ marginTop: "20px" }}>
              {I.shield}
              Secured by CarbonX blockchain verification · Polygon PoS
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
}
