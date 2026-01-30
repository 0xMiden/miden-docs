---
sidebar_position: 7
title: "Part 7: Creating Output Notes"
description: "Learn how to create output notes programmatically within account methods, including the P2ID (Pay-to-ID) note pattern for sending assets."
---

# Part 7: Creating Output Notes

In this section, you'll learn how to create output notes from within account methods. We'll implement the withdrawal logic that creates P2ID (Pay-to-ID) notes to send assets back to depositors.

## What You'll Learn

- Computing note recipients with `Recipient::compute()`
- Creating output notes with `output_note::create()`
- Adding assets to output notes with `output_note::add_asset()`
- The P2ID note pattern and script root digest
- Note tags, types, and execution hints

## Output Notes Overview

When an account needs to send assets to another account, it creates an **output note**. The note travels through the network until the recipient consumes it.

```text
WITHDRAW FLOW:
┌────────────────┐          ┌────────────────┐          ┌────────────────┐
│ Bank Account   │ creates  │ P2ID Note      │ consumed │ Depositor      │
│                │ ────────▶│ (with assets)  │ ────────▶│ Wallet         │
│ remove_asset() │          │                │          │ receives asset │
└────────────────┘          └────────────────┘          └────────────────┘
```

## The P2ID Note Pattern

P2ID (Pay-to-ID) is a standard note pattern in Miden that sends assets to a specific account. Key properties:

- **Target account**: Only one account can consume the note
- **Asset transfer**: Assets are transferred on consumption
- **Standard script**: Uses a well-known script from miden-lib

Our bank uses P2ID notes for withdrawals.

## Step 1: P2ID Script Root

P2ID notes use a standard script from miden-lib. We need its MAST root (digest):

```rust title="contracts/bank-account/src/lib.rs"
/// Returns the P2ID note script root digest.
///
/// This is a constant value derived from the standard P2ID note script in miden-lib.
/// The digest is the MAST root of the compiled P2ID note script.
fn p2id_note_root() -> Digest {
    Digest::from_word(Word::new([
        Felt::from_u64_unchecked(15783632360113277539),
        Felt::from_u64_unchecked(7403765918285273520),
        Felt::from_u64_unchecked(15691985194755641846),
        Felt::from_u64_unchecked(10399643920503194563),
    ]))
}
```

:::warning Version-Specific
This digest is specific to miden-lib version. If the P2ID script changes in a future version, this digest must be updated.
:::

## Step 2: Computing the Recipient

The recipient is a cryptographic commitment that identifies who can consume the note:

```rust title="contracts/bank-account/src/lib.rs"
let recipient = Recipient::compute(
    serial_num,     // Unique identifier for this note
    script_root,    // P2ID script MAST root
    vec![           // Inputs to the P2ID script
        recipient_id.suffix,
        recipient_id.prefix,
        felt!(0),
        felt!(0),
        felt!(0),
        felt!(0),
        felt!(0),
        felt!(0),
    ],
);
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| `serial_num` | Unique 4-Felt value preventing note reuse |
| `script_root` | The note script's MAST root digest |
| `inputs` | Script inputs (account ID for P2ID) |

### P2ID Input Layout

The P2ID script expects inputs in this order:

```text
P2ID Inputs: [suffix, prefix, 0, 0, 0, 0, 0, 0]
              ━━━━━━  ━━━━━━  ━━━━━━━━━━━━━━━━━
               Account ID      Padding to 8 elements
```

:::warning Array Ordering
Note the order: `suffix` comes before `prefix`. This is the opposite of how `AccountId` fields are typically accessed. See [Common Pitfalls](../../pitfalls#array-ordering-rustmasm-reversal) for more details.
:::

## Step 3: Creating the Output Note

Use `output_note::create()` to create the note:

```rust title="contracts/bank-account/src/lib.rs"
let note_idx = output_note::create(tag, aux, note_type, execution_hint, recipient);
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tag` | `Tag` | Routing information for the note |
| `aux` | `Felt` | Auxiliary data (application-specific) |
| `note_type` | `NoteType` | Public (on-chain) or Private (off-chain) |
| `execution_hint` | `Felt` | When the note should execute |
| `recipient` | `Recipient` | Who can consume the note |

### Note Tags

Tags help route notes to the correct recipient. For P2ID notes:

```rust
// Convert Felt to Tag
let tag = Tag::from(tag_felt);
```

Tags are computed from the recipient's account ID. See the test code for tag computation logic.

### Note Types

| Value | Type | Description |
|-------|------|-------------|
| 1 | Public | Full note data stored on-chain |
| 2 | Private | Only commitment stored on-chain |

```rust
let note_type = NoteType::from(Felt::from_u32(1)); // Public
```

### Execution Hints

Hints suggest when the note should be consumed:

```rust
let execution_hint = felt!(0); // "Always" - standard P2ID behavior
```

## Step 4: Adding Assets

After creating the note, add assets to it:

```rust title="contracts/bank-account/src/lib.rs"
// Remove the asset from the bank's vault
native_account::remove_asset(asset.clone());

