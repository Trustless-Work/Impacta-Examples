import { SmartAccountKit, IndexedDBStorage } from "smart-account-kit";

let smartAccountKitInstance: SmartAccountKit | null = null;

function getConfig() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const networkPassphrase = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE;
  const accountWasmHash = process.env.NEXT_PUBLIC_ACCOUNT_WASM_HASH;
  const webauthnVerifierAddress =
    process.env.NEXT_PUBLIC_WEBAUTHN_VERIFIER;

  if (!rpcUrl || !networkPassphrase || !accountWasmHash || !webauthnVerifierAddress) {
    throw new Error(
      "Missing Smart Account Kit config. Set NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_NETWORK_PASSPHRASE, NEXT_PUBLIC_ACCOUNT_WASM_HASH, and NEXT_PUBLIC_WEBAUTHN_VERIFIER in .env.local"
    );
  }

  return {
    rpcUrl,
    networkPassphrase,
    accountWasmHash,
    webauthnVerifierAddress,
    storage: new IndexedDBStorage(),
    rpId: typeof window !== "undefined" ? window.location.hostname : "",
    rpName: "Passkey Stellar App",
    timeoutInSeconds: 30,
  };
}

export function getSmartAccountKit(): SmartAccountKit {
  if (typeof window === "undefined") {
    throw new Error("SmartAccountKit can only be used in the browser");
  }

  if (!smartAccountKitInstance) {
    smartAccountKitInstance = new SmartAccountKit(getConfig());
  }

  return smartAccountKitInstance;
}
