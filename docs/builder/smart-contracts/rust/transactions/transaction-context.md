---
title: "Transaction Context"
sidebar_position: 2
description: "Transaction scripts, block queries, and expiration management with the tx module and #[tx_script] macro."
---

# Transaction Context

A Miden transaction is a local operation that consumes zero or more input notes and produces state changes plus output notes for a single account. The transaction executes entirely on the client — the VM runs the code, generates a ZK proof, and only the proof is submitted to the network. The `tx` module provides access to block information, note commitments, and expiration controls. Transaction scripts (`#[tx_script]`) serve as standalone entry points that orchestrate the transaction.

## The `tx` module

```rust
use miden::tx;
```

### Block information

```rust
// Current block number
let block_num: Felt = tx::get_block_number();

// Block commitment (hash of block header)
let commitment: Word = tx::get_block_commitment();

// Block timestamp (seconds since epoch)
let timestamp: Felt = tx::get_block_timestamp();
```

### Note commitments

```rust
// Commitment over all input notes in this transaction
let input_commit: Word = tx::get_input_notes_commitment();

// Commitment over all output notes in this transaction
let output_commit: Word = tx::get_output_notes_commitment();

// Number of input/output notes
let num_inputs: Felt = tx::get_num_input_notes();
let num_outputs: Felt = tx::get_num_output_notes();
```

### Transaction expiration

Control how long a transaction remains valid:

```rust
// Get current expiration delta (in blocks)
let delta: Felt = tx::get_expiration_block_delta();

// Set a new expiration delta
tx::update_expiration_block_delta(felt!(100));
```

The expiration delta determines how many blocks after creation the transaction remains valid. If the transaction isn't included within this window, it expires.

## The `#[tx_script]` macro

Transaction scripts are standalone functions that run in a transaction context. They can call account methods and process notes.

```rust
use miden::tx_script;

#[tx_script]
fn initialize_bank(arg: Word) {
    // Transaction script logic
}
```

The `#[tx_script]` macro:
- Exports the function via the `miden:base/transaction-script@1.0.0` WIT interface
- The function receives a `Word` argument
- Returns `()`

### Cargo.toml for transaction scripts

```toml
[package.metadata.miden]
project-kind = "tx-script"
```

## Time-based patterns

### Block-based cooldowns

```rust
const COOLDOWN_BLOCKS: u64 = 100;

pub fn rate_limited_action(&mut self) {
    let state: Word = self.last_action.read();
    let last_block = state[0].as_u64();
    let current_block = tx::get_block_number().as_u64();

    let elapsed = current_block.saturating_sub(last_block);
    assert!(elapsed >= COOLDOWN_BLOCKS);

    // Update last action block
    self.last_action.write(Word::from([
        tx::get_block_number(),
        felt!(0), felt!(0), felt!(0),
    ]));
}
```

### Expiration windows

```rust
pub fn time_locked_withdraw(&mut self, asset: Asset, note_idx: NoteIdx) {
    let config: Word = self.config.read();
    let unlock_block = config[0].as_u64();
    let current_block = tx::get_block_number().as_u64();

    // Can only withdraw after the unlock block
    assert!(current_block >= unlock_block);

    let removed = self.remove_asset(asset);
    output_note::add_asset(removed, note_idx);
}
```

### Daily reset pattern

```rust
const BLOCKS_PER_DAY: u64 = 28800;  // ~3 second blocks

pub fn daily_limited_action(&mut self, amount: u64) {
    let state: Word = self.state.read();
    let daily_spent = state[0].as_u64();
    let last_reset = state[1].as_u64();

    let current_block = tx::get_block_number().as_u64();
    let blocks_since_reset = current_block.saturating_sub(last_reset);

    // Reset daily counter if a day has passed
    let effective_spent = if blocks_since_reset >= BLOCKS_PER_DAY {
        0
    } else {
        daily_spent
    };

    let daily_max = 1_000_000u64;
    assert!(effective_spent + amount <= daily_max);

    // Update state
    let new_reset = if blocks_since_reset >= BLOCKS_PER_DAY {
        tx::get_block_number()
    } else {
        Felt::from_u64_unchecked(last_reset)
    };

    self.state.write(Word::from([
        Felt::from_u64_unchecked(effective_spent + amount),
        new_reset,
        felt!(0), felt!(0),
    ]));
}
```

## Complete `tx` module reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_block_number` | `fn() -> Felt` | Current block number |
| `get_block_commitment` | `fn() -> Word` | Block header commitment |
| `get_block_timestamp` | `fn() -> Felt` | Block timestamp (seconds) |
| `get_input_notes_commitment` | `fn() -> Word` | Hash of all input notes |
| `get_output_notes_commitment` | `fn() -> Word` | Hash of all output notes |
| `get_num_input_notes` | `fn() -> Felt` | Number of input notes |
| `get_num_output_notes` | `fn() -> Felt` | Number of output notes |
| `get_expiration_block_delta` | `fn() -> Felt` | Current expiration delta |
| `update_expiration_block_delta` | `fn(delta: Felt)` | Set expiration delta |

For signature verification using the transaction context, see [Authentication](./authentication). For more time-based and security patterns, see [Patterns & Security](../patterns). For the complete function table, see the [Cheatsheet](../api-reference).

:::info API Reference
Full API docs on docs.rs: [`miden::tx`](https://docs.rs/miden/latest/miden/tx/)
:::
