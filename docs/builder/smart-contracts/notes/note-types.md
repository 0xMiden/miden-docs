---
title: "Note Types"
sidebar_position: 2
description: "Built-in note types like P2ID (Pay to ID) for common asset transfer patterns."
---

# Note Types

Miden provides built-in note patterns for common asset transfer scenarios. These are protocol primitives you can use directly or extend for custom behavior.

## P2ID (Pay to ID)

The most common pattern — a note that can only be consumed by a specific account. The note script checks that the consuming account's ID matches the target, then transfers all assets.

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
- `account.receive_asset()` calls the wallet component's method via [cross-component calls](../transactions/cross-component-calls)
- If `assert_eq!` fails, proof generation fails and the note cannot be consumed

```toml title="p2id-note/Cargo.toml"
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

# Declare the account component this note interacts with
[package.metadata.miden.dependencies]
"miden:basic-wallet" = { path = "../basic-wallet" }

[package.metadata.component.target.dependencies]
"miden:basic-wallet" = { path = "../basic-wallet/target/generated-wit/" }
```

## More note types

Additional note types (SWAPP, P2IDR, and others) will be documented as the protocol matures.

For writing custom note scripts, see [Note Scripts](./note-scripts). For the transaction context and `#[tx_script]`, see [Transaction Context](../transactions/transaction-context). For common patterns, see [Patterns & Security](../patterns).
