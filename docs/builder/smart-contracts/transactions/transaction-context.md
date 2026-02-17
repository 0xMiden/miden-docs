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

## Transaction scripts

Transaction scripts use the `#[tx_script]` macro to define a top-level entry point for the transaction. See [Transaction Scripts](./transaction-scripts) for the full `#[tx_script]` API and examples.

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

For signature verification using the transaction context, see [Authentication](../accounts/authentication). For more time-based and security patterns, see [Patterns & Security](../patterns). For the complete function table, see the [Cheatsheet](../api-reference).

:::info API Reference
Full API docs on docs.rs: [`miden::tx`](https://docs.rs/miden/latest/miden/tx/)
:::
