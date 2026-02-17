---
title: "Note Types"
sidebar_position: 2
description: "Built-in note types: P2ID, P2IDE (with expiration), and SWAP (atomic exchange)."
---

# Note Types

Miden provides built-in note patterns for common asset transfer scenarios. These are protocol primitives you can use directly or extend for custom behavior.

:::note
All note script crates require `#![no_std]` and `#![feature(alloc_error_handler)]` at the crate root. These are omitted from code examples below for brevity.
:::

## P2ID (Pay to ID)

The most common pattern — a note that can only be consumed by a specific account. The note script checks that the consuming account's ID matches the target, then transfers all assets.

### When to use

Use P2ID for standard asset transfers where only the intended recipient should be able to consume the note. This is the most common note type.

### How it works

1. Creator creates a P2ID note containing the assets and the target account ID as a note input
2. Consumer's transaction processes the note — the script verifies the consuming account's ID matches the target
3. If the IDs match, all assets transfer to the consuming account; otherwise proof generation fails

### Note inputs

| Input | Type | Description |
|-------|------|-------------|
| `target_account_id` | `AccountId` | The account allowed to consume this note |

### Implementation

```rust title="p2id-note/src/lib.rs"
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

- `self.target_account_id` is populated from note inputs (the `#[note]` macro handles this)
- `account: &mut Account` is the consuming account — its type comes from WIT bindings
- `account.receive_asset()` calls the wallet component's method via [cross-component calls](../transactions/cross-component-calls)
- If `assert_eq!` fails, proof generation fails and the note cannot be consumed

### Cargo.toml

```toml title="p2id-note/Cargo.toml"
[package]
name = "p2id"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = "0.10"

[package.metadata.component]
package = "miden:p2id"

[package.metadata.miden]
project-kind = "note-script"

# Declare the account component this note interacts with
[package.metadata.miden.dependencies]
"miden:basic-wallet" = { path = "../basic-wallet" }

[package.metadata.component.target.dependencies]
"miden:basic-wallet" = { path = "../basic-wallet/target/generated-wit/" }
```

## P2IDE (Pay to ID with Expiration)

P2IDE extends P2ID with a timelock and a reclaim window. The note can't be consumed before `timelock_height`, and if the target hasn't consumed it by `reclaim_height`, the creator can reclaim the assets.

### When to use

Use P2IDE when the sender wants the option to reclaim assets if the recipient doesn't consume the note within a time window.

### How it works

1. Creator creates a P2IDE note with the target account ID, a timelock height, and a reclaim height as note inputs
2. **Target consumes after `timelock_height`** — assets transfer to the target account
3. **Creator reclaims after `reclaim_height`** — assets return to the creator
4. **Before timelock or between timelock and reclaim by a non-target** — any consumption attempt fails (proof generation fails)

### Note inputs

| Input | Type | Description |
|-------|------|-------------|
| `target_account_id_prefix` | `Felt` | Target account ID prefix |
| `target_account_id_suffix` | `Felt` | Target account ID suffix |
| `timelock_height` | `Felt` | Block height before which the note can't be consumed |
| `reclaim_height` | `Felt` | Block height after which the creator can reclaim |

### Implementation

```rust title="p2ide-note/src/lib.rs"
use miden::*;

use crate::bindings::Account;

fn consume_assets(account: &mut Account) {
    let assets = active_note::get_assets();
    for asset in assets {
        account.receive_asset(asset);
    }
}

fn reclaim_assets(account: &mut Account, consuming_account: AccountId) {
    let creator_account = active_note::get_sender();

    if consuming_account == creator_account {
        consume_assets(account);
    } else {
        panic!();
    }
}

#[note]
struct P2ideNote;

#[note]
impl P2ideNote {
    #[note_script]
    pub fn run(self, _arg: Word, account: &mut Account) {
        let inputs = active_note::get_inputs();

        // make sure the number of inputs is 4
        assert_eq((inputs.len() as u32).into(), felt!(4));

        let target_account_id_prefix = inputs[0];
        let target_account_id_suffix = inputs[1];

        let timelock_height = inputs[2];
        let reclaim_height = inputs[3];

        // get block number
        let block_number = tx::get_block_number();
        assert!(block_number >= timelock_height);

        // get consuming account id
        let consuming_account_id = account.get_id();

        // target account id
        let target_account_id = AccountId::new(target_account_id_prefix, target_account_id_suffix);

        let is_target = target_account_id == consuming_account_id;
        if is_target {
            consume_assets(account);
        } else {
            assert!(reclaim_height >= block_number);
            reclaim_assets(account, consuming_account_id);
        }
    }
}
```

### Cargo.toml

```toml title="p2ide-note/Cargo.toml"
[package]
name = "p2ide"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = "0.10"

[package.metadata.component]
package = "miden:p2ide"

[package.metadata.miden]
project-kind = "note-script"

[package.metadata.miden.dependencies]
"miden:basic-wallet" = { path = "../basic-wallet" }

[package.metadata.component.target.dependencies]
"miden:basic-wallet" = { path = "../basic-wallet/target/generated-wit/" }
```

## SWAP (Atomic Exchange)

SWAP enables atomic asset exchange. The creator offers one asset; any consumer who provides the requested asset in return can consume the note. The swap is atomic — both sides happen in a single transaction or neither does.

### When to use

Use SWAP for trustless atomic exchanges where two parties trade assets without intermediaries.

### How it works

1. Creator creates a SWAP note containing the offered asset and metadata describing the requested asset + payback recipient
2. Consumer's transaction processes the note — the script creates a P2ID payback note targeted at the original creator containing the requested asset
3. Consumer receives the offered asset into their vault
4. Both transfers happen atomically in one transaction

:::info
SWAP notes use `SwapNote` from the `miden-standards` crate. The note script itself is written in MASM and compiled into the standards library. You don't write the script in Rust — you use the builder to create SWAP notes in client code.
:::

### Implementation

```rust
SwapNote::create(
    sender,                  // AccountId: who receives the payback
    offered_asset,           // Asset: what the note carries
    requested_asset,         // Asset: what the consumer must provide
    swap_note_type,          // NoteType: public or private
    swap_note_attachment,    // NoteAttachment: auxiliary data for the SWAP note
    payback_note_type,       // NoteType: for the P2ID payback
    payback_note_attachment, // NoteAttachment: auxiliary data for the payback note
    rng,                     // &mut impl FeltRng
) -> Result<(Note, NoteDetails), NoteError>
```

Returns a tuple of `(Note, NoteDetails)` — the SWAP note to submit and the expected payback note details (for tracking).

`NoteAttachment` is defined in the `miden-standards` crate (not the core `miden` SDK). It wraps the attachment data that gets set on output notes — see [note attachments](./output-notes#note-attachments) for the underlying SDK API.

## More note types

For writing custom note scripts, see [Note Scripts](./note-scripts). For the transaction context and `#[tx_script]`, see [Transaction Context](../transactions/transaction-context). For common patterns, see [Patterns & Security](../patterns).
