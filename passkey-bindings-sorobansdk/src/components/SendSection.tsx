"use client";

import { useState } from "react";
import {
  WalletNotConnectedError,
  SimulationError,
  WebAuthnError,
  validateAddress,
} from "smart-account-kit";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useBalance } from "@/hooks/useBalance";
import {
  getExplorerTxUrl,
  getNetworkFromPassphrase,
} from "@/lib/stellar/explorer";

const NATIVE_TOKEN_CONTRACT =
  process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT ?? "";
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";

export function SendSection() {
  const { wallet, getKit } = useSmartAccount();
  const { balance, isLoading: balanceLoading, refetch } = useBalance(
    wallet?.contractId ?? null,
    NATIVE_TOKEN_CONTRACT
  );
  const [tokenContract, setTokenContract] = useState(NATIVE_TOKEN_CONTRACT);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransfer = async () => {
    setError(null);
    setSuccessHash(null);

    if (!wallet) {
      setError("Please connect a wallet first");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!recipient.trim()) {
      setError("Please enter a recipient address");
      return;
    }

    if (!tokenContract.trim()) {
      setError("Please enter a token contract address");
      return;
    }

    try {
      validateAddress(recipient.trim(), "recipient");
      validateAddress(tokenContract.trim(), "tokenContract");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid address");
      return;
    }

    if (!balanceLoading && balance !== null && amountNum > balance) {
      setError("Insufficient balance");
      return;
    }

    if (recipient.trim() === wallet.contractId) {
      setError("Cannot transfer to yourself");
      return;
    }

    setIsSubmitting(true);

    try {
      const kit = getKit();
      const result = await kit.transfer(
        tokenContract.trim(),
        recipient.trim(),
        amountNum
      );

      if (result.success && result.hash) {
        setSuccessHash(result.hash);
        setAmount("");
        setRecipient("");
        refetch();
      } else {
        setError(result.error ?? "Transfer failed");
      }
    } catch (err) {
      if (err instanceof WalletNotConnectedError) {
        setError("Wallet not connected. Please connect and try again.");
      } else if (err instanceof WebAuthnError) {
        setError("Biometric authentication failed. Please try again.");
      } else if (err instanceof SimulationError) {
        setError(`Transaction simulation failed: ${err.message}`);
      } else {
        setError((err as Error).message ?? "Transfer failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!wallet) {
    return null;
  }

  const network = getNetworkFromPassphrase(NETWORK_PASSPHRASE);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Send XLM
      </h3>

      {!balanceLoading && balance !== null && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Available
          </span>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {balance.toFixed(7)} XLM
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {successHash && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200"
        >
          <p className="font-medium">Transfer successful!</p>
          <a
            href={getExplorerTxUrl(successHash, network)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block font-mono text-xs underline"
          >
            View on explorer
          </a>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="send-token-contract"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Token Contract
        </label>
        <input
          id="send-token-contract"
          type="text"
          value={tokenContract}
          onChange={(e) => setTokenContract(e.target.value)}
          placeholder="C..."
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="send-recipient"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Recipient Address
        </label>
        <input
          id="send-recipient"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="G... or C..."
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="send-amount"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Amount
        </label>
        <input
          id="send-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          disabled={isSubmitting}
        />
      </div>

      <button
        type="button"
        onClick={handleTransfer}
        disabled={isSubmitting}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Transferring..." : "Send"}
      </button>
    </div>
  );
}
