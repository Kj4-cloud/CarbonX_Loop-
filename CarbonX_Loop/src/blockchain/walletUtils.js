/**
 * Wallet utility functions for CarbonX.
 * Handles address generation, formatting, and MetaMask integration.
 */

/**
 * Generate a random Ethereum-style wallet address (0x + 40 hex chars).
 * This is a simulated address for the in-app wallet system.
 */
export function generateWalletAddress() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}

/**
 * Format a wallet address for display: 0x1a2b...9f0e
 */
export function formatAddress(address) {
  if (!address || address.length < 12) return address || "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}

/**
 * Connect MetaMask and return the connected account address.
 * Returns null if MetaMask is not available.
 */
export async function connectMetaMask() {
  if (!window.ethereum) {
    return { address: null, error: "MetaMask is not installed" };
  }
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return { address: accounts[0], error: null };
  } catch (err) {
    return { address: null, error: err.message };
  }
}

/**
 * Check if MetaMask is available.
 */
export function isMetaMaskAvailable() {
  return typeof window !== "undefined" && !!window.ethereum;
}
