// src/blockchain/useBlockchain.js
import { useState, useCallback } from "react";
import { ethers } from "ethers";
import CarbonCreditABI from "./contracts/CarbonCreditERC1155.json";
import { CARBON_CREDIT_ADDRESS, POLYGON_AMOY_CHAIN_ID } from "./config";

export function useBlockchain() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // ── Connect MetaMask wallet ──
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask not found! Please install MetaMask extension.");
      return null;
    }
    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();

      // Force switch to Amoy if user is on wrong network
      if (Number(network.chainId) !== POLYGON_AMOY_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError) {
          // If Amoy not added, add it automatically
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
                chainName: "Polygon Amoy Testnet",
                nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
                rpcUrls: ["https://rpc-amoy.polygon.technology/"],
                blockExplorerUrls: ["https://amoy.polygonscan.com"]
              }]
            });
          }
        }
      }

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      setIsConnecting(false);
      return signer;
    } catch (err) {
      setError(err.message);
      setIsConnecting(false);
      return null;
    }
  }, []);

  // ── Transfer credits to another wallet ──
  const transferCredits = async (toAddress, tokenId, amount) => {
    const signer = await connectWallet();
    if (!signer) return null;
    const contract = new ethers.Contract(CARBON_CREDIT_ADDRESS, CarbonCreditABI, signer);
    const tx = await contract.transferCredits(toAddress, tokenId, amount);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  };

  // ── Permanently retire (burn) credits ──
  const retireCredits = async (tokenId, amount) => {
    const signer = await connectWallet();
    if (!signer) return null;
    const contract = new ethers.Contract(CARBON_CREDIT_ADDRESS, CarbonCreditABI, signer);
    const tx = await contract.retireCredits(tokenId, amount);
    const receipt = await tx.wait();
    return { txHash: tx.hash, receipt };
  };

  // ── Get credit balance for an address ──
  const getBalance = async (address, tokenId) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CARBON_CREDIT_ADDRESS, CarbonCreditABI, provider);
    const balance = await contract.getCreditBalance(address, tokenId);
    return balance.toString();
  };

  return {
    account, isConnecting, error,
    connectWallet, transferCredits, retireCredits, getBalance
  };
}
