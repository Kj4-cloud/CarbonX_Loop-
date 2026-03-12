import { useState, useEffect } from "react";

const icons = {
  check: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  leaf: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  external: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  download: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  arrow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  clock: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  zap: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  globe: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

const txData = {
  hash: "0x4f92b3a91cd7f2e84acd0192837465fb2190a8e1",
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
  buyer: "0x9658...b545",
  co2Tonnes: 1,
  treeEquiv: 16,
  carMilesEquiv: "2,400 miles",
  flightHoursEquiv: "4 hrs",
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`copy-btn ${copied ? "copy-btn--copied" : ""}`}>
      {copied ? "✓ Copied" : <>{icons.copy} Copy</>}
    </button>
  );
}

function VerificationStep({ step, label, sublabel, done, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="vstep" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(-12px)",
    }}>
      <div className="vstep-col">
        <div className={`vstep-circle ${done ? "vstep-circle--done" : ""}`}>
          {done ? "✓" : step}
        </div>
        {step < 4 && <div className={`vstep-line ${done ? "vstep-line--done" : ""}`} />}
      </div>
      <div style={{ paddingTop: "4px" }}>
        <div className={`vstep-label ${done ? "vstep-label--done" : ""}`}>{label}</div>
        <div className="vstep-sublabel">{sublabel}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, accent }) {
  return (
    <div className="info-row">
      <span className="info-row-label">{label}</span>
      <span className={`info-row-value ${mono ? "info-row-value--mono" : ""} ${accent ? "info-row-value--accent" : ""}`}>{value}</span>
    </div>
  );
}

function ImpactCard({ icon, value, label, color }) {
  return (
    <div className="impact-card">
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{icon}</div>
      <div className="impact-card-value" style={{ color: color || "#16a34a" }}>{value}</div>
      <div className="impact-card-label">{label}</div>
    </div>
  );
}

