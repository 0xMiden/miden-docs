---
sidebar_label: Introduction
sidebar_position: 0
---

<!--
ARCHITECTURE NOTE:
This landing page is the ONLY Design content in docs/.
Full Design documentation (Protocol, VM, Compiler, Node) lives in versioned_docs/
and is populated by ingestion from external source repositories.
DO NOT add protocol documentation files here.
-->

# Miden Design

This section explains the architecture, protocols, and internal mechanisms that power the Miden network.

:::info Version Note
Design documentation (Protocol, Virtual Machine, Compiler, Node) is available in **released versions only**. Please select a version from the dropdown (e.g., 0.12, 0.11) to access the full Design documentation.
:::

## Overview

Miden is a zero-knowledge rollup built on STARKs that uses an **actor model** where each account is an independent state machine. Unlike traditional blockchains where a single global state is updated sequentially, Miden enables parallel execution through isolated account states.

### How Transactions Work

1. **Local Execution** – Users execute transactions on their own devices, updating their account state locally
2. **Proof Generation** – The client generates a STARK proof attesting to the validity of the state transition
3. **Note Creation** – Transactions produce notes that carry assets and data to recipient accounts
4. **Network Submission** – Only the proof and resulting notes are submitted to the network
5. **Verification** – The Miden node verifies proofs and updates commitment trees

### State Model

Miden separates state into two domains:

- **Account State** – Each account maintains its own isolated state (code, storage, assets)
- **Note State** – Notes exist independently until consumed by a recipient account

Both accounts and notes can be **public** (full data on-chain) or **private** (only commitments stored on-chain).

### Execution Environment

The Miden VM is a STARK-based virtual machine optimized for zero-knowledge proof generation:

- **Stack-based architecture** with specialized chiplets for cryptographic operations
- **Miden Assembly (MASM)** as the native instruction set
- **Rust compiler** (in development) for writing smart contracts in Rust

## Prerequisites

This documentation assumes familiarity with:

- Basic cryptography concepts (hash functions, Merkle trees)
- Zero-knowledge proofs (conceptual understanding of STARKs)
- Blockchain state machines and consensus

For practical usage guides, see the [Build documentation](/).
