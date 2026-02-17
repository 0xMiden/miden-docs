---
title: "Reading Notes"
sidebar_position: 3
description: "Read the active note's data and access input notes by index during transactions."
---

# Reading Notes

Miden provides two modules for reading note data during transactions: `active_note` for the currently executing note, and `input_note` for querying specific input notes by index.

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

:::info API Reference
Full API docs on docs.rs: [`miden::active_note`](https://docs.rs/miden/latest/miden/active_note/), [`miden::input_note`](https://docs.rs/miden/latest/miden/input_note/)
:::
