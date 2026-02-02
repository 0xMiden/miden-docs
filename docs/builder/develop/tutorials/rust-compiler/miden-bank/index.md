---
sidebar_position: 4
title: "Building a Bank with Miden Rust"
description: "Learn Miden Rust compiler fundamentals by building a complete banking application with deposits, withdrawals, and asset management."
---

# Building a Bank with Miden Rust

Welcome to the **Miden Rust Compiler Tutorial**! This hands-on guide teaches you how to build smart contracts on Miden using Rust by walking through a complete banking application.

## What You'll Build

You'll create a **banking system** consisting of:

- **Bank Account Component**: A smart contract that manages depositor balances and vault operations
- **Deposit Note**: A note script that processes deposits into the bank
- **Withdraw Request Note**: A note script that requests withdrawals from the bank
- **Initialization Script**: A transaction script to deploy and initialize the bank

Each part ends with a **runnable MockChain test** that verifies what you built works correctly.

## Tutorial Structure

This tutorial is designed for hands-on learning. Each part builds on the previous one, and every part includes:

- **What You'll Build** - Clear objectives for the section
- **Step-by-step code** - Progressively building functionality
- **Try It section** - A MockChain test to verify your code works
- **Complete code** - Full code listing for reference

### Parts Overview

| Part | Topic | What You'll Build |
|------|-------|-------------------|
| **Part 0** | [Project Setup](./00-project-setup) | Create project with `miden new` |
| **Part 1** | [Account Components](./01-account-components) | Bank struct with storage |
| **Part 2** | [Constants & Constraints](./02-constants-constraints) | Business rules and validation |
| **Part 3** | [Asset Management](./03-asset-management) | Deposit logic with balance tracking |
| **Part 4** | [Note Scripts](./04-note-scripts) | Deposit note for receiving assets |
| **Part 5** | [Cross-Component Calls](./05-cross-component-calls) | How bindings enable calls |
| **Part 6** | [Transaction Scripts](./06-transaction-scripts) | Initialization script |
| **Part 7** | [Output Notes](./07-output-notes) | Withdraw with P2ID output |
| **Part 8** | [Complete Flows](./08-complete-flows) | End-to-end verification |

## Tutorial Cards

import DocCard from '@theme/DocCard';

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './00-project-setup',
        label: 'Part 0: Project Setup',
        description: 'Create your project with miden new and understand the workspace structure.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './01-account-components',
        label: 'Part 1: Account Components',
        description: 'Learn #[component], Value storage, and StorageMap for managing state.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './02-constants-constraints',
        label: 'Part 2: Constants & Constraints',
        description: 'Define business rules with constants and validate with assertions.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './03-asset-management',
        label: 'Part 3: Asset Management',
        description: 'Handle fungible assets with vault operations and balance tracking.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './04-note-scripts',
        label: 'Part 4: Note Scripts',
        description: 'Write scripts that execute when notes are consumed.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './05-cross-component-calls',
        label: 'Part 5: Cross-Component Calls',
        description: 'Call account methods from note scripts via bindings.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './06-transaction-scripts',
        label: 'Part 6: Transaction Scripts',
        description: 'Write scripts for account initialization and owner operations.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './07-output-notes',
        label: 'Part 7: Creating Output Notes',
        description: 'Create P2ID notes programmatically for withdrawals.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './08-complete-flows',
        label: 'Part 8: Complete Flows',
        description: 'Walk through end-to-end deposit and withdraw operations.',
      }}
    />
  </div>
</div>

## Prerequisites

Before starting this tutorial, ensure you have:

- Completed the [Quick Start guide](../../../quick-start/) (familiarity with `midenup`, `miden new`, basic tooling)
- Basic understanding of Miden concepts (accounts, notes, transactions)
- Rust programming experience

:::tip No Miden Rust Experience Required
This tutorial assumes no prior experience with the Miden Rust compiler. We'll explain each concept as we encounter it.
:::

## Concepts Covered

This tutorial covers the following Miden Rust compiler features:

| Concept               | Description                                                | Part |
| --------------------- | ---------------------------------------------------------- | ---- |
| `#[component]`        | Define account components with storage                     | 1 |
| Storage Types         | `Value` for single values, `StorageMap` for key-value data | 1 |
| Constants             | Define compile-time business rules                         | 2 |
| Assertions            | Validate conditions and handle errors                      | 2 |
| Asset Handling        | Add and remove assets from account vaults                  | 3 |
| `#[note_script]`      | Scripts that execute when notes are consumed               | 4 |
| Cross-Component Calls | Call account methods from note scripts                     | 5 |
| `#[tx_script]`        | Transaction scripts for account operations                 | 6 |
| Output Notes          | Create notes programmatically                              | 7 |

## Source Code Repository

The complete source code for this tutorial is available in the **[miden-bank repository](https://github.com/keinberger/miden-bank)**. You can clone it to follow along or reference the implementation:

```bash title=">_ Terminal"
git clone https://github.com/keinberger/miden-bank.git
cd miden-bank
```

## Supplementary Guides

These standalone guides complement the tutorial:

- **[Testing with MockChain](../../testing)** - Learn to test your contracts
- **[Debugging](../../debugging)** - Troubleshoot common issues
- **[Common Pitfalls](../../pitfalls)** - Avoid known gotchas

## Getting Help

If you get stuck during this tutorial:

- Check the [Miden Docs](https://docs.miden.xyz) for detailed technical references
- Join the [Build On Miden](https://t.me/BuildOnMiden) Telegram community for support
- Review the complete code in the [miden-bank repository](https://github.com/keinberger/miden-bank)

Ready to build your first Miden banking application? Let's get started with [Part 0: Project Setup](./00-project-setup)!
