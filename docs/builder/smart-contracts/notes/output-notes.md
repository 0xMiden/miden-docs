---
title: "Output Notes"
sidebar_position: 4
description: "Create output notes, attach assets, set attachments, and compute recipients."
---

# Output Notes

Use the `output_note` module to create notes and attach assets:

```rust
use miden::{output_note, Asset, NoteIdx, Tag, NoteType, Recipient};
```

## Create a note

```rust
let note_idx: NoteIdx = output_note::create(tag, note_type, recipient);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tag` | `Tag` | Routing/filtering tag for the note |
| `note_type` | `NoteType` | Visibility: public or private |
| `recipient` | `Recipient` | Hash identifying who can consume the note |

Returns a `NoteIdx` used to reference this note in subsequent operations.

## Add assets to a note

```rust
output_note::add_asset(asset, note_idx);
```

You can add multiple assets to the same note by calling `add_asset` multiple times with the same `note_idx`.

## Query output note state

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

## Set note attachments

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

## Computing a Recipient

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

:::info API Reference
Full API docs on docs.rs: [`miden::output_note`](https://docs.rs/miden/latest/miden/output_note/)
:::
