import type { StellarNetwork } from "./types";

const EXPLORER_BASE = "https://stellar.expert/explorer";

/**
 * Returns the Stellar Expert explorer URL for a transaction.
 *
 * @param txHash - Transaction hash
 * @param network - "testnet" or "mainnet"
 */
export function getExplorerTxUrl(
  txHash: string,
  network: StellarNetwork
): string {
  return `${EXPLORER_BASE}/${network}/tx/${txHash}`;
}

/**
 * Derives network from Stellar network passphrase.
 */
export function getNetworkFromPassphrase(passphrase: string): StellarNetwork {
  return passphrase.includes("Test") ? "testnet" : "mainnet";
}
