---
sidebar_position: 6
title: "Part 6: Transaction Scripts"
description: "Learn how to write transaction scripts for account initialization and owner-controlled operations using the #[tx_script] attribute."
---

# Part 6: Transaction Scripts

In this section, you'll learn how to write transaction scripts - code that the account owner explicitly executes. We'll implement an initialization script that enables the bank to accept deposits.

## What You'll Learn

- The `#[tx_script]` attribute
- Transaction script function signature
- The `Account` binding for method access
- When to use transaction scripts vs note scripts

## Transaction Scripts vs Note Scripts

| Aspect | Transaction Script | Note Script |
|--------|-------------------|-------------|
| Initiation | Explicitly called by account owner | Triggered when note is consumed |
| Access | Direct account method access | Must call through bindings |
| Use case | Setup, owner operations | Receiving messages/assets |
| Parameter | `account: &mut Account` | Note context via `active_note::` |

**Use transaction scripts for:**
- One-time initialization
- Admin/owner operations
- Operations that don't involve receiving notes

**Use note scripts for:**
- Receiving assets from other accounts
- Processing requests from other accounts
- Multi-party interactions

## Project Structure

```text
contracts/init-tx-script/
├── Cargo.toml        # Transaction script configuration
└── src/
    └── lib.rs        # Script implementation
```

### Cargo.toml for Transaction Scripts

```toml title="contracts/init-tx-script/Cargo.toml"
[package]
name = "init-tx-script"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = { workspace = true }

[package.metadata.component]
package = "miden:init-tx-script"

[package.metadata.miden]
project-kind = "transaction-script"

[package.metadata.miden.dependencies]
"miden:bank-account" = { path = "../bank-account" }

[package.metadata.component.target.dependencies]
"miden:bank-account" = { path = "../bank-account/target/generated-wit/" }
```

Key configuration:
- `project-kind = "transaction-script"` - Marks this as a transaction script
- Dependencies reference the account component (same as note scripts)

## The #[tx_script] Attribute

The `#[tx_script]` attribute marks the entry point for a transaction script:

```rust title="contracts/init-tx-script/src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

use miden::*;

// Import the Account binding
use crate::bindings::Account;

#[tx_script]
fn run(_arg: Word, account: &mut Account) {
    account.initialize();
}
```

### Function Signature

```rust
fn run(_arg: Word, account: &mut Account)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `_arg` | `Word` | Optional argument passed when executing |
| `account` | `&mut Account` | Mutable reference to the account component |

The `Account` type is generated from your component's bindings and provides access to all public methods.

## The Account Binding

Unlike note scripts that import bindings like `bank_account::deposit()`, transaction scripts receive the account as a parameter:

```rust
// Note script style (indirect):
use crate::bindings::miden::bank_account::bank_account;
bank_account::deposit(depositor, asset);

// Transaction script style (direct):
use crate::bindings::Account;
fn run(_arg: Word, account: &mut Account) {
    account.initialize();  // Direct method call
}
```

The `Account` wrapper provides:
- Direct method access without module prefixes
- Proper mutable/immutable borrowing
- Automatic context binding

## Complete Initialization Script

Here's our bank initialization script:

```rust title="contracts/init-tx-script/src/lib.rs"
// Do not link against libstd (i.e. anything defined in `std::`)
#![no_std]
#![feature(alloc_error_handler)]

use miden::*;

// Import the Account binding which wraps the bank-account component methods
use crate::bindings::Account;

/// Initialize Transaction Script
///
/// This transaction script initializes the bank account, enabling deposits.
/// It must be executed by the bank account owner before any deposits can be made.
///
/// # Flow
/// 1. Transaction is created with this script attached
/// 2. Script executes in the context of the bank account
/// 3. Calls `account.initialize()` to enable deposits
/// 4. Bank account is now "deployed" and visible on chain
#[tx_script]
fn run(_arg: Word, account: &mut Account) {
    account.initialize();
}
```

### Execution Flow

```text
1. Account owner creates transaction with init-tx-script
   ┌───────────────────────────────────────┐
   │ Transaction                           │
   │  Account: Bank's AccountId            │
   │  Script: init-tx-script               │
   └───────────────────────────────────────┘

2. Transaction executes
   ┌───────────────────────────────────────┐
   │ run(_arg, account)                    │
   │  └─ account.initialize()              │
   │       └─ Sets initialized flag to 1   │
   └───────────────────────────────────────┘

3. Account state updated
   ┌───────────────────────────────────────┐
   │ Bank Account                          │
   │  Storage[0] = [1, 0, 0, 0]  ← Initialized │
   │  Now visible on-chain                 │
   └───────────────────────────────────────┘
```

## Using Script Arguments

The `_arg` parameter can pass data to the script:

```rust title="Example: Parameterized script"
#[tx_script]
fn run(arg: Word, account: &mut Account) {
    // Use arg as configuration
    let config_value = arg[0];
    account.configure(config_value);
}
```

When creating the transaction, provide the argument:

```rust title="Integration code (not contract code)"
let tx_script_args = Word::from([felt!(42), felt!(0), felt!(0), felt!(0)]);
let tx_context = mock_chain
    .build_tx_context(bank_account.id(), &[], &[])?
    .tx_script(init_tx_script)
    .tx_script_args(tx_script_args)  // Pass the argument
    .build()?;
```

## Account Deployment Pattern

In Miden, accounts are only visible on-chain after their first state change. Transaction scripts are commonly used for this "deployment":

```rust
// Common initialization pattern
#[tx_script]
fn run(_arg: Word, account: &mut Account) {
    // This state change makes the account visible on-chain
    account.initialize();
}
```

Before initialization:
- Account exists locally but isn't visible on the network
- Cannot receive notes or interact with other accounts

After initialization:
- Account is "deployed" and visible
- Can receive deposits and interact normally

## Building Transaction Scripts

Build your transaction script with:

```bash title=">_ Terminal"
# First, ensure the account component is built
cd contracts/bank-account
miden build

# Then build the transaction script
cd ../init-tx-script
miden build
```

## Testing Transaction Scripts

In tests, attach the script to a transaction:

```rust title="integration/tests/deposit_test.rs"
use miden_objects::transaction::TransactionScript;

// Build the init script package
let init_tx_script_package = Arc::new(build_project_in_dir(
    Path::new("../contracts/init-tx-script"),
    true,
)?);

// Create the TransactionScript
let init_program = init_tx_script_package.unwrap_program();
let init_tx_script = TransactionScript::new((*init_program).clone());

// Attach to transaction context
let init_tx_context = mock_chain
    .build_tx_context(bank_account.id(), &[], &[])?
    .tx_script(init_tx_script)
    .build()?;

// Execute
let executed_init = init_tx_context.execute().await?;
```

## Key Takeaways

1. **`#[tx_script]`** marks the entry point with signature `fn run(_arg: Word, account: &mut Account)`
2. **Direct account access** - Methods called on the `account` parameter, not via module imports
3. **Owner-initiated** - Only the account owner can execute transaction scripts
4. **Deployment pattern** - First state change makes account visible on-chain
5. **Dependencies** - Same Cargo.toml configuration as note scripts

:::tip View Complete Source
See the complete transaction script implementation in the [miden-bank repository](https://github.com/keinberger/miden-bank/blob/main/contracts/init-tx-script/src/lib.rs).
:::

## Next Steps

Now that you understand transaction scripts, let's learn the advanced topic of creating output notes in [Part 7: Creating Output Notes](./output-notes).
