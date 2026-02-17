---
title: "Advice Provider"
sidebar_position: 5
description: "Reading and writing the advice map, loading preimages, and requesting Falcon signatures in Miden transactions."
---

# Advice Provider

The advice provider is a mechanism for supplying non-deterministic auxiliary data to the VM during proof generation. It backs an **advice map** (a key-value store of `Word → Vec<Felt>`) and an **advice stack** that host-provided data can be pushed onto. Common uses include passing structured data into transaction scripts, providing Falcon signatures for authentication, and seeding note scripts with external inputs.

## Reading from the advice map

### `adv_push_mapvaln`

Pushes the value associated with a key onto the advice stack and returns its length.

```rust
use miden::intrinsics::advice::adv_push_mapvaln;

// Push the value for `key` onto the advice stack; returns the number of Felts pushed.
let num_felts: Felt = adv_push_mapvaln(key);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `Word` | Key to look up in the advice map |
| **Returns** | `Felt` | Number of `Felt` elements pushed onto the advice stack |

### `adv_load_preimage`

Loads a preimage from the advice provider given a commitment and expected word count. This is useful when a note or transaction script needs to retrieve data that was hashed and stored by the sender.

```rust
use miden::stdlib::mem::adv_load_preimage;

// Load `num_words` Words whose hash matches `commitment`.
let felts: Vec<Felt> = adv_load_preimage(num_words, commitment);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `num_words` | `Felt` | Number of `Word`s to load |
| `commitment` | `Word` | Expected hash of the preimage data |
| **Returns** | `Vec<Felt>` | The preimage data as a flat vector of `Felt` elements |

### Pattern: passing structured data to a transaction script

The canonical pattern (used in `basic-wallet-tx-script`) combines `adv_push_mapvaln` with `adv_load_preimage` to retrieve structured data encoded as a preimage:

```rust
use miden::intrinsics::advice::adv_push_mapvaln;
use miden::stdlib::mem::adv_load_preimage;

// 1. Look up the key — returns the number of Felts stored there
let num_felts = adv_push_mapvaln(key);

// 2. Load the preimage (num_felts must be word-aligned)
let num_words = Felt::from_u64_unchecked(num_felts.as_u64() / 4);
let data: Vec<Felt> = adv_load_preimage(num_words, key);

// 3. Index into the data by field position
let tag       = data[0];
let note_type = data[1];
// ...
```

See [Transaction Scripts](./transaction-scripts) for the full `basic-wallet-tx-script` example.

## Writing to the advice map

### `adv_insert`

Inserts a slice of `Word`s into the advice map under the given key.

```rust
use miden::intrinsics::advice::adv_insert;

let values: &[Word] = &[word_a, word_b];
adv_insert(key, values);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `Word` | Key under which to store the data |
| `values` | `&[Word]` | Slice of `Word`s to store |

### `adv_insert_mem`

Inserts a range of memory into the advice map. The VM reads `Word`s from addresses `[start_addr, end_addr)` and stores them under the key.

```rust
use miden::intrinsics::advice::adv_insert_mem;

adv_insert_mem(key, start_addr, end_addr);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `Word` | Key under which to store the data |
| `start_addr` | `u32` | Start memory address (inclusive) |
| `end_addr` | `u32` | End memory address (exclusive) |

## Requesting a Falcon signature

`emit_falcon_sig_to_stack` emits an `AUTH_REQUEST_EVENT` that instructs the host to push a Falcon512 signature onto the advice stack. This is typically used in [authentication components](./authentication) before calling `rpo_falcon512_verify`.

```rust
use miden::intrinsics::advice::emit_falcon_sig_to_stack;

// Request the host to push a Falcon signature onto the advice stack
emit_falcon_sig_to_stack(msg, pub_key);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `msg` | `Word` | RPO256 hash of the message to sign |
| `pub_key` | `Word` | RPO256 hash of the signer's public key |

## Function reference

| Function | Module | Signature | Description |
|----------|--------|-----------|-------------|
| `adv_push_mapvaln` | `miden::intrinsics::advice` | `(key: Word) -> Felt` | Push advice-map value onto the advice stack |
| `adv_load_preimage` | `miden::stdlib::mem` | `(num_words: Felt, commitment: Word) -> Vec<Felt>` | Load a preimage matching a commitment |
| `adv_insert` | `miden::intrinsics::advice` | `(key: Word, values: &[Word])` | Insert words into the advice map |
| `adv_insert_mem` | `miden::intrinsics::advice` | `(key: Word, start_addr: u32, end_addr: u32)` | Insert a memory range into the advice map |
| `emit_falcon_sig_to_stack` | `miden::intrinsics::advice` | `(msg: Word, pub_key: Word)` | Request a Falcon512 signature from the host |

## Related

- [Authentication](./authentication) — RPO-Falcon512 signature verification and nonce management
- [Transaction Scripts](./transaction-scripts) — executing logic in the transaction context
- [Transaction Context](./transaction-context) — overview of transaction execution
