---
title: "Getting Started"
sidebar_position: 2
description: "Install the Miden toolchain, create your first Rust smart contract project, and build it."
---

# Getting Started

This guide walks you through installing the Miden toolchain, creating a project with `miden new`, understanding the project structure and `Cargo.toml` configuration, and building your first contract. For a complete end-to-end walkthrough, see the [Miden Bank Tutorial](../../develop/tutorials/rust-compiler/miden-bank/).

## Prerequisites

- [Rust toolchain](https://rustup.rs/) installed
- Basic familiarity with Rust programming

## Install the Miden toolchain

Install `midenup`, the Miden toolchain manager:

```bash title=">_ Terminal"
curl -L https://raw.githubusercontent.com/0xMiden/midenup/main/install.sh | bash
```

Then install the Miden tools:

```bash title=">_ Terminal"
midenup install
```

Verify the installation:

```bash title=">_ Terminal"
miden --version
```

This installs `cargo-miden` (the compiler), the Miden CLI, and required toolchain components.

## Create a new project

```bash title=">_ Terminal"
miden new my-project
cd my-project
```

This generates a workspace with the following structure:

```text
my-project/
├── contracts/
│   ├── counter-account/        # Example account component
│   │   ├── src/lib.rs
│   │   └── Cargo.toml
│   └── increment-note/         # Example note script
│       ├── src/lib.rs
│       └── Cargo.toml
├── integration/                 # Tests and deployment scripts
│   ├── src/
│   │   ├── bin/
│   │   ├── lib.rs
│   │   └── helpers.rs
│   └── tests/
├── Cargo.toml                   # Workspace root
└── rust-toolchain.toml          # Pinned Rust toolchain
```

### Project layout

| Directory | Purpose |
|-----------|---------|
| `contracts/` | Smart contract source code — account components, note scripts, tx scripts |
| `integration/` | Tests, deployment scripts, and on-chain interaction helpers |

## Understanding `Cargo.toml`

Each contract has its own `Cargo.toml` with Miden-specific configuration:

```toml title="contracts/counter-account/Cargo.toml"
[package]
name = "counter-contract"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = { path = "../../sdk/sdk" }

[package.metadata.component]
package = "miden:counter-contract"

[package.metadata.miden]
project-kind = "account"
supported-types = ["RegularAccountUpdatableCode"]
```

### Key configuration fields

| Field | Required | Description |
|-------|----------|-------------|
| `crate-type = ["cdylib"]` | Yes | Required for WebAssembly compilation |
| `[package.metadata.miden]` | Yes | Miden compiler configuration |
| `project-kind` | Yes | `"account"`, `"note-script"`, or `"tx-script"` |
| `supported-types` | Account only | Which account types this component supports |
| `[package.metadata.component]` | Yes | WIT component package name |
| `[package.metadata.miden.dependencies]` | For cross-component | References to other Miden packages |

### Project kinds

| Kind | Description | Example |
|------|-------------|---------|
| `"account"` | Account component with storage and methods | Wallets, contracts |
| `"note-script"` | Note script that executes when a note is consumed | P2ID, custom transfers |
| `"tx-script"` | Transaction script that runs in a transaction context | Initialization scripts |

## Your first contract

Here's the `basic-wallet` example from the compiler — a minimal account component:

```rust title="src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

use miden::{component, native_account, output_note, Asset, NoteIdx};

#[component]
struct MyAccount;

#[component]
impl MyAccount {
    /// Adds an asset to the account vault.
    pub fn receive_asset(&mut self, asset: Asset) {
        self.add_asset(asset);
    }

    /// Moves an asset from the account vault to an output note.
    pub fn move_asset_to_note(&mut self, asset: Asset, note_idx: NoteIdx) {
        let asset = self.remove_asset(asset);
        output_note::add_asset(asset, note_idx);
    }
}
```

Key points:

- **`#![no_std]`**: Required — Miden contracts run without the standard library
- **`#[component]`**: Applied to both the struct and impl block
- **`&mut self`**: Marks methods that modify state (write operations)
- **`self.add_asset()` / `self.remove_asset()`**: Auto-generated methods on components without explicit storage fields

## Build your project

```bash title=">_ Terminal"
cd contracts/counter-account
miden build --release
```

<details>
<summary>Expected output</summary>

```text
   Compiling counter-contract v0.1.0
    Finished `release` profile [optimized] target(s)
Creating Miden package target/miden/release/counter_contract.masp
```

</details>

### What's in a `.masp` file?

A `.masp` (Miden Assembly Package) file contains:

- Compiled Miden Assembly (MASM) code
- WIT interface definitions for component interoperability
- Storage layout metadata
- Account type configuration

This is what you deploy to the Miden network. The MASM code is what the Miden VM executes to generate zero-knowledge proofs.

## Common `#![no_std]` setup

Most contracts need these attributes at the top of `lib.rs`:

```rust
// Required: no standard library
#![no_std]
// Required: custom alloc error handler
#![feature(alloc_error_handler)]

// Optional: if you need heap allocation (Vec, String, etc.)
extern crate alloc;
use alloc::vec::Vec;
```

If you need heap allocation, add a global allocator:

```rust
#[global_allocator]
static ALLOC: miden::BumpAlloc = miden::BumpAlloc::new();
```

See [Patterns](./patterns) for more on `BumpAlloc` and `#![no_std]` implications.

## Troubleshooting

### `error: requires #![no_std]`

Add `#![no_std]` to the top of your `lib.rs`. Miden contracts cannot use the standard library.

### `error: crate-type must be cdylib`

Ensure your `Cargo.toml` has `crate-type = ["cdylib"]` under `[lib]`.

### `error: unknown project-kind`

Valid values are `"account"`, `"note-script"`, or `"tx-script"`. Check `[package.metadata.miden]`.

### Build succeeds but `.masp` not generated

Make sure you're building from the contract directory (not the workspace root) or specify the package: `miden build -p counter-contract --release`.

Once your project builds, explore [Components](./accounts/components) to understand the `#[component]` macro and [Types](./types) for Felt, Word, and field arithmetic.
