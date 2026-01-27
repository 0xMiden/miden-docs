# How Miden Works

Welcome to the Miden Design documentation. This section explains the architecture, protocols, and internal mechanisms that power the Miden network.

## Architecture Overview

Miden is a zero-knowledge rollup built on STARKs. The network consists of:

- **Protocol** - The state model, accounts, notes, and transaction semantics
- **Virtual Machine** - The Miden VM that executes programs and generates proofs
- **Proving System** - STARK-based cryptographic proofs for validity
- **Client** - Libraries for building and submitting transactions
- **Node** - Infrastructure for running network operators

## Section Guide

### Protocol

The foundational design of the Miden state machine:

- Blockchain structure and state transitions
- Account model and storage
- Note-based transaction semantics
- Asset definitions and fungibility

### Virtual Machine

How the Miden VM executes programs:

- Chiplet architecture (Memory, Hasher, Bitwise, ACE)
- Decoder constraints
- Stack operations
- Lookup tables (LogUp, Multiset)

### Proving

The cryptographic foundation:

- STARK proof background
- Execution trace optimization
- Performance characteristics

### Client & Node

System architecture for network participants:

- Client design and capabilities
- Node operator infrastructure
- RPC interfaces

## Prerequisites

This documentation assumes familiarity with:

- Basic cryptography concepts
- Zero-knowledge proofs (conceptual understanding)
- Blockchain state machines

For practical usage guides, see the [Builder documentation](/builder).
