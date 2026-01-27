<!--
ARCHITECTURE NOTE:
This landing page is the ONLY Design content in docs/.
Full Design documentation (Protocol, VM, Compiler, Node) lives in versioned_docs/
and is populated by ingestion from external source repositories.
DO NOT add protocol documentation files here.
-->

# How Miden Works

Welcome to the Miden Design documentation. This section explains the architecture, protocols, and internal mechanisms that power the Miden network.

:::info Version Note
Design documentation (Protocol, Virtual Machine, Compiler, Node) is available in **released versions only**. Please select a version from the dropdown (e.g., 0.12, 0.11) to access the full Design documentation.
:::

## Architecture Overview

Miden is a zero-knowledge rollup built on STARKs. The network consists of:

- **Protocol** - The state model, accounts, notes, and transaction semantics
- **Virtual Machine** - The Miden VM that executes programs and generates proofs
- **Proving System** - STARK-based cryptographic proofs for validity
- **Client** - Libraries for building and submitting transactions
- **Node** - Infrastructure for running network operators

## Documentation Sections

Select a released version to access:

- **Protocol** - Foundational protocol design: accounts, notes, assets, transactions, and blockchain structure
- **Virtual Machine** - VM architecture: chiplets, decoder, stack operations, and lookup tables
- **Compiler** - Compiler design, usage guides, and technical appendix
- **Node** - Node operator documentation and infrastructure guides

## Prerequisites

This documentation assumes familiarity with:

- Basic cryptography concepts
- Zero-knowledge proofs (conceptual understanding)
- Blockchain state machines

For practical usage guides, see the [Builder documentation](/builder).
