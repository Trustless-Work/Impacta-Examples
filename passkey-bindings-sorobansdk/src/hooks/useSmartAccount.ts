"use client";

import { useState, useEffect, useCallback } from "react";
import type { ConnectWalletResult } from "smart-account-kit";
import { getSmartAccountKit } from "@/lib/smart-account/config";

export function useSmartAccount() {
  const [wallet, setWallet] = useState<ConnectWalletResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const kit = getSmartAccountKit();
        const result = await kit.connectWallet();
        setWallet(result);
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    try {
      const kit = getSmartAccountKit();
      const handler = () => setWallet(null);
      kit.events.on("sessionExpired", handler);
      return () => {
        kit.events.off("sessionExpired", handler);
      };
    } catch {
      return undefined;
    }
  }, []);

  const createWallet = useCallback(async (userName: string) => {
    const kit = getSmartAccountKit();
    const nativeTokenContract =
      process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT;

    const result = await kit.createWallet("Passkey Stellar App", userName, {
      autoSubmit: true,
      autoFund: !!nativeTokenContract,
      nativeTokenContract: nativeTokenContract ?? undefined,
    });

    const connected = await kit.connectWallet();
    setWallet(connected);
    return result;
  }, []);

  const connect = useCallback(async () => {
    const kit = getSmartAccountKit();
    const result = await kit.connectWallet({ prompt: true });
    setWallet(result);
    return result;
  }, []);

  const disconnect = useCallback(async () => {
    const kit = getSmartAccountKit();
    await kit.disconnect();
    setWallet(null);
  }, []);

  const getKit = useCallback(() => getSmartAccountKit(), []);

  return {
    wallet,
    isLoading,
    createWallet,
    connect,
    disconnect,
    getKit,
  };
}
