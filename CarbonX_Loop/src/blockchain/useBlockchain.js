// src/blockchain/useBlockchain.js
import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import CarbonCreditABI from "./contracts/CarbonCreditERC1155.json";
import { CARBON_CREDIT_ADDRESS, POLYGON_AMOY_CHAIN_ID, AMOY_NETWORK } from "./config";

export function useBlockchain() {
  const [account, setAccount]         = useState(null);
  const [isConnecting, setConnecting]  = useState(false);
  const [chainOk, setChainOk]          = useState(false);
  const [error, setError]              = useState(null);

  // ── Auto-detect already-connected wallet on page load ──────
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then(accs => {
      if (accs.length > 0) setAccount(accs[0]);
    });
    window.ethereum.on('accountsChanged', accs => setAccount(accs[0] || null));
    window.ethereum.on('chainChanged', () => window.location.reload());
  }, []);

  // ── Connect MetaMask + auto-add Amoy if needed ────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return null;
    }
    setConnecting(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== POLYGON_AMOY_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: AMOY_NETWORK.chainId }],
          });
        } catch (switchErr) {
          if (switchErr.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [AMOY_NETWORK],
            });
          } else throw switchErr;
        }
      }

      const signer = await provider.getSigner();
      const addr   = await signer.getAddress();
      setAccount(addr);
      setChainOk(true);
      setConnecting(false);
      return signer;
    } catch (err) {
      setError(err.message);
      setConnecting(false);
      return null;
    }
  }, []);

  // ── Helper: get contract instance with signer ──────────────
  const getContract = async () => {
    const signer = await connectWallet();
    if (!signer) return null;
    return new ethers.Contract(CARBON_CREDIT_ADDRESS, CarbonCreditABI, signer);
  };

  // ── Transfer credits to another wallet ────────────────────
  const transferCredits = async (toAddress, tokenId, amount) => {
    const contract = await getContract();
    if (!contract) return null;
    const tx      = await contract.transferCredits(toAddress, tokenId, amount);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  };

  // ── Permanently retire (burn) credits ─────────────────────
  const retireCredits = async (tokenId, amount) => {
    const contract = await getContract();
    if (!contract) return null;
    const tx      = await contract.retireCredits(tokenId, amount);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  };

  // ── Read balance for a wallet address + token ID ──────────
  const getBalance = async (address, tokenId) => {
    const provider = new ethers.JsonRpcProvider(
      'https://polygon-amoy-bor-rpc.publicnode.com'
    );
    const contract = new ethers.Contract(
      CARBON_CREDIT_ADDRESS, CarbonCreditABI, provider
    );
    const bal = await contract.getCreditBalance(address, tokenId);
    return bal.toString();
  };

  return {
    account, isConnecting, chainOk, error,
    connectWallet, transferCredits, retireCredits, getBalance,
  };
}
