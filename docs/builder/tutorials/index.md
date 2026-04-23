---
title: Tutorials
sidebar_position: 0
pagination_prev: null
---

# Tutorials

Hands-on walkthroughs for building on Miden. Every tutorial pairs with runnable Rust and TypeScript examples from the [miden-tutorials](https://github.com/0xMiden/miden-tutorials) repo and with MockChain tests so you can verify each step locally.

## Pick a path

<CardGrid cols={3}>
  <Card title="Rust compiler" href="./rust-compiler/" eyebrow="Beginner · Walkthroughs">
    Install the Rust compiler toolchain and walk through your first Miden smart contract, step by step.
  </Card>
  <Card title="Miden Bank" href="./miden-bank/" eyebrow="Intermediate · Real app">
    Build a complete banking application — components, storage, note scripts, cross-component calls, output notes.
  </Card>
  <Card title="Miden node setup" href="./miden_node_setup" eyebrow="Operator">
    Run a Miden node locally or on testnet with `midenup` and the node binary.
  </Card>
</CardGrid>

## Prerequisites

- [Install the Miden toolchain](../get-started/setup/installation) with `midenup`.
- Basic familiarity with Rust (or TypeScript for the client examples).
- Understanding of the core concepts — [accounts, notes, transactions](../smart-contracts/).
