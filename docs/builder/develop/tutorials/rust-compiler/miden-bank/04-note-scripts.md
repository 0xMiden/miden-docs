---
sidebar_position: 4
title: "Part 4: Note Scripts"
description: "Learn how to write note scripts that execute when notes are consumed, using active_note APIs to access sender, assets, and inputs."
---

# Part 4: Note Scripts

In this section, you'll learn how to write note scripts - code that executes when a note is consumed by an account. We'll implement a deposit note that transfers assets to the bank.

## What You'll Learn

- The `#[note_script]` attribute
- Using `active_note::get_sender()` to identify the note creator
- Using `active_note::get_assets()` to access attached assets
- Using `active_note::get_inputs()` for note parameters
- Differences between note scripts and account components

## Note Scripts vs Account Components

| Feature | Account Component | Note Script |
|---------|------------------|-------------|
| Purpose | Persistent account logic | One-time execution when consumed |
| Storage | Has persistent storage | No storage (reads from note data) |
| Attribute | `#[component]` | `#[note_script]` |
| Entry point | Methods on struct | `fn run(_arg: Word)` |
| Invocation | Called by other contracts | Executes when note is consumed |

Note scripts are like "messages" that carry code along with data and assets.

## Project Structure

```text
contracts/deposit-note/
├── Cargo.toml        # Note script configuration
└── src/
    └── lib.rs        # Script implementation
```

### Cargo.toml for Note Scripts

```toml title="contracts/deposit-note/Cargo.toml"
[package]
name = "deposit-note"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = { workspace = true }

[package.metadata.component]
package = "miden:deposit-note"

[package.metadata.miden]
project-kind = "note-script"

# Dependencies on account components
[package.metadata.miden.dependencies]
"miden:bank-account" = { path = "../bank-account" }

[package.metadata.component.target.dependencies]
"miden:bank-account" = { path = "../bank-account/target/generated-wit/" }
```

Key differences from account components:
- `project-kind = "note-script"` instead of `"account"`
- Dependencies section declares which accounts it can interact with

## The #[note_script] Attribute

The `#[note_script]` attribute marks the entry point for a note script:

```rust title="contracts/deposit-note/src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

use miden::*;

// Import the bank account's generated bindings
use crate::bindings::miden::bank_account::bank_account;

#[note_script]
fn run(_arg: Word) {
    // Script logic executes when note is consumed
}
```

The function signature is always:
```rust
fn run(_arg: Word)
```

The `_arg` parameter can pass additional data, but we don't use it in this example.

## Note Context APIs

The `active_note` module provides APIs to access note data during execution:

### get_sender() - Who Created the Note

```rust
let depositor = active_note::get_sender();
```

Returns the `AccountId` of the account that created/sent the note. In our bank:
- The sender is the depositor
- Their ID is used to credit their balance

### get_assets() - Attached Assets

```rust
let assets = active_note::get_assets();
for asset in assets {
    // Process each asset
}
```

Returns an iterator over all assets attached to the note. Assets are transferred to the consuming account's vault before the script runs.

### get_inputs() - Note Parameters

```rust
let inputs = active_note::get_inputs();
let first_input = inputs[0];
```

Returns a vector of `Felt` values passed when the note was created. Use inputs to parameterize note behavior.

## Complete Deposit Note Implementation

Here's our deposit note that processes deposits into the bank:

```rust title="contracts/deposit-note/src/lib.rs"
// Do not link against libstd (i.e. anything defined in `std::`)
#![no_std]
#![feature(alloc_error_handler)]

use miden::*;

// Import the bank account's generated bindings
use crate::bindings::miden::bank_account::bank_account;

/// Deposit Note Script
///
/// When consumed by the Bank account, this note transfers all its assets
/// to the bank and credits the depositor (note sender) with the deposited amount.
#[note_script]
fn run(_arg: Word) {
    // The depositor is whoever created/sent this note
    let depositor = active_note::get_sender();

    // Get all assets attached to this note
    let assets = active_note::get_assets();

    // Deposit each asset into the bank
    for asset in assets {
        bank_account::deposit(depositor, asset);
    }
}
```

