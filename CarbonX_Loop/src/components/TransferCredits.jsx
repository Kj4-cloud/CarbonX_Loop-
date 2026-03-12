// src/components/TransferCredits.jsx
import { useState } from "react";
import { useBlockchain } from "../blockchain/useBlockchain";
import { logTransaction } from "../blockchain/logTransaction";
import { CREDIT_TYPES, BLOCK_EXPLORER } from "../blockchain/config";

export default function TransferCredits() {
  const { account, connectWallet, transferCredits } = useBlockchain();
  const [toAddress, setToAddress] = useState("");
  const [tokenId, setTokenId]     = useState(1);
  const [amount, setAmount]       = useState(1);
  const [loading, setLoading]     = useState(false);
  const [txHash, setTxHash]       = useState(null);

  const handleTransfer = async () => {
    if (!account) { await connectWallet(); return; }
    setLoading(true);
    try {
      const result = await transferCredits(toAddress, tokenId, amount);
      if (result) {
        setTxHash(result.txHash);
        await logTransaction({
          txHash:    result.txHash,
          fromAddr:  account,
          toAddr:    toAddress,
          tokenId, amount,
          txType:    "transfer"
        });
      }
    } catch (err) {
      alert("Transfer failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>Transfer Carbon Credits</h3>
      <select onChange={e => setTokenId(Number(e.target.value))}>
        {Object.entries(CREDIT_TYPES).map(([name, id]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
      <input placeholder='Recipient wallet address (0x...)'
        onChange={e => setToAddress(e.target.value)} />
      <input type='number' min='1' value={amount}
        onChange={e => setAmount(Number(e.target.value))} />
      <button onClick={handleTransfer} disabled={loading}>
        {loading ? 'Processing...' : 'Transfer Credits'}
      </button>
      {txHash && (
        <p>✅ Success! <a href={BLOCK_EXPLORER + txHash} target='_blank'>
          View on PolygonScan</a></p>
      )}
    </div>
  );
}
