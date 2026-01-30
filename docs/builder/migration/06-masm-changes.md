---
sidebar_position: 6
title: "MASM Changes"
description: "Syntax modernization and cryptography updates"
---

# MASM Changes

:::warning Breaking Change
MASM syntax has been modernized. Replace dotted keywords (`const.`, `export.`, `use.`) with spaced forms.
:::

## Quick Fix

```masm title="src/contract.masm"
# Before
const.MY_CONSTANT=42
use.miden::account
export.my_procedure

# After
const MY_CONSTANT=42
use miden::account
export my_procedure
```

---

## Syntax Modernization

Replace dotted keywords with spaced forms:

### Constants

```diff title="src/contract.masm"
- const.MY_CONSTANT=42
+ const MY_CONSTANT=42
```

### Exports

```diff title="src/contract.masm"
- export.my_procedure
+ export my_procedure
    # procedure body
- end
+ end
```

### Imports

```diff title="src/contract.masm"
- use.miden::account
- use.miden::note

+ use miden::account
+ use miden::note
```

### Re-exports

```diff title="src/contract.masm"
- export.miden::account::get_id
+ pub use miden::account::get_id
```

:::tip Helper Script
Use sed to batch-update MASM files:
```bash
# Update constants
sed -i 's/const\./const /g' *.masm

# Update exports
sed -i 's/export\./export /g' *.masm

# Update imports
sed -i 's/use\./use /g' *.masm
```
:::

---

## Cryptography Updates

### Falcon Signature Rename

Rename `RpoFalcon512` to `Falcon512Rpo` throughout codebase:

```diff title="src/auth.masm"
- use.miden::contracts::auth::basic::auth_tx_rpo_falcon512
+ use miden::contracts::auth::basic::auth_tx_falcon512_rpo
```

### ECDSA Procedures

ECDSA procedures moved to new namespace:

```diff title="src/crypto.masm"
- use.miden::crypto::dsa::ecdsa
- exec.ecdsa::verify_k256

+ use miden::core::crypto::dsa::ecdsa_k256_keccak
+ exec.ecdsa_k256_keccak::verify
```

### RPO Hash Helpers

Hash helper procedures renamed:

```diff title="src/hash.masm"
- exec.rpo::hash_memory_words
+ exec.rpo::hash_words
```

---

## Complete MASM Migration Example

Before:
```masm title="src/contract.masm (before)"
use.miden::account
use.std::crypto::hashes::rpo

const.BALANCE_SLOT=0

export.get_balance
    push.BALANCE_SLOT
    exec.account::get_item
end

export.transfer
    exec.rpo::hash_memory_words
    # ... rest of procedure
end
```

After:
```masm title="src/contract.masm (after)"
use miden::account
use miden::core::crypto::hashes::rpo

const BALANCE_SLOT=0

export get_balance
    push.BALANCE_SLOT
    exec.account::get_item
end

export transfer
    exec.rpo::hash_words
    # ... rest of procedure
end
```

---

## Migration Steps

1. Find all `.masm` files in your project
2. Replace `const.` with `const ` (space instead of dot)
3. Replace `export.` with `export ` (space instead of dot)
4. Replace `use.` with `use ` (space instead of dot)
5. Replace `export.<path>` re-exports with `pub use <path>`
6. Update `std::` namespace to `miden::core::`
7. Rename `RpoFalcon512` to `Falcon512Rpo`
8. Update ECDSA procedure paths
9. Rename `hash_memory_words` to `hash_words`

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `unexpected token '.'` | Old syntax | Use space: `const X` not `const.X` |
| `module 'std' not found` | Namespace changed | Use `miden::core::` |
| `procedure 'auth_tx_rpo_falcon512' not found` | Renamed | Use `auth_tx_falcon512_rpo` |
| `procedure 'hash_memory_words' not found` | Renamed | Use `hash_words` |
