---
title: "Rust Reference"
sidebar_position: 0
description: "Complete reference documentation for building Miden smart contracts in Rust using the Miden compiler SDK."
---

# Rust Reference

Complete reference documentation for the Miden Rust compiler SDK (v0.9.0). Use these pages as a reference while building — for a hands-on tutorial, see the [Miden Bank Tutorial](../../develop/tutorials/rust-compiler/miden-bank/).

:::tip Quick imports
```rust
use miden::{component, felt, Felt, Word, Asset, AccountId, NoteIdx};
use miden::{Value, StorageMap, ValueAccess, StorageMapAccess};
use miden::{active_account, native_account, active_note, output_note, tx};
```
:::

## Environment

All Miden Rust contracts compile under these constraints:

- `#![no_std]` — no standard library
- Rust 2024 edition
- Target: `wasm32-unknown-unknown` → Miden Assembly → ZK proof

import DocCard from '@theme/DocCard';

## Concepts

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './overview',
        label: 'Overview',
        description: 'Client-side execution, ZK proofs, and the account model — the big picture.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './getting-started',
        label: 'Getting Started',
        description: 'Create your first project with miden new and build it.',
      }}
    />
  </div>
</div>

## Core

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './components',
        label: 'Components',
        description: 'The #[component] macro, storage attributes, and impl blocks.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './types',
        label: 'Type System',
        description: 'Felt, Word, Asset, AccountId — field arithmetic and type conversions.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './storage',
        label: 'Storage',
        description: 'Value slots, StorageMaps, and persistent state management.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './custom-types',
        label: 'Custom Types',
        description: 'Export structs and enums with #[export_type] for use in public APIs.',
      }}
    />
  </div>
</div>

## Operations

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './account-operations',
        label: 'Account Operations',
        description: 'Read account state and mutate the vault with active_account and native_account.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './notes',
        label: 'Notes',
        description: 'Create output notes and read input notes for asset transfers.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './note-scripts',
        label: 'Note Scripts',
        description: 'Write note scripts with #[note] and #[note_script] macros.',
      }}
    />
  </div>
</div>

## Advanced

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './transaction-context',
        label: 'Transaction Context',
        description: 'Transaction scripts, block queries, and expiration management.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './authentication',
        label: 'Authentication',
        description: 'RPO-Falcon512 signatures, nonce management, and replay protection.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './cross-component-calls',
        label: 'Cross-Component Calls',
        description: 'Call methods across components using generate!() and WIT bindings.',
      }}
    />
  </div>
</div>

## Reference

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './patterns',
        label: 'Patterns & Best Practices',
        description: 'Access control, rate limiting, spending limits, and security patterns.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './api-reference',
        label: 'API Reference',
        description: 'Every function signature, type, trait, and macro in the SDK.',
      }}
    />
  </div>
</div>
