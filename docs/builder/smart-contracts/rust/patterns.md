---
title: "Patterns & Security"
sidebar_position: 12
description: "Common patterns for access control, rate limiting, spending limits, and security in Miden Rust contracts."
---

# Patterns & Security

Proven patterns for writing safe, correct Miden smart contracts, followed by security considerations specific to the Miden execution model. Each pattern is presented problem-first: the problem is stated, then the solution is shown with code. For a hands-on tutorial applying these patterns, see the [Miden Bank Tutorial](../../develop/tutorials/rust-compiler/miden-bank/).

## Common Patterns

### Basic wallet

The simplest useful contract — receive and send assets:

```rust
#![no_std]
#![feature(alloc_error_handler)]

use miden::{component, output_note, Asset, NoteIdx};

#[component]
struct Wallet;

#[component]
impl Wallet {
    pub fn receive_asset(&mut self, asset: Asset) {
        self.add_asset(asset);
    }

    pub fn send_asset(&mut self, asset: Asset, note_idx: NoteIdx) {
        let removed = self.remove_asset(asset);
        output_note::add_asset(removed, note_idx);
    }
}
```

### Counter

Track a numeric value in storage:

```rust
use miden::{component, felt, Felt, StorageMap, StorageMapAccess, Word};

#[component]
struct Counter {
    #[storage(description = "counter storage map")]
    count_map: StorageMap,
}

#[component]
impl Counter {
    pub fn get_count(&self) -> Felt {
        let key = Word::from_u64_unchecked(0, 0, 0, 1);
        self.count_map.get(&key)
    }

    pub fn increment_count(&mut self) -> Felt {
        let key = Word::from_u64_unchecked(0, 0, 0, 1);
        let current: Felt = self.count_map.get(&key);
        let new_value = current + felt!(1);
        self.count_map.set(key, new_value);
        new_value
    }
}
```

### Access control

Restrict operations to the account owner:

```rust
use miden::{component, felt, active_account, Value, ValueAccess, Word, AccountId};

#[component]
struct OwnedContract {
    #[storage(slot(0), description = "owner account id")]
    owner: Value,
}

#[component]
impl OwnedContract {
    pub fn init_owner(&mut self, owner_id: AccountId) {
        let current: Word = self.owner.read();
        assert!(current[0] == felt!(0)); // Not already initialized

        self.owner.write(Word::from([
            owner_id.prefix, owner_id.suffix, felt!(0), felt!(0)
        ]));
    }

    fn require_owner(&self) {
        let owner: Word = self.owner.read();
        let caller = active_account::get_id();
        assert!(owner[0] == caller.prefix);
        assert!(owner[1] == caller.suffix);
    }

    pub fn privileged_action(&mut self) {
        self.require_owner();
        // ... protected logic
    }
}
```

### Rate limiting

Enforce cooldown periods between actions:

```rust
use miden::{component, felt, tx, Felt, Value, ValueAccess, Word};

const COOLDOWN_BLOCKS: u64 = 100;

#[component]
struct RateLimited {
    #[storage(slot(0), description = "last action block")]
    last_action: Value,
}

#[component]
impl RateLimited {
    pub fn rate_limited_action(&mut self) {
        let state: Word = self.last_action.read();
        let last_block = state[0].as_u64();
        let current_block = tx::get_block_number().as_u64();

        assert!(current_block.saturating_sub(last_block) >= COOLDOWN_BLOCKS);

        self.last_action.write(Word::from([
            tx::get_block_number(), felt!(0), felt!(0), felt!(0),
        ]));
    }
}
```

### Spending limits

Cap per-transaction and daily spending:

