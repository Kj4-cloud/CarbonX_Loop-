import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import "./BlockchainExplorer.css";

// Icons 
const I = {
  check: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  stepCheck: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  copy: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  dl: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  ext: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  shield: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  pin: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
};

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  const go = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2200); };
  return (
    <button onClick={go} className={`be-copy-btn ${ok ? "copied" : ""}`}>
      {ok ? "✓ Copied" : <>{I.copy} Copy</>}
    </button>
  );
}

function Reveal({ children, delay = 0, y = 20 }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      opacity: v ? 1 : 0, transform: v ? "translateY(0)" : `translateY(${y}px)`,
      transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
    }}>{children}</div>
  );
}

function Step({ step, label, sub, done }) {
  return (
    <div className="be-step-wrap">
      <div className="be-step-col">
        <div className={`be-step-circle ${done ? "done" : "pending"}`}>
          {done ? I.stepCheck : <span className="be-step-num">{step}</span>}
        </div>
        {step < 4 && (
          <div className={`be-step-line ${done ? "done" : "pending"}`} />
        )}
      </div>
      <div className="be-step-content" style={{ paddingBottom: step === 4 ? "0" : "6px" }}>
        <div className={`be-step-label ${done ? "done" : "pending"}`}>{label}</div>
        <div className="be-step-sub">{sub}</div>
      </div>
    </div>
  );
}

