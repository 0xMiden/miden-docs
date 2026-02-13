---
sidebar_position: 3
title: "Note Changes"
description: "Note attachments, tags, network accounts, and input notes API changes"
---

# Note Changes

:::warning Breaking Change
The note system has been redesigned. `NoteMetadata` no longer stores `aux` or `NoteExecutionHint` — use `NoteAttachment` instead.
:::

## Quick Fix

```rust title="src/note.rs"
// Before
let metadata = NoteMetadata::new(sender, note_type, tag, execution_hint, aux)?;

// After
let attachment_word = Word::from([aux, execution_hint.into(), felt!(0), felt!(0)]);
let attachment = NoteAttachment::new_word(NoteAttachmentScheme::none(), attachment_word);
let metadata = NoteMetadata::new(sender, note_type)
    .with_tag(tag)
    .with_attachment(attachment);
let note = Note::new(assets, metadata, recipient);
```

---

## Note Attachments

`NoteMetadata` no longer stores `aux` or `NoteExecutionHint`. Use `NoteAttachment` instead.

```diff title="src/note.rs"
- // Before: aux and hints in metadata
- let metadata = NoteMetadata::new(
-     sender,
-     note_type,
-     tag,
-     execution_hint,         // No longer here
-     aux,                    // No longer here
- )?;

+ // After: use attachments
+ let attachment_word = Word::from([aux, execution_hint.into(), felt!(0), felt!(0)]);
+ let attachment = NoteAttachment::new_word(NoteAttachmentScheme::none(), attachment_word);
+ let metadata = NoteMetadata::new(sender, note_type)
+     .with_tag(tag)
+     .with_attachment(attachment);
+ let note = Note::new(assets, metadata, recipient);
```

:::info Good to know
This separation makes note metadata more lightweight and allows attachments to be optional.
:::

---

## Tag Semantics

`NoteTag::from_account_id` was removed. Use `NoteTag::new()` for explicit values and
`NoteTag::with_account_target()` for account targeting:

```diff title="src/note.rs"
- // Before: tag with embedded target
- let tag = NoteTag::from_account_id(target_account);
-
+ // After: use tag constructors
+ let tag = NoteTag::new(12345);
+ let target_tag = NoteTag::with_account_target(target_account);
+ let metadata = metadata.with_tag(target_tag);
```

---

## Network Account Target

Implement `NetworkAccountTarget` attachment for network-account notes:

```rust title="src/network_note.rs"
use miden_protocol::note::NoteAttachment;
use miden_standards::note::NetworkAccountTarget;

let target = NetworkAccountTarget::new(account_id, execution_hint)?;
let attachment = NoteAttachment::from(target);
let metadata = metadata.with_attachment(attachment);
```

---

## MINT Notes

`MintNoteStorage` supports private and public output notes:

```diff title="src/mint.rs"
- // Before
- use miden_lib::note::create_mint_note;
- let mint_note = create_mint_note(
-     faucet_id,
-     sender,
-     recipient_digest,
-     output_note_tag,
-     amount,
-     aux,
-     output_note_aux,
-     rng,
- )?;

+ // After: explicit private/public choice
+ use miden_standards::note::{MintNote, MintNoteStorage};
+ use miden_protocol::note::NoteAttachment;
+
+ // For private output notes
+ let mint_storage = MintNoteStorage::new_private(recipient_digest, amount, output_note_tag);
+
+ // For public output notes
+ let mint_storage = MintNoteStorage::new_public(recipient, amount, output_note_tag)?;
+ let mint_note = MintNote::create(
+     faucet_id,
+     sender,
+     mint_storage,
+     NoteAttachment::default(),
+     rng,
+ )?;
```

:::tip
Choose `MintNoteStorage::new_private` for most use cases. Use `new_public` only when the note
contents should be visible on-chain.
:::

---

## Input Notes API

Unified interface accepts full `Note` objects instead of IDs:

```diff title="src/transaction.rs"
- // Before: separate authenticated/unauthenticated lists
- let tx = TransactionRequestBuilder::new()
-     .with_authenticated_input_notes(auth_note_ids)
-     .with_unauthenticated_input_notes(unauth_note_ids)
-     .build()?;

+ // After: unified input notes
+ let tx = TransactionRequestBuilder::new()
+     .input_notes(notes) // Full Note objects
+     .build()?;
```

---

## FetchedNote Structure

Private notes now carry `NoteHeader`; public notes expose `note` and `inclusionProof`:

```rust title="src/fetch.rs"
match fetched_note {
    FetchedNote::Private(header, _) => {
        // Access header fields
        let note_id = header.id();
    }
    FetchedNote::Public(note, inclusion_proof) => {
        // Access full note and proof
        let inputs = note.inputs();
    }
}
```

---

## Migration Steps

1. Remove `aux` and `execution_hint` from `NoteMetadata` constructors
2. Create `NoteAttachment` objects for aux data and hints
3. Update `NoteTag` usage to `NoteTag::new()` / `NoteTag::with_account_target()`
4. Use `with_account_target()` for targeted notes
5. Implement `NetworkAccountTarget` for network notes
6. Update mint note creation to use `MintNoteStorage`
7. Refactor input notes to pass full `Note` objects
8. Update `FetchedNote` handling for new structure

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `NoteMetadata::new takes 2 arguments` | aux/hint removed | Use `NoteAttachment` |
| `NoteTag::from_account_id not found` | API changed | Use `with_account_target()` |
| `with_authenticated_input_notes not found` | API unified | Use `with_input_notes()` |
