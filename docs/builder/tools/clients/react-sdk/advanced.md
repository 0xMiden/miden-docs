---
title: Advanced
sidebar_position: 5
---

# Advanced hooks

Hooks beyond the core send / mint / consume trio: custom scripts, MASM compilation, session wallets, store backup, note serialization, and sync control.

## `useTransaction`

General-purpose transaction runner that accepts either a prebuilt `TransactionRequest` or a builder callback. This is the escape hatch when the higher-level hooks don't cover your flow.

```tsx
import { useTransaction } from "@miden-sdk/react";
import { TransactionRequestBuilder } from "@miden-sdk/miden-sdk";

const { executeTransaction, isLoading, stage } = useTransaction();

// Direct request
await executeTransaction({
  accountId: contractAccount,
  request: prebuiltRequest,
});

// Builder callback — receives the raw WebClient
await executeTransaction({
  accountId: contractAccount,
  request: (client) =>
    new TransactionRequestBuilder()
      .withCustomScript(txScript)
      .build(),
});
```

`ExecuteTransactionOptions`:

| Field | Description |
| --- | --- |
| `accountId` | Account the transaction applies to |
| `request` | `TransactionRequest` or `(client: WebClient) => TransactionRequest \| Promise<TransactionRequest>` |
| `skipSync` | Skip pre-send auto-sync (default `false`) |
| `privateNoteTarget` | Deliver private output notes to this account after commit (any `AccountRef` form) |

The `privateNoteTarget` field is the 4-step pipeline shortcut: execute the tx, commit on-chain, then auto-deliver the private note through the note transport to the target. Useful for "send private note" UIs where the recipient already has the React SDK running.

## `useExecuteProgram`

View call — executes a transaction script locally and returns the stack output. No prove, no submit, no state change. Think of it as Miden's `eth_call`.

```tsx
import { useExecuteProgram } from "@miden-sdk/react";

const { executeProgram, isLoading, error } = useExecuteProgram();

const result = await executeProgram({
  accountId: contractAccount,
  script: compiledTxScript,
  foreignAccounts: [counterAccount], // optional
});

// result is a FeltArray — 16-element final stack
const count = result.stack.get(0).asInt();
console.log("Count:", count);
```

See [`useCompile`](#usecompile) for producing the `TransactionScript`, and the [Web SDK transactions guide](../web-client/transactions.md#view-calls-executeprogram) for the shape of the returned `FeltArray`.

## `useCompile`

Compiles Miden Assembly into `AccountComponent`, `TransactionScript`, or `NoteScript`. Each result method is independently callable — call only what you need for the current operation.

```tsx
import { useCompile } from "@miden-sdk/react";
import { StorageSlot } from "@miden-sdk/miden-sdk";

const { component, txScript, noteScript, isLoading, error } = useCompile();

// Account component
const counterComponent = await component({
  code: counterContractCode,
  slots: [StorageSlot.emptyValue("miden::tutorials::counter")],
});

// Transaction script (with optional libraries)
const script = await txScript({
  code: `
    use external_contract::counter_contract
    begin
      call.counter_contract::increment_count
    end
  `,
  libraries: [
    { namespace: "external_contract::counter_contract", code: counterContractCode },
  ],
});

// Note script
const attachScript = await noteScript({
  code: `
    use miden::protocol::active_note
    use miden::core::sys
    begin
      exec.sys::truncate_stack
    end
  `,
});
```

See the [Web SDK compile guide](../web-client/compile.md) for the full `CompileComponentOptions` / `CompileTxScriptOptions` / `CompileNoteScriptOptions` shapes — the React hook just wraps the underlying `client.compile.*` calls with loading/error state.

## `useSessionAccount`

Drives the "session wallet" pattern — create a throw-away wallet, fund it from another account, consume some notes, then discard or archive it. Useful for one-off interactions that shouldn't touch a long-lived account.

```tsx
import { useSessionAccount } from "@miden-sdk/react";

const { start, step, account, isLoading, error } = useSessionAccount({
  funder: mainWallet,
  fundAmount: 100n,
  fundAsset: usdcFaucetId,
});

await start();

// step progresses through: "idle" | "creating" | "funding" | "consuming" | "ready"
```

Options and return shapes vary by release — check `UseSessionAccountOptions` / `UseSessionAccountReturn` in `@miden-sdk/react` exports for the canonical names.

## `useExportStore` / `useImportStore`

Back up and restore the entire local store as encrypted bytes. Handy for wallet backup/restore UIs.

```tsx
import { useExportStore, useImportStore } from "@miden-sdk/react";

// Export
const { exportStore } = useExportStore();
const bytes = await exportStore();
download(bytes, "wallet-backup.bin");

// Import (destructive — overwrites the current store)
const { importStore } = useImportStore();
await importStore({ data: uploadedBytes });
```

`ImportStoreOptions` accepts the raw bytes (`data`) and any optional password/derivation args the release supports. Check `UseImportStoreResult` exports for the current shape.

## `useImportNote` / `useExportNote`

Serialize notes to bytes for QR delivery or import notes handed over out-of-band. These complement the private-note transport layer — use the transport when the recipient is online, and QR/bytes when they aren't.

```tsx
import { useExportNote, useImportNote } from "@miden-sdk/react";

const { exportNote } = useExportNote();
const noteBytes = await exportNote(noteId);
// encode noteBytes into a QR, link, email, etc.

const { importNote } = useImportNote();
await importNote(uploadedBytes);
```

## `useSyncControl`

Pause and resume the auto-sync loop without dismounting `MidenProvider`. Useful when a long operation needs consistent local state, or during battery-sensitive background work.

```tsx
import { useSyncControl } from "@miden-sdk/react";

const { pause, resume, isPaused } = useSyncControl();

// Before a long sequence
pause();
// ... operations that need a stable snapshot ...
resume();
```

`pause()` stops the timer but doesn't cancel an in-flight sync — wait for `isSyncing` to settle if you need a truly quiescent state.

## Next

- [Signers](./signers.md) — wire external wallets (Para, Turnkey, MidenFi) or build a custom signer.
- [Recipes](./recipes.md) — end-to-end patterns.
