---
title: "Notes"
sidebar_position: 1
description: "Create output notes, read input notes, and write note scripts for asset transfers."
---

# Notes

Notes are Miden's mechanism for transferring assets between accounts. They work like programmable UTXOs — each note carries assets and a script that determines who can consume it and what happens when they do. Assets can't transfer directly between accounts; they must move through notes, which ensures privacy (the network doesn't see account-to-account links) and enables programmable conditions on transfers.

## Note lifecycle

```
1. Creator account calls output_note::create() → NoteIdx
2. Creator adds assets with output_note::add_asset()
3. Note exists on-chain (or privately)
4. Consumer account processes the note in a transaction
5. Note script runs, assets transfer to consumer
```

## Creating output notes

Use the `output_note` module to create notes and attach assets:

```rust
use miden::{output_note, Asset, NoteIdx, Tag, NoteType, Recipient};
```

### Create a note

```rust
let note_idx: NoteIdx = output_note::create(tag, note_type, recipient);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tag` | `Tag` | Routing/filtering tag for the note |
| `note_type` | `NoteType` | Visibility: public or private |
| `recipient` | `Recipient` | Hash identifying who can consume the note |

Returns a `NoteIdx` used to reference this note in subsequent operations.

### Add assets to a note

```rust
output_note::add_asset(asset, note_idx);
```

You can add multiple assets to the same note by calling `add_asset` multiple times with the same `note_idx`.

### Query output note state

```rust
// Get assets info (commitment and count)
let info: OutputNoteAssetsInfo = output_note::get_assets_info(note_idx);

// Get all assets on the note
let assets: Vec<Asset> = output_note::get_assets(note_idx);

// Get the recipient
let recipient: Recipient = output_note::get_recipient(note_idx);

// Get note metadata
let metadata: Word = output_note::get_metadata(note_idx);
```

### Set note attachments

Notes can carry additional data as attachments:

```rust
// Set an attachment with an explicit kind (None/Word/Array) and Word payload
output_note::set_attachment(note_idx, attachment_scheme, attachment_kind, attachment_word);

// Set a Word-sized attachment (convenience)
output_note::set_word_attachment(note_idx, attachment_scheme, word_data);

// Set an array-sized attachment (commitment to advice map values)
output_note::set_array_attachment(note_idx, attachment_scheme, commitment_word);
```

`set_array_attachment` stores a commitment to array data. The advice map must contain the
corresponding elements committed to by `commitment_word`.

### Computing a Recipient

The `Recipient` is a hash that encodes who can consume a note:

```rust
use miden::{Recipient, Digest};

let recipient = Recipient::compute(
    serial_num,       // Word: unique serial number
    script_digest,    // Digest: hash of the note script
    inputs,           // Vec<Felt>: note inputs (e.g., target account ID)
);
```

The computation is: `hash(hash(hash(serial_num, [0;4]), script_root), inputs_commitment)`.

## Reading the active note

When a note script executes, it can access the current note's data via `active_note`:

```rust
use miden::active_note;
```

### Get note inputs

Note inputs are custom `Felt` values set by the note creator:

```rust
let inputs: Vec<Felt> = active_note::get_inputs();
```

### Get note assets

```rust
let assets: Vec<Asset> = active_note::get_assets();
```

### Get note metadata

```rust
// Who sent this note
let sender: AccountId = active_note::get_sender();

// The note's recipient hash
let recipient: Recipient = active_note::get_recipient();

// The note's script root
let script_root: Word = active_note::get_script_root();

// The note's serial number
let serial_num: Word = active_note::get_serial_number();

// Raw metadata word
let metadata: Word = active_note::get_metadata();
```

### Transfer all assets to the consuming account

A convenience function that adds all note assets to the consuming account:

```rust
active_note::add_assets_to_account();
```

## Reading input notes by index

For transaction scripts that need to inspect specific input notes:

```rust
use miden::input_note;

// Get assets info for a specific input note
let info = input_note::get_assets_info(note_idx);

// Get all assets from a specific input note
let assets: Vec<Asset> = input_note::get_assets(note_idx);

// Get sender, recipient, metadata, inputs, script root, serial number
let sender: AccountId = input_note::get_sender(note_idx);
let recipient: Recipient = input_note::get_recipient(note_idx);
let metadata: Word = input_note::get_metadata(note_idx);
let inputs_info = input_note::get_inputs_info(note_idx);
let script_root: Word = input_note::get_script_root(note_idx);
let serial_num: Word = input_note::get_serial_number(note_idx);
```

## Note scripts

When a note is consumed, its script executes to determine what happens to the assets. The script defines the consumption rules — who can consume the note and what state changes occur. You write note scripts using the `#[note]` and `#[note_script]` macros.

### The `#[note]` pattern

A note script consists of a struct (holding note inputs) and an impl block with a `#[note_script]` method:

```rust
use miden::{AccountId, Word, active_note, note};

#[note]
struct P2idNote {
    target_account_id: AccountId,
}

#[note]
impl P2idNote {
    #[note_script]
    pub fn run(self, _arg: Word, account: &mut Account) {
        // Script logic here
    }
}
```

The `#[note]` macro:
1. Generates the WIT note-script interface
2. Deserializes note inputs into struct fields
3. Exports the `run` function as the note's entry point

### Struct fields as note inputs

Fields on the `#[note]` struct are populated from the note's input data when the note is consumed:

```rust
#[note]
struct MyNote {
    target_account_id: AccountId,  // Deserialized from note inputs
}
```

The compiler maps struct fields to note inputs based on their order and type. Supported field types include `AccountId`, `Felt`, `Word`, and other SDK types.

If you don't need inputs, use a unit struct:

```rust
#[note]
struct CounterNote;
```

### `#[note_script]` method requirements

The `#[note_script]` method has specific signature constraints:

| Constraint | Details |
|------------|---------|
| Receiver | `self` (by value only — not `&self` or `&mut self`) |
| Return type | `()` |
| Required arg | One `Word` argument (the note script argument) |
| Optional arg | `&Account` or `&mut Account` (the consuming account) |
| Generics | Not allowed |
| Async | Not allowed |

### Parameter ordering

The `Word` and `&mut Account` parameters can appear in either order:

```rust
// Both are valid:
pub fn run(self, _arg: Word, account: &mut Account) { ... }
pub fn run(self, account: &mut Account, _arg: Word) { ... }
```

### With account access

When you include `&mut Account` (or `&Account`), the note script can call methods on the consuming account's components:

```rust
#[note_script]
pub fn run(self, _arg: Word, account: &mut Account) {
    let assets = active_note::get_assets();
    for asset in assets {
        account.receive_asset(asset);  // Cross-component call
    }
}
```

The `Account` type comes from WIT bindings of the account component — see [Cross-Component Calls](./cross-component-calls).

### Without account access

If the note script doesn't need to interact with the account:

```rust
#[note_script]
pub fn run(self, _arg: Word) {
    // Can still read note data via active_note
    let assets = active_note::get_assets();
    // But cannot call account methods
}
```

## Example: P2ID (Pay to ID)

The most common pattern — a note that can only be consumed by a specific account:

```rust title="p2id-note/src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

use miden::{AccountId, Word, active_note, note};

use crate::bindings::Account;

#[note]
struct P2idNote {
    target_account_id: AccountId,
}

#[note]
impl P2idNote {
    #[note_script]
    pub fn run(self, _arg: Word, account: &mut Account) {
        let current_account = account.get_id();
        assert_eq!(current_account, self.target_account_id);

        let assets = active_note::get_assets();
        for asset in assets {
            account.receive_asset(asset);
        }
    }
}
```

Key points:

- `self.target_account_id` is populated from note inputs (the `#[note]` macro handles this)
- `account: &mut Account` is the consuming account — its type comes from WIT bindings
- `account.receive_asset()` calls the wallet component's method via cross-component calls
- If `assert_eq!` fails, proof generation fails and the note cannot be consumed

## Example: Counter note (cross-component calls)

A note that calls methods on the consuming account's component:

```rust title="counter-note/src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

use miden::*;

use crate::bindings::miden::counter_contract::counter_contract;

#[note]
struct CounterNote;

#[note]
impl CounterNote {
    #[note_script]
    pub fn run(self, _arg: Word) {
        let initial_value = counter_contract::get_count();
        counter_contract::increment_count();
        let expected_value = initial_value + Felt::from_u32(1);
        let final_value = counter_contract::get_count();
        assert_eq(final_value, expected_value);
    }
}
```

This note doesn't take `&mut Account` — instead it calls the counter contract's methods directly through generated bindings. See [Cross-Component Calls](./cross-component-calls).

## Cargo.toml for note scripts

Note scripts require `project-kind = "note-script"` and must declare dependencies on any account components they interact with:

```toml
[package]
name = "p2id"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = { path = "../../sdk/sdk" }

[package.metadata.component]
package = "miden:p2id"

[package.metadata.miden]
project-kind = "note-script"

# Miden dependencies — account components this note calls
[package.metadata.miden.dependencies]
"miden:basic-wallet" = { path = "../basic-wallet" }

# WIT dependencies — generated interfaces for cross-component calls
[package.metadata.component.target.dependencies]
"miden:basic-wallet" = { path = "../basic-wallet/target/generated-wit/" }
```

For standalone transaction entry points that orchestrate multiple operations, see [Transaction Context](./transaction-context) and the `#[tx_script]` macro. For common note patterns like P2ID variations, see [Patterns & Security](../patterns).

:::info API Reference
Full API docs on docs.rs: [`miden::active_note`](https://docs.rs/miden/latest/miden/active_note/), [`miden::output_note`](https://docs.rs/miden/latest/miden/output_note/), [`miden::input_note`](https://docs.rs/miden/latest/miden/input_note/)
:::
