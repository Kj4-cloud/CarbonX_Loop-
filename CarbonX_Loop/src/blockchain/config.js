// src/blockchain/config.js

// ── Deployed Contract Address on Polygon Amoy ──────────────────
// Replace with the actual deployed address after running Remix deploy
export const CARBON_CREDIT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";

// ── Network Config ──────────────────────────────────────────────
export const POLYGON_AMOY_CHAIN_ID = 80002;
export const RPC_URL = "https://polygon-amoy-bor-rpc.publicnode.com";
export const BLOCK_EXPLORER = "https://amoy.polygonscan.com/tx/";

// ── ERC-1155 Token IDs — each ID = one carbon credit type ──────
// Token ID 1 = Solar 2023 credits, Token ID 2 = Wind 2023, etc.
// Add more as the admin mints new credit types in Remix
export const CREDIT_TYPES = {
  SOLAR_2023:  1,
  WIND_2023:   2,
  FOREST_2023: 3,
  SOLAR_2024:  4,
  WIND_2024:   5,
};

// ── Amoy Network Config object (for wallet_addEthereumChain) ────
export const AMOY_NETWORK = {
  chainId: `0x${(80002).toString(16)}`,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: ["https://polygon-amoy-bor-rpc.publicnode.com"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
};