// Add the asset to the output note
output_note::add_asset(asset.clone(), note_idx);
```

The `note_idx` returned by `create()` identifies which note to add assets to.

:::info Order Matters
Remove assets from the vault **before** adding them to the output note. The asset must be in your vault to remove it.
:::

## Complete Implementation

Here's the full `create_p2id_note` function:

```rust title="contracts/bank-account/src/lib.rs"
fn create_p2id_note(
    &mut self,
    serial_num: Word,
    asset: &Asset,
    recipient_id: AccountId,
    tag: Felt,
    aux: Felt,
    note_type: Felt,
) {
    // Convert the passed tag Felt to a Tag
    let tag = Tag::from(tag);

    // Convert note_type Felt to NoteType
    let note_type = NoteType::from(note_type);

    // Execution hint: always (standard P2ID behavior)
    let execution_hint = felt!(0);

    // Get the P2ID note script root digest
    let script_root = Self::p2id_note_root();

    // Compute the recipient hash
    let recipient = Recipient::compute(
        serial_num,
        script_root,
        vec![
            recipient_id.suffix,
            recipient_id.prefix,
            felt!(0),
            felt!(0),
            felt!(0),
            felt!(0),
            felt!(0),
            felt!(0),
        ],
    );

    // Create the output note
    let note_idx = output_note::create(tag, aux, note_type, execution_hint, recipient);

    // Remove the asset from the bank's vault
    native_account::remove_asset(asset.clone());

    // Add the asset to the output note
    output_note::add_asset(asset.clone(), note_idx);
}
```

## Computing P2ID Tags

For proper routing, P2ID notes need tags computed from the recipient account ID. Here's the pattern from test code:

```rust title="Example: Tag computation"
const LOCAL_ANY_PREFIX: u32 = 0xC000_0000;
const TAG_BITS: u8 = 14;

fn compute_p2id_tag_for_local_account(account_id: AccountId) -> u32 {
    let prefix_u64 = account_id.prefix().as_u64();

    // Right shift by 34 to get top 30 bits
    let shifted = (prefix_u64 >> 34) as u32;

    // Mask to keep only top TAG_BITS bits
    let mask = u32::MAX << (30 - TAG_BITS);
    let account_bits = shifted & mask;

    // Combine with LocalAny prefix
    LOCAL_ANY_PREFIX | account_bits
}
```

This creates a `LocalAny` tag that routes to the specific account.

## Verifying Output Notes in Tests

When testing, verify the output note matches expectations:

```rust title="integration/tests/withdraw_test.rs"
use miden_lib::note::utils::build_p2id_recipient;

// Build expected recipient using miden-lib helper
let recipient = build_p2id_recipient(sender.id(), serial_num)?;

// Create expected note
let p2id_output_note = Note::new(
    p2id_output_note_assets,
    p2id_output_note_metadata,
    recipient,
);

// Tell the transaction context to expect this output
let withdraw_request_tx_context = mock_chain
    .build_tx_context(bank_account.id(), &[withdraw_request_note.id()], &[])?
    .extend_expected_output_notes(vec![OutputNote::Full(p2id_output_note.into())])
    .build()?;
```

## Key Takeaways

1. **`Recipient::compute()`** creates a cryptographic commitment from serial number, script root, and inputs
2. **`output_note::create()`** creates the note with tag, type, and recipient
3. **`output_note::add_asset()`** attaches assets to the created note
4. **P2ID pattern** uses a standard script with account ID as input
5. **Serial numbers** must be unique to prevent note replay
6. **Array ordering** - P2ID expects `[suffix, prefix, ...]` not `[prefix, suffix, ...]`

:::tip View Complete Source
See the complete P2ID note creation implementation in the [miden-bank repository](https://github.com/keinberger/miden-bank/blob/main/contracts/bank-account/src/lib.rs).
:::

## Next Steps

Now that you understand all the pieces, let's see how they work together in [Part 8: Complete Flows](./complete-flows).
