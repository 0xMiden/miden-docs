---
sidebar_position: 1
title: "Part 1: Account Components and Storage"
description: "Learn how to define account components with the #[component] attribute and manage persistent state using Value and StorageMap storage types."
---

# Part 1: Account Components and Storage

In this section, you'll learn the fundamentals of building Miden account components using the Rust compiler. We'll create the Bank account structure that stores initialization state and tracks depositor balances.

## What You'll Learn

- The `#[component]` attribute and what it generates
- `Value` storage type for single Word values
- `StorageMap` for key-value storage
- `#[storage(slot(N))]` attribute syntax
- Project configuration in `Cargo.toml`

## Project Setup

First, let's look at the project structure for an account component:

```text
contracts/bank-account/
├── Cargo.toml        # Project configuration with Miden metadata
└── src/
    └── lib.rs        # Component implementation
```

### Cargo.toml Configuration

Account components require specific metadata in `Cargo.toml`:

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

Key configuration options:

| Field | Description |
|-------|-------------|
| `crate-type = ["cdylib"]` | Required for WebAssembly compilation |
| `project-kind = "account"` | Tells the compiler this is an account component |
| `supported-types` | Account types this component supports |

:::info Supported Account Types
`RegularAccountImmutableCode` means the account code cannot be changed after deployment. Other options include `RegularAccountMutableCode` for upgradeable accounts.
:::

## The #[component] Attribute

The `#[component]` attribute marks a struct as a Miden account component. It generates:

- WIT (WebAssembly Interface Types) bindings for cross-component calls
- MASM (Miden Assembly) code for the account logic
- Storage slot management code

Here's our Bank component definition:

```rust title="contracts/bank-account/src/lib.rs"
// Do not link against libstd (i.e. anything defined in `std::`)
#![no_std]
#![feature(alloc_error_handler)]

#[macro_use]
extern crate alloc;

use miden::*;

/// Bank account component that tracks depositor balances.
#[component]
struct Bank {
    /// Tracks whether the bank has been initialized (deposits enabled).
    /// Word layout: [is_initialized (0 or 1), 0, 0, 0]
    #[storage(slot(0), description = "initialized")]
    initialized: Value,

    /// Maps depositor AccountId -> balance (as Felt)
    /// Key: [prefix, suffix, asset_prefix, asset_suffix]
    #[storage(slot(1), description = "balances")]
    balances: StorageMap,
}
```

### No-std Environment

```rust
#![no_std]
```

Miden contracts run in a `no_std` environment, meaning they don't link against Rust's standard library. This is essential for blockchain execution where contracts need to be deterministic and lightweight.

### Imports

```rust
use miden::*;
```

The `miden` crate provides all the types and macros needed for Miden development:

- **`component`**: Macro for defining components
- **`Felt`**: Miden's native field element (64-bit prime field)
- **`Word`**: Four Felts `[Felt; 4]`
- **`Value`**: Single-value storage type
- **`StorageMap`**: Key-value storage type

## Storage Types

Miden accounts have storage slots that persist state on-chain. Each slot holds one `Word` (4 Felts = 32 bytes). The Miden Rust compiler provides two abstractions over these slots.

### Value Storage

The `Value` type provides access to a single storage slot:

```rust
#[storage(slot(0), description = "initialized")]
initialized: Value,
```

Use `Value` when you need to store a single `Word` of data. In our bank, we use it for a boolean flag (is the bank initialized?).

**Reading and writing:**

```rust
// Read returns a Word
let current: Word = self.initialized.read();

// Check the first element (our flag)
if current[0].as_u64() == 0 {
    // Not initialized
}

// Write a new value
let new_value = Word::from([felt!(1), felt!(0), felt!(0), felt!(0)]);
self.initialized.write(new_value);
```

:::tip Type Annotations
The `.read()` method requires a type annotation: `let current: Word = self.initialized.read();`
:::

### StorageMap

The `StorageMap` type provides key-value storage within a slot:

```rust
#[storage(slot(1), description = "balances")]
balances: StorageMap,
```

Use `StorageMap` when you need to store multiple values indexed by keys. In our bank, we track each depositor's balance.

**Reading and writing:**

```rust
// Create a key (must be a Word)
let key = Word::from([
    depositor.prefix,
    depositor.suffix,
    felt!(0),
    felt!(0),
]);

// Get returns a Felt (single value, not a Word)
let balance: Felt = self.balances.get(&key);

// Set stores a Felt at the key
let new_balance = balance + deposit_amount;
self.balances.set(key, new_balance);
```

:::warning StorageMap Returns Felt
Unlike `Value::read()` which returns a `Word`, `StorageMap::get()` returns a single `Felt`. This is an important distinction.
:::

### Storage Slot Layout

Storage slots are numbered starting from 0. Plan your layout carefully:

| Slot | Type | Purpose |
|------|------|---------|
| 0 | `Value` | Initialization flag |
| 1 | `StorageMap` | Depositor balances |

The `description` attribute is for documentation and debugging - it doesn't affect runtime behavior.

## Component Implementation

The `#[component]` attribute is also used on the `impl` block to define methods:

```rust title="contracts/bank-account/src/lib.rs"
#[component]
impl Bank {
    /// Get the balance for a depositor.
    pub fn get_balance(&self, depositor: AccountId) -> Felt {
        let key = Word::from([depositor.prefix, depositor.suffix, felt!(0), felt!(0)]);
        self.balances.get(&key)
    }

    // More methods...
}
```

### Public vs Private Methods

- **Public methods** (`pub fn`) are exposed in the generated WIT interface and can be called by other contracts
- **Private methods** (`fn`) are internal and cannot be called from outside

```rust
// Public: Can be called by note scripts and other contracts
pub fn get_balance(&self, depositor: AccountId) -> Felt { ... }

// Private: Internal helper, not exposed
fn require_initialized(&self) { ... }
```

## Building the Component

Build your account component with:

```bash title=">_ Terminal"
cd contracts/bank-account
miden build
```

This compiles the Rust code to Miden Assembly and generates:

- `target/miden/release/bank_account.masp` - The compiled package
- `target/generated-wit/` - WIT interface files for other contracts to use

## Key Takeaways

1. **`#[component]`** marks structs and impl blocks as Miden account components
2. **`Value`** stores a single Word, read with `.read()`, write with `.write()`
3. **`StorageMap`** stores key-value pairs, access with `.get()` and `.set()`
4. **Storage slots** are numbered from 0, each holds 4 Felts (32 bytes)
5. **Public methods** are callable by other contracts via generated bindings

:::tip View Complete Source
See the complete bank account implementation in the [miden-bank repository](https://github.com/keinberger/miden-bank/blob/main/contracts/bank-account/src/lib.rs).
:::

## Next Steps

Now that you understand account components and storage, let's learn how to define business rules with [Part 2: Constants and Constraints](./constants-constraints).
