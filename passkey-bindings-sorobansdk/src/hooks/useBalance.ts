"use client";

import { useState, useEffect, useCallback } from "react";
import { getTokenBalance } from "@/lib/stellar/balance";

export function useBalance(
  contractId: string | null,
  tokenContract: string
): {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!contractId || !tokenContract) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const networkPassphrase =
      process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "";

    if (!rpcUrl) {
      setError("RPC URL not configured");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getTokenBalance(
        rpcUrl,
        tokenContract,
        contractId,
        networkPassphrase
      );
      setBalance(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load balance"
      );
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [contractId, tokenContract]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refetch = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch,
  };
}
