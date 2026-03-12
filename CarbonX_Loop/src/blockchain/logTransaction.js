/ src/blockchain/logTransaction.js
import { supabase } from "../supabaseClient"; // your existing Supabase client
import { BLOCK_EXPLORER, CREDIT_TYPES } from "./config";

export const logTransaction = async ({
  txHash, fromAddr, toAddr, tokenId, amount, txType
}) => {
  // Get credit name from token ID
  const creditName = Object.keys(CREDIT_TYPES).find(
    key => CREDIT_TYPES[key] === tokenId
  ) || `Token #${tokenId}`;

  const { data, error } = await supabase
    .from("transactions")
    .insert([{
      tx_hash:     txHash,
      from_addr:   fromAddr,
      to_addr:     toAddr || null,
      token_id:    tokenId,
      amount:      amount,
      tx_type:     txType,
      credit_name: creditName,
      status:      "confirmed",
    }]);

  if (error) {
    console.error("Failed to log transaction to Supabase:", error);
  } else {
    console.log(`Transaction logged: ${BLOCK_EXPLORER}${txHash}`);
  }
  return { data, error };
};
