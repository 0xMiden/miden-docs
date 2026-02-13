---
sidebar_position: 1
title: "Imports & Dependencies"
description: "Crate renames and dependency changes in v0.13"
---

# Imports & Dependencies

:::warning Breaking Change
The `miden-objects` and `miden-lib` crates have been renamed. All imports must be updated.
:::

## Quick Fix

```toml title="Cargo.toml"
# Remove these
miden-objects = "0.12"
miden-lib = "0.12"

# Add these
miden-protocol = "0.13"
miden-standards = "0.13"
```

---

## Crate Renames

Core types have moved from `miden-objects` and `miden-lib` to new packages.

| Old Package | New Package | Contains |
|-------------|-------------|----------|
| `miden-objects` | `miden-protocol` | Core protocol types |
| `miden-lib` | `miden-standards` | Standard library |

### Cargo.toml

```diff title="Cargo.toml"
# Before
- miden-objects = "0.12"
- miden-lib = "0.12"

# After
+ miden-protocol = "0.13"
+ miden-standards = "0.13"
```

### Rust Imports

```diff title="src/lib.rs"
# Before
- use miden_objects::{Account, Note, Transaction};
- use miden_lib::StdLibrary;

# After
+ use miden_protocol::{Account, Note, Transaction};
+ use miden_standards::CoreLibrary;
```

:::tip Helper Script
Use your IDE's find-and-replace to update all imports at once:
- Find: `miden_objects` → Replace: `miden_protocol`
- Find: `miden_lib` → Replace: `miden_standards`
:::

---

## Miden VM and Crypto Updates

Update Miden VM to 0.20 and `miden-crypto` to 0.19:

```toml title="Cargo.toml"
miden-vm = "0.20"
miden-crypto = "0.19"
```

---

## Core Library Rename

The standard library has been renamed from `StdLibrary` to `CoreLibrary`.

### Rust

```diff title="src/lib.rs"
- use miden_lib::StdLibrary;
- let stdlib = StdLibrary::default();

+ use miden_standards::CoreLibrary;
+ let corelib = CoreLibrary::default();
```

### MASM Imports

```diff title="src/contract.masm"
# Before
- use.std::crypto::hashes

# After
+ use.miden::core::crypto::hashes
```

---

## Migration Steps

1. Update `Cargo.toml` with new package names and versions
2. Run `cargo update` to fetch new packages
3. Find and replace old import paths throughout your codebase
4. Rename `StdLibrary` to `CoreLibrary`
5. Update MASM imports from `std::` to `miden::core::`
6. Compile and fix any remaining import errors

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `unresolved import 'miden_objects'` | Old package name | Change to `miden_protocol` |
| `cannot find 'StdLibrary' in 'miden_lib'` | Renamed to CoreLibrary | Use `miden_standards::CoreLibrary` |
| `unresolved import 'std::crypto'` | MASM namespace change | Use `miden::core::crypto` |
