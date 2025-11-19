---
sidebar_position: 2
title: Create Your Project
description: Set up a new Miden project and understand the counter contract implementation.
---

# Create Your Project

In this section, you'll set up a new Miden project and understand the structure and implementation of both the counter account contract and increment note script.

## Setting Up Your Project

Create a new Miden project using the CLI:

```bash title=">_ Terminal"
miden new counter-project
cd counter-project
```

This creates a workspace with the following structure:

```text
counter-project/
├── contracts/                   # Each contract as individual crate
│   ├── counter-account/         # Example: Counter account contract
│   └── increment-note/          # Example: Increment note contract
├── integration/                 # Integration crate (scripts + tests)
│   ├── src/
│   │   ├── bin/                 # Rust binaries for on-chain interactions
│   │   ├── lib.rs
│   │   └── helpers.rs           # Temporary helper file
│   └── tests/                   # Test files
├── Cargo.toml                   # Workspace root
└── rust-toolchain.toml          # Rust toolchain specification
```

The project follows Miden's design philosophy of clean separation:

- **`contracts/`**: Your primary working directory for writing Miden smart contract code
- **`integration/`**: All on-chain interactions, deployment scripts, and tests

Each contract is organized as its own individual crate, providing independent versioning, dependencies, and clear isolation between different contracts.

## Building Your Contracts

You can build individual contracts by navigating to their directory and running the Miden build command:

```bash title=">_ Terminal"
# Build the counter account contract
cd contracts/counter-account
miden build

# Build the increment note contract
cd ../increment-note
miden build
```

This compiles the Rust contract code into Miden assembly, making it ready for deployment and interaction.

## Understanding the Counter Account Contract

Let's examine the counter account contract that comes with the project template. Open `contracts/counter-account/src/lib.rs`:

```rust title="contracts/counter-account/src/lib.rs"
// Do not link against libstd (i.e. anything defined in `std::`)
#![no_std]

// Global allocator to use heap memory in no-std environment
#[global_allocator]
static ALLOC: miden::BumpAlloc = miden::BumpAlloc::new();

// Define a panic handler as required by the `no_std` environment
#[cfg(not(test))]
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

use miden::{component, felt, Felt, StorageMap, StorageMapAccess, Word};

use crate::bindings::exports::miden::counter_contract::counter::Guest;

/// Main contract structure for the counter example.
#[component]
struct CounterContract {
    /// Storage map holding the counter value.
    #[storage(slot(0), description = "counter contract storage map")]
    count_map: StorageMap,
}

impl Guest for CounterContract {
    /// Returns the current counter value stored in the contract's storage map.
    fn get_count() -> Felt {
        // Get the instance of the contract
        let contract = CounterContract::default();
        // Define a fixed key for the counter value within the map
        let key = Word::from([felt!(0), felt!(0), felt!(0), felt!(1)]);
        // Read the value associated with the key from the storage map
        contract.count_map.get(&key)
    }

    /// Increments the counter value stored in the contract's storage map by one.
    fn increment_count() -> Felt {
        // Get the instance of the contract
        let contract = CounterContract::default();
        // Define the same fixed key
        let key = Word::from([felt!(0), felt!(0), felt!(0), felt!(1)]);
        // Read the current value
        let current_value: Felt = contract.count_map.get(&key);
        // Increment the value by one
        let new_value = current_value + felt!(1);
        // Write the new value back to the storage map
        contract.count_map.set(key, new_value);
        new_value
    }
}
```

### Counter Contract Walkthrough

#### No-std Environment

```rust
#![no_std]
```

Miden contracts run in a `no_std` environment, meaning they don't link against Rust's standard library. This is essential for blockchain execution where contracts need to be deterministic and lightweight.

The global allocator and panic handler are required boilerplate for `no_std` environments:

```rust
#[global_allocator]
static ALLOC: miden::BumpAlloc = miden::BumpAlloc::new();

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
```

#### Miden Library Imports

