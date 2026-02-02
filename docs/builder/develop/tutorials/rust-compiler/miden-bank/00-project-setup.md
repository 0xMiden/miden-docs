---
sidebar_position: 0
title: "Part 0: Project Setup"
description: "Set up a new Miden project and prepare the workspace for building the banking application."
---

# Part 0: Project Setup

In this section, you'll create a new Miden project and set up the workspace structure for our banking application. By the end, you'll have a working project that compiles successfully.

## What You'll Build in This Part

By the end of this section, you will have:

- Created a new Miden project using `miden new`
- Understood the workspace structure
- Renamed and configured the project for our bank
- Successfully compiled a minimal account component

## Prerequisites

Before starting, ensure you have completed the [Quick Start installation guide](../../../../quick-start/setup/installation) and have:

- **Rust toolchain** installed and configured
- **midenup toolchain** installed with Miden CLI tools (`miden` command available)

Verify your installation:

```bash title=">_ Terminal"
miden --version
```

<details>
<summary>Expected output</summary>

```text
miden-cli 0.8.x
```

</details>

## Step 1: Create the Project

Create a new Miden project using the CLI:

```bash title=">_ Terminal"
miden new miden-bank
cd miden-bank
```

This creates a workspace with the following structure:

```text
miden-bank/
├── contracts/                   # Smart contract code
│   ├── counter-account/         # Example account contract (we'll replace this)
│   └── increment-note/          # Example note script (we'll replace this)
├── integration/                 # Tests and deployment scripts
│   ├── src/
│   │   ├── bin/                 # Executable scripts for on-chain interactions
│   │   ├── lib.rs
│   │   └── helpers.rs           # Helper functions for tests
│   └── tests/                   # Test files
├── Cargo.toml                   # Workspace root
└── rust-toolchain.toml          # Rust toolchain specification
```

The project follows Miden's design philosophy:

- **`contracts/`**: Your smart contract code (account components, note scripts, transaction scripts)
- **`integration/`**: All on-chain interactions, deployment scripts, and tests

## Step 2: Set Up the Bank Account Contract

We'll replace the example `counter-account` with our `bank-account`. First, rename the directory:

```bash title=">_ Terminal"
mv contracts/counter-account contracts/bank-account
```

Now update the `Cargo.toml` inside `contracts/bank-account/`:

```toml title="contracts/bank-account/Cargo.toml"
[package]
name = "bank-account"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = { workspace = true }

[package.metadata.component]
package = "miden:bank-account"

[package.metadata.miden]
project-kind = "account"
supported-types = ["RegularAccountImmutableCode"]
```

### Key Configuration Options

| Field | Description |
|-------|-------------|
| `crate-type = ["cdylib"]` | Required for WebAssembly compilation |
| `project-kind = "account"` | Tells the compiler this is an account component |
| `supported-types` | Account types this component supports |
| `package = "miden:bank-account"` | The component package name for cross-component calls |

:::info Supported Account Types
`RegularAccountImmutableCode` means the account code cannot be changed after deployment. This is appropriate for our bank since we want the logic to be fixed.
:::

## Step 3: Create a Minimal Bank Component

Replace the contents of `contracts/bank-account/src/lib.rs` with a minimal bank structure:

```rust title="contracts/bank-account/src/lib.rs"
// Do not link against libstd (i.e. anything defined in `std::`)
#![no_std]
#![feature(alloc_error_handler)]

#[macro_use]
extern crate alloc;

use miden::*;

/// Bank account component - we'll build this up throughout the tutorial.
#[component]
struct Bank {
    /// Tracks whether the bank has been initialized (deposits enabled).
    /// Word layout: [is_initialized (0 or 1), 0, 0, 0]
    #[storage(slot(0), description = "initialized")]
    initialized: Value,

    /// Maps depositor AccountId -> balance (as Felt).
    /// We'll use this to track user balances in Part 1.
    #[storage(slot(1), description = "balances")]
    balances: StorageMap,
}

#[component]
impl Bank {
    /// Initialize the bank account, enabling deposits.
    pub fn initialize(&mut self) {
        // Read current value from storage
        let current: Word = self.initialized.read();

        // Check not already initialized
        assert!(
            current[0].as_u64() == 0,
            "Bank already initialized"
        );

        // Set initialized flag to 1
        let initialized_word = Word::from([felt!(1), felt!(0), felt!(0), felt!(0)]);
        self.initialized.write(initialized_word);
    }

    /// Get the balance for a depositor.
    ///
    /// This method is required for the component to compile correctly -
    /// account components must use WIT binding types (like AccountId)
    /// in at least one public method.
    pub fn get_balance(&self, depositor: AccountId) -> Felt {
        let key = Word::from([depositor.prefix, depositor.suffix, felt!(0), felt!(0)]);
        self.balances.get(&key)
    }
}
```

