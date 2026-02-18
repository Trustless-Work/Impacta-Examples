"use client";

import { useState, useCallback } from "react";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useBalance } from "@/hooks/useBalance";

const NATIVE_TOKEN_CONTRACT =
  process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT ?? "";

export function ReceiveSection() {
  const { wallet } = useSmartAccount();
  const { balance, isLoading, error, refetch } = useBalance(
    wallet?.contractId ?? null,
    NATIVE_TOKEN_CONTRACT
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!wallet?.contractId) return;

    try {
      await navigator.clipboard.writeText(wallet.contractId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [wallet?.contractId]);

  if (!wallet) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Receive XLM
      </h3>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your address
        </label>
        <div className="flex gap-2">
          <code className="flex-1 truncate rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100">
            {wallet.contractId}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy address"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Balance
        </span>
        {isLoading ? (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading...
          </span>
        ) : error ? (
          <span className="text-sm text-red-600 dark:text-red-400">
            Unable to load balance
          </span>
        ) : (
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {balance !== null ? `${balance.toFixed(7)} XLM` : "—"}
          </span>
        )}
      </div>

      {!isLoading && !error && (
        <button
          type="button"
          onClick={refetch}
          className="self-start text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Refresh balance
        </button>
      )}
    </div>
  );
}
