// src/components/ConnectWallet.jsx
import { useBlockchain } from "../blockchain/useBlockchain";

export default function ConnectWallet() {
  const { account, isConnecting, connectWallet } = useBlockchain();

  if (account) {
    return (
      <div className='wallet-connected'>
        <span className='dot green'></span>
        Connected: {account.slice(0,6)}...{account.slice(-4)}
      </div>
    );
  }

  return (
    <button onClick={connectWallet} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask'}
    </button>
  );
}
