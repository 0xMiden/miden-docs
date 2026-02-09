---
title: "Notes"
sidebar_position: 8
description: "Create output notes for asset transfers and read input notes during consumption."
---

# Notes

Notes are Miden's mechanism for transferring assets between accounts. They work like programmable UTXOs — each note carries assets and a script that determines who can consume it and what happens when they do.

## What you'll learn

- Creating output notes with `output_note`
- Reading input note data with `active_note` and `input_note`
- The P2ID (Pay to ID) pattern
- Note lifecycle and asset flow

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
| `note_type` | `NoteType` | Visibility: public, private, or encrypted |
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
// Set an attachment with raw data
output_note::set_attachment(note_idx, attachment_scheme, payload_data);

// Set a Word-sized attachment
output_note::set_word_attachment(note_idx, attachment_scheme, word_data);

// Set an array-sized attachment
output_note::set_array_attachment(note_idx, attachment_scheme, word_data);
```

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

## Example: P2ID (Pay to ID)

The most common pattern — a note that can only be consumed by a specific account:

```rust title="src/lib.rs"
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
        // Verify the consuming account matches the target
        let current_account = account.get_id();
        assert_eq!(current_account, self.target_account_id);

        // Transfer all assets to the consuming account
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

See [Note Scripts](./note-scripts) for full details on the `#[note]` and `#[note_script]` macros.

## Next steps

- [Note Scripts](./note-scripts) — Write note scripts with `#[note]` and `#[note_script]`
- [Cross-Component Calls](./cross-component-calls) — How `account.receive_asset()` works
- [Transaction Context](./transaction-context) — Transaction scripts and block queries
