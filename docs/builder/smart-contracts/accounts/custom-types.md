---
title: "Custom Types"
sidebar_position: 3
description: "Export custom structs and enums for use in public component methods with #[export_type]."
---

# Custom Types

When public [component](./components) methods use custom structs or enums, those types must be annotated with `#[export_type]` so the compiler can generate corresponding WIT interface definitions. Types used only internally (in private methods or local variables) don't need this annotation.

## When you need `#[export_type]`

Any custom type that appears in a **public method signature** must be annotated with `#[export_type]`:

```rust
use miden::{export_type, Felt, Word, Asset};

#[export_type]
pub struct StructA {
    pub foo: Word,
    pub asset: Asset,
}

#[export_type]
pub struct StructB {
    pub bar: Felt,
    pub baz: Felt,
}
```

Types that are only used internally (in private methods or local variables) don't need the annotation.

## Exporting structs

Struct fields must be public and use types that are either SDK types (`Felt`, `Word`, `Asset`, etc.) or themselves marked with `#[export_type]`:

```rust
use miden::{export_type, Felt, Word, Asset, component};

#[export_type]
pub struct StructA {
    pub foo: Word,
    pub asset: Asset,
}

#[export_type]
pub struct StructB {
    pub bar: Felt,
    pub baz: Felt,
}

#[component]
struct MyAccount;

#[component]
impl MyAccount {
    pub fn test_custom_types(&self, a: StructA, asset: Asset) -> StructB {
        StructB {
            bar: a.foo[0],
            baz: a.foo[1],
        }
    }
}
```

## Exporting enums

Enums work the same way — annotate with `#[export_type]`:

```rust
use miden::{export_type, Felt};

#[export_type]
pub enum EnumA {
    VariantA,
    VariantB,
}
```

Enum variants can be unit variants (as shown above). The compiler generates the corresponding WIT enum definition.

## Types in submodules

Custom types can be defined in submodules. Each type still needs `#[export_type]`:

```rust
pub mod my_types {
    use miden::{Felt, export_type};

    #[export_type]
    pub enum EnumA {
        VariantA,
        VariantB,
    }

    #[export_type]
    pub struct StructC {
        pub inner1: Felt,
        pub inner2: Felt,
    }
}

// Use in component methods
#[component]
impl MyAccount {
    pub fn process(&self, a: StructA, asset: Asset) -> my_types::StructC {
        my_types::StructC {
            inner1: a.foo[0],
            inner2: a.foo[1],
        }
    }
}
```

## Nested types

Exported types can reference other exported types:

```rust
#[export_type]
pub struct LaterDefined {
    pub value: Felt,
}

#[export_type]
pub struct ForwardHolder {
    pub nested: LaterDefined,
}
```

The compiler resolves references regardless of declaration order — `ForwardHolder` can reference `LaterDefined` even if it's defined first.

## Complete example

From the compiler test suite (`component-macros-account`):

```rust title="src/lib.rs"
#![no_std]
#![feature(alloc_error_handler)]

use miden::{Asset, Felt, Word, component, export_type};

pub mod my_types {
    use miden::{Felt, export_type};

    #[export_type]
    pub enum EnumA {
        VariantA,
        VariantB,
    }

    #[export_type]
    pub struct StructC {
        pub inner1: Felt,
        pub inner2: Felt,
    }
}

#[export_type]
pub struct StructA {
    pub foo: Word,
    pub asset: Asset,
}

#[export_type]
pub struct StructB {
    pub bar: Felt,
    pub baz: Felt,
}

#[component]
struct MyAccount;

#[component]
impl MyAccount {
    pub fn test_custom_types(&self, a: StructA, asset: Asset) -> StructB {
        StructB {
            bar: a.foo.inner.0,
            baz: a.foo.inner.1,
        }
    }

    pub fn test_custom_types2(&self, a: StructA, asset: Asset) -> my_types::StructC {
        my_types::StructC {
            inner1: a.foo.inner.0,
            inner2: a.foo.inner.1,
        }
    }
}
```

```toml title="Cargo.toml"
[package]
name = "component_macros_account"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
miden = { path = "../../../../sdk/sdk" }

[package.metadata.component]
package = "miden:component-macros-account"

[package.metadata.miden]
project-kind = "account"
supported-types = ["RegularAccountUpdatableCode"]
```

## Rules summary

| Rule | Details |
|------|---------|
| When needed | Any custom type in a `pub fn` signature on a `#[component]` impl |
| Struct fields | Must be `pub` |
| Allowed field types | `Felt`, `Word`, `Asset`, `AccountId`, or other `#[export_type]` types |
| Enums | Unit variants supported |
| Modules | Types in submodules work — just apply `#[export_type]` to each |
| Order | Declaration order doesn't matter — forward references are resolved |

Exported types appear in generated WIT bindings used by [cross-component calls](../cross-component-calls).

:::info API Reference
Full API docs on docs.rs: [`miden`](https://docs.rs/miden/latest/miden/) (`#[export_type]` macro)
:::