```rust
use miden::{component, felt, output_note, tx, Asset, Felt, NoteIdx, Value, ValueAccess, Word};

const BLOCKS_PER_DAY: u64 = 28800;

#[component]
struct LimitedWallet {
    #[storage(slot(0), description = "limits: [max_per_tx, daily_max, 0, 0]")]
    limits: Value,

    #[storage(slot(1), description = "state: [daily_spent, last_reset, 0, 0]")]
    state: Value,
}

#[component]
impl LimitedWallet {
    pub fn send(&mut self, asset: Asset, note_idx: NoteIdx) {
        let amount = asset.inner[0].as_u64();

        // Check per-tx limit
        let limits: Word = self.limits.read();
        assert!(amount <= limits[0].as_u64());

        // Check daily limit with auto-reset
        let state: Word = self.state.read();
        let daily_spent = state[0].as_u64();
        let last_reset = state[1].as_u64();
        let current_block = tx::get_block_number().as_u64();
        let blocks_since_reset = current_block.saturating_sub(last_reset);

        let effective_daily = if blocks_since_reset >= BLOCKS_PER_DAY { 0 } else { daily_spent };
        assert!(effective_daily + amount <= limits[1].as_u64());

        // Update state
        let new_reset = if blocks_since_reset >= BLOCKS_PER_DAY {
            tx::get_block_number()
        } else {
            Felt::from_u64_unchecked(last_reset)
        };
        self.state.write(Word::from([
            Felt::from_u64_unchecked(effective_daily + amount),
            new_reset, felt!(0), felt!(0),
        ]));

        // Execute transfer
        let removed = self.remove_asset(asset);
        output_note::add_asset(removed, note_idx);
    }
}
```

## Security

### Assertions and error handling

Miden doesn't support error strings or `Result` types in contract execution. Use assertions:

```rust
// Good — clear, simple assertions
assert!(amount > felt!(0));
assert!(amount.as_u64() <= 1_000_000);

// Also available — SDK assertion functions
use miden::{assert_eq, assertz};
assert_eq(a, b);     // Fails if a != b
assertz(flag);       // Fails if flag != 0
```

When an assertion fails, proof generation fails and the transaction is rejected before reaching the network.

### Replay protection

Always increment the nonce when modifying account state (see [Authentication](./authentication) for the full pattern):

```rust
// The auth component should call incr_nonce()
let new_nonce = self.incr_nonce();
```

Without nonce management, the same transaction proof could be submitted multiple times.

### Safe arithmetic

Use `saturating_sub` to prevent underflow:

```rust
// Good — won't underflow
let elapsed = current_block.saturating_sub(last_block);

// Dangerous — could underflow if current < last
let elapsed = current_block - last_block;
```

For Felt arithmetic, values wrap modulo the prime field (no overflow panic), but the result may not be what you expect if you're treating Felts as integers.

### Anti-patterns

#### Don't use integer division with Felt

```rust
// WRONG — Felt division computes multiplicative inverse, not integer division
let half = amount / felt!(2);

// RIGHT — convert to u64 for integer division
let half = Felt::from_u64_unchecked(amount.as_u64() / 2);
```

#### Don't compare Felts with `>` or `<` directly

```rust
// WRONG — Felt comparison is over field elements, not integers
if amount > felt!(100) { ... }

// RIGHT — convert to u64 for numeric comparison
if amount.as_u64() > 100 { ... }
```

#### Don't store secrets in contract code

Contract code is visible on-chain. Never embed private keys, seeds, or other secrets.

#### Don't skip nonce management

Every state-changing transaction must increment the nonce to prevent replay attacks.

For the complete function reference, see the [Cheatsheet](./api-reference).

## `#![no_std]` Environment

All Miden contracts run without the standard library. This means:

### Standard library alternatives

| Not available | Alternative |
|---------------|-------------|
| `std::collections::HashMap` | Use `StorageMap` for on-chain state |
| `std::string::String` | Use `alloc::string::String` with allocator |
| `std::vec::Vec` | Use `alloc::vec::Vec` with allocator |
| `println!()` / `eprintln!()` | Use `miden::intrinsics::debug::breakpoint()` for debugging |
| `std::io` | Not available |
| Error strings in `assert!()` | Use `assert!(condition)` without messages |

### Using the allocator

If you need heap allocation (`Vec`, `String`, etc.), add the bump allocator:

```rust
#![no_std]
#![feature(alloc_error_handler)]

extern crate alloc;
use alloc::vec::Vec;

#[global_allocator]
static ALLOC: miden::BumpAlloc = miden::BumpAlloc::new();

#[cfg(not(test))]
#[panic_handler]
fn my_panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

#[cfg(not(test))]
#[alloc_error_handler]
fn my_alloc_error(_info: core::alloc::Layout) -> ! {
    loop {}
}
```

`BumpAlloc` is a bump allocator — it grows memory but never frees it. This is fine for short-lived transaction execution.
