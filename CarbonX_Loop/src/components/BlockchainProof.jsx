// src/components/BlockchainProof.jsx
import { useBlockchainProof } from "../blockchain/useBlockchainProof";
import { BLOCK_EXPLORER } from "../blockchain/config";

const TYPE = {
  transfer: { bg:'#E8F5E9', color:'#2E7D32', label:'Transfer' },
  retire:   { bg:'#FFF8E1', color:'#E65100', label:'Retired'  },
  mint:     { bg:'#E3F2FD', color:'#1565C0', label:'Minted'   },
};

export default function BlockchainProof() {
  const {
    latestBlock, transactions, totalCount, confirmedCount,
    isListening, account, connectMetaMask
  } = useBlockchainProof();

  return (
    <div style={{ padding:16, maxWidth:900, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{ background:'#E8F5E9', borderRadius:'50%', padding:'8px 10px' }}>
          <span style={{ color:'#2E7D32', fontSize:20 }}>✔</span>
        </div>
        <div>
          <h2 style={{ margin:0 }}>Blockchain Proof</h2>
          <p style={{ margin:0, color:'#888', fontSize:13 }}>
            Immutable transaction records on-chain
            {isListening && <span style={{ marginLeft:8, color:'#4CAF50' }}>● Live</span>}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
        gap:12, marginBottom:20 }}>
        {[
          { label:'TOTAL',        val:totalCount,     color:'#2E7D32' },
          { label:'CONFIRMED',    val:confirmedCount, color:'#2E7D32' },
          { label:'LATEST BLOCK', val:latestBlock ? `#${latestBlock}` : '...', color:'#7B61FF' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background:'#fff', border:'1px solid #eee',
            borderRadius:12, padding:20, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:700, color }}>{val ?? '—'}</div>
            <div style={{ fontSize:12, color:'#999', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* MetaMask Banner */}
      <div style={{ background:'#1A1F2E', borderRadius:12, padding:'16px 20px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:28 }}>🦊</span>
          <div>
            <div style={{ color:'#fff', fontWeight:600 }}>
              {account ? 'MetaMask Connected' : 'Connect MetaMask'}
            </div>
            <div style={{ color:'#aaa', fontSize:12, fontFamily:'monospace' }}>
              {account
                ? `${account.slice(0,6)}...${account.slice(-4)}`
                : 'Verify your on-chain transactions'}
            </div>
          </div>
        </div>
        {!account ? (
          <button onClick={connectMetaMask} style={{ background:'#1A7A4A',
            color:'#fff', border:'none', borderRadius:8, padding:'8px 16px',
            cursor:'pointer', fontWeight:600 }}>
            {window.ethereum ? 'Connect' : 'Install MetaMask'}
          </button>
        ) : (
          <span style={{ color:'#4CAF50', fontWeight:600 }}>● Connected</span>
        )}
      </div>

      {/* Transaction List */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:12 }}>
        <h3 style={{ margin:0 }}>Transaction Proofs</h3>
        <span style={{ color:'#888', fontSize:13 }}>{totalCount} records</span>
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'#888' }}>
          No transactions yet — mint or transfer credits to see them here
        </div>
      ) : transactions.map((tx, i) => {
        const t = TYPE[tx.tx_type] || TYPE.transfer;
        return (
          <div key={tx.tx_hash} style={{ background:'#1A2A1A', borderRadius:12,
            padding:'16px 20px', marginBottom:12, border:'1px solid #2E4A2E' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ color:'#4CAF50', fontWeight:700 }}>
                TRANSACTION #{i+1}
              </span>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ background:t.bg, color:t.color, borderRadius:20,
                  padding:'2px 10px', fontSize:12, fontWeight:600 }}>{t.label}</span>
                <span style={{ color:'#A78BFA', fontSize:13 }}>● Polygon</span>
                <span style={{ color:'#4CAF50', fontSize:13 }}>● Confirmed</span>
              </div>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ color:'#888', fontSize:11, letterSpacing:1 }}>TRANSACTION HASH</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#ccc', fontFamily:'monospace', fontSize:12 }}>
                  {tx.tx_hash}
                </span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>navigator.clipboard.writeText(tx.tx_hash)}
                    style={{ background:'transparent', border:'1px solid #444',
                      color:'#aaa', borderRadius:6, padding:'3px 10px',
                      cursor:'pointer', fontSize:12 }}>Copy</button>
                  <a href={BLOCK_EXPLORER+tx.tx_hash} target='_blank' rel='noreferrer'
                    style={{ background:'transparent', border:'1px solid #444',
                      color:'#aaa', borderRadius:6, padding:'3px 10px',
                      fontSize:12, textDecoration:'none' }}>↗ Explorer</a>
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <div>
                <div style={{ color:'#888', fontSize:11, letterSpacing:1 }}>FROM</div>
                <div style={{ color:'#ccc', fontFamily:'monospace', fontSize:12 }}>
                  {tx.from_addr ? `${tx.from_addr.slice(0,6)}...${tx.from_addr.slice(-4)}` : '—'}
                </div>
              </div>
              <div>
                <div style={{ color:'#888', fontSize:11, letterSpacing:1 }}>AMOUNT</div>
                <div style={{ color:'#4CAF50', fontWeight:700 }}>{tx.amount} Credits</div>
              </div>
              <div>
                <div style={{ color:'#888', fontSize:11, letterSpacing:1 }}>BLOCK</div>
                <div style={{ color:'#ccc' }}>
                  #{tx.block_number?.toLocaleString() || '—'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
