"use client";

import { ReceiveSection } from "@/components/ReceiveSection";
import { WalletConnection } from "@/components/WalletConnection";

export default function ReceivePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 pb-32 pt-24 font-sans dark:bg-black">
      <main className="w-full max-w-3xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            Receive
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Share your address to receive XLM and other tokens.
          </p>
        </div>
        <WalletConnection />
        <ReceiveSection />
      </main>
    </div>
  );
}
