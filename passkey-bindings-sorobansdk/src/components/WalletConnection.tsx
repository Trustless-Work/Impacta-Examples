"use client";

import { useState } from "react";
import { truncateAddress } from "smart-account-kit";
import { useSmartAccount } from "@/hooks/useSmartAccount";

export function WalletConnection() {
  const { wallet, isLoading, createWallet, connect, disconnect } =
    useSmartAccount();
  const [userName, setUserName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleCreateWallet = async () => {
    if (!userName.trim()) {
      setError("Please enter an email or username");
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      await createWallet(userName.trim());
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        setError("Passkey creation was cancelled. Please try again.");
      } else {
        setError(error.message ?? "Failed to create wallet");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      await connect();
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        setError("Passkey selection was cancelled.");
      } else {
        setError(error.message ?? "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    try {
      await disconnect();
    } catch (err) {
      setError((err as Error).message ?? "Failed to disconnect");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Restoring session...
        </p>
      </div>
    );
  }

  if (wallet) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Connected
          </p>
          <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
            {truncateAddress(wallet.contractId, 8)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDisconnect}
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Create New Wallet
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Create a passkey-secured smart wallet. You&apos;ll use your device
          biometrics to sign.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your email"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            disabled={isCreating}
          />
          <button
            type="button"
            onClick={handleCreateWallet}
            disabled={isCreating}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isCreating ? "Creating..." : "Create Wallet"}
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-zinc-500 dark:bg-black dark:text-zinc-400">
            or
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Connect Existing Wallet
        </h2>
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}
