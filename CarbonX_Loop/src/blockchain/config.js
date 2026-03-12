// src/blockchain/config.js

// ── Contract Address (replace with your deployed address from Step 3.2) ──
export const CARBON_CREDIT_ADDRESS = "0xYourDeployedContractAddressHere";

// ── Network Configuration ──
export const POLYGON_AMOY_CHAIN_ID = 80002;
export const BLOCK_EXPLORER = "https://amoy.polygonscan.com/tx/";

// ── Token IDs — each ID is a different credit type ──
// You define these when you mint. Examples:
export const CREDIT_TYPES = {
  SOLAR_2023:  1,
  WIND_2023:   2,
  FOREST_2023: 3,
  SOLAR_2024:  4,
  WIND_2024:   5,
  // Add more as you create new project types
};
