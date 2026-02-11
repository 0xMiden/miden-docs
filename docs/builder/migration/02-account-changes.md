---
sidebar_position: 2
title: "Account Changes"
description: "Named storage slots, keystore, components, and procedure root changes"
---

# Account Changes

:::warning Breaking Change
Storage is now name-based, not index-based. All storage access code must be updated.
:::

## Quick Fix

Replace numeric indices with `StorageSlotName`:

```rust title="src/account.rs"
// Before
let value = account.storage().get_item(0)?;

// After
let slot_name = StorageSlotName::new("my_component::my_slot")?;
let value = account.storage().get_item(&slot_name)?;
```

---

## Named Storage Slots

Replace index-based storage access with `StorageSlotName` identifiers.

### Rust

```diff title="src/account.rs"
- // Before: access by numeric index
- let value = account.storage().get_item(0)?;
- let _old_value = account.storage_mut().set_item(0, new_value)?;

+ // After: access by name
+ let slot_name = StorageSlotName::new("my_component::my_slot")?;
+ let value = account.storage().get_item(&slot_name)?;
+ let _old_value = account.storage_mut().set_item(&slot_name, new_value)?;
```

### MASM Updates

The `native_account::set_map_item` procedure now takes slot IDs and returns only old values:

```diff title="src/contract.masm"
- # Before
- exec.native_account::set_map_item
- # Returns: [OLD_MAP_ROOT, OLD_VALUE, ...]

+ # After
+ # Inputs: [slot_id_prefix, slot_id_suffix, KEY, NEW_VALUE]
+ exec.native_account::set_map_item
+ # Returns: [OLD_VALUE, ...]
```

:::info Good to know
The return value change means you may need to update stack manipulation after calling `set_map_item`.
:::

---

## Keystore Changes

Remove RNG generics from `FilesystemKeyStore`:

```diff title="src/client.rs"
- use miden_client::keystore::FilesystemKeyStore;
- let keystore = FilesystemKeyStore::<rand::rngs::StdRng>::new(path)?;

+ use miden_client::keystore::FilesystemKeyStore;
+ let keystore = FilesystemKeyStore::new(path)?;
```

---

## Web Component Compilation

Web component compilation now requires `AccountComponentCode` from `CodeBuilder`:

```diff title="src/component.ts"
- // Before
- const component = AccountComponent.compile(accountCode, builder, [slot]);

+ // After
+ const componentCode = builder.compileAccountComponentCode(accountCode);
+ const component = AccountComponent.compile(componentCode, [slot]);
```

---

## Storage Schemas

Replace `AccountComponentTemplate` with metadata-driven `StorageSchema`:

```diff title="src/schema.rs"
- use miden_lib::AccountComponentTemplate;
- let template = AccountComponentTemplate::new(slots)?;

+ use miden_protocol::account::component::{SchemaTypeId, StorageSchema, StorageSlotSchema};
+ use miden_protocol::account::StorageSlotName;
+ let schema = StorageSchema::new([
+     (
+         StorageSlotName::new("my_component::balance")?,
+         StorageSlotSchema::value("balance", SchemaTypeId::native_word()),
+     ),
+     (
+         StorageSlotName::new("my_component::metadata")?,
+         StorageSlotSchema::map(
+             "metadata",
+             SchemaTypeId::native_word(),
+             SchemaTypeId::native_word(),
+         ),
+     ),
+ ])?;
```

---

## Procedure Roots

Use `AccountProcedureRoot` instead of `AccountProcedureInfo`:

```diff title="src/procedure.rs"
- use miden_objects::account::AccountProcedureInfo;
- let info = AccountProcedureInfo::new(digest, storage_offset)?;

+ use miden_protocol::account::AccountProcedureRoot;
+ let root = AccountProcedureRoot::from_raw(digest);
```

---

## Migration Steps

1. Identify all storage slot access patterns in your code
2. Define `StorageSlotName` constants for each slot
3. Update storage access to use names instead of indices
4. Remove RNG type parameters from keystore initialization
5. Update component compilation to use `CodeBuilder`
6. Migrate storage templates to `StorageSchema`
7. Replace `AccountProcedureInfo` with `AccountProcedureRoot`

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `expected &StorageSlotName, found u8` | API changed to names | Use `StorageSlotName` |
| `FilesystemKeyStore expects 0 type parameters` | RNG generic removed | Remove type parameter |
| `AccountComponentTemplate not found` | Renamed | Use `StorageSchema` |
