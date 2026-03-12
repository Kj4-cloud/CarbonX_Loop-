// src/blockchain/useBlockchainProof.js
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { supabase } from "../lib/supabase";
import CarbonCreditABI from "./contracts/CarbonCreditERC1155.json";
import { CARBON_CREDIT_ADDRESS, RPC_URL } from "./config";

export function useBlockchainProof() {
  const [latestBlock, setLatestBlock]       = useState(null);
  const [transactions, setTransactions]     = useState([]);
  const [totalCount, setTotalCount]         = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [isListening, setIsListening]       = useState(false);
  const [account, setAccount]               = useState(null);

  // ── Fetch existing txns from Supabase ────────────────────
  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) {
      setTransactions(data);
      setTotalCount(data.length);
      setConfirmedCount(data.filter(t => t.status === 'confirmed').length);
    }
  }, []);

  // ── Poll latest block every 5 seconds ────────────────────
  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const poll = async () => {
      try {
        const n = await provider.getBlockNumber();
        setLatestBlock(n.toLocaleString());
      } catch (e) {}
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, []);

  // ── Listen to on-chain events live ────────────────────────
  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CARBON_CREDIT_ADDRESS, CarbonCreditABI, provider
    );
    setIsListening(true);

    const handle = (type) => async (...args) => {
      const event = args[args.length - 1];
      const newTx = {
        tx_hash:      event.log.transactionHash,
        tx_type:      type,
        status:       'confirmed',
        block_number: event.log.blockNumber,
        created_at:   new Date().toISOString(),
        ...(type === 'transfer' && { from_addr: args[0], to_addr: args[1], token_id: Number(args[2]), amount: Number(args[3]) }),
        ...(type === 'retire'   && { from_addr: args[0], token_id: Number(args[1]), amount: Number(args[2]) }),
        ...(type === 'mint'     && { to_addr: args[0],   token_id: Number(args[1]), amount: Number(args[2]), credit_name: args[3] }),
      };
      await supabase.from('transactions').upsert([newTx], { onConflict: 'tx_hash' });
      setTransactions(p => [newTx, ...p.filter(t => t.tx_hash !== newTx.tx_hash)]);
      setTotalCount(p => p + 1);
      setConfirmedCount(p => p + 1);
    };

    contract.on('CreditTransferred', handle('transfer'));
    contract.on('CreditRetired',     handle('retire'));
    contract.on('CreditMinted',      handle('mint'));

    return () => { contract.removeAllListeners(); setIsListening(false); };
  }, []);

  // ── Supabase real-time — sync across all browser tabs ────
  useEffect(() => {
    fetchTransactions();
    const ch = supabase
      .channel('tx-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          setTransactions(p => {
            if (p.find(t => t.tx_hash === payload.new.tx_hash)) return p;
            return [payload.new, ...p];
          });
          setTotalCount(p => p + 1);
          if (payload.new.status === 'confirmed') setConfirmedCount(p => p + 1);
        }
      ).subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchTransactions]);

  // ── MetaMask account detection ────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' })
      .then(accs => { if (accs[0]) setAccount(accs[0]); });
    window.ethereum.on('accountsChanged', accs => setAccount(accs[0] || null));
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) { window.open('https://metamask.io/download/', '_blank'); return; }
    const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accs[0]);
  };

  return {
    latestBlock, transactions, totalCount, confirmedCount,
    isListening, account, connectMetaMask, fetchTransactions,
  };
}
