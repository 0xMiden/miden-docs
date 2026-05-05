---
title: "Miden Smart Contracts"
description: "Reference documentation for building Miden smart contracts in Rust using the Miden SDK."
pagination_prev: null
---

# Miden Smart Contracts

This section is the complete reference for building smart contracts on Miden using Rust and the Miden SDK. If you're new to Miden, follow the hands-on [Miden Bank Tutorial](../tutorials/miden-bank/index.md).

All Miden Rust contracts compile under these constraints: `#![no_std]`, Rust 2024 edition.

## Core concepts

<CardGrid cols={3}>
  <Card title="Accounts" href="./accounts/" eyebrow="State & code">
    Components, storage, custom types, operations, cryptography, and authentication.
  </Card>
  <Card title="Notes" href="./notes/" eyebrow="Programmable messages">
    Programmable UTXOs for asset transfers.
  </Card>
  <Card title="Transactions" href="./transactions/" eyebrow="Execution">
    Transaction context, scripts, and the advice provider.
  </Card>
  <Card title="Cross-component calls" docId="builder/smart-contracts/cross-component-calls" eyebrow="Composition">
    Calling methods across account components and from note scripts.
  </Card>
</CardGrid>

## Reference

<CardGrid cols={3}>
  <Card title="Types" docId="builder/smart-contracts/types" eyebrow="Primitives">
    Core types: Felt, Word, AccountId, NoteId, and more.
  </Card>
  <Card title="Patterns" docId="builder/smart-contracts/patterns" eyebrow="Recipes">
    Access control, rate limiting, spending limits, and anti-patterns.
  </Card>
  <Card title="API reference" href="https://docs.rs/miden/latest/miden/" eyebrow="docs.rs">
    Complete API documentation for the miden crate.
  </Card>
</CardGrid>
