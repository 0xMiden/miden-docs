---
title: "MASM Constants: word() and event()"
sidebar_position: 5.7
description: "Derive MASM word and event constants from string literals with word(\"...\") and event(\"...\"), added in Miden v0.14."
---

# MASM Constants: `word()` and `event()`

Miden v0.14 adds two constant expressions to MASM that let you derive values from a string literal at assembly time:

- `word("literal")` — hashes the literal with Blake3 and produces a `Word` (four field elements).
- `event("literal")` — hashes the literal with Blake3 and reduces to a single `Felt` event id (the first element of the word, reduced modulo the Goldilocks prime).

Both run at assembly time, so the hashing cost is paid by the assembler — the emitted MAST sees only the final word/felt immediate.

:::info Migrating from v0.13?
See the [MASM migration guide](../migration/masm-changes) for the full list of MASM changes in v0.14. Event names on the kernel were also renamespaced from `miden::…` to `miden::protocol::…` — see [Kernel Events Prefixed with miden::protocol](../migration/transaction-changes#kernel-events-prefixed-with-midenprotocol).
:::

## `word("...")`

`word("literal")` is valid anywhere a `Word` constant expression is accepted, most commonly in a `const` declaration. The literal string is hashed with Blake3; the 32-byte digest is split into four little-endian `u64` limbs and each limb becomes a `Felt`.

### Naming a storage slot

```masm
use.miden::protocol::active_account
use.miden::protocol::native_account
use.miden::core::sys

const COUNTER_SLOT = word("miden::tutorials::counter")

#! Inputs:  []
#! Outputs: [count]
pub proc get_count
    push.COUNTER_SLOT[0..2] exec.active_account::get_item
    # => [count]

    exec.sys::truncate_stack
end

#! Inputs:  []
#! Outputs: []
pub proc increment_count
    push.COUNTER_SLOT[0..2] exec.active_account::get_item
    add.1
    push.COUNTER_SLOT[0..2] exec.native_account::set_item
    # => []

    exec.sys::truncate_stack
end
```

`push.COUNTER_SLOT` pushes the full four-element word; `push.COUNTER_SLOT[0..2]` pushes a slice of the word. The derived word is deterministic — the same literal always hashes to the same word — so components that agree on a string convention share the same slot without a separately distributed constant.

`word("...")` is only valid inside a `const` declaration. `push` and other instructions accept named constants but not inline `word("...")` calls, so always bind the expression to a name first.

## `event("...")`

`event("literal")` derives a `Felt` event id from the literal using the same hashing procedure as `word(...)`, then taking the first limb. This matches `EventId::from_name` in `miden-core`.

Use `event("...")` in a `const` to name an event, then `emit.NAME`:

```masm
const U64_DIV_EVENT = event("miden::core::math::u64::u64_div")

proc handler
    # ... stack shaping ...
    emit.U64_DIV_EVENT
    # ... continue ...
end
```

You can also emit a literal inline, without naming it:

```masm
begin
    emit.event("miden::test::equiv")
end
```

The assembler guarantees the three forms below produce the same MAST:

```masm
const EVT = event("miden::test::equiv")

# (1) named constant
begin
    emit.EVT
end

# (2) inline literal
begin
    emit.event("miden::test::equiv")
end

# (3) manual push + emit
begin
    push.EVT
    emit
    drop
end
```

## Where each is valid

| Context                              | `word("...")` | `event("...")` |
| ------------------------------------ | :-----------: | :------------: |
| `const NAME = ...`                   |      yes      |      yes       |
| `push.NAME` (immediate Word context) |      yes      |       —        |
| `push.NAME` (immediate Felt context) |       —       |      yes       |
| `emit.NAME`                          |       —       |      yes       |
| `emit.event("...")` inline           |       —       |      yes       |
| Inline `word("...")` in `push.`      |      no       |       —        |

`emit.CONST` is only accepted when `CONST` was declared with `event("...")`. A constant declared with `word("...")` or a plain integer will be rejected by the assembler.

## Why prefer literal hashing?

- **Readable MASM.** `event("miden::core::math::u64::u64_div")` documents intent directly in the source; the equivalent `push.<felt>` loses all context.
- **Decoupled components.** Two MASM libraries that agree on a string name (e.g. `"miden::tutorials::counter"`) share a storage slot or event id without passing a constant between them.
- **Assembly-time cost.** The Blake3 hash is computed once by the assembler; the running VM sees a plain immediate.

## Notes and limitations

- Hashing uses **Blake3**, not the VM's native hash. The derived values are convenient identifiers, not commitments produced inside a proof.
- `word("")` and `event("")` (empty string) are valid and hash like any other input; collisions are vanishingly unlikely but not impossible.
- Event ids are `Felt`s, so they are reduced modulo the Goldilocks prime ($p = 2^{64} - 2^{32} + 1$). Two distinct Blake3 digests whose first 8 little-endian bytes coincide modulo $p$ would collide — again, vanishingly unlikely for meaningful names.
- These constants are evaluated inside the assembler (`miden-assembly` / `miden-assembly-syntax`). Code generated before v0.14 that did its own string-to-felt mapping for event ids must drop that logic — the assembler now owns it.
