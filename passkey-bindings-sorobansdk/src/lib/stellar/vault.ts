import { Client, networks } from "../../packages/src/index";

const testnet = networks.testnet;

/**
 * RPC URL for Soroban (default: testnet). Use env NEXT_PUBLIC_RPC_URL in app.
 */
function getRpcUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_RPC_URL) {
    return process.env.NEXT_PUBLIC_RPC_URL;
  }
  return "https://soroban-testnet.stellar.org";
}

/**
 * Creates a typed client for the Vault contract on testnet.
 * Contract ID: CBT26NZLY5EZTA7YXACH6DZD43SNG3LRIB52LDUV7TIH3RWR7KT45EXZ
 *
 * Methods:
 * - deposit({ user, amount })
 * - withdraw({ user, amount })
 * - balance_of({ user })
 * - initialize({ token })
 */
export function getVaultClient(): Client {
  return new Client({
    ...testnet,
    rpcUrl: getRpcUrl(),
  });
}

export { Client as VaultClient, networks as vaultNetworks } from "../../packages/src/index";
