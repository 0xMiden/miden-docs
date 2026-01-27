# How Miden Works

Welcome to the Miden Design documentation. This section explains the architecture, protocols, and internal mechanisms that power the Miden network.

## Architecture Overview

Miden is a zero-knowledge rollup built on STARKs. The network consists of:

- **Protocol** - The state model, accounts, notes, and transaction semantics
- **Virtual Machine** - The Miden VM that executes programs and generates proofs
- **Proving System** - STARK-based cryptographic proofs for validity
- **Client** - Libraries for building and submitting transactions
- **Node** - Infrastructure for running network operators

## Documentation Sections

### [Miden Base](./miden-base)
The foundational protocol design: accounts, notes, assets, transactions, and blockchain structure.

### [Miden VM](./miden-vm)
Virtual machine architecture: chiplets, decoder, stack operations, and lookup tables.

### [Compiler](./compiler)
Compiler design, usage guides, and technical appendix.

### [Miden Node](./miden-node)
Node operator documentation and infrastructure guides.

## Prerequisites

This documentation assumes familiarity with:

- Basic cryptography concepts
- Zero-knowledge proofs (conceptual understanding)
- Blockchain state machines

For practical usage guides, see the [Builder documentation](/builder).
