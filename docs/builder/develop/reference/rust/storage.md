---
title: "Storage"
sidebar_position: 5
description: "Persistent state management with Value slots and StorageMaps in Miden smart contracts."
---

# Storage

Miden accounts have persistent storage organized into **slots**. Each slot holds either a single `Word` (via `Value`) or a key-value map (via `StorageMap`).

## What you'll learn

- `Value` for single-slot storage and the `ValueAccess` trait
- `StorageMap` for key-value storage and the `StorageMapAccess` trait
- Storage layout planning and slot limits
- Patterns for packing data into Words

## Storage slots

An account can have up to **256 storage slots** (indices 0–255). Each slot is declared as a field on your component struct:

```rust
#[component]
struct MyContract {
    #[storage(slot(0), description = "configuration")]
    config: Value,

    #[storage(slot(1), description = "user balances")]
    balances: StorageMap,
}
```

If you omit `slot(N)`, slots are assigned sequentially starting from 0.

## Value — Single-slot storage

A `Value` stores a single `Word` (4 Felts) at a fixed slot.

### The `ValueAccess` trait

```rust
pub trait ValueAccess<V> {
    fn read(&self) -> V;
    fn write(&mut self, value: V) -> V;
}
```

`Value` implements `ValueAccess<V>` for any `V` that converts to/from `Word`. In practice, you'll mostly use `V = Word`:

### Reading

```rust
pub fn get_config(&self) -> Word {
    self.config.read()
}

pub fn is_initialized(&self) -> bool {
    let state: Word = self.initialized.read();
    state[0] == felt!(1)
}
```

### Writing

`write()` returns the **previous value**:

```rust
pub fn initialize(&mut self) {
    let old: Word = self.initialized.write(
        Word::from([felt!(1), felt!(0), felt!(0), felt!(0)])
    );
    // old contains the previous value of the slot
}
```

### Packing multiple values

Since each slot holds a `Word` (4 Felts), pack related values together:

```rust
// Store limits as [max_per_tx, daily_max, 0, 0]
pub fn set_limits(&mut self, max_per_tx: u64, daily_max: u64) {
    self.limits.write(Word::from([
        Felt::from_u64_unchecked(max_per_tx),
        Felt::from_u64_unchecked(daily_max),
        felt!(0),
        felt!(0),
    ]));
}

// Read individual fields
pub fn get_max_per_tx(&self) -> u64 {
    let limits: Word = self.limits.read();
    limits[0].as_u64()
}
```

## StorageMap — Key-value storage

A `StorageMap` stores key-value pairs where both keys and values are `Word`-sized.

### The `StorageMapAccess` trait

```rust
pub trait StorageMapAccess<K, V> {
    fn get(&self, key: &K) -> V;
    fn set(&mut self, key: K, value: V) -> V;
}
```

`StorageMap` implements `StorageMapAccess<K, V>` for types that convert to/from `Word`.

### Reading from a map

```rust
// Get returns a Felt (the first element of the stored Word)
pub fn get_balance(&self, account_id: AccountId) -> Felt {
    let key = Word::from([account_id.prefix, account_id.suffix, felt!(0), felt!(0)]);
    self.balances.get(&key)
}
```

When you call `get()` with a `Felt` return type, it returns the first element of the stored `Word`. For the full `Word`, specify the return type:

```rust
// Get the full Word value
let full_value: Word = self.my_map.get(&key);
```

### Writing to a map

`set()` returns the **previous value**:

```rust
pub fn set_balance(&mut self, account_id: AccountId, amount: Felt) {
    let key = Word::from([account_id.prefix, account_id.suffix, felt!(0), felt!(0)]);
    let old: Felt = self.balances.set(key, amount);
    // old contains the previous balance
}
```

### Map with Word values

```rust
pub fn store_data(&mut self, key: Word, value: Word) {
    let old: Word = self.data_map.set(key, value);
}

pub fn read_data(&self, key: Word) -> Word {
    self.data_map.get(&key)
}
```

## Storage layout planning

Plan your storage layout before building. Document what each slot and each Felt within a Word represents:

```rust
#[component]
struct TokenVault {
    /// Slot 0: Configuration
    /// [0] = max_supply (u64)
    /// [1] = is_paused (0 or 1)
    /// [2] = decimals
    /// [3] = unused
    #[storage(slot(0), description = "vault configuration")]
    config: Value,

    /// Slot 1: State tracking
    /// [0] = total_supply (u64)
    /// [1] = total_holders (u64)
    /// [2] = last_mint_block
    /// [3] = unused
    #[storage(slot(1), description = "vault state")]
    state: Value,

    /// Slot 2: Balance map
    /// Key: [account_prefix, account_suffix, 0, 0]
    /// Value: [balance, last_activity_block, 0, 0]
    #[storage(slot(2), description = "user balances")]
    balances: StorageMap,
}
```

### Guidelines

- **Use comments** to document the layout of each Felt within a Word
- **Group related data** into the same slot to minimize storage operations
- **Reserve slot 0** for configuration or authentication keys (convention)
- **Use StorageMap** when you need dynamic keys (per-user balances, per-item data)
- **Use Value** for global state that has a fixed structure

## Low-level storage access

If you need direct storage access outside the component traits, use the bindings:

```rust
use miden::storage;

// Direct slot access
let value: Word = storage::get_item(slot_id);
let old: Word = storage::set_item(slot_id, new_value);

// Direct map access
let value: Word = storage::get_map_item(slot_id, &key);
let old: Word = storage::set_map_item(slot_id, key, value);

// Initial values (at transaction start)
let initial: Word = storage::get_initial_item(slot_id);
let initial: Word = storage::get_initial_map_item(slot_id, &key);
```

These functions are useful for checking what values were at the start of the transaction (before any modifications).

## Next steps

- [Types](./types) — Understand Felt and Word conversions
- [Custom Types](./custom-types) — Export your own types with `#[export_type]`
- [Patterns](./patterns) — Common storage patterns (access control, rate limiting, etc.)
