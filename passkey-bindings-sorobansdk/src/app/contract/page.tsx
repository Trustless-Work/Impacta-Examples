"use client";

import { useState } from "react";
import {
  WalletNotConnectedError,
  WebAuthnError,
} from "smart-account-kit";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { getVaultClient } from "@/lib/stellar/vault";
import {
  getExplorerTxUrl,
  getNetworkFromPassphrase,
} from "@/lib/stellar/explorer";
import { VaultError } from "../../packages/src/index";

const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ??
  "Test SDF Network ; September 2015";

/** 7 decimals: 1 unit = 10^7 stroops */
const DECIMALS = 7;
const SCALAR = BigInt(10) ** BigInt(DECIMALS);

function humanToI128(human: string): bigint {
  const num = parseFloat(human);
  if (Number.isNaN(num) || num < 0) return BigInt(0);
  const [whole = "0", frac = ""] = human.split(".");
  const fracPadded = frac.slice(0, DECIMALS).padEnd(DECIMALS, "0");
  return BigInt(whole) * SCALAR + BigInt(fracPadded || "0");
}

function i128ToHuman(val: bigint): string {
  const whole = val / SCALAR;
  const frac = val % SCALAR;
  const fracStr = frac.toString().padStart(DECIMALS, "0").replace(/0+$/, "") || "0";
  return fracStr === "0" ? whole.toString() : `${whole}.${fracStr}`;
}