```rust
use miden::{component, felt, Felt, StorageMap, StorageMapAccess, Word};
use crate::bindings::exports::miden::counter_contract::counter::Guest;
```

These imports provide:

- **`component`**: Macro for defining contract components
- **`Felt`/`Word`**: Miden's native field element and word types
- **`StorageMap`**: Key-value storage within account storage slots
- **`Guest`**: The interface trait this contract implements

#### Contract Structure Definition

```rust
#[component]
struct CounterContract {
    #[storage(slot(0), description = "counter contract storage map")]
    count_map: StorageMap,
}
```

The `#[component]` attribute marks this as a Miden component. The `count_map` field is a `StorageMap` that will be stored in storage slot 0 of the account.

**Important**: Storage slots in Miden hold `Word` values, which are composed of four field elements (`Felt`). Each `Felt` is a 64-bit unsigned integer (u64). The `StorageMap` provides a key-value interface within a single storage slot, allowing you to store multiple key-value pairs within the four-element word structure.

#### Guest Implementation

```rust
impl Guest for CounterContract {
    // Function implementations...
}
```

The `Guest` trait defines the external interface that other contracts and notes can call. This is the contract's public API.

#### Storage Key Strategy

```rust
let key = Word::from([felt!(0), felt!(0), felt!(0), felt!(1)]);
```

Both functions use the same fixed key `[0, 0, 0, 1]` to store and retrieve the counter value within the storage map. This demonstrates a simple but effective storage pattern.

## Understanding the Increment Note Script

Now let's examine the increment note script at `contracts/increment-note/src/lib.rs`:

```rust title="contracts/increment-note/src/lib.rs"
// Do not link against libstd (i.e. anything defined in `std::`)
#![no_std]

// Global allocator to use heap memory in no-std environment
#[global_allocator]
static ALLOC: miden::BumpAlloc = miden::BumpAlloc::new();

// Required for no-std crates
#[cfg(not(test))]
#[panic_handler]
fn my_panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

use miden::*;

use crate::bindings::miden::counter_contract::counter;

#[note_script]
fn run(_arg: Word) {
    let initial_value = counter::get_count();
    counter::increment_count();
    let expected_value = initial_value + Felt::from_u32(1);
    let final_value = counter::get_count();
    assert_eq(final_value, expected_value);
}
```

### Increment Note Script Walkthrough

#### No-std Setup

Similar to the account contract, the note script uses `#![no_std]` with the same allocator and panic handler setup.

#### Miden Imports

```rust
use miden::*;
use crate::bindings::miden::counter_contract::counter;
```

The wildcard import brings in all Miden note script functionality. The `counter` binding imports the interface functions from the counter contract, allowing the note script to call them.

#### No Struct Definition

Unlike account contracts, note scripts don't define a struct. They are purely functional code that gets executed when a note is consumed. The script defines **what happens** when the note is processed, not a persistent data structure.

Learn more about [note scripts in the Miden documentation](http://docs.miden.xyz/miden-base/note/).

#### The Note Script Function

```rust
#[note_script]
fn run(_arg: Word) {
    let initial_value = counter::get_count();
    counter::increment_count();
    let expected_value = initial_value + Felt::from_u32(1);
    let final_value = counter::get_count();
    assert_eq(final_value, expected_value);
}
```

The `#[note_script]` attribute marks this function as the entry point for note execution. The function:

1. **Gets the initial counter value** using the imported `counter::get_count()` function
2. **Calls increment_count()** to increment the counter on the target account
3. **Verifies the operation succeeded** by checking the final value matches expectations

This demonstrates how note scripts interact with account contracts through their public interfaces, calling functions defined in the `Guest` implementation.

The counter example demonstrates a complete interaction pattern: the account contract manages persistent state, while the note script provides a mechanism to trigger state changes through note consumption.

## Next Steps

Now that you understand the contract code structure, let's move on to [deploying your contract](./deploy) and learn how the integration folder enables interaction with your contracts on the Miden network.

---
