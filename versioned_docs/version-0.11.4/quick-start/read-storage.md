---
sidebar_position: 4
title: Read Storage Values
description: Learn how to query account storage data using the Miden CLI.
draft: true
---

# Read Storage Values

Welcome to Miden's powerful storage system! This guide will teach you how to read and understand account storage: your on-chain data.

## Understanding Miden Account Storage

**Account Storage** in Miden is like a sophisticated filing cabinet where accounts can store arbitrary data. Unlike simple balance tracking, Miden storage enables complex applications and smart contracts.

### Storage Architecture

Miden accounts support **up to 255 indexed storage slots**, each serving different purposes:

#### Value Slots (Simple Storage)

- **Purpose**: Store small, fixed-size data
- **Capacity**: Exactly 32 bytes per slot
- **Use Cases**: Public keys, configuration values, flags
- **Access**: Direct slot index (0-254)

#### Map Slots (Advanced Storage)

- **Purpose**: Store large amounts of key-value data
- **Structure**: Sparse Merkle Tree (SMT)
- **Capacity**: Virtually unlimited key-value pairs
- **Use Cases**: User profiles, game states, complex data structures
- **Access**: Hash-based key lookup

### Words vs Felts: Miden's Data Types

#### Felt (Field Element)

- **Definition**: Basic unit of computation in Miden VM
- **Size**: ~31 bytes (prime field element)
- **Range**: 0 to 2^64 - 2^32 + 1 (Goldilocks prime)
- **Use**: Numbers, hashes, small data

#### Word

- **Definition**: Collection of 4 Felts
- **Size**: 4 × 31 bytes = ~124 bytes
- **Structure**: `[felt0, felt1, felt2, felt3]`
- **Use**: Larger data structures, addresses, complex values

```rust title="data-types.rs"
// Example data types
type Felt = u64;  // Simplified representation
type Word = [Felt; 4];  // Array of 4 field elements

// Storage examples
let public_key: Word = [felt1, felt2, felt3, felt4];
let balance: Felt = 1000;
let timestamp: Felt = 1672531;
```

## Storage Modes & Privacy

| Storage Mode | Data Visibility           | Use Case                                 |
| ------------ | ------------------------- | ---------------------------------------- |
| **Public**   | Fully on-chain & readable | Transparent contracts, public registries |
| **Private**  | Only commitments on-chain | Personal data, confidential applications |

## How to Read Storage Data

### Prerequisites

- **[Miden CLI installed](./index.md#install-miden-cli)**
- **Account created and deployed** (from [Create Account](./create-account.md))

### Reading Value Slots

:::note todo
Add section and explain how to use `miden call` once available
:::
