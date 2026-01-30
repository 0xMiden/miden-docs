---
sidebar_position: 7
title: "Assembler Changes"
description: "LibraryPath removal and debug mode changes"
---

# Assembler Changes

:::warning Breaking Change
`LibraryPath` has been removed. Use `Path` directly from `miden_assembly`.
:::

## Quick Fix

```rust title="src/assembler.rs"
// Before
use miden_assembly::LibraryPath;
let path = LibraryPath::new("miden::account")?;

// After
use miden_assembly::Path;
let path = Path::new("miden::account")?;
```

---

## LibraryPath Removal

Remove `LibraryPath`; use `Path` directly from `miden_assembly`:

```diff title="src/assembler.rs"
- use miden_assembly::LibraryPath;
- let path = LibraryPath::new("miden::account")?;

+ use miden_assembly::Path;
+ let path = Path::new("miden::account")?;
```

---

## Debug Mode Changes

Debug mode is now always enabled; remove toggle calls:

```diff title="src/assembler.rs"
- use miden_assembly::Assembler;
- let assembler = Assembler::new()
-     .with_debug_mode(true)  // No longer needed
-     .build()?;

+ use miden_assembly::Assembler;
+ let assembler = Assembler::new().build()?;
+ // Debug mode is always enabled
```

:::info Good to know
Debug mode being always-on simplifies development and has negligible performance impact in production.
:::

---

## Compile Function Argument Order

:::warning Breaking Change
`compile_and_statically_link_from_dir` argument order changed to `(dir, namespace)`.
:::

```diff title="src/compiler.rs"
- // Before: (namespace, dir)
- let program = assembler.compile_and_statically_link_from_dir(
-     "my_module",
-     "./src/masm",
- )?;

+ // After: (dir, namespace)
+ let program = assembler.compile_and_statically_link_from_dir(
+     "./src/masm",
+     "my_module",
+ )?;
```

---

## Library Compilation

Library compilation API updates to use builder pattern:

```diff title="src/library.rs"
- use miden_assembly::Library;
- let lib = Library::from_dir(path, namespace)?;

+ use miden_assembly::Library;
+ let lib = Library::builder()
+     .from_dir(path)
+     .with_namespace(namespace)
+     .build()?;
```

---

## Assembler Context

Assembler context creation simplified:

```diff title="src/context.rs"
- let ctx = AssemblerContext::new()
-     .with_libraries(&[lib1, lib2])
-     .with_debug_info(true)?;

+ let ctx = AssemblerContext::new()
+     .with_libraries(&[lib1, lib2])?;
+ // Debug info always included
```

---

## Migration Steps

1. Replace all `LibraryPath` imports with `Path`
2. Remove `with_debug_mode()` calls from assembler configuration
3. Swap argument order in `compile_and_statically_link_from_dir` calls
4. Update library compilation to use builder pattern
5. Remove `with_debug_info()` calls from context creation

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `LibraryPath not found` | Removed | Use `Path` |
| `with_debug_mode not found` | Removed | Delete the call |
| `mismatched types` in compile_from_dir | Arg order swapped | Swap `(dir, namespace)` |
| `with_debug_info not found` | Removed | Delete the call |
