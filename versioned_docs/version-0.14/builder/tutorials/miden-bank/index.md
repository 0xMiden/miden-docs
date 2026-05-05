---
sidebar_position: 4
title: "Building a Bank with Miden Rust"
description: "Learn Miden Rust compiler fundamentals by building a complete banking application with deposits, withdrawals, and asset management."
---

# Building a Bank with Miden Rust

Welcome to the **Miden Rust Compiler Tutorial**. This hands-on guide teaches you how to build smart contracts on Miden using Rust by walking through a complete banking application, part by part.

## What you'll build

A banking system consisting of:

- **Bank account component** — a smart contract that manages depositor balances and vault operations.
- **Deposit note** — a note script that processes deposits into the bank.
- **Withdraw request note** — a note script that requests withdrawals.
- **Initialization script** — a transaction script to deploy and initialize the bank.

Each part ends with a **runnable MockChain test** so you can verify what you built works correctly.

## Tutorial structure

Every part builds on the previous one and includes:

- **What you'll build** — clear objectives for the section.
- **Step-by-step code** — progressively building functionality.
- **Try it** — a MockChain test to verify your code works.
- **Complete code** — full code listing for reference.

## Walkthrough

<CardGrid cols={2}>
  <Card title="Part 0: Project setup" docId="builder/tutorials/miden-bank/project-setup" eyebrow="Start here">
    Create your project with `miden new` and understand the workspace structure.
  </Card>
  <Card title="Part 1: Account components" docId="builder/tutorials/miden-bank/account-components" eyebrow="Component model">
    Learn `#[component]`, `Value` storage, and `StorageMap` for managing state.
  </Card>
  <Card title="Part 2: Constants & constraints" docId="builder/tutorials/miden-bank/constants-constraints" eyebrow="Business rules">
    Define constants and validate inputs with assertions.
  </Card>
  <Card title="Part 3: Asset management" docId="builder/tutorials/miden-bank/asset-management" eyebrow="Vault ops">
    Handle fungible assets with vault operations and balance tracking.
  </Card>
  <Card title="Part 4: Note scripts" docId="builder/tutorials/miden-bank/note-scripts" eyebrow="Consuming notes">
    Write scripts that execute when notes are consumed.
  </Card>
  <Card title="Part 5: Cross-component calls" docId="builder/tutorials/miden-bank/cross-component-calls" eyebrow="Composition">
    Call account methods from note scripts via bindings.
  </Card>
  <Card title="Part 6: Transaction scripts" docId="builder/tutorials/miden-bank/transaction-scripts" eyebrow="Account ops">
    Write scripts for account initialization and owner operations.
  </Card>
  <Card title="Part 7: Output notes" docId="builder/tutorials/miden-bank/output-notes" eyebrow="Emitting notes">
    Create P2ID notes programmatically for withdrawals.
  </Card>
  <Card title="Part 8: Complete flows" docId="builder/tutorials/miden-bank/complete-flows" eyebrow="End-to-end">
    Walk through end-to-end deposit and withdraw operations.
  </Card>
</CardGrid>

## Prerequisites

- Completed the [Get started guide](../../get-started/index.md) — `midenup`, `miden new`, basic tooling.
- Understanding of Miden concepts: [accounts, notes, transactions](../../smart-contracts/index.md).
- Rust programming experience.

<Callout variant="tip" title="No Miden-Rust experience required">
This tutorial assumes no prior experience with the Miden Rust compiler. We explain every concept as it comes up.
</Callout>

## Concepts covered

| Concept                      | What it does                                               | Part |
| ---------------------------- | ---------------------------------------------------------- | ---- |
| `#[component]`               | Define account components with storage                     | 1    |
| Storage types                | `Value` for single values, `StorageMap` for key-value data | 1    |
| Constants                    | Define compile-time business rules                         | 2    |
| Assertions                   | Validate conditions and handle errors                      | 2    |
| Asset handling               | Add and remove assets from account vaults                  | 3    |
| `#[note]` + `#[note_script]` | Note struct/impl pattern for scripts consumed by accounts  | 4    |
| Cross-component calls        | Call account methods from note scripts                     | 5    |
| `#[tx_script]`               | Transaction scripts for account operations                 | 6    |
| Output notes                 | Create notes programmatically                              | 7    |

## Source code

The complete source code for this tutorial is available in the [examples/miden-bank](https://github.com/0xMiden/miden-tutorials/tree/main/examples/miden-bank) directory of the miden-tutorials repository:

```bash title=">_ Terminal"
git clone https://github.com/0xMiden/miden-tutorials.git
cd miden-tutorials/examples/miden-bank
```

## Supplementary guides

<CardGrid cols={3}>
  <Card title="Testing with MockChain" docId="builder/tutorials/helpers/testing" eyebrow="Guide">
    Learn to test your contracts with MockChain for local simulation.
  </Card>
  <Card title="Debugging" docId="builder/tutorials/helpers/debugging" eyebrow="Guide">
    Interpret errors and debug common issues.
  </Card>
  <Card title="Common pitfalls" docId="builder/tutorials/helpers/pitfalls" eyebrow="Guide">
    Avoid known issues and limitations.
  </Card>
</CardGrid>

## Getting help

- Detailed technical reference: [docs.miden.xyz](https://docs.miden.xyz).
- Join the [Build on Miden](https://t.me/BuildOnMiden) Telegram for support.
- Review the complete code in the [examples/miden-bank](https://github.com/0xMiden/miden-tutorials/tree/main/examples/miden-bank) directory.

Ready? Start with [Part 0: Project setup](./00-project-setup.md).
