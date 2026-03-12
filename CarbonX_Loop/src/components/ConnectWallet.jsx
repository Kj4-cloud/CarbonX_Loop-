// src/components/ConnectWallet.jsx
import { useBlockchain } from "../blockchain/useBlockchain";

export default function ConnectWallet() {
  const { account, isConnecting, connectWallet } = useBlockchain();
  const short = a => `${a.slice(0,6)}...${a.slice(-4)}`;

  if (account) return (
    <div style={{ display:'flex', alignItems:'center', gap:8,
      background:'#E8F5E9', border:'1px solid #4CAF50',
      borderRadius:8, padding:'6px 14px', fontSize:13 }}>
      <span style={{ color:'#2E7D32', fontWeight:700 }}>●</span>
      <span style={{ fontFamily:'monospace' }}>{short(account)}</span>
    </div>
  );

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      style={{ background:'#1A7A4A', color:'#fff', border:'none',
        borderRadius:8, padding:'8px 18px', cursor:'pointer',
        fontWeight:600, fontSize:14 }}
    >
      {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask'}
    </button>
  );
}
