---
title: "Account Operations"
sidebar_position: 4
description: "Query account state with active_account and mutate the vault with native_account."
---

# Account Operations

Miden provides two modules for interacting with the current account during a transaction: `active_account` for read-only queries (balance, nonce, commitments) and `native_account` for mutations (add/remove assets, increment nonce). The split reflects the ZK proof model — `active_account` calls don't affect the proof's state transition, while `native_account` calls represent state changes that must be proven. The vault is the account's asset container where all fungible and non-fungible assets live.

## `active_account` — Read-only queries

These functions query the current account's state without modifying it. They're available in both `&self` and `&mut self` methods.

```rust
use miden::active_account;
```

### Account identity

```rust
// Get the account ID
let id: AccountId = active_account::get_id();

// Get the current nonce
let nonce: Felt = active_account::get_nonce();
```

### Vault queries

```rust
// Get fungible asset balance for a specific faucet
let balance: Felt = active_account::get_balance(faucet_id);

// Get the balance at the start of this transaction
let initial: Felt = active_account::get_initial_balance(faucet_id);

// Check if a non-fungible asset exists in the vault
let has_nft: bool = active_account::has_non_fungible_asset(asset);

// Get vault commitment (Merkle root)
let root: Word = active_account::get_vault_root();
let initial_root: Word = active_account::get_initial_vault_root();
```

### Commitment queries

```rust
// Full account commitment (code + storage + vault + nonce)
let commitment: Word = active_account::compute_commitment();
let initial: Word = active_account::get_initial_commitment();

// Storage commitment only
let storage: Word = active_account::compute_storage_commitment();
let initial_storage: Word = active_account::get_initial_storage_commitment();

// Code commitment
let code: Word = active_account::get_code_commitment();
```

### Procedure queries

```rust
// Number of exported procedures
let count: Felt = active_account::get_num_procedures();

// Get the root hash of procedure at index
let root: Word = active_account::get_procedure_root(0);

// Check if a procedure exists
let exists: bool = active_account::has_procedure(proc_root);
```

## native_account — Mutations

`add_asset`, `remove_asset`, and `incr_nonce` require `&mut self` and modify account state. `compute_delta_commitment` and `was_procedure_called` take `&self` — they are read-only queries on the native account.

```rust
use miden::native_account;
```

### Asset operations

```rust
// Add an asset to the vault — returns the asset as stored
let stored: Asset = native_account::add_asset(asset);

// Remove an asset from the vault — returns the removed asset
// Proof generation fails if the asset doesn't exist or insufficient balance
let removed: Asset = native_account::remove_asset(asset);
```

### Nonce management

```rust
// Increment the account nonce (replay protection)
let new_nonce: Felt = native_account::incr_nonce();
```

:::warning
The nonce must be incremented for any transaction that modifies account state. Without it, the same transaction could be replayed.
:::

### Transaction tracking

```rust
// Compute commitment of all state changes in this transaction
let delta: Word = native_account::compute_delta_commitment();

// Check if a specific procedure was called during this transaction
let called: bool = native_account::was_procedure_called(proc_root);
```

## Auto-generated methods on components

`#[component]` implements the `ActiveAccount` and `NativeAccount` traits on the struct, exposing these functions as methods on `self`:

```rust
#[component]
impl MyAccount {
    pub fn receive_asset(&mut self, asset: Asset) {
        // These are equivalent:
        self.add_asset(asset);              // via NativeAccount trait
        native_account::add_asset(asset);   // direct module call
    }

    pub fn check_balance(&self, faucet_id: AccountId) -> Felt {
        // These are equivalent:
        self.get_balance(faucet_id)          // via ActiveAccount trait
        active_account::get_balance(faucet_id)  // direct module call
    }
}
```

### NativeAccount methods (on `&mut self`)

| Method | Signature |
|--------|-----------|
| `add_asset` | `fn add_asset(&mut self, asset: Asset) -> Asset` |
| `remove_asset` | `fn remove_asset(&mut self, asset: Asset) -> Asset` |
| `incr_nonce` | `fn incr_nonce(&mut self) -> Felt` |
| `compute_delta_commitment` | `fn compute_delta_commitment(&self) -> Word` |
| `was_procedure_called` | `fn was_procedure_called(&self, proc_root: Word) -> bool` |

### ActiveAccount methods (on `&self`)

| Method | Signature |
|--------|-----------|
| `get_id` | `fn get_id(&self) -> AccountId` |
| `get_nonce` | `fn get_nonce(&self) -> Felt` |
| `get_balance` | `fn get_balance(&self, faucet_id: AccountId) -> Felt` |
| `get_initial_balance` | `fn get_initial_balance(&self, faucet_id: AccountId) -> Felt` |
| `has_non_fungible_asset` | `fn has_non_fungible_asset(&self, asset: Asset) -> bool` |
| `get_vault_root` | `fn get_vault_root(&self) -> Word` |
| `get_initial_vault_root` | `fn get_initial_vault_root(&self) -> Word` |
| `compute_commitment` | `fn compute_commitment(&self) -> Word` |
| `get_initial_commitment` | `fn get_initial_commitment(&self) -> Word` |
| `compute_storage_commitment` | `fn compute_storage_commitment(&self) -> Word` |
| `get_initial_storage_commitment` | `fn get_initial_storage_commitment(&self) -> Word` |
| `get_code_commitment` | `fn get_code_commitment(&self) -> Word` |
| `get_num_procedures` | `fn get_num_procedures(&self) -> Felt` |
| `get_procedure_root` | `fn get_procedure_root(&self, index: u8) -> Word` |
| `has_procedure` | `fn has_procedure(&self, proc_root: Word) -> bool` |

## When proof generation fails

Several operations cause proof generation to fail if preconditions aren't met:

| Operation | Fails when |
|-----------|-----------|
| `remove_asset(asset)` | Asset not in vault or insufficient balance |
| `get_balance(faucet_id)` | Referenced asset is non-fungible |
| `get_procedure_root(index)` | Index out of bounds |
| Any `assert!()` | Condition is false |

When proof generation fails:
1. The ZK circuit cannot produce a valid proof
2. The transaction is rejected **before reaching the network**
3. No state changes occur
4. The client receives an error describing the failure

## ManagedWallet component

```rust
#![no_std]
#![feature(alloc_error_handler)]

use miden::{component, active_account, native_account, output_note, Asset, AccountId, NoteIdx, Felt};

#[component]
struct ManagedWallet;

#[component]
impl ManagedWallet {
    /// Receive an asset into the vault.
    pub fn receive_asset(&mut self, asset: Asset) {
        self.add_asset(asset);
    }

    /// Send an asset to an output note, with balance check.
    pub fn send_asset(&mut self, asset: Asset, note_idx: NoteIdx) {
        let removed = self.remove_asset(asset);
        output_note::add_asset(removed, note_idx);
    }

    /// Query the balance of a fungible asset.
    pub fn balance_of(&self, faucet_id: AccountId) -> Felt {
        self.get_balance(faucet_id)
    }
}
```

To move assets out of an account, create [output notes](../notes/output-notes) with `output_note::add_asset`. For signature verification and nonce management, see [Authentication](./authentication). For complete function signatures, see the [Cheatsheet](../api-reference).

:::info API Reference
Full API docs on docs.rs: [`miden::active_account`](https://docs.rs/miden/latest/miden/active_account/), [`miden::native_account`](https://docs.rs/miden/latest/miden/native_account/)
:::
