---
title: "Rust Compiler"
sidebar_position: 1
description: "Learn to build Miden smart contracts using Rust with the Miden Rust compiler."
---

# Rust Compiler

The Miden Rust compiler lets you write smart contracts in Rust and compile them to Miden Assembly (MASM). This section covers tutorials and reference documentation for building with the Rust compiler.

## Getting started

If you're new to the Miden Rust compiler, start with the **Miden Bank tutorial** — a comprehensive, step-by-step guide that teaches all the core concepts through building a complete banking application.

<CardGrid cols={2}>
  <Card title="Miden Bank tutorial" href="../miden-bank/" eyebrow="Walkthrough">
    Build a complete banking application while learning account components, note and transaction scripts, asset management, cross-component calls, and output note creation.
  </Card>
  <Card title="Rust SDK reference" href="../../smart-contracts/" eyebrow="Reference">
    Types, macros, storage, APIs, and more — detailed reference documentation for the Miden Rust SDK.
  </Card>
</CardGrid>

## Supplementary guides

<CardGrid cols={3}>
  <Card title="Testing with MockChain" href="../../guides/testing" eyebrow="Guide">
    Test your contracts using MockChain for local blockchain simulation.
  </Card>
  <Card title="Debugging" href="../../guides/debugging" eyebrow="Guide">
    Interpret errors and debug common issues.
  </Card>
  <Card title="Common pitfalls" href="../../guides/pitfalls" eyebrow="Guide">
    Avoid known issues and limitations.
  </Card>
</CardGrid>

## Source code

The complete source code for the Miden Bank example is available at **[github.com/keinberger/miden-bank](https://github.com/keinberger/miden-bank)**.

## Prerequisites

Before starting, ensure you have:

- Completed the [Get Started guide](../../get-started/)
- Basic familiarity with Rust programming
- Understanding of Miden concepts (accounts, notes, transactions)