This is our starting point with two storage slots:
- `initialized`: A `Value` slot to track whether the bank is ready
- `balances`: A `StorageMap` to track user balances (we'll use this starting in Part 1)

:::note Compiler Requirement
Account components must use WIT binding types (like `AccountId`, `Asset`, etc.) in at least one public method signature for the compiler to generate the required bindings correctly. The `get_balance` method serves this purpose.
:::

## Step 4: Update the Workspace Configuration

Update the root `Cargo.toml` to reflect our renamed contract:

```toml title="Cargo.toml"
[workspace]
resolver = "2"

members = [
    "contracts/bank-account",
    "contracts/increment-note",  # We'll replace this later
    "integration",
]

[workspace.dependencies]
miden = { version = "0.8" }
```

## Step 5: Build and Verify

Let's verify everything compiles correctly:

```bash title=">_ Terminal"
cd contracts/bank-account
miden build --release
```

<details>
<summary>Expected output</summary>

```text
   Compiling bank-account v0.1.0 (/path/to/miden-bank/contracts/bank-account)
    Finished `release` profile [optimized] target(s)
Creating Miden package /path/to/miden-bank/target/miden/release/bank_account.masp
```

</details>

The compiled output is stored in `target/miden/release/bank_account.masp`.

:::tip What's a .masp File?
A `.masp` file is a Miden Assembly Package. It contains the compiled MASM (Miden Assembly) code and metadata needed to deploy and interact with your contract.
:::

## Try It: Verify Your Setup

Let's create a simple test to verify the bank account can be created. Create a new test file:

```rust title="integration/tests/part0_setup_test.rs"
use integration::helpers::{
    build_project_in_dir, create_testing_account_from_package, AccountCreationConfig,
};
use miden_client::account::{StorageMap, StorageSlot};
use miden_client::Word;
use std::{path::Path, sync::Arc};

#[tokio::test]
async fn test_bank_account_builds_and_loads() -> anyhow::Result<()> {
    // Build the bank account contract
    let bank_package = Arc::new(build_project_in_dir(
        Path::new("../contracts/bank-account"),
        true,
    )?);

    // Create the bank account with initial storage
    // Slot 0: initialized flag (Value, starts as [0, 0, 0, 0])
    // Slot 1: balances map (StorageMap, starts empty)
    let bank_cfg = AccountCreationConfig {
        storage_slots: vec![
            StorageSlot::Value(Word::default()),
            StorageSlot::Map(StorageMap::with_entries([])?),
        ],
        ..Default::default()
    };

    let bank_account =
        create_testing_account_from_package(bank_package.clone(), bank_cfg).await?;

    // Verify the account was created
    println!("Bank account created with ID: {:?}", bank_account.id());
    println!("Part 0 setup verified!");

    Ok(())
}
```

Run the test from the project root:

```bash title=">_ Terminal"
cargo test --package integration part0_setup_test -- --nocapture
```

<details>
<summary>Expected output</summary>

```text
   Compiling integration v0.1.0 (/path/to/miden-bank/integration)
    Finished `test` profile [unoptimized + debuginfo] target(s)
     Running tests/part0_setup_test.rs

running 1 test
Bank account created with ID: 0x...
Part 0 setup verified!
test test_bank_account_builds_and_loads ... ok

test result: ok. 1 passed; 0 failed; 0 ignored
```

</details>

:::tip Troubleshooting
**"Failed to build bank account contract"**: Make sure the `contracts/bank-account/Cargo.toml` is properly configured and you've updated the root `Cargo.toml` members list.

**"cannot find module helpers"**: Ensure the `integration/src/helpers.rs` file exists (it should have been generated by `miden new`).
:::

## What We've Built So Far

At this point, you have:

| Component | Status | Description |
|-----------|--------|-------------|
| `bank-account` | Minimal | Initialization flag + balance storage |
| `deposit-note` | Not started | Coming in Part 4 |
| `withdraw-note` | Not started | Coming in Part 7 |
| `init-tx-script` | Not started | Coming in Part 6 |

Your bank can be created, but doesn't do anything useful yet. In the next parts, we'll add:

1. **Part 1**: Deeper dive into storage (Value vs StorageMap)
2. **Part 2**: Business rules and constraints
3. **Part 3**: Asset handling for deposits
4. And more...

## Key Takeaways

1. **`miden new`** creates a complete project workspace with contracts and integration folders
2. **Account components** are defined with `#[component]` on a struct
3. **Storage slots** are declared with `#[storage(slot(N))]` attributes
4. **`miden build`** compiles Rust to Miden Assembly (.masp package)
5. **Tests verify** that your code works before moving on

## Next Steps

Now that your project is set up, let's dive deeper into account components and storage in [Part 1: Account Components and Storage](./01-account-components).
