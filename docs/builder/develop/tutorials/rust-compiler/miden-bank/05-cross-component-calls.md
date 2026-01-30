---
sidebar_position: 5
title: "Part 5: Cross-Component Calls"
description: "Learn how note scripts and transaction scripts call account component methods using generated bindings and proper dependency configuration."
---

# Part 5: Cross-Component Calls

In this section, you'll learn how note scripts call methods on account components. We'll explore the generated bindings system and the dependency configuration required to enable cross-component communication.

## What You'll Learn

- How bindings are generated and imported
- Calling account methods from note scripts
- Configuring dependencies in `Cargo.toml`
- Understanding the WIT interface files

## The Bindings System

When you build an account component with `miden build`, it generates:

1. **MASM code** - The compiled contract logic
2. **WIT files** - WebAssembly Interface Type definitions

Other contracts (note scripts, transaction scripts) import these WIT files to call the account's methods.

```text
Build Flow:
┌──────────────────┐    miden build    ┌─────────────────────────────────┐
│ bank-account/    │ ─────────────────▶│ target/generated-wit/           │
│  src/lib.rs      │                   │  miden_bank-account.wit         │
│                  │                   │  miden_bank-account_world.wit   │
└──────────────────┘                   └─────────────────────────────────┘
                                                      │
                                                      ▼
                                       ┌─────────────────────────────────┐
                                       │ deposit-note/                   │
                                       │  imports generated bindings     │
                                       └─────────────────────────────────┘
```

## Importing Bindings

In your note script, import the generated bindings:

```rust title="contracts/deposit-note/src/lib.rs"
// Import the bank account's generated bindings
use crate::bindings::miden::bank_account::bank_account;
```

The import path follows this pattern:
```
crate::bindings::{component-package}::{component-name}::{interface-name}
```

For our bank:
- `miden` - The package prefix from `[package.metadata.component]`
- `bank_account` - The component name (derived from package name)
- `bank_account` - The interface name (same as component)

## Calling Account Methods

Once imported, call the account methods directly:

```rust title="contracts/deposit-note/src/lib.rs"
#[note_script]
fn run(_arg: Word) {
    let depositor = active_note::get_sender();
    let assets = active_note::get_assets();

    for asset in assets {
        // Call the bank account's deposit method
        bank_account::deposit(depositor, asset);
    }
}
```

The binding automatically handles:
- Marshalling arguments across the component boundary
- Invoking the correct MASM procedures
- Returning results back to the caller

## Configuring Dependencies

Your `Cargo.toml` needs two dependency sections:

```toml title="contracts/deposit-note/Cargo.toml"
[package.metadata.miden.dependencies]
"miden:bank-account" = { path = "../bank-account" }

[package.metadata.component.target.dependencies]
"miden:bank-account" = { path = "../bank-account/target/generated-wit/" }
```

### miden.dependencies

```toml
[package.metadata.miden.dependencies]
"miden:bank-account" = { path = "../bank-account" }
```

This tells `cargo-miden` where to find the source package. Used during the build process to:
- Verify interface compatibility
- Link the compiled MASM code

### component.target.dependencies

```toml
[package.metadata.component.target.dependencies]
"miden:bank-account" = { path = "../bank-account/target/generated-wit/" }
```

This tells the Rust compiler where to find the WIT interface files. The path points to the `generated-wit/` directory created when you built the account component.

:::warning Both Sections Required
If either section is missing, your build will fail with linking or interface errors.
:::

## Build Order

Components must be built in dependency order:

```bash title=">_ Terminal"
# 1. Build the account component first
cd contracts/bank-account
miden build

# 2. Then build note scripts that depend on it
cd ../deposit-note
miden build
```

If you build out of order, you'll see errors about missing WIT files.

## Multiple Dependencies

Note scripts can depend on multiple account components:

```toml title="Example: Multi-dependency note"
[package.metadata.miden.dependencies]
"miden:bank-account" = { path = "../bank-account" }
"miden:token-faucet" = { path = "../token-faucet" }

[package.metadata.component.target.dependencies]
"miden:bank-account" = { path = "../bank-account/target/generated-wit/" }
"miden:token-faucet" = { path = "../token-faucet/target/generated-wit/" }
```

Import and use both:

```rust
use crate::bindings::miden::bank_account::bank_account;
use crate::bindings::miden::token_faucet::token_faucet;

#[note_script]
fn run(_arg: Word) {
    // Call methods on either component
    bank_account::deposit(/* ... */);
    token_faucet::mint(/* ... */);
}
```

## What Methods Are Available?

Only **public methods** (`pub fn`) on the `#[component] impl` block are available through bindings:

```rust title="contracts/bank-account/src/lib.rs"
#[component]
impl Bank {
    // PUBLIC: Available through bindings
    pub fn deposit(&mut self, depositor: AccountId, deposit_asset: Asset) { ... }
    pub fn withdraw(&mut self, /* ... */) { ... }
    pub fn get_balance(&self, depositor: AccountId) -> Felt { ... }

    // PRIVATE: NOT available through bindings
    fn require_initialized(&self) { ... }
    fn create_p2id_note(&mut self, /* ... */) { ... }
}
```

## Understanding the Generated WIT

The WIT files describe the interface. Here's a simplified example:

```wit title="target/generated-wit/miden_bank-account.wit"
interface bank-account {
    use miden:types/types.{account-id, asset, felt, word};

    deposit: func(depositor: account-id, deposit-asset: asset);
    withdraw: func(depositor: account-id, withdraw-asset: asset, ...);
    get-balance: func(depositor: account-id) -> felt;
}
```

This WIT is used to generate the Rust bindings that appear in `crate::bindings`.

## Calling from Transaction Scripts

Transaction scripts use a slightly different import pattern:

```rust title="contracts/init-tx-script/src/lib.rs"
use crate::bindings::Account;

#[tx_script]
fn run(_arg: Word, account: &mut Account) {
    // The account parameter is already the bound component
    account.initialize();
}
```

The `Account` binding in transaction scripts wraps the entire component, giving direct method access through the `account` parameter.

## Common Issues

### "Cannot find module" Error

```
error: cannot find module `bindings`
```

**Cause**: The account component wasn't built, or the WIT path is wrong.

**Solution**:
1. Build the account: `cd contracts/bank-account && miden build`
2. Verify the WIT path in `Cargo.toml` points to `target/generated-wit/`

### "Method not found" Error

```
error: no method named `deposit` found
```

**Cause**: The method isn't marked `pub` in the account component.

**Solution**: Ensure the method has `pub fn` visibility.

## Key Takeaways

1. **Build accounts first** - They generate WIT files that note scripts need
2. **Two dependency sections** - Both `miden.dependencies` and `component.target.dependencies` are required
3. **Import path pattern** - `crate::bindings::{package}::{component}::{interface}`
4. **Only public methods** - Private methods aren't exposed in bindings
5. **Transaction scripts differ** - They receive the account as a parameter

:::tip View Complete Source
See the complete Cargo.toml configurations:
- [Deposit Note Cargo.toml](https://github.com/keinberger/miden-bank/blob/main/contracts/deposit-note/Cargo.toml)
- [Withdraw Request Note Cargo.toml](https://github.com/keinberger/miden-bank/blob/main/contracts/withdraw-request-note/Cargo.toml)
:::

## Next Steps

Now that you understand cross-component calls, let's learn about transaction scripts in [Part 6: Transaction Scripts](./transaction-scripts).
