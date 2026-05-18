---
title: "Miden Smart Contracts"
description: "Build Miden smart contracts with Rust, Miden Assembly, and reusable Miden Standards."
pagination_prev: null
---

# Miden Smart Contracts

This section covers the developer-facing paths for building smart contracts on Miden. Use Rust when you want the higher-level SDK and compiler workflow, use Miden Assembly when you need direct control over VM execution, and use Miden Standards when you want reusable account components, note scripts, faucet policies, and protocol-compatible building blocks.

If you're new to Miden, follow the hands-on [Miden Bank Tutorial](../tutorials/miden-bank/).

## Authoring paths

| Path | Status | Start here |
|------|--------|------------|
| Rust | Account, note, transaction, type, and composition docs for Rust-first smart-contract development. | [Rust](./rust) |
| Miden Assembly | Dedicated authoring path planned; direct MASM appears today in note, transaction, and reference docs. | [Note scripts](./notes/note-scripts) |
| Miden Standards | Shared reusable components, notes, faucet policies, and MASM modules. | [Miden Standards](./standards/) |

## Building blocks

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
  <Card title="Cross-component calls" href="./cross-component-calls" eyebrow="Composition">
    Calling methods across account components and from note scripts.
  </Card>
</CardGrid>

## Reference

<CardGrid cols={3}>
  <Card title="Types" href="./types" eyebrow="Primitives">
    Core types: Felt, Word, AccountId, NoteId, and more.
  </Card>
  <Card title="Patterns" href="./patterns" eyebrow="Recipes">
    Access control, rate limiting, spending limits, and anti-patterns.
  </Card>
  <Card title="API reference" href="https://docs.rs/miden/latest/miden/" eyebrow="docs.rs">
    Complete API documentation for the miden crate.
  </Card>
</CardGrid>