export default function AuditReport() {
  const [mounted, setMounted] = useState(false);
  const [confetti, setConfetti] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Animate confirmation count
    let i = 0;
    const iv = setInterval(() => {
      i += 4;
      if (i >= txData.confirmations) { setCount(txData.confirmations); clearInterval(iv); }
      else setCount(i);
    }, 18);
    const ct = setTimeout(() => setConfetti(false), 3500);
    return () => { clearInterval(iv); clearTimeout(ct); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        
        :root {
          --bg-main: #080f0a;
          --bg-card: rgba(255,255,255,0.025);
          --bg-topbar: rgba(8,15,10,0.85);
          --text-main: #e5e7eb;
          --text-title: #f9fafb;
          --text-muted: #6b7280;
          --text-sub: #9ca3af;
          --border-color: rgba(255,255,255,0.05);
          --border-card: rgba(255,255,255,0.07);
          --icon-bg: rgba(255,255,255,0.05);
          --icon-border: rgba(255,255,255,0.1);
          --btn-hover: rgba(255,255,255,0.08);
          --value-text: #d1d5db;
        }

        @media (prefers-color-scheme: light) {
          :root {
            --bg-main: #f9fafb;
            --bg-card: #ffffff;
            --bg-topbar: rgba(255,255,255,0.9);
            --text-main: #374151;
            --text-title: #111827;
            --text-muted: #6b7280;
            --text-sub: #4b5563;
            --border-color: rgba(0,0,0,0.08);
            --border-card: rgba(0,0,0,0.08);
            --icon-bg: rgba(0,0,0,0.04);
            --icon-border: rgba(0,0,0,0.08);
            --btn-hover: rgba(0,0,0,0.06);
            --value-text: #111827;
          }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { background: var(--bg-main); }

        .audit-root {
          min-height: 100vh;
          background: var(--bg-main);
          background-image:
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(22,163,74,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(74,222,128,0.04) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text-main);
          padding: 0 0 80px;
        }

        .topbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          background: var(--bg-topbar);
          backdrop-filter: blur(12px);
          z-index: 10;
        }

        .back-btn {
          background: var(--icon-bg);
          border: 1px solid var(--icon-border);
          color: var(--text-sub);
          border-radius: 8px;
          padding: 7px 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          font-family: inherit;
        }
        .back-btn:hover { background: var(--btn-hover); color: var(--text-main); }

        .topbar-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          color: var(--text-title);
          font-weight: 600;
        }

        .topbar-badge {
          margin-left: auto;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.25);
          color: #16a34a;
          @media (prefers-color-scheme: dark) { color: #4ade80; }
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          letter-spacing: 0.03em;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16a34a;
          @media (prefers-color-scheme: dark) { background: #4ade80; }
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero {
          padding: 48px 24px 32px;
          text-align: center;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "translateY(0)" : "translateY(20px)"};
          transition: all 0.7s ease;
        }

        .hero-seal {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #4ade80);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 20px;
          box-shadow: 0 0 0 8px rgba(74,222,128,0.08), 0 0 0 16px rgba(74,222,128,0.04), 0 8px 32px rgba(74,222,128,0.3);
          animation: sealPulse 3s ease-in-out infinite;
        }
        @keyframes sealPulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(74,222,128,0.08), 0 0 0 16px rgba(74,222,128,0.04), 0 8px 32px rgba(74,222,128,0.3); }
          50% { box-shadow: 0 0 0 10px rgba(74,222,128,0.12), 0 0 0 20px rgba(74,222,128,0.05), 0 8px 40px rgba(74,222,128,0.4); }
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 700;
          color: var(--text-title);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .hero-sub {
          font-size: 13px;
          color: var(--text-muted);
          letter-spacing: 0.03em;
        }

        .hero-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 auto;
          width: fit-content;
          margin-top: 6px;
        }

        .hero-divider span {
          width: 30px;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(74,222,128,0.3));
        }
        .hero-divider span:last-child {
          background: linear-gradient(to left, transparent, rgba(74,222,128,0.3));
        }

        .content {
          padding: 0 20px;
          max-width: 480px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(4px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
        }

        .card-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .card-header-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16a34a;
        }

        .card-body {
          padding: 6px 18px;
        }

        .hash-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          gap: 12px;
        }

        .hash-value {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #16a34a;
          @media (prefers-color-scheme: dark) { color: #a3e635; }
          word-break: break-all;
          flex: 1;
          line-height: 1.5;
        }

        .network-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px 14px;
          gap: 12px;
        }

        .network-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.2);
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 12px;
          color: #7c3aed;
          @media (prefers-color-scheme: dark) { color: #a78bfa; }
          font-weight: 600;
        }

        .polygon-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .status-badge {
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.2);
          color: #16a34a;
          @media (prefers-color-scheme: dark) { color: #4ade80; }
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .conf-row {
          padding: 0 18px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .conf-bar-wrap {
          flex: 1;
          height: 4px;
          background: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
        }

        .conf-bar-fill {
          height: 100%;
          background: linear-gradient(to right, #16a34a, #4ade80);
          border-radius: 4px;
          width: ${Math.min((count / 150) * 100, 100)}%;
          transition: width 0.1s linear;
        }

        .conf-label {
          font-size: 11px;
          color: #16a34a;
          @media (prefers-color-scheme: dark) { color: #4ade80; }
          font-weight: 600;
          font-family: 'DM Mono', monospace;
          white-space: nowrap;
        }

        .impact-grid {
          display: flex;
          gap: 10px;
          padding: 14px 18px;
        }

        .wallet-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px 18px;
        }

        .wallet-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .wallet-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        .wallet-addr {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: var(--text-title);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .wallet-role {
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .actions-row {
          display: flex;
          gap: 10px;
          padding: 4px 0 0;
        }

        .btn-primary {
          flex: 1;
          background: linear-gradient(135deg, #16a34a, #15803d);
          border: none;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 13px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(22,163,74,0.25);
          letter-spacing: 0.01em;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.35); }

        .btn-secondary {
          background: var(--icon-bg);
          border: 1px solid var(--icon-border);
          color: var(--text-sub);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 13px 16px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s;
          justify-content: center;
        }
        .btn-secondary:hover { background: var(--btn-hover); color: var(--text-title); }

        .footer-note {
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          padding-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .confetti-wrap {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 100;
          overflow: hidden;
          opacity: ${confetti ? 1 : 0};
          transition: opacity 1s ease 2s;
        }

        .c-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 1px;
          animation: fall linear forwards;
        }

        @keyframes fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        .steps-wrap {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── CopyButton ── */
        .copy-btn {
          background: var(--icon-bg);
          border: 1px solid var(--icon-border);
          color: var(--text-sub);
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
          font-family: inherit;
        }
        .copy-btn--copied {
          background: rgba(74,222,128,0.15);
          border-color: #16a34a;
          color: #16a34a;
        }

        /* ── VerificationStep ── */
        .vstep {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          transition: all 0.5s ease;
        }
        .vstep-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .vstep-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--icon-bg);
          border: 1px solid var(--icon-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: var(--text-sub);
          font-weight: 700;
          flex-shrink: 0;
        }
        .vstep-circle--done {
          background: linear-gradient(135deg, #4ade80, #16a34a);
          border: none;
          color: #fff;
          box-shadow: 0 0 12px rgba(74,222,128,0.4);
        }
        .vstep-line {
          width: 1px;
          height: 28px;
          background: var(--border-color);
        }
        .vstep-line--done {
          background: rgba(74,222,128,0.3);
        }
        .vstep-label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 2px;
        }
        .vstep-label--done {
          color: var(--text-title);
        }
        .vstep-sublabel {
          font-size: 11px;
          color: var(--text-sub);
        }

        /* ── InfoRow ── */
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .info-row-label {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .info-row-value {
          font-size: 13px;
          color: var(--text-title);
          font-weight: 600;
        }
        .info-row-value--mono {
          font-family: 'DM Mono', monospace;
          font-weight: 400;
        }
        .info-row-value--accent {
          color: #16a34a;
          background: rgba(22,163,74,0.08);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(22,163,74,0.2);
          font-weight: 700;
        }

        /* ── ImpactCard ── */
        .impact-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          flex: 1;
        }
        .impact-card-value {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 3px;
        }
        .impact-card-label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        /* ── Impact description text ── */
        .impact-desc {
          padding: 0 18px 14px;
          font-size: 11px;
          color: var(--text-sub);
          line-height: 1.6;
        }
        .impact-desc strong {
          color: var(--text-title);
        }

        .hero-divider-text {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          width: auto !important;
          height: auto !important;
          background: none !important;
        }

        .conf-text {
          font-size: 11px;
          color: var(--text-sub);
          font-weight: 500;
        }
      `}</style>

      {/* Confetti */}
      <div className="confetti-wrap">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="c-particle" style={{
            left: `${Math.random() * 100}%`,
            background: ["#4ade80","#a3e635","#16a34a","#fbbf24","#34d399"][i % 5],
            animationDuration: `${1.5 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.8}s`,
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
          }} />
        ))}
      </div>

      <div className="audit-root">
        {/* Top Bar */}
        <div className="topbar">
          <button className="back-btn">{icons.arrow}</button>
          <span className="topbar-title">Audit Report</span>
          <div className="topbar-badge">
            <div className="pulse-dot" />
            On-Chain Verified
          </div>
        </div>

        {/* Hero */}
        <div className="hero" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease" }}>
          <div className="hero-seal">{icons.check}</div>
          <div className="hero-title">Transaction Verified</div>
          <div className="hero-sub">Carbon Credit Issuance · Authentic &amp; On-Chain</div>
          <div className="hero-divider" style={{ marginTop: "10px" }}>
            <span />
            <span className="hero-divider-text">VERRA VCS · REDD+ CERTIFIED</span>
            <span />
          </div>
        </div>

        <div className="content">

          {/* Transaction Hash */}
          <div className="card" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}>
            <div className="card-header">
              <div className="card-header-dot" />
              Transaction Hash
            </div>
            <div className="hash-row">
              <div className="hash-value">{txData.hash}</div>
              <CopyButton text={txData.hash} />
            </div>
            <div className="network-row">
              <div className="network-badge">
                <div className="polygon-dot" />
                {txData.network}
              </div>
              <div className="status-badge">
                <span>✓</span> {txData.status}
              </div>
            </div>
            {/* Confirmation Bar */}
            <div className="conf-row">
              <span className="conf-text">Confirmations</span>
              <div className="conf-bar-wrap">
                <div className="conf-bar-fill" />
              </div>
              <span className="conf-label">{count} / 128+</span>
            </div>
          </div>

          {/* Block Details */}
          <div className="card" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.2s" }}>
            <div className="card-header">
              <div className="card-header-dot" />
              Block Details
            </div>
            <div className="card-body">
              <InfoRow label="Block Number" value={txData.block} mono />
              <InfoRow label="Timestamp" value={txData.timestamp} />
              <InfoRow label="Gas Consumed" value={txData.gasConsumed} mono />
              <InfoRow label="Gas Cost (USD)" value={txData.gasCostUSD} />
            </div>
          </div>

          {/* Carbon Credit Details */}
          <div className="card" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.25s" }}>
            <div className="card-header">
              <div className="card-header-dot" style={{ background: "#a3e635" }} />
              Carbon Credit Details
            </div>
            <div className="card-body">
              <InfoRow label="Project" value={txData.batchName} />
              <InfoRow label="Batch ID" value={`Carbon Credit Batch ${txData.batchId}`} mono />
              <InfoRow label="Credit Type" value={txData.creditType} />
              <InfoRow label="Standard" value={txData.standard} accent />
              <InfoRow label="Methodology" value={txData.methodology} mono />
              <InfoRow label="Vintage Year" value={txData.vintage} />
              <InfoRow label="Country" value={txData.country} />
              <InfoRow label="Quantity" value={`${txData.quantity} tCO₂e`} accent />
              <InfoRow label="Price Paid" value={txData.pricePerCredit} />
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="card" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.3s" }}>
            <div className="card-header">
              <div className="card-header-dot" style={{ background: "#4ade80" }} />
              Your Environmental Impact
            </div>
            <div className="impact-grid">
              <ImpactCard icon="🌱" value="1 tCO₂" label="Offset" color="#4ade80" />
              <ImpactCard icon="🌳" value={`${txData.treeEquiv}`} label="Trees / Year" color="#a3e635" />
              <ImpactCard icon="🚗" value={txData.carMilesEquiv} label="Car Emissions" color="#fbbf24" />
            </div>
            <div className="impact-desc">
              This credit offsets the equivalent of <strong>4 hours of commercial flight</strong> or <strong>driving 2,400 miles</strong>. Your contribution protects Indian forest ecosystems under REDD+ protocols.
            </div>
          </div>

          {/* Wallet Info */}
          <div className="card" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.35s" }}>
            <div className="card-header">
              <div className="card-header-dot" style={{ background: "#a78bfa" }} />
              Participants
            </div>
            <div className="wallet-row">
              <div className="wallet-item">
                <div>
                  <div className="wallet-label" style={{ marginBottom: "4px" }}>Seller</div>
                  <div className="wallet-addr">
                    {txData.seller}
                    <CopyButton text={txData.seller} />
                  </div>
                </div>
                <span className="wallet-role" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>Issuer</span>
              </div>
              <div style={{ height: "1px", background: "var(--border-color)" }} />
              <div className="wallet-item">
                <div>
                  <div className="wallet-label" style={{ marginBottom: "4px" }}>Buyer</div>
                  <div className="wallet-addr">
                    {txData.buyer}
                    <CopyButton text={txData.buyer} />
                  </div>
                </div>
                <span className="wallet-role" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>You</span>
              </div>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="card" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.4s" }}>
            <div className="card-header">
              <div className="card-header-dot" style={{ background: "#fbbf24" }} />
              Verification Trail
            </div>
            <div className="steps-wrap">
              <VerificationStep step={1} label="Smart Contract Executed" sublabel="Marketplace contract call confirmed" done delay={600} />
              <VerificationStep step={2} label="Token Minted to Buyer" sublabel={`1 CARB token → ${txData.buyer}`} done delay={900} />
              <VerificationStep step={3} label="Verra Registry Cross-Check" sublabel="VCS Batch #4402 validated against registry" done delay={1200} />
              <VerificationStep step={4} label="Supabase Record Updated" sublabel="Off-chain metadata synced & indexed" done delay={1500} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.5s" }}>
            <div className="actions-row">
              <button className="btn-primary">
                {icons.download} Download Certificate
              </button>
              <button className="btn-secondary" onClick={() => window.open(`https://polygonscan.com/tx/${txData.hash}`, "_blank")}>
                {icons.external} PolygonScan
              </button>
            </div>
            <div className="footer-note" style={{ marginTop: "16px" }}>
              {icons.shield}
              Secured by CarbonX blockchain verification · Polygon PoS
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
