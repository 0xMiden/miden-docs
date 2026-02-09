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

## Basics

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './overview',
        label: 'Overview',
        description: 'Execution model, account system, notes, and ZK proofs.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './getting-started',
        label: 'Getting Started',
        description: 'Install the toolchain, create a project, and build it.',
      }}
    />
  </div>
</div>

## SDK

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './types',
        label: 'Types',
        description: 'Felt, Word, Asset — field arithmetic and conversions.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './components',
        label: 'Components',
        description: 'The #[component] macro, storage, and methods.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './storage',
        label: 'Storage',
        description: 'Value slots and StorageMaps for persistent state.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './custom-types',
        label: 'Custom Types',
        description: 'Export structs and enums with #[export_type].',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './account-operations',
        label: 'Account Operations',
        description: 'Read state and mutate the vault.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './notes',
        label: 'Notes',
        description: 'Programmable UTXOs for asset transfers.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './transaction-context',
        label: 'Transaction Context',
        description: 'Block queries, expiration, and #[tx_script].',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './authentication',
        label: 'Authentication',
        description: 'Falcon512 signatures and replay protection.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './cross-component-calls',
        label: 'Cross-Component Calls',
        description: 'WIT bindings and generate!() for inter-component calls.',
      }}
    />
  </div>
</div>

## Patterns & Security

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './patterns',
        label: 'Patterns & Security',
        description: 'Access control, rate limiting, spending limits, and anti-patterns.',
      }}
    />
  </div>
</div>

## Quick Reference

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './api-reference',
        label: 'Cheatsheet',
        description: 'Every function, type, trait, and macro at a glance.',
      }}
    />
  </div>
</div>
