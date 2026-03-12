// src/components/RetireCredits.jsx
import { useState } from "react";
import { useBlockchain } from "../blockchain/useBlockchain";
import { logTransaction } from "../blockchain/logTransaction";
import { CREDIT_TYPES, BLOCK_EXPLORER } from "../blockchain/config";

export default function RetireCredits() {
  const { account, connectWallet, retireCredits } = useBlockchain();
  const [tokenId, setToken] = useState(1);
  const [amount, setAmount] = useState(1);
  const [loading, setLoad]  = useState(false);
  const [txHash, setHash]   = useState(null);
  const [err, setErr]       = useState(null);

  const handle = async () => {
    if (!account) { await connectWallet(); return; }
    setLoad(true); setErr(null);
    try {
      const res = await retireCredits(tokenId, amount);
      if (res) {
        setHash(res.txHash);
        await logTransaction({
          txHash: res.txHash, fromAddr: account, toAddr: null,
          tokenId, amount, txType: 'retire',
          blockNumber: res.receipt?.blockNumber,
        });
      }
    } catch (e) { setErr(e.message); }
    setLoad(false);
  };

  return (
    <div style={{ maxWidth:480, padding:24, background:'#fff',
      borderRadius:12, border:'1px solid #E0E0E0' }}>
      <h3 style={{ margin:'0 0 4px', color:'#E65100' }}>Retire Carbon Credits</h3>
      <p style={{ margin:'0 0 16px', fontSize:13, color:'#888' }}>
        Retiring permanently removes credits from circulation
      </p>
      <label style={{ display:'block', marginBottom:12 }}>
        <span style={{ fontSize:13, color:'#666' }}>Credit Type</span>
        <select value={tokenId} onChange={e=>setToken(Number(e.target.value))}
          style={{ display:'block', width:'100%', padding:8, marginTop:4,
            borderRadius:6, border:'1px solid #CCC' }}>
          {Object.entries(CREDIT_TYPES).map(([name,id])=>(
            <option key={id} value={id}>{name.replace(/_/g,' ')}</option>
          ))}
        </select>
      </label>
      <label style={{ display:'block', marginBottom:16 }}>
        <span style={{ fontSize:13, color:'#666' }}>Amount to Retire</span>
        <input type='number' min='1' value={amount}
          onChange={e=>setAmount(Number(e.target.value))}
          style={{ display:'block', width:'100%', padding:8, marginTop:4,
            borderRadius:6, border:'1px solid #CCC', boxSizing:'border-box' }}/>
      </label>
      <button onClick={handle} disabled={loading}
        style={{ width:'100%', padding:10, background:'#E65100',
          color:'#fff', border:'none', borderRadius:8, cursor:'pointer',
          fontWeight:600, fontSize:14 }}>
        {loading ? 'Processing...' : 'Retire Credits Permanently'}
      </button>
      {txHash && (
        <p style={{ marginTop:12, color:'#2E7D32', fontSize:13 }}>
          Retired!{' '}
          <a href={BLOCK_EXPLORER+txHash} target='_blank' rel='noreferrer'
            style={{ color:'#1565C0' }}>View on PolygonScan ↗</a>
        </p>
      )}
      {err && <p style={{ marginTop:12, color:'#B71C1C', fontSize:13 }}>{err}</p>}
    </div>
  );
}
