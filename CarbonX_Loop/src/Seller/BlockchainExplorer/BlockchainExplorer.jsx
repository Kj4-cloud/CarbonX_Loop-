import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import "./BlockchainExplorer.css";

/**
 * BlockchainExplorer - Audit report view for blockchain carbon credit transactions.
 * Shows verified transaction details, smart contract data, and impact validation.
 *
 * @param {Object} [props.transaction] - Transaction data override
 */
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

      if (error && error.code !== "PGRST116") {
        console.warn("BlockchainExplorer: fetch error", error.message);
      }

      if (txData) {
        setDbTx({
          hash: txData.tx_hash,
          status: "Verified",
          statusMessage:
            txData.status_message ||
            "Authentic Carbon Credit Issuance • On-chain validation successful",
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
            image: txData.impact_image || "",
            coordinates: txData.coordinates,
            projectId: txData.project_id,
            verifiedTonnes: String(txData.verified_tonnes),
            methodology: txData.methodology,
            certType: txData.cert_type,
          },
          networkLoad: {
            label: txData.network_load_label,
            percent: txData.network_load_percent,
          },
        });
      }
    };
    fetchTx();
  }, [user]);

  // BUG-05 fix: use dbTx when available, fall back to hardcoded demo data
  const tx = dbTx || {
    hash: "0x4f92...a8e1",
    status: "Verified",
    statusMessage:
      "Authentic Carbon Credit Issuance • On-chain validation successful",
    network: "Polygon PoS",
    staking: "Success",
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
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDCoa70KjVmd0zvt-N8-_egRf8n5hs21IUZ_dFFpxljocipkFvatfbGnqt-wpMThYiqYfHOG3JcIir4AQReTdfBF4aBRLJVzUGx_8mwq0blB6jxp6ELWR8FabfSvul018Q97g69xooFeEPTSUueKemnHiq1mv1yJdjCQFh51VcMCBKir2oFutkiIHZcUJ13YBeBy4AP41poCrSD0Hu2SGDfppjUEyXnhz6jVj-dL2DVs9J-62LL4-e6nYJouDuYlyzsaG9hwXE4xTse",
      coordinates: "4.72° S, 70.85° W",
      projectId: "AMZ-F8296-08RA",
      verifiedTonnes: "45.7",
      methodology: "Verra VCS",
      certType: "Gold Standard",
    },
    networkLoad: { label: "Optimal", percent: 35 },
    ...propTx,
  };

  return (
    <main className="be-main">
      {/* Back Header */}
      <div className="be-back-header">
        <span
          className="material-symbols-outlined"
          style={{ color: "var(--slate-500)" }}
        >
          arrow_back
        </span>
        <h1 className="be-page-title">Audit Report</h1>
      </div>

      {/* Verified Banner */}
      <section className="be-verified-banner animate-fade-in">
        <div className="be-verified-icon">
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: "2.5rem", color: "var(--primary)" }}
          >
            verified
          </span>
        </div>
        <h2 className="be-verified-title">Transaction Verified</h2>
        <p className="be-verified-desc">{tx.statusMessage}</p>
      </section>

      {/* Transaction Hash */}
      <section
        className="be-section animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="be-hash-row">
          <div>
            <span className="be-section-label">Transaction Hash</span>
            <p className="be-hash-value">{tx.hash}</p>
          </div>
          <button className="be-copy-btn">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1rem" }}
            >
              content_copy
            </span>
          </button>
        </div>
        <div className="be-net-status-row">
          <div className="be-net-chip">
            <span className="be-net-dot" style={{ background: "#7c3aed" }} />
            <span className="be-net-label">{tx.network}</span>
          </div>
          <span className="be-status-chip">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "0.75rem", color: "var(--primary)" }}
            >
              check_circle
            </span>
            {tx.staking}
          </span>
        </div>
      </section>

      {/* Transaction Details */}
      <section
        className="be-section animate-fade-in"
        style={{ animationDelay: "0.15s" }}
      >
        <h3 className="be-section-heading">Transaction Details</h3>
        <div className="be-details-card">
          <div className="be-detail-row">
            <span className="be-detail-label">Minting Event</span>
            <span className="be-detail-value">{tx.details.mintingEvent}</span>
          </div>
          <div className="be-detail-row">
            <span className="be-detail-label">Timestamp</span>
            <span className="be-detail-value">{tx.details.timestamp}</span>
          </div>
          <div className="be-detail-row">
            <span className="be-detail-label">Gas Consumed</span>
            <span className="be-detail-value">{tx.details.gasConsumed}</span>
          </div>
        </div>
      </section>

      {/* Smart Contract */}
      <section
        className="be-section animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <h3 className="be-section-heading">Smart Contract Data</h3>
        <div className="be-details-card">
          <div className="be-detail-row">
            <span className="be-detail-label">Token ID</span>
            <span className="be-detail-value be-mono">
              {tx.smartContract.tokenId}
            </span>
          </div>
          <div className="be-detail-row">
            <span className="be-detail-label">Standard</span>
            <span className="be-detail-value">{tx.smartContract.standard}</span>
          </div>
          <div className="be-detail-row">
            <span className="be-detail-label">Contract Address</span>
            <div className="be-contract-addr">
              <span className="be-detail-value be-mono">
                {tx.smartContract.contractAddress}
              </span>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--primary)",
                  cursor: "pointer",
                }}
              >
                open_in_new
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Validation */}
      <section
        className="be-section animate-fade-in"
        style={{ animationDelay: "0.25s" }}
      >
        <h3 className="be-section-heading">Impact Validation</h3>
        <div className="be-impact-card">
          <div className="be-impact-image-wrap">
            <div
              className="be-impact-image"
              style={{ backgroundImage: `url('${tx.impact.image}')` }}
            />
            <div className="be-impact-coords">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "0.75rem", color: "var(--primary)" }}
              >
                location_on
              </span>
              <span>{tx.impact.coordinates}</span>
            </div>
          </div>
          <div className="be-impact-details">
            <div className="be-impact-row">
              <span className="be-detail-label">Project ID</span>
              <span className="be-detail-value be-mono">
                {tx.impact.projectId}
              </span>
            </div>
            <div className="be-impact-tonnes">
              <span className="be-detail-label">Verified Tonnes CO₂e</span>
              <span className="be-tonnes-value">
                {tx.impact.verifiedTonnes}
              </span>
            </div>
            <div className="be-impact-certs">
              <span className="be-cert-chip green">
                {tx.impact.methodology}
              </span>
              <span className="be-cert-chip amber">{tx.impact.certType}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Network Load */}
      <div
        className="be-network-load animate-fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        <span className="be-network-load-label">Network Load</span>
        <span className="be-network-load-status">{tx.networkLoad.label}</span>
        <div className="be-network-bar">
          <div
            className="be-network-bar-fill"
            style={{ width: `${tx.networkLoad.percent}%` }}
          ></div>
        </div>
      </div>
    </main>
  );
}