### Execution Flow

```text
1. User creates deposit note with 100 tokens attached
   ┌───────────────────────────────────────┐
   │ Note: deposit-note                    │
   │ Sender: User's AccountId              │
   │ Assets: [100 tokens]                  │
   └───────────────────────────────────────┘

2. Bank account consumes the note
   ┌───────────────────────────────────────┐
   │ Bank receives assets into vault       │
   │ Note script executes...               │
   └───────────────────────────────────────┘

3. Note script runs
   depositor = get_sender()  → User's AccountId
   assets = get_assets()     → [100 tokens]
   bank_account::deposit(depositor, 100 tokens)

4. Bank's deposit() method executes
   - Updates balance: balances[User] += 100
   - Assets already in vault from consumption
```

## Withdraw Request Note (Complex Example)

For more complex scenarios, use note inputs to pass parameters:

```rust title="contracts/withdraw-request-note/src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

use miden::*;
use crate::bindings::miden::bank_account::bank_account;

/// Withdraw Request Note Script
///
/// # Note Inputs (11 Felts)
/// [0-3]: withdraw asset (amount, 0, faucet_suffix, faucet_prefix)
/// [4-7]: serial_num (random/unique per note)
/// [8]: tag (P2ID note tag for routing)
/// [9]: aux (auxiliary data)
/// [10]: note_type (1 = Public, 2 = Private)
#[note_script]
fn run(_arg: Word) {
    // The depositor is whoever created/sent this note
    let depositor = active_note::get_sender();

    // Get the inputs
    let inputs = active_note::get_inputs();

    // Parse withdraw asset from inputs [0-3]
    let withdraw_asset = Asset::new(Word::from([
        inputs[0], inputs[1], inputs[2], inputs[3]
    ]));

    // Parse serial number from inputs [4-7]
    let serial_num = Word::from([
        inputs[4], inputs[5], inputs[6], inputs[7]
    ]);

    // Parse remaining parameters
    let tag = inputs[8];
    let aux = inputs[9];
    let note_type = inputs[10];

    // Call the bank account to withdraw the assets
    bank_account::withdraw(depositor, withdraw_asset, serial_num, tag, aux, note_type);
}
```

### Input Layout Design

Design your input layout carefully:

| Index | Field | Type | Description |
|-------|-------|------|-------------|
| 0-3 | Asset | Word | Amount + faucet ID |
| 4-7 | Serial | Word | Unique note identifier |
| 8 | Tag | Felt | P2ID routing tag |
| 9 | Aux | Felt | Application data |
| 10 | Type | Felt | Public(1) or Private(2) |

:::warning Stack Limits
Note inputs are limited. Keep your input layout compact. See [Common Pitfalls](../../pitfalls) for stack-related constraints.
:::

## Building Note Scripts

Build your note script with:

```bash title=">_ Terminal"
cd contracts/deposit-note
miden build
```

:::info Build Order
Build account components first (e.g., `bank-account`) before building note scripts that depend on them. The note script needs the generated WIT files from the account.
:::

## Key Takeaways

1. **`#[note_script]`** marks the entry point function `fn run(_arg: Word)`
2. **`active_note::get_sender()`** returns who created the note
3. **`active_note::get_assets()`** returns assets attached to the note
4. **`active_note::get_inputs()`** returns parameterized data
5. **Note scripts execute once** when consumed - no persistent state

:::tip View Complete Source
See the complete note script implementations:
- [Deposit Note](https://github.com/keinberger/miden-bank/blob/main/contracts/deposit-note/src/lib.rs)
- [Withdraw Request Note](https://github.com/keinberger/miden-bank/blob/main/contracts/withdraw-request-note/src/lib.rs)
:::

## Next Steps

Now that you understand note scripts, let's learn how they call account methods in [Part 5: Cross-Component Calls](./cross-component-calls).
