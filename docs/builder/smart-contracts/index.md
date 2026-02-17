---
title: "Rust Reference"
sidebar_position: 0
description: "Complete reference documentation for building Miden smart contracts in Rust using the Miden compiler SDK."
---

# Rust Reference

Complete reference documentation for the Miden Rust compiler SDK (v0.9.0). Use these pages as a reference while building — for a hands-on tutorial, see the [Miden Bank Tutorial](../develop/tutorials/rust-compiler/miden-bank/).

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
        label: 'How It Works',
        description: 'Execution model, accounts, notes, and the transaction lifecycle.',
      }}
    />
  </div>
</div>

## Accounts

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './accounts/components',
        label: 'Components',
        description: 'The #[component] macro, storage, and methods.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './accounts/storage',
        label: 'Storage',
        description: 'Value slots and StorageMaps for persistent state.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './accounts/custom-types',
        label: 'Custom Types',
        description: 'Export structs and enums with #[export_type].',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './accounts/account-operations',
        label: 'Account Operations',
        description: 'Read state and mutate the vault.',
      }}
    />
  </div>
</div>

## Transactions

<div className="row">
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
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './transactions/transaction-context',
        label: 'Transaction Context',
        description: 'Block queries, expiration, and #[tx_script].',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './transactions/authentication',
        label: 'Authentication',
        description: 'Falcon512 signatures and replay protection.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './transactions/cross-component-calls',
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
