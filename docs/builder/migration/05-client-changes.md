---
sidebar_position: 5
title: "Client Changes"
description: "Rust RPC, WebClient, and CLI changes"
---

# Client Changes

This section covers client API updates for both Rust and Web clients.

:::info Good to know
These changes affect both Rust SDK users and JavaScript/TypeScript WebClient users. Check which sections apply to your stack.
:::

---

## Rust RPC Changes

:::warning Breaking Change
The batch `get_account_proofs` method has been removed. Use individual `get_account` calls instead.
:::

```diff title="src/rpc.rs"
- // Before: batch account proofs
- let proofs = client.get_account_proofs(&account_ids).await?;

+ // After: individual account calls
+ let mut accounts = Vec::new();
+ for account_id in &account_ids {
+     let account = client.get_account(account_id).await?;
+     accounts.push(account);
+ }
```

:::tip
For better performance with many accounts, consider using `futures::join_all` to parallelize the requests.
:::

---

## RNG Requirements

Client RNG must implement `Send + Sync`:

```diff title="src/client.rs"
- use rand::rngs::ThreadRng;
- let client = Client::new(config, ThreadRng::default())?;

+ use rand::rngs::StdRng;
+ use rand::SeedableRng;
+ let rng = StdRng::from_entropy();  // StdRng is Send + Sync
+ let client = Client::new(config, rng)?;
```

---

## CLI Changes

The swap command no longer accepts `payback_note_type`:

```diff title="Terminal"
# Before
- miden-client swap --amount 100 --payback-note-type private

# After
miden-client swap --amount 100
# Note type is now determined automatically
```

---

## WebClient Store

:::warning Breaking Change (JavaScript/TypeScript)
WebClient store now requires optional store name for multiple instances.
:::

```diff title="src/client.ts"
- // Before
- const client = await WebClient.create(config);

+ // After: optional store name for isolation
+ const client = await WebClient.create(config, {
+     storeName: 'my-app-store'  // Optional, for multiple instances
+ });
```

---

## Block Numbers

Block numbers changed from strings to numeric types:

```diff title="src/api.ts"
- // Before (JavaScript)
- const blockNum = response.blockNumber; // "12345"
- const parsed = parseInt(blockNum);

+ // After
+ const blockNum = response.blockNumber; // 12345 (number)
```

---

## NetworkId

`NetworkId` replaced enum with class using static constructors:

```diff title="src/network.ts"
- // Before (TypeScript)
- import { NetworkId } from 'miden-client';
- const network = NetworkId.Testnet;

+ // After
+ import { NetworkId } from 'miden-client';
+ const network = NetworkId.testnet();  // Static constructor
+ const custom = NetworkId.custom(chainId);
```

---

## Migration Steps

1. Replace batch `get_account_proofs` with individual `get_account` calls
2. Ensure RNG types implement `Send + Sync` (use `StdRng`)
3. Remove `payback_note_type` from swap CLI commands
4. Add store name parameter to WebClient if using multiple instances
5. Update code expecting string block numbers to handle numeric types
6. Replace `NetworkId` enum usage with static constructors

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `get_account_proofs not found` | API removed | Use `get_account` per account |
| `ThreadRng does not implement Send` | RNG constraint | Use `StdRng` |
| `unexpected argument 'payback-note-type'` | CLI changed | Remove the argument |
| `NetworkId.Testnet is not a function` | Enum → class | Use `NetworkId.testnet()` |
