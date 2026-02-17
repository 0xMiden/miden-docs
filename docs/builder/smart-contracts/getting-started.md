---
title: "Toolchain & Project Structure"
sidebar_position: 2
description: "The Miden toolchain, project layout, Cargo.toml configuration, and how Rust source becomes a deployable .masp file."
---

# Toolchain & Project Structure

Miden contracts are written in Rust and compiled to WebAssembly, then translated to Miden Assembly (MASM) by the Miden compiler. The toolchain manages this pipeline. This page explains what the tools are, how a project is organized, and what each piece of configuration controls. For a hands-on walkthrough, see the [Miden Bank Tutorial](../develop/tutorials/rust-compiler/miden-bank/).

## The Miden toolchain

The Miden toolchain consists of two main tools:

| Tool | Purpose |
|------|---------|
| `midenup` | Toolchain manager — installs and updates Miden tools (similar to `rustup`) |
| `cargo-miden` | Cargo subcommand that compiles Rust contracts to `.masp` files |

`midenup` is installed via a shell script and manages versioned Miden toolchain components, including the correct Rust nightly and Wasm targets required by `cargo-miden`. This ensures your contracts are always compiled with a compatible toolchain.

### Installing the toolchain

```bash title=">_ Terminal"
curl -L https://raw.githubusercontent.com/0xMiden/midenup/main/install.sh | bash
midenup install
```

`midenup install` downloads `cargo-miden`, the Miden CLI, and the required Rust toolchain components. After installation, `miden --version` confirms the toolchain is ready.

## Project layout

A Miden project created with `miden new` is a Cargo workspace with a conventional structure:

```text
my-project/
├── contracts/
│   ├── counter-account/        # Account component
│   │   ├── src/lib.rs
│   │   └── Cargo.toml
│   └── increment-note/         # Note script
│       ├── src/lib.rs
│       └── Cargo.toml
├── integration/                # Tests and deployment scripts
│   ├── src/
│   │   ├── bin/
│   │   ├── lib.rs
│   │   └── helpers.rs
│   └── tests/
├── Cargo.toml                  # Workspace root
└── rust-toolchain.toml         # Pinned Rust toolchain
```

| Directory | What lives here |
|-----------|----------------|
| `contracts/` | Smart contract source — account components, note scripts, transaction scripts. Each contract is its own crate with its own `Cargo.toml`. |
| `integration/` | Tests, deployment scripts, and helpers for interacting with the Miden network or a local mock. |
| `rust-toolchain.toml` | Pins the Rust toolchain version. The Miden compiler requires specific Rust and Wasm target versions. |

## `Cargo.toml` configuration

Each contract crate has Miden-specific configuration under `[package.metadata.miden]`:

```toml title="contracts/counter-account/Cargo.toml"
[package]
name = "counter-contract"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = "0.10"

[package.metadata.component]
package = "miden:counter-contract"

[package.metadata.miden]
project-kind = "account"
supported-types = ["RegularAccountUpdatableCode"]
```

### Key fields

| Field | Required | What it controls |
|-------|----------|-----------------|
| `crate-type = ["cdylib"]` | Yes | Tells Cargo to produce a dynamic library — required for WebAssembly compilation |
| `[package.metadata.miden]` | Yes | Miden compiler configuration block |
| `project-kind` | Yes | What kind of contract this is (see below) |
| `supported-types` | Account only | Which account types this component supports |
| `[package.metadata.component]` | Yes | WIT component package name — used for cross-component interoperability |
| `[package.metadata.miden.dependencies]` | Cross-component only | References to other Miden packages this component calls |

### Project kinds

| Kind | Description |
|------|-------------|
| `"account"` | An account component — has storage slots, exposes public methods, and is attached to an account on deployment |
| `"note-script"` | Code that executes when a note is consumed by a recipient |
| `"transaction-script"` | Code that runs in a transaction context, used for initialization or scripted interactions |

## What a contract looks like

Miden contracts are `#![no_std]` Rust libraries. Here's the `counter-account` component that `miden new` generates:

```rust title="contracts/counter-account/src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

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

- **`#![no_std]`** — Miden contracts run inside the Miden VM, which has no OS or standard library
- **`#[component]`** — Applied to both the struct and `impl` block; generates WIT bindings and storage scaffolding
- **`StorageMap`** — A persistent key-value store annotated with `#[storage]`
- **`&self` vs `&mut self`** — Read-only methods take `&self`, write methods take `&mut self`

Most contracts also need `extern crate alloc` and a bump allocator if they use heap types (`Vec`, `String`, etc.):

```rust
extern crate alloc;
use alloc::vec::Vec;

#[global_allocator]
static ALLOC: miden::BumpAlloc = miden::BumpAlloc::new();
```

## The build output: `.masp` files

Running `miden build --release` from a contract directory produces a `.masp` file (Miden Assembly Package):

```text
target/miden/release/counter_contract.masp
```

A `.masp` file contains:

- **Compiled MASM** — The Miden Assembly the VM executes at transaction time
- **WIT interface definitions** — For cross-component interoperability
- **Storage layout metadata** — How the component's storage slots are organized
- **Account type configuration** — Which account types this component supports

This is the artifact that gets deployed to the Miden network. The Miden VM executes the MASM code and produces a zero-knowledge proof; the network verifies the proof without ever seeing the original Rust source.

## Common `#![no_std]` patterns

| Pattern | When to use |
|---------|-------------|
| `extern crate alloc;` | When you need `Vec`, `String`, `Box`, or other heap types |
| `#[global_allocator] static ALLOC: miden::BumpAlloc` | Required alongside `extern crate alloc` — the VM has no default allocator |
| `use alloc::vec::Vec;` | Heap-allocated collections |
| `#![feature(alloc_error_handler)]` | Required when using a custom allocator |

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `requires #![no_std]` | Missing `no_std` attribute | Add `#![no_std]` to the top of `lib.rs` |
| `crate-type must be cdylib` | Wrong crate type | Set `crate-type = ["cdylib"]` in `[lib]` |
| `unknown project-kind` | Typo in project kind | Valid values: `"account"`, `"note-script"`, `"transaction-script"` |
| `.masp` not generated after successful build | Built from workspace root without specifying package | Run from the contract directory, or use `miden build -p counter-contract --release` |

Once you understand the project structure, explore [Components](./accounts/components) for the full `#[component]` API and [Types](./types) for Felt, Word, and field arithmetic.
