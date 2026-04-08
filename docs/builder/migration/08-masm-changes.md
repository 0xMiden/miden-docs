---
sidebar_position: 8
title: "MASM Changes"
description: "New MASM features and standard library additions in v0.14"
---

# MASM Changes

:::info New MASM Features
Miden v0.14 introduces new standard library modules for MASM, including native 128-bit unsigned integer arithmetic.
:::

---

## 128-bit Integer Math: `std::math::u128`

### Summary

A new `std::math::u128` module provides full 128-bit unsigned integer arithmetic in MASM. A `u128` value is represented as four `u32` limbs in **little-endian** order `[a0, a1, a2, a3]`, where `a0` (the low limb) sits on top of the stack.

For example, the value `0x00000001_00000002_00000003_00000004` is pushed as:

```masm
# Stack (top → bottom): [0x4, 0x3, 0x2, 0x1]
#                         a0    a1    a2    a3
push.0x00000001.0x00000002.0x00000003.0x00000004
```

### Usage Examples

**Wrapping addition:**

```masm
use.std::math::u128

# Push two u128 values (low limb on top)
# a = 0x00000000_00000000_00000000_00000005
push.0.0.0.5
# b = 0x00000000_00000000_00000000_00000003
push.0.0.0.3

exec.u128::wrapping_add
# Stack: [8, 0, 0, 0] (a + b = 8)
```

**Comparison (`lt`, `gte`):**

```masm
use.std::math::u128

# a = 10
push.0.0.0.10
# b = 20
push.0.0.0.20

exec.u128::lt
# Stack: [1] (10 < 20 is true)
```

**Bitwise operations (`and`, `xor`):**

```masm
use.std::math::u128

push.0.0.0.0xFF
push.0.0.0.0x0F

exec.u128::and
# Stack: [0x0F, 0, 0, 0]
```

**Shift left:**

```masm
use.std::math::u128

push.0.0.0.1
push.4  # shift amount

exec.u128::shl
# Stack: [16, 0, 0, 0] (1 << 4 = 16)
```

**Division and divmod:**

```masm
use.std::math::u128

# a = 100
push.0.0.0.100
# b = 7
push.0.0.0.7

exec.u128::divmod
# Stack: [quotient (4 limbs), remainder (4 limbs)]
```

### Available Procedures

The full list of procedures in `std::math::u128`:

| Category | Procedures |
|----------|-----------|
| **Arithmetic** | `overflowing_add`, `widening_add`, `wrapping_add`, `overflowing_sub`, `wrapping_sub`, `overflowing_mul`, `widening_mul`, `wrapping_mul`, `div`, `mod`, `divmod` |
| **Comparison** | `eq`, `neq`, `eqz`, `lt`, `gt`, `lte`, `gte`, `min`, `max` |
| **Bitwise** | `and`, `or`, `xor`, `not` |
| **Bit counting** | `clz`, `ctz`, `clo`, `cto` |
| **Shifts / Rotates** | `shl`, `shr`, `rotl`, `rotr` |

---

## `u32overflowing_mul` → `u32widening_mul`

### Summary

Three rename pairs that better reflect that the result is *wider* than the operands (not arithmetic overflow):

```masm
# Before (0.13)
u32overflowing_mul
u32overflowing_madd
exec.::std::math::u64::overflowing_mul

# After (0.14)
u32widening_mul
u32widening_madd
exec.::std::math::u64::widening_mul
```

`u32overflowing_add` is unchanged (the rename only applies to multiplication and madd). v0.14 also adds matching `u32widening_add` and `std::math::u64::widening_add` helpers.

---

## `breakpoint` Instruction Removed

The `breakpoint` MASM instruction was a no-op used with the old `miden debug` REPL. Both the REPL and the instruction are gone — any `.masm` source containing `breakpoint` will now fail to assemble. Delete those lines.

```masm
# Before (0.13)
breakpoint  # used for debugging

# After (0.14)
# Just remove the line — breakpoint no longer exists
```

---

## Migration Steps

1. If you have custom 128-bit arithmetic helpers in MASM, consider replacing them with the new `std::math::u128` module.
2. Remember that `u128` values follow the same little-endian convention as the rest of v0.14 — the low limb (`a0`) is on top of the stack.
3. Rename `u32overflowing_mul` → `u32widening_mul` and `u32overflowing_madd` → `u32widening_madd`.
4. Rename `std::math::u64::overflowing_mul` → `std::math::u64::widening_mul`.
5. Remove any `breakpoint` instructions from your MASM source.

---

## Common Errors

| Error Message | Cause | Solution |
| --- | --- | --- |
| `unknown module std::math::u128` | Using an older assembler version | Update to `miden-assembly` 0.22. |
| Incorrect `u128` results | Limbs pushed in big-endian order | Push low limb last so it lands on top: `push.a3.a2.a1.a0`. |
| `unknown instruction u32overflowing_mul` | Instruction renamed | Use `u32widening_mul`. |
| `unknown instruction breakpoint` | Instruction removed | Delete the line. |
