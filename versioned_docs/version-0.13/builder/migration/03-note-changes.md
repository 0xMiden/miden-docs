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
let metadata = NoteMetadata::new(sender, note_type, tag, aux, execution_hint)?;

// After
let metadata = NoteMetadata::new(sender, note_type, tag)?;
let attachment = NoteAttachment::new(aux_data, execution_hint)?;
let note = Note::new(metadata, script, inputs, attachment)?;
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
-     aux,                    // No longer here
-     execution_hint,         // No longer here
- )?;

+ // After: use attachments
+ let metadata = NoteMetadata::new(sender, note_type, tag)?;
+ let attachment = NoteAttachment::new(aux_data, execution_hint)?;
+ let note = Note::new(metadata, script, inputs, attachment)?;
```

:::info Good to know
This separation makes note metadata more lightweight and allows attachments to be optional.
:::

---

## Tag Semantics

`NoteTag` is now a plain `u32`. Use `with_account_target()` for account targeting:

```diff title="src/note.rs"
- // Before: tag with embedded target
- let tag = NoteTag::from_account_id(target_account)?;

+ // After: plain tag with explicit targeting
+ let tag: u32 = 12345;
+ let note = note.with_account_target(target_account)?;
```

---

## Network Account Target

Implement `NetworkAccountTarget` attachment for network-account notes:

```rust title="src/network_note.rs"
use miden_protocol::notes::NetworkAccountTarget;

let target = NetworkAccountTarget::new(account_id, network_id)?;
let note = note.with_attachment(target)?;
```

---

## MINT Notes

New `MintNoteInputs` enum supports private and public output notes:

```diff title="src/mint.rs"
- // Before
- let mint_note = MintNote::new(amount, recipient)?;

+ // After: explicit private/public choice
+ use miden_standards::notes::MintNoteInputs;
+
+ // For private notes
+ let inputs = MintNoteInputs::Private { amount, recipient };
+
+ // For public notes
+ let inputs = MintNoteInputs::Public { amount, recipient, metadata };
```

:::tip
Choose `MintNoteInputs::Private` for most use cases. Use `Public` only when the note contents should be visible on-chain.
:::

---

## Input Notes API

Unified interface accepts full `Note` objects instead of IDs:

```diff title="src/transaction.rs"
- // Before: separate authenticated/unauthenticated lists
- let tx = TransactionRequest::new()
-     .with_authenticated_input_notes(auth_note_ids)
-     .with_unauthenticated_input_notes(unauth_note_ids)?;

+ // After: unified input notes
+ let tx = TransactionRequest::new()
+     .with_input_notes(notes)?;  // Full Note objects
```

---

## FetchedNote Structure

Private notes now carry `NoteHeader`; public notes expose `note` and `inclusionProof`:

```rust title="src/fetch.rs"
match fetched_note {
    FetchedNote::Private { header, .. } => {
        // Access header fields
        let note_id = header.id();
    }
    FetchedNote::Public { note, inclusion_proof } => {
        // Access full note and proof
        let inputs = note.inputs();
    }
}
```

---

## Migration Steps

1. Remove `aux` and `execution_hint` from `NoteMetadata` constructors
2. Create `NoteAttachment` objects for aux data and hints
3. Update `NoteTag` usage to plain `u32` values
4. Use `with_account_target()` for targeted notes
5. Implement `NetworkAccountTarget` for network notes
6. Update mint note creation to use `MintNoteInputs` enum
7. Refactor input notes to pass full `Note` objects
8. Update `FetchedNote` handling for new structure

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `NoteMetadata::new takes 3 arguments` | aux/hint removed | Use `NoteAttachment` |
| `NoteTag::from_account_id not found` | API changed | Use `with_account_target()` |
| `with_authenticated_input_notes not found` | API unified | Use `with_input_notes()` |