function ResultBlock({
  label,
  value,
  error,
  txHash,
}: {
  label: string;
  value?: string;
  error?: string;
  txHash?: string;
}) {
  if (!value && !error && !txHash) return null;
  const network = getNetworkFromPassphrase(NETWORK_PASSPHRASE);
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {error && (
        <p className="mt-1 font-mono text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {value && (
        <p className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
      )}
      {txHash && (
        <a
          href={getExplorerTxUrl(txHash, network)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block font-mono text-xs text-blue-600 underline dark:text-blue-400"
        >
          View on explorer
        </a>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
    </div>
  );
}

export default function ContractPage() {
  const { wallet, getKit } = useSmartAccount();
  const vault = getVaultClient();

  const [initToken, setInitToken] = useState("");
  const [initResult, setInitResult] = useState<{ error?: string; txHash?: string }>({});
  const [initLoading, setInitLoading] = useState(false);

  const [depositUser, setDepositUser] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositResult, setDepositResult] = useState<{ error?: string; txHash?: string }>({});
  const [depositLoading, setDepositLoading] = useState(false);

  const [withdrawUser, setWithdrawUser] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawResult, setWithdrawResult] = useState<{ error?: string; txHash?: string }>({});
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [balanceUser, setBalanceUser] = useState("");
  const [balanceResult, setBalanceResult] = useState<{ value?: string; error?: string }>({});
  const [balanceLoading, setBalanceLoading] = useState(false);

  const handleInitialize = async () => {
    setInitResult({});
    if (!wallet) {
      setInitResult({ error: "Connect a wallet first" });
      return;
    }
    if (!initToken.trim()) {
      setInitResult({ error: "Enter token contract address" });
      return;
    }
    setInitLoading(true);
    try {
      const kit = getKit();
      const assembled = await vault.initialize(
        { token: initToken.trim() },
        { publicKey: kit.deployerPublicKey }
      );
      const sent = await kit.signAndSubmit(assembled);
      if (sent.success && sent.hash) {
        setInitResult({ txHash: sent.hash });
        setInitToken("");
      } else {
        setInitResult({ error: sent.error ?? "Transaction failed" });
      }
    } catch (err) {
      const msg =
        err instanceof WalletNotConnectedError
          ? "Wallet not connected"
          : err instanceof WebAuthnError
            ? "Authentication failed"
            : err instanceof Error
              ? err.message
              : "Unknown error";
      setInitResult({ error: msg });
    } finally {
      setInitLoading(false);
    }
  };

  const handleDeposit = async () => {
    setDepositResult({});
    if (!wallet) {
      setDepositResult({ error: "Connect a wallet first" });
      return;
    }
    const user = depositUser.trim() || wallet.contractId;
    const amount = humanToI128(depositAmount);
    if (amount <= BigInt(0)) {
      setDepositResult({ error: "Enter a valid amount" });
      return;
    }
    setDepositLoading(true);
    try {
      const kit = getKit();
      const assembled = await vault.deposit(
        { user, amount },
        { publicKey: kit.deployerPublicKey }
      );
      const sent = await kit.signAndSubmit(assembled);
      if (sent.success && sent.hash) {
        setDepositResult({ txHash: sent.hash });
        setDepositAmount("");
      } else {
        setDepositResult({ error: sent.error ?? "Transaction failed" });
      }
    } catch (err) {
      const msg =
        err instanceof WalletNotConnectedError
          ? "Wallet not connected"
          : err instanceof WebAuthnError
            ? "Authentication failed"
            : err instanceof Error
              ? err.message
              : "Unknown error";
      setDepositResult({ error: msg });
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawResult({});
    if (!wallet) {
      setWithdrawResult({ error: "Connect a wallet first" });
      return;
    }
    const user = withdrawUser.trim() || wallet.contractId;
    const amount = humanToI128(withdrawAmount);
    if (amount <= BigInt(0)) {
      setWithdrawResult({ error: "Enter a valid amount" });
      return;
    }
    setWithdrawLoading(true);
    try {
      const kit = getKit();
      const assembled = await vault.withdraw(
        { user, amount },
        { publicKey: kit.deployerPublicKey }
      );
      const sent = await kit.signAndSubmit(assembled);
      if (sent.success && sent.hash) {
        setWithdrawResult({ txHash: sent.hash });
        setWithdrawAmount("");
      } else {
        setWithdrawResult({ error: sent.error ?? "Transaction failed" });
      }
    } catch (err) {
      const msg =
        err instanceof WalletNotConnectedError
          ? "Wallet not connected"
          : err instanceof WebAuthnError
            ? "Authentication failed"
            : err instanceof Error
              ? err.message
              : "Unknown error";
      setWithdrawResult({ error: msg });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleBalanceOf = async () => {
    setBalanceResult({});
    const user = balanceUser.trim();
    if (!user) {
      setBalanceResult({ error: "Enter user address (G... or C...)" });
      return;
    }
    setBalanceLoading(true);
    try {
      const assembled = await vault.balance_of({ user });
      const result = assembled.result;
      const raw =
        typeof result === "bigint"
          ? result
          : (result as { toBigInt?: () => bigint })?.toBigInt?.() ?? BigInt(0);
      setBalanceResult({ value: i128ToHuman(raw) });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const known = Object.entries(VaultError).find(([, v]) =>
        message.includes((v as { message: string }).message)
      );
      const errorMsg = known
        ? (known[1] as { message: string }).message
        : message;
      setBalanceResult({ error: errorMsg });
    } finally {
      setBalanceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-32 pt-24 font-sans dark:bg-black">
      <main className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Vault contract
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Interact with the vault contract (testnet). Connect your wallet to
            send transactions.
          </p>
        </div>

        {!wallet && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
          >
            Connect a passkey wallet on the home page to initialize, deposit,
            and withdraw. You can still query <strong>balance_of</strong> without
            a wallet.
          </div>
        )}

        <div className="flex flex-col gap-8">
          {/* initialize */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              initialize
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Set the token contract for the vault (one-time).
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Field
                id="init-token"
                label="Token contract (C...)"
                value={initToken}
                onChange={setInitToken}
                placeholder=""
                disabled={initLoading}
              />
              <button
                type="button"
                onClick={handleInitialize}
                disabled={initLoading || !wallet}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {initLoading ? "Submitting…" : "Initialize"}
              </button>
              <ResultBlock
                label="Result"
                error={initResult.error}
                txHash={initResult.txHash}
              />
            </div>
          </section>

          {/* deposit */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              deposit
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Deposit tokens into the vault for a user (default: your wallet).
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Field
                id="deposit-user"
                label="User address (optional, defaults to connected wallet)"
                value={depositUser}
                onChange={setDepositUser}
                placeholder=""
                disabled={depositLoading}
              />
              <Field
                id="deposit-amount"
                label="Amount"
                value={depositAmount}
                onChange={setDepositAmount}
                placeholder=""
                disabled={depositLoading}
              />
              <button
                type="button"
                onClick={handleDeposit}
                disabled={depositLoading || !wallet}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {depositLoading ? "Submitting…" : "Deposit"}
              </button>
              <ResultBlock
                label="Result"
                error={depositResult.error}
                txHash={depositResult.txHash}
              />
            </div>
          </section>

          {/* withdraw */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              withdraw
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Withdraw tokens from the vault for a user (default: your wallet).
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Field
                id="withdraw-user"
                label="User address (optional)"
                value={withdrawUser}
                onChange={setWithdrawUser}
                placeholder=""
                disabled={withdrawLoading}
              />
              <Field
                id="withdraw-amount"
                label="Amount"
                value={withdrawAmount}
                onChange={setWithdrawAmount}
                placeholder=""
                disabled={withdrawLoading}
              />
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawLoading || !wallet}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {withdrawLoading ? "Submitting…" : "Withdraw"}
              </button>
              <ResultBlock
                label="Result"
                error={withdrawResult.error}
                txHash={withdrawResult.txHash}
              />
            </div>
          </section>

          {/* balance_of */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              balance_of
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Read-only: get vault balance for an address.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Field
                id="balance-user"
                label="User address"
                value={balanceUser}
                onChange={setBalanceUser}
                placeholder=""
                disabled={balanceLoading}
              />
              <button
                type="button"
                onClick={handleBalanceOf}
                disabled={balanceLoading}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {balanceLoading ? "Querying…" : "Query balance"}
              </button>
              <ResultBlock
                label="Balance"
                value={balanceResult.value}
                error={balanceResult.error}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
