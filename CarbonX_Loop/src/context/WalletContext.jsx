import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { generateWalletAddress } from "../blockchain/walletUtils";

// ─── Wallet Context ─────────────────────────────────────────────────────────
const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { user, accountType } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  // ─── Fetch or create wallet ──────────────────────────────────────────────
  const fetchWallet = useCallback(async () => {
    if (!user) {
      setWallet(null);
      setWalletLoading(false);
      return;
    }

    setWalletLoading(true);
    try {
      // Try to fetch existing wallet
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Wallet fetch error:", error);
      }

      if (data) {
        setWallet(data);
      } else {
        // Auto-create wallet for new users
        const newAddress = generateWalletAddress();
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id: user.id,
            wallet_address: newAddress,
            balance: 0,
            account_type: accountType || "buyer",
          })
          .select()
          .single();

        if (createError) {
          // Could be a race condition — try fetching again
          if (createError.code === "23505") {
            const { data: existingWallet } = await supabase
              .from("wallets")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();
            setWallet(existingWallet);
          } else {
            console.error("Wallet creation error:", createError);
          }
        } else {
          setWallet(newWallet);
        }
      }
    } catch (err) {
      console.error("Wallet init error:", err);
    } finally {
      setWalletLoading(false);
    }
  }, [user, accountType]);

  // ─── Fetch wallet transactions ────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!wallet) return;
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Transactions fetch error:", error);
        return;
      }
      setTransactions(data || []);
    } catch (err) {
      console.error("Transactions fetch error:", err);
    }
  }, [wallet]);

  // ─── Init wallet on user change ──────────────────────────────────────────
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // ─── Fetch transactions when wallet is loaded ────────────────────────────
  useEffect(() => {
    if (wallet) {
      fetchTransactions();
    }
  }, [wallet, fetchTransactions]);

  // ─── Deposit funds ────────────────────────────────────────────────────────
  const deposit = useCallback(
    async (amount) => {
      if (!wallet || amount <= 0) {
        return { success: false, error: "Invalid deposit" };
      }

      try {
        // Update balance
        const { error: updateError } = await supabase
          .from("wallets")
          .update({ balance: wallet.balance + amount })
          .eq("id", wallet.id);

        if (updateError) throw updateError;

        // Log transaction
        const txHash = "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        await supabase.from("wallet_transactions").insert({
          wallet_id: wallet.id,
          type: "deposit",
          amount,
          description: `Deposited ₹${amount.toLocaleString("en-IN")}`,
          tx_hash: txHash,
          to_address: wallet.wallet_address,
        });

        // Refresh wallet
        setWallet((prev) => ({ ...prev, balance: prev.balance + amount }));
        await fetchTransactions();
        return { success: true, tx_hash: txHash };
      } catch (err) {
        console.error("Deposit error:", err);
        return { success: false, error: err.message };
      }
    },
    [wallet, fetchTransactions],
  );

  // ─── Withdraw funds ───────────────────────────────────────────────────────
  const withdraw = useCallback(
    async (amount) => {
      if (!wallet || amount <= 0) {
        return { success: false, error: "Invalid withdrawal" };
      }
      if (wallet.balance < amount) {
        return { success: false, error: "Insufficient balance" };
      }

      try {
        const { error: updateError } = await supabase
          .from("wallets")
          .update({ balance: wallet.balance - amount })
          .eq("id", wallet.id);

        if (updateError) throw updateError;

        const txHash = "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        await supabase.from("wallet_transactions").insert({
          wallet_id: wallet.id,
          type: "withdraw",
          amount,
          description: `Withdrew ₹${amount.toLocaleString("en-IN")}`,
          tx_hash: txHash,
          from_address: wallet.wallet_address,
        });

        setWallet((prev) => ({ ...prev, balance: prev.balance - amount }));
        await fetchTransactions();
        return { success: true, tx_hash: txHash };
      } catch (err) {
        console.error("Withdraw error:", err);
        return { success: false, error: err.message };
      }
    },
    [wallet, fetchTransactions],
  );

  // ─── Get wallet by user ID (for looking up seller wallets) ────────────────
  const getWalletByUserId = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("wallet_address, user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Wallet lookup error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Wallet lookup error:", err);
      return null;
    }
  }, []);

  const value = {
    wallet,
    walletLoading,
    transactions,
    deposit,
    withdraw,
    fetchWallet,
    fetchTransactions,
    getWalletByUserId,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// ─── Custom Hook ────────────────────────────────────────────────────────────
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
