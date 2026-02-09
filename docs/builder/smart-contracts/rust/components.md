---
title: "Components"
sidebar_position: 4
description: "Define Miden account components using the #[component] macro — storage, methods, and auto-generated bindings."
---

# Components

Components are the building blocks of Miden accounts. Each component defines a [storage](./storage) layout, exposes public methods through a WIT interface, and can be composed with other components on the same account — for example, a wallet component + an auth component + custom logic. This modularity lets you reuse a wallet component across many accounts and test or upgrade components independently.

## The `#[component]` macro

Apply `#[component]` to both a struct definition and its impl block:

```rust
use miden::{component, felt, Felt, StorageMap, StorageMapAccess, Word};

#[component]
struct CounterContract {
    #[storage(description = "counter contract storage map")]
    count_map: StorageMap,
}

#[component]
impl CounterContract {
    pub fn get_count(&self) -> Felt {
        let key = Word::from_u64_unchecked(0, 0, 0, 1);
        self.count_map.get(&key)
    }

    pub fn increment_count(&mut self) -> Felt {
        let key = Word::from_u64_unchecked(0, 0, 0, 1);
        let current_value: Felt = self.count_map.get(&key);
        let new_value = current_value + felt!(1);
        self.count_map.set(key, new_value);
        new_value
    }
}
```

The macro generates:

1. **WIT interface definition** describing the component's public API
2. **Storage metadata** mapping field names to slot indices
3. **Export bindings** for the Miden runtime

## Struct definition

The struct defines the component's storage layout:

```rust
#[component]
struct MyContract {
    #[storage(description = "owner account identifier")]
    owner: Value,

    #[storage(description = "user balances")]
    balances: StorageMap,
}
```

### Storage fields

Each field must be either `Value` (single-slot) or `StorageMap` (map-slot), annotated with `#[storage]`:

```rust
#[storage(description = "human-readable description")]
field_name: Value,

#[storage(description = "human-readable description")]
field_name: StorageMap,
```

The `description` is required and becomes part of the generated metadata. Slots are assigned sequentially starting from 0 unless explicitly specified with `slot(N)`:

```rust
#[storage(slot(0), description = "initialized flag")]
initialized: Value,

#[storage(slot(1), description = "balances map")]
balances: StorageMap,
```

### Components without storage

Components don't need storage fields:

```rust
#[component]
struct MyAccount;

#[component]
impl MyAccount {
    pub fn receive_asset(&mut self, asset: Asset) {
        self.add_asset(asset);
    }
}
```

## Impl block — methods

### Read methods (`&self`)

Methods that take `&self` are **read-only** — they can query storage and account state but cannot modify anything:

```rust
pub fn get_balance(&self, depositor: AccountId) -> Felt {
    let key = Word::from([depositor.prefix, depositor.suffix, felt!(0), felt!(0)]);
    self.balances.get(&key)
}
```

### Write methods (`&mut self`)

Methods that take `&mut self` can **modify state** — write to storage, add/remove assets, create notes:

```rust
pub fn deposit(&mut self, asset: Asset) {
    self.add_asset(asset);
}
```

:::info What this means for ZK proofs
Read methods produce proofs that don't change account state. Write methods produce proofs that include state transitions. The `&self` vs `&mut self` distinction is enforced by the compiler and determines which kernel operations are available.
:::

### Private methods

Methods without `pub` are private — they can be called from other methods in the same component but are not exported in the WIT interface:

```rust
fn require_initialized(&self) {
    let state: Word = self.initialized.read();
    assert!(state[0] == felt!(1));
}

pub fn do_something(&mut self) {
    self.require_initialized();
    // ...
}
```

### Supported parameter and return types

Public methods can use these types in their signatures:

| Type | As parameter | As return |
|------|-------------|-----------|
| `Felt` | Yes | Yes |
| `Word` | Yes | Yes |
| `Asset` | Yes | Yes |
| `AccountId` | Yes | Yes |
| `NoteIdx` | Yes | Yes |
| Custom types with `#[export_type]` | Yes | Yes |

## Auto-generated methods

The `#[component]` macro automatically provides methods on `self` through the `NativeAccount` and `ActiveAccount` traits.

### Always available (via `NativeAccount` trait on `&mut self`)

```rust
// Add an asset to the account vault
self.add_asset(asset: Asset) -> Asset

// Remove an asset from the account vault
self.remove_asset(asset: Asset) -> Asset

// Increment the account nonce (replay protection)
self.incr_nonce() -> Felt

// Compute commitment of account state changes
self.compute_delta_commitment() -> Word

// Check if a procedure was called during this transaction
self.was_procedure_called(proc_root: Word) -> bool
```

### Always available (via `ActiveAccount` trait on `&self`)

```rust
// Get the account ID
self.get_id() -> AccountId

// Get the account nonce
self.get_nonce() -> Felt

// Get fungible asset balance for a faucet
self.get_balance(faucet_id: AccountId) -> Felt

// Check non-fungible asset ownership
self.has_non_fungible_asset(asset: Asset) -> bool

// Get storage and vault commitments
self.get_vault_root() -> Word
self.compute_commitment() -> Word
self.compute_storage_commitment() -> Word
// ... and more (see API Reference)
```

## Complete example

Here's the `basic-wallet` example from the compiler:

```rust title="src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

use miden::{component, native_account, output_note, Asset, NoteIdx};

#[component]
struct MyAccount;

#[component]
impl MyAccount {
    /// Adds an asset to the account.
    pub fn receive_asset(&mut self, asset: Asset) {
        self.add_asset(asset);
    }

    /// Moves an asset from the account to a note.
    pub fn move_asset_to_note(&mut self, asset: Asset, note_idx: NoteIdx) {
        let asset = self.remove_asset(asset);
        output_note::add_asset(asset, note_idx);
    }
}
```

```toml title="Cargo.toml"
[package]
name = "basic_wallet"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = { path = "../../sdk/sdk" }

[package.metadata.component]
package = "miden:basic-wallet"

[package.metadata.miden]
project-kind = "account"
supported-types = ["RegularAccountUpdatableCode"]
```

For the full list of auto-generated methods, see the [Cheatsheet](./api-reference). To export your own types for use in public method signatures, see [Custom Types](./custom-types). For the complete account and vault query API, see [Account Operations](./account-operations).
