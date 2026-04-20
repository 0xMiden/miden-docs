---
title: Recipes
sidebar_position: 7
---

# Recipes

Short patterns covering the common cases. For longer walkthroughs — building a full wallet app from scratch, including UI — see the [React wallet tutorial](https://github.com/0xMiden/tutorials/blob/main/docs/src/web-client/react_wallet_tutorial.md) in the tutorials repo, which uses these hooks end-to-end.

## Show transaction progress

Every mutation hook exposes `isLoading` and `stage`; use them for optimistic UI:

```tsx
import { useSend } from "@miden-sdk/react";

function SendButton({ from, to, assetId }: Props) {
  const { send, stage, isLoading, error } = useSend();

  const handleSend = async () => {
    try {
      await send({ from, to, assetId, amount: 100n });
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <>
      <button onClick={handleSend} disabled={isLoading}>
        {isLoading ? `${stage}…` : "Send"}
      </button>
      {error && <p role="alert">{error.message}</p>}
    </>
  );
}
```

## Format token amounts

```tsx
import { formatAssetAmount, parseAssetAmount } from "@miden-sdk/react";

// Display: 1_000_000n with 8 decimals → "0.01"
const display = formatAssetAmount(balance, 8);

// User input: "0.01" with 8 decimals → 1_000_000n
const amount = parseAssetAmount("0.01", 8);
```

## Display a note summary

```tsx
import { getNoteSummary, formatNoteSummary } from "@miden-sdk/react";

const summary = getNoteSummary(note);
const text = formatNoteSummary(summary); // "1.5 USDC"
```

`noteSummaries` from `useNotes()` already runs `getNoteSummary` for you — these helpers are for ad-hoc formatting elsewhere.

## Wait for confirmation after a send

```tsx
import { useSend, useWaitForCommit } from "@miden-sdk/react";

const { send } = useSend();
const { waitForCommit } = useWaitForCommit();

const result = await send({ from, to, assetId, amount: 100n });
await waitForCommit({ transactionId: result.txId });
```

## Drop to the raw client

```tsx
import { useMidenClient } from "@miden-sdk/react";

function BlockHeaderPeek() {
  const client = useMidenClient();
  const header = await client.getBlockHeaderByNumber(100);
  // ... whatever the hooks don't expose
}
```

`useMidenClient()` throws if the provider isn't ready — guard with `useMiden().isReady` when you render before init.

## Prevent race conditions

Two user actions can fire in quick succession — a double-click on "Send", or a hook plus a manual button both wanting to sign. The React SDK exposes a lock:

```tsx
import { useMiden } from "@miden-sdk/react";

const { runExclusive } = useMiden();

await runExclusive(async (client) => {
  // Multiple client calls that must not interleave with other hooks'
  // WASM work run here — the lock serialises them across the whole app.
});
```

Built-in mutations already use this lock internally; `runExclusive` is the escape hatch for your own compound flows.

## Isolated clients for multi-wallet apps

Use a unique `storeName` (via `MidenProvider` config or a custom signer) per user account so their IndexedDB databases don't share storage:

```tsx
<MidenProvider
  config={{
    rpcUrl: "testnet",
    seed: undefined,
    // storeName is set via the active SignerContext in practice;
    // see the Signers guide for the custom-signer path.
  }}
>
  <App />
</MidenProvider>
```

## Account IDs — hex and bech32 interchangeably

Every hook accepts either:

```tsx
// Both are valid
useAccount("0x1234567890abcdef");
useAccount("mtst1qy35...");

// Convert for display
account.bech32id(); // "mtst1qy35..."

import { toBech32AccountId } from "@miden-sdk/react";
toBech32AccountId(someHexId); // "mtst1qy35..."
```

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `"Client not ready"` thrown by a hook | Component rendered before `MidenProvider` finished initializing. Guard with `useMiden().isReady` or render via `MidenProvider`'s `loadingComponent`. |
| Transactions stuck in `"proving"` | Remote prover unreachable. Check `prover` config and network; consider `prover: { primary: "testnet", fallback: "local" }`. |
| Notes not appearing after mint | Call `sync()` from `useSyncState()` or verify `autoSyncInterval` isn't `0`. |
| Bech32 address has wrong prefix | `rpcUrl` doesn't match the network you intended. `"testnet"` → `mtst1...`, `"devnet"` → `mdev1...`. |
| WASM init fails in dev | Ensure your bundler serves `.wasm` with the `application/wasm` MIME type. Vite does this automatically; some custom setups don't. |
| `"A send is already in progress"` | Two `useSend` mutations fired simultaneously. Either `await` the previous call before starting the next, or use `runExclusive` to coordinate. |

## Next

- Longer walkthrough: [React wallet tutorial](https://github.com/0xMiden/tutorials/blob/main/docs/src/web-client/react_wallet_tutorial.md) — builds a complete wallet app on top of these hooks.
- Reference: [Setup](./setup.md), [Query hooks](./query-hooks.md), [Mutation hooks](./mutation-hooks.md), [Advanced](./advanced.md), [Signers](./signers.md).
