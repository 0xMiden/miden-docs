---
title: "Cheatsheet"
sidebar_position: 7
description: "Quick-reference cheatsheet for every function, type, trait, and macro in the Miden Rust SDK."
---

# Cheatsheet

:::tip
This is a quick-reference cheatsheet. For full API documentation with examples, see [`miden` on docs.rs](https://docs.rs/miden/latest/miden/).
:::

Quick-reference for the Miden Rust SDK — every function signature, type, trait, and macro at a glance. Each section links to the detailed page for full explanations and examples. The SDK exposes the Miden transaction kernel's host functions — all execution happens locally on the client during proof generation, not on-chain. For runnable examples, see the [compiler examples directory](https://github.com/0xMiden/compiler/tree/next/examples).

## Core imports

```rust
use miden::{
    // Macros
    component, note, note_script, tx_script, export_type, felt,

    // Types
    Felt, Word, Asset, AccountId, NoteIdx, Tag, NoteType, Recipient, Digest,

    // Storage
    Value, StorageMap, ValueAccess, StorageMapAccess,

    // Modules
    active_account, native_account, active_note, output_note, input_note, tx,
    asset, faucet, storage,

    // Crypto
    hash_words, rpo_falcon512_verify,

    // Allocator
    BumpAlloc,
};
```

---

## Macros → [Components](./accounts/components), [Notes](./notes/note-scripts), [Transaction Context](./transactions/transaction-context), [Custom Types](./accounts/custom-types), [Cross-Component Calls](./cross-component-calls)

### `#[component]`

Defines an account component. Apply to both struct and impl block.

```rust
#[component]
struct MyAccount { /* storage fields */ }

#[component]
impl MyAccount { /* public and private methods */ }
```

### `#[note]`

Defines a note script. Apply to both struct and impl block.

```rust
#[note]
struct MyNote { /* fields from note inputs */ }

#[note]
impl MyNote { /* must contain a #[note_script] method */ }
```

### `#[note_script]`

Marks the entry point method of a note script. Must be inside a `#[note] impl` block.

**Constraints**: `self` by value, returns `()`, one `Word` arg, optional `&Account`/`&mut Account`.

### `#[tx_script]`

Marks a function as a transaction script entry point.

```rust
#[tx_script]
fn my_script(arg: Word) { ... }
```

### `#[export_type]`

Exports a custom type for use in public component method signatures.

```rust
#[export_type]
pub struct MyType { pub field: Felt }
```

### `felt!(n)`

Creates a `Felt` from an integer literal at compile time. Limited to values ≤ `u32::MAX`.

```rust
let f = felt!(42);
```

### `miden::generate!()`

Generates WIT bindings for cross-component calls. Creates a `bindings` module.

```rust
miden::generate!();
bindings::export!(MyNote);
```

---

## Types → [Types](./types)

### `Felt`

Field element over the Goldilocks prime ($p = 2^{64} - 2^{32} + 1$).

| Method | Signature | Description |
|--------|-----------|-------------|
| `from_u32` | `fn(value: u32) -> Self` | Create from u32 (always safe) |
| `from_u64_unchecked` | `fn(value: u64) -> Self` | Create from u64 (caller ensures < p) |
| `new` | `fn(value: u64) -> Result<Self, FeltError>` | Create with validation |
| `as_u64` | `fn(self) -> u64` | Get canonical u64 representation |
| `is_odd` | `fn(self) -> bool` | Check parity |
| `inv` | `fn(self) -> Self` | Multiplicative inverse (panics if 0) |
| `exp` | `fn(self, other: Self) -> Self` | Exponentiation: self^other mod p |
| `pow2` | `fn(self) -> Self` | Compute 2^self (panics if > 63) |

**Operators**: `Add`, `Sub`, `Mul`, `Div`, `Neg`, `AddAssign`, `SubAssign`, `MulAssign`, `DivAssign`, `Eq`, `Ord`

### `Word`

Four-element tuple: `(Felt, Felt, Felt, Felt)`. Repr: `#[repr(C, align(16))]`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `new` | `fn(word: [Felt; 4]) -> Self` | Create from array |
| `from_u64_unchecked` | `fn(a: u64, b: u64, c: u64, d: u64) -> Self` | Create from 4 u64 values |
| `reverse` | `fn(&self) -> Word` | Reverse element order |

**Indexing**: `word[0]` through `word[3]`. Supports `Index<usize>` and `IndexMut<usize>`.

**Conversions**: `From<[Felt; 4]>`, `From<(Felt, Felt, Felt, Felt)>`, `From<Felt>`, `Into<[Felt; 4]>`, `Into<Felt>`

### `Asset`

Wraps a `Word`. Field: `inner: Word`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `new` | `fn(word: impl Into<Word>) -> Self` | Create from Word |
| `as_word` | `fn(&self) -> &Word` | Borrow as Word |

**Fungible encoding**: `[amount, 0, faucet_suffix, faucet_prefix]`
**Non-fungible encoding**: `[hash0, hash1, hash2, faucet_prefix]`

### `AccountId`

Fields: `prefix: Felt`, `suffix: Felt`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `new` | `fn(prefix: Felt, suffix: Felt) -> Self` | Create from prefix/suffix |

### `Recipient`

Field: `inner: Word`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `compute` | `fn(serial_num: Word, script_digest: Digest, inputs: Vec<Felt>) -> Self` | Compute from components |

### `Digest`

Field: `inner: Word`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `new` | `fn(felts: [Felt; 4]) -> Self` | Create from array |
| `from_word` | `const fn(word: Word) -> Self` | Create from Word |

### Other types

| Type | Inner | Description |
|------|-------|-------------|
| `NoteIdx` | `Felt` | Output note index |
| `Tag` | `Felt` | Note routing tag |
| `NoteType` | `Felt` | Note visibility |
| `StorageSlotId` | `prefix: Felt, suffix: Felt` | Storage slot identifier |

---

## Traits → [Storage](./accounts/storage), [Components](./accounts/components)

### `ValueAccess<V>`

```rust
pub trait ValueAccess<V> {
    fn read(&self) -> V;
    fn write(&mut self, value: V) -> V;  // Returns previous value
}
```

Implemented by `Value` for any `V: Into<Word> + From<Word>`.

### `StorageMapAccess<K, V>`

```rust
pub trait StorageMapAccess<K, V> {
    fn get(&self, key: &K) -> V;
    fn set(&mut self, key: K, value: V) -> V;  // Returns previous value
}
```

Implemented by `StorageMap` for `K: Into<Word> + AsRef<Word>`, `V: From<Word> + Into<Word>`.

### `ActiveAccount`

Auto-implemented on `#[component]` structs. Provides read-only account queries on `&self`.

### `NativeAccount`

Auto-implemented on `#[component]` structs. Provides account mutations on `&mut self`.

---

## `active_account` module → [Account Operations](./accounts/account-operations)

Read-only account state queries.

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_id` | `fn() -> AccountId` | Account ID |
| `get_nonce` | `fn() -> Felt` | Current nonce |
| `get_balance` | `fn(faucet_id: AccountId) -> Felt` | Fungible balance for faucet |
| `get_initial_balance` | `fn(faucet_id: AccountId) -> Felt` | Balance at tx start |
| `has_non_fungible_asset` | `fn(asset: Asset) -> bool` | Check NFT ownership |
| `get_initial_commitment` | `fn() -> Word` | Account commitment at tx start |
| `compute_commitment` | `fn() -> Word` | Current account commitment |
| `get_code_commitment` | `fn() -> Word` | Code commitment |
| `get_initial_storage_commitment` | `fn() -> Word` | Storage commitment at tx start |
| `compute_storage_commitment` | `fn() -> Word` | Current storage commitment |
| `get_initial_vault_root` | `fn() -> Word` | Vault root at tx start |
| `get_vault_root` | `fn() -> Word` | Current vault root |
| `get_num_procedures` | `fn() -> Felt` | Number of exported procedures |
| `get_procedure_root` | `fn(index: u8) -> Word` | Procedure root at index |
| `has_procedure` | `fn(proc_root: Word) -> bool` | Check procedure existence |

---

## `native_account` module → [Account Operations](./accounts/account-operations)

Account state mutations (write operations).

| Function | Signature | Description |
|----------|-----------|-------------|
| `add_asset` | `fn(asset: Asset) -> Asset` | Add asset to vault |
| `remove_asset` | `fn(asset: Asset) -> Asset` | Remove asset from vault |
| `incr_nonce` | `fn() -> Felt` | Increment nonce, return new value |
| `compute_delta_commitment` | `fn() -> Word` | Commitment of state changes |
| `was_procedure_called` | `fn(proc_root: Word) -> bool` | Check if procedure was called |

---

## `storage` module → [Storage](./accounts/storage)

Direct storage access (lower-level than `Value`/`StorageMap` traits).

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_item` | `fn(slot_id: StorageSlotId) -> Word` | Get slot value |
| `get_initial_item` | `fn(slot_id: StorageSlotId) -> Word` | Value at tx start |
| `set_item` | `fn(slot_id: StorageSlotId, value: Word) -> Word` | Set slot, return old |
| `get_map_item` | `fn(slot_id: StorageSlotId, key: &Word) -> Word` | Get map value |
| `get_initial_map_item` | `fn(slot_id: StorageSlotId, key: &Word) -> Word` | Map value at tx start |
| `set_map_item` | `fn(slot_id: StorageSlotId, key: Word, value: Word) -> Word` | Set map value, return old |

---

## `active_note` module → [Notes](./notes/reading-notes)

Access the currently executing note's data.

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_inputs` | `fn() -> Vec<Felt>` | Note input values |
| `get_assets` | `fn() -> Vec<Asset>` | Note assets |
| `get_sender` | `fn() -> AccountId` | Note sender |
| `get_recipient` | `fn() -> Recipient` | Note recipient hash |
| `get_script_root` | `fn() -> Word` | Note script root |
| `get_serial_number` | `fn() -> Word` | Note serial number |
| `get_metadata` | `fn() -> NoteMetadata` | Note metadata (attachment + header) |

---

## `output_note` module → [Notes](./notes/output-notes)

Create and manage output notes.

| Function | Signature | Description |
|----------|-----------|-------------|
| `create` | `fn(tag: Tag, note_type: NoteType, recipient: Recipient) -> NoteIdx` | Create a new output note |
| `add_asset` | `fn(asset: Asset, note_idx: NoteIdx)` | Add asset to output note |
| `get_assets_info` | `fn(note_idx: NoteIdx) -> OutputNoteAssetsInfo` | Assets commitment and count |
| `get_assets` | `fn(note_idx: NoteIdx) -> Vec<Asset>` | All assets on note |
| `get_recipient` | `fn(note_idx: NoteIdx) -> Recipient` | Note recipient |
| `get_metadata` | `fn(note_idx: NoteIdx) -> NoteMetadata` | Note metadata (attachment + header) |
| `set_attachment` | `fn(note_idx: NoteIdx, scheme: Felt, kind: Felt, data: Word)` | Set attachment with explicit kind |
| `set_word_attachment` | `fn(note_idx: NoteIdx, scheme: Felt, data: Word)` | Set Word attachment |
| `set_array_attachment` | `fn(note_idx: NoteIdx, scheme: Felt, data: Word)` | Set array attachment (commitment) |

---

## `input_note` module → [Notes](./notes/reading-notes)

Access specific input notes by index.

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_assets_info` | `fn(note_idx: NoteIdx) -> InputNoteAssetsInfo` | Assets commitment and count |
| `get_assets` | `fn(note_idx: NoteIdx) -> Vec<Asset>` | All assets on note |
| `get_recipient` | `fn(note_idx: NoteIdx) -> Recipient` | Note recipient |
| `get_metadata` | `fn(note_idx: NoteIdx) -> NoteMetadata` | Note metadata (attachment + header) |
| `get_sender` | `fn(note_idx: NoteIdx) -> AccountId` | Note sender |
| `get_inputs_info` | `fn(note_idx: NoteIdx) -> InputNoteInputsInfo` | Inputs commitment and count |
| `get_script_root` | `fn(note_idx: NoteIdx) -> Word` | Note script root |
| `get_serial_number` | `fn(note_idx: NoteIdx) -> Word` | Note serial number |

---

## `tx` module → [Transaction Context](./transactions/transaction-context)

Transaction context queries.

| Function | Signature | Description |
|----------|-----------|-------------|
| `get_block_number` | `fn() -> Felt` | Current block number |
| `get_block_commitment` | `fn() -> Word` | Block header commitment |
| `get_block_timestamp` | `fn() -> Felt` | Block timestamp (seconds) |
| `get_input_notes_commitment` | `fn() -> Word` | Hash of all input notes |
| `get_output_notes_commitment` | `fn() -> Word` | Hash of all output notes |
| `get_num_input_notes` | `fn() -> Felt` | Number of input notes |
| `get_num_output_notes` | `fn() -> Felt` | Number of output notes |
| `get_expiration_block_delta` | `fn() -> Felt` | Expiration delta |
| `update_expiration_block_delta` | `fn(delta: Felt)` | Set expiration delta |

---

## `asset` module

Asset construction.

| Function | Signature | Description |
|----------|-----------|-------------|
| `build_fungible_asset` | `fn(faucet_id: AccountId, amount: Felt) -> Asset` | Create fungible asset |
| `build_non_fungible_asset` | `fn(faucet_id: AccountId, data_hash: Word) -> Asset` | Create non-fungible asset |

---

## `faucet` module

Faucet operations (for faucet account types only).

| Function | Signature | Description |
|----------|-----------|-------------|
| `create_fungible_asset` | `fn(amount: Felt) -> Asset` | Create asset from this faucet |
| `create_non_fungible_asset` | `fn(data_hash: Word) -> Asset` | Create NFT from this faucet |
| `mint` | `fn(asset: Asset) -> Asset` | Mint asset |
| `burn` | `fn(asset: Asset) -> Asset` | Burn asset |
| `get_total_issuance` | `fn() -> Felt` | Total minted supply |
| `is_non_fungible_asset_issued` | `fn(asset: Asset) -> bool` | Check if NFT issued |

---

## Cryptography → [Cryptography](./accounts/cryptography)

### Hash functions

```rust
use miden::{hash_words, blake3_hash, sha256_hash};
use miden::intrinsics::advice::adv_push_mapvaln;
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `hash_words` | `fn(words: &[Word]) -> Digest` | RPO256 hash of Words |
| `intrinsics::crypto::merge` | `fn(digests: [Digest; 2]) -> Digest` | RPO 2-to-1 merge |
| `blake3_hash` | `fn(input: [u8; 32]) -> [u8; 32]` | BLAKE3 hash |
| `blake3_merge` | `fn(input: [u8; 64]) -> [u8; 32]` | BLAKE3 2-to-1 hash |
| `sha256_hash` | `fn(input: [u8; 32]) -> [u8; 32]` | SHA256 hash |
| `sha256_merge` | `fn(input: [u8; 64]) -> [u8; 32]` | SHA256 2-to-1 hash |

### Digital signatures

| Function | Signature | Description |
|----------|-----------|-------------|
| `rpo_falcon512_verify` | `fn(pk: Word, msg: Word)` | Verify Falcon512 signature (panics if invalid) |

### Advice provider

```rust
use miden::intrinsics::advice::{adv_insert, emit_falcon_sig_to_stack, adv_push_mapvaln};
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `adv_insert` | `fn(key: Word, values: &[Word])` | Insert into advice map |
| `adv_push_mapvaln` | `fn(key: Word) -> Felt` | Push advice map values to stack |
| `emit_falcon_sig_to_stack` | `fn(msg: Word, pub_key: Word)` | Request Falcon signature |

---

## Assertion functions

```rust
use miden::{assert, assertz, assert_eq};
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `assert` | `fn(a: Felt)` | Fails if `a != 1` |
| `assertz` | `fn(a: Felt)` | Fails if `a != 0` |
| `assert_eq` | `fn(a: Felt, b: Felt)` | Fails if `a != b` |

---

## Allocator

```rust
use miden::BumpAlloc;

#[global_allocator]
static ALLOC: BumpAlloc = BumpAlloc::new();
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `new` | `const fn() -> Self` | Create allocator |
| `alloc` | `unsafe fn(&self, layout: Layout) -> *mut u8` | Allocate (bump pointer) |
| `dealloc` | `unsafe fn(&self, ptr: *mut u8, layout: Layout)` | No-op (memory not reclaimed) |

Properties: 16-byte minimum alignment, Wasm page size (64KB), grows until exhausted.

---

## Debug

```rust
use miden::intrinsics::debug::breakpoint;
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `breakpoint` | `fn()` | Set VM breakpoint at call site |

---

## Supported account types

Configure in `Cargo.toml` under `[package.metadata.miden]`:

| Type | Description |
|------|-------------|
| `RegularAccountUpdatableCode` | Standard account with updatable code |
| `RegularAccountImmutableCode` | Account with fixed code |
| `FungibleFaucet` | Token minting faucet |
| `NonFungibleFaucet` | NFT minting faucet |
