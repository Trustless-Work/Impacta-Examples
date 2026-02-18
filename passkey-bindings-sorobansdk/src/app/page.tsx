"use client";

import Link from "next/link";
import { WalletConnection } from "@/components/WalletConnection";
import MadeByOppia from "@/components/MadeByOppia";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 pb-32 pt-24 font-sans dark:bg-black">
      <main className="w-full max-w-3xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            Passkey Smart Wallet
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Create or connect a passkey-secured smart wallet on Stellar. Sign
            with Face ID, Touch ID, or your device security.
          </p>
        </div>

        <WalletConnection />

        <div className="mt-8 flex flex-col gap-4 text-center sm:flex-row sm:justify-center">
          <Link
            href="/receive"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Receive
          </Link>
          <Link
            href="/send"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Send
          </Link>
          <Link
            href="/contract"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Vault contract
          </Link>
        </div>

        <div className="mt-8">
          <MadeByOppia />
        </div>
      </main>
    </div>
  );
}