export default function BlockchainExplorer({ transaction: propTx }) {
  const { user } = useAuth();
  const [dbTx, setDbTx] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchTx = async () => {
      const { data: txData, error } = await supabase
        .from("blockchain_transactions")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (txData) {
        setDbTx({
          hash: txData.tx_hash,
          status: "Verified",
          statusMessage: txData.status_message || "Authentic Carbon Credit Issuance • On-chain validation successful",
          network: txData.network,
          staking: txData.staking_status,
          details: {
            mintingEvent: txData.minting_event,
            timestamp: txData.tx_timestamp,
            gasConsumed: txData.gas_consumed,
          },
          smartContract: {
            tokenId: txData.token_id,
            standard: txData.token_standard,
            contractAddress: txData.contract_address,
          },
          impact: {
            image: txData.impact_image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80",
            coordinates: txData.coordinates || "4.72° S, 70.85° W",
            projectId: txData.project_id || "AMZ-F8296-08RA",
            verifiedTonnes: String(txData.verified_tonnes || "45.7"),
            methodology: txData.methodology || "Verra VCS",
            certType: txData.cert_type || "Gold Standard",
          },
          networkLoad: {
            label: txData.network_load_label || "Optimal",
            percent: txData.network_load_percent || 35,
          },
        });
      }
    };
    fetchTx();
  }, [user]);

  const tx = dbTx || {
    hash: "0x4f92...a8e1",
    hashFull: "0x4f92b3a91cd7f2e84acd0192837465fb2190a8e1",
    status: "Verified",
    statusMessage: "Authentic Carbon Credit Issuance • On-chain validation successful",
    network: "Polygon PoS",
    staking: "Confirmed",
    details: {
      mintingEvent: "Carbon Credit Batch #4402",
      timestamp: "2024-01-15 09:42:31 UTC",
      gasConsumed: "0.0023 MATIC (~$0.002)",
    },
    smartContract: {
      tokenId: "#CC-4402-NILGIRIS",
      standard: "ERC-1155 (Multi-Token)",
      contractAddress: "0x7a3...f9c2",
    },
    impact: {
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80",
      coordinates: "4.72° S, 70.85° W",
      projectId: "AMZ-F8296-08RA",
      verifiedTonnes: "45.7",
      methodology: "Verra VCS",
      certType: "Gold Standard",
    },
    seller: "0xb56d...5d62",
    sellerFull: "0xb56d...5d62",
    buyer: "0x9658...b545",
    buyerFull: "0x9658...b545",
    networkLoad: { label: "Optimal", percent: 35 },
    ...propTx,
  };

  return (
    <main className="be-main">
      <div className="be-back-header">
        <div className="be-back-btn" onClick={() => window.history.back()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </div>
        <h1 className="be-page-title">Audit Report</h1>
      </div>

      <Reveal delay={0} y={15}>
        <section className="be-verified-banner">
          <div className="be-verified-icon">{I.check}</div>
          <h2 className="be-verified-title">Transaction Verified</h2>
          <p className="be-verified-desc">{tx.statusMessage}</p>
        </section>
      </Reveal>

      {/* Impact Validation Card */}
      <Reveal delay={100}>
        <div className="be-card" style={{ marginBottom: "1.5rem" }}>
          <div className="be-card-h">
            <div className="be-card-dot" style={{ background: "#4ade80", color: "#4ade80" }} />
            Impact Validation
          </div>
          <div className="be-impact-image-wrap">
            <div className="be-impact-image" style={{ backgroundImage: `url('/forest-aerial.png'), url('${tx.impact.image}')` }} />
            <div className="be-impact-overlay" />
            <div className="be-impact-coords">
              {I.pin} <span>{tx.impact.coordinates}</span>
            </div>
          </div>
          <div className="be-impact-details">
            <div className="be-impact-row mb-2">
              <div className="be-impact-section-label">Project ID</div>
              <div className="be-impact-project-id">{tx.impact.projectId}</div>
            </div>
            <div className="be-impact-row mb-2 mt-1">
              <div className="be-impact-tonnes-label">Verified Tonnes CO₂e</div>
              <span className="be-tonnes-value">{tx.impact.verifiedTonnes}</span>
            </div>
            <div className="be-impact-certs">
              <span className="be-cert-chip green">{tx.impact.methodology}</span>
              <span className="be-cert-chip amber">{tx.impact.certType}</span>
            </div>
          </div>
          <div className="be-ornament" />
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="be-card" style={{ marginBottom: "1.5rem" }}>
          <div className="be-card-h">
            <div className="be-card-dot" style={{ background: "#a78bfa", color: "#a78bfa" }} />
            Participants
          </div>
          <div className="be-participants-body">
            <div className="be-participant-row">
              <div>
                <div className="be-participant-label">Seller</div>
                <div className="be-participant-address">
                  {tx.seller} <CopyBtn text={tx.sellerFull || tx.seller} />
                </div>
              </div>
              <div className="be-badge-issuer">Issuer</div>
            </div>
            <div className="be-participant-divider" />
            <div className="be-participant-row">
              <div>
                <div className="be-participant-label">Buyer</div>
                <div className="be-participant-address">
                  {tx.buyer} <CopyBtn text={tx.buyerFull || tx.buyer} />
                </div>
              </div>
              <div className="be-badge-you">You</div>
            </div>
          </div>
          <div className="be-ornament" />
        </div>
      </Reveal>

      <Reveal delay={300}>
        <div className="be-card" style={{ marginBottom: "1.5rem" }}>
          <div className="be-card-h">
            <div className="be-card-dot" style={{ background: "#fbbf24", color: "#fbbf24" }} />
            Verification Trail
          </div>
          <div style={{ padding: "20px" }}>
            <Step step={1} label="Smart Contract Executed" sub="Marketplace contract call confirmed" done />
            <Step step={2} label="Token Minted to Buyer" sub={`1 CARB token → ${tx.buyer}`} done />
            <Step step={3} label="Verra Registry Cross-Check" sub="VCS Batch #4402 validated against registry" done />
            <Step step={4} label="Supabase Record Updated" sub="Off-chain metadata synced & indexed" done />
          </div>
          <div className="be-ornament" />
        </div>
      </Reveal>

      <Reveal delay={400}>
        <div className="be-actions-row">
          <button className="be-btn-download">
            {I.dl} Download Certificate
          </button>
          <button className="be-btn-polygonscan" onClick={() => window.open(`https://polygonscan.com/tx/${tx.hash}`, "_blank")}>
            {I.ext} PolygonScan
          </button>
        </div>
        <div className="be-footer-note">
          {I.shield} Secured by CarbonX blockchain verification · Polygon PoS
        </div>
      </Reveal>

      <Reveal delay={500}>
        <div className="be-network-load">
          <span className="be-network-load-label">Network Load</span>
          <span className="be-network-load-status">{tx.networkLoad.label}</span>
          <div className="be-network-bar">
            <div className="be-network-bar-fill" style={{ width: `${tx.networkLoad.percent}%` }}></div>
          </div>
        </div>
      </Reveal>

    </main>
  );
}
