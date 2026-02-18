import * as StellarSdk from "@stellar/stellar-sdk";

export const STROOPS_PER_UNIT = 10_000_000;

/**
 * Fetches native XLM balance using the SDK's getAssetBalance (recommended for SAC).
 */
async function getNativeBalance(
  rpc: StellarSdk.rpc.Server,
  address: string,
  networkPassphrase: string
): Promise<number> {
  const response = await rpc.getAssetBalance(
    address,
    StellarSdk.Asset.native(),
    networkPassphrase
  );
  if (!response.balanceEntry?.amount) {
    return 0;
  }
  const amount = BigInt(response.balanceEntry.amount);
  return Number(amount) / STROOPS_PER_UNIT;
}

/**
 * Fetches token balance via getContractData (for custom/Soroban tokens).
 */
async function getContractTokenBalance(
  rpc: StellarSdk.rpc.Server,
  tokenContract: string,
  address: string
): Promise<number> {
  const addressSc = StellarSdk.Address.fromString(address).toScAddress();
  const balanceKey = StellarSdk.xdr.ScVal.scvVec([
    StellarSdk.xdr.ScVal.scvSymbol("Balance"),
    StellarSdk.xdr.ScVal.scvAddress(addressSc),
  ]);

  const balanceData = await rpc.getContractData(tokenContract, balanceKey);
  const val = balanceData.val.contractData().val();

  if (val.switch().name !== "scvI128") {
    return 0;
  }

  const i128 = val.i128();
  const lo = BigInt(i128.lo().toString());
  const hi = BigInt(i128.hi().toString());
  const balanceStroops = (hi << BigInt(64)) | lo;

  return Number(balanceStroops) / STROOPS_PER_UNIT;
}

/**
 * Fetches token balance for an address.
 * Uses getAssetBalance for native XLM (recommended), getContractData for other tokens.
 *
 * @param rpcUrl - Stellar RPC endpoint
 * @param tokenContract - Token contract address (C...) or empty for native
 * @param address - Address to query (G... or C...)
 * @param networkPassphrase - Network passphrase (required for native balance)
 * @returns Balance in human units (e.g. XLM), or 0 if no entry
 */
export async function getTokenBalance(
  rpcUrl: string,
  tokenContract: string,
  address: string,
  networkPassphrase?: string
): Promise<number> {
  const rpc = new StellarSdk.rpc.Server(rpcUrl);

  const nativeContract =
    process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT ?? "";
  const isNative =
    tokenContract && nativeContract && tokenContract === nativeContract;

  if (isNative && networkPassphrase) {
    try {
      return await getNativeBalance(rpc, address, networkPassphrase);
    } catch {
      return 0;
    }
  }

  if (tokenContract) {
    try {
      return await getContractTokenBalance(rpc, tokenContract, address);
    } catch {
      return 0;
    }
  }

  return 0;
}
