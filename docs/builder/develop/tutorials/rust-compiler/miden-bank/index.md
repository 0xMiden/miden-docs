---
sidebar_position: 4
title: "Building a Bank with Miden Rust"
description: "Learn Miden Rust compiler fundamentals by building a complete banking application with deposits, withdrawals, and asset management."
---

# Building a Bank with Miden Rust

Welcome to the **Miden Rust Compiler Tutorial**! This multi-part guide teaches you how to build smart contracts on Miden using Rust by walking through a complete banking application.

## What You'll Build

You'll create a **banking system** consisting of:

- **Bank Account Component**: A smart contract that manages depositor balances and vault operations
- **Deposit Note**: A note script that processes deposits into the bank
- **Withdraw Request Note**: A note script that requests withdrawals from the bank
- **Initialization Script**: A transaction script to deploy and initialize the bank

This example demonstrates all major Miden Rust compiler concepts through a practical, real-world use case.

## Concepts Covered

This tutorial covers the following Miden Rust compiler features:

| Concept               | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `#[component]`        | Define account components with storage                     |
| Storage Types         | `Value` for single values, `StorageMap` for key-value data |
| Constants             | Define compile-time business rules                         |
| Asset Handling        | Add and remove assets from account vaults                  |
| `#[note_script]`      | Scripts that execute when notes are consumed               |
| `#[tx_script]`        | Transaction scripts for account operations                 |
| Cross-Component Calls | Call account methods from note scripts                     |
| Output Notes          | Create notes programmatically                              |

## Prerequisites

Before starting this tutorial, ensure you have:

- Completed the [Quick Start guide](../../../../quick-start/) (familiarity with `midenup`, `miden new`, basic tooling)
- Basic understanding of Miden concepts (accounts, notes, transactions)
- Rust programming experience

:::tip No Miden Rust Experience Required
This tutorial assumes no prior experience with the Miden Rust compiler. We'll explain each concept as we encounter it.
:::

## Tutorial Structure

Follow these sections in order:

import DocCard from '@theme/DocCard';

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './account-components',
        label: 'Part 1: Account Components',
        description: 'Learn #[component], Value storage, and StorageMap for managing state.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './constants-constraints',
        label: 'Part 2: Constants & Constraints',
        description: 'Define business rules with constants and validate with assertions.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './asset-management',
        label: 'Part 3: Asset Management',
        description: 'Handle fungible assets with vault operations.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './note-scripts',
        label: 'Part 4: Note Scripts',
        description: 'Write scripts that execute when notes are consumed.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './cross-component-calls',
        label: 'Part 5: Cross-Component Calls',
        description: 'Call account methods from note scripts via bindings.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './transaction-scripts',
        label: 'Part 6: Transaction Scripts',
        description: 'Write scripts for account initialization and owner operations.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './output-notes',
        label: 'Part 7: Creating Output Notes',
        description: 'Create P2ID notes programmatically for withdrawals.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './complete-flows',
        label: 'Part 8: Complete Flows',
        description: 'Walk through end-to-end deposit and withdraw operations.',
      }}
    />
  </div>
</div>

## Supplementary Guides

These standalone guides complement the tutorial:

- **[Testing with MockChain](../testing)** - Learn to test your contracts
- **[Debugging](../debugging)** - Troubleshoot common issues
- **[Common Pitfalls](../pitfalls)** - Avoid known gotchas

## Source Code Repository

The complete source code for this tutorial is available in the **[miden-bank repository](https://github.com/keinberger/miden-bank)**. You can clone it to follow along or reference the implementation:

```bash title=">_ Terminal"
git clone https://github.com/keinberger/miden-bank.git
cd miden-bank
```

## Getting Help

If you get stuck during this tutorial:

- Check the [Miden Docs](https://docs.miden.xyz) for detailed technical references
- Join the [Build On Miden](https://t.me/BuildOnMiden) Telegram community for support
- Review the complete code in the [miden-bank repository](https://github.com/keinberger/miden-bank)

Ready to build your first Miden banking application? Let's get started with [Part 1: Account Components](./account-components)!
