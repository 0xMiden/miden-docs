---
title: Overview
sidebar_position: 1
---

# What is the Private State Manager?

Miden uses client-side execution — transactions are built and proven locally on user devices. This means account state lives on the client, not on a centralized server. While this gives users full control over their data, it introduces practical challenges:

- **Backup**: If a device is lost, so is the account state.
- **Multi-device sync**: A user with a phone and laptop needs both devices to see the same account state.
- **Multi-party coordination**: Multisig accounts require multiple signers to agree on state changes before they can be submitted on-chain.

The Private State Manager (PSM) solves these problems. It is a server that stores encrypted account state and coordinates state changes across devices and parties — without the server operator ever gaining the ability to forge or tamper with the state.

## Architecture

PSM sits between Miden clients and the Miden network:

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Miden       │     │   PSM       │     │  Miden      │
│  Client A    │◄───►│   Server    │◄───►│  Node       │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
┌─────────────┐            │
│  Miden       │◄──────────┘
│  Client B    │
└─────────────┘
```

- **Miden Client** handles transaction execution, proving, and local state management.
- **PSM Server** stores state snapshots and deltas, authenticates requests, validates changes against the network, and coordinates multi-party workflows.
- **Miden Node** is the network's RPC endpoint that PSM validates state against.

Each account is independently configured on PSM with its own authentication policy and storage. Clients interact with PSM through either gRPC or HTTP — both interfaces expose the same semantics.

## How it works

PSM models account state as an append-only chain of deltas:

1. **Configure**: A client registers an account with PSM, providing authentication credentials and an initial state snapshot.
2. **Push delta**: When the client executes a transaction, it pushes the resulting state change (delta) to PSM. The server validates the delta against the current state and the Miden network, then acknowledges it with a cryptographic signature.
3. **Get state**: Any authorized device can retrieve the latest state snapshot, which includes all validated deltas merged together.

For multi-party workflows, PSM adds delta proposals — a coordination layer where signers can propose, review, and co-sign state changes before they become canonical.

## Trust model

PSM is designed to minimize trust in the server operator:

- **Integrity**: Every delta references the previous state commitment. The server cannot silently insert, reorder, or drop deltas without breaking the commitment chain.
- **Acknowledgement**: The server signs each accepted delta with its own key. Clients can verify these signatures to confirm the server processed their changes.
- **Authentication**: Only authorized parties (listed in the account's cosigner allowlist) can read or write state. Authentication uses Falcon RPO signatures with replay protection.
- **Network validation**: The server validates deltas against the Miden network's state, ensuring changes are consistent with on-chain reality.

The server _can_ refuse to serve data (denial of service), but it cannot forge state or silently corrupt an account's history.

## Use cases

| Use case | How PSM helps |
|---|---|
| **State backup** | Account state is stored on PSM, recoverable even if the device is lost. |
| **Multi-device sync** | Multiple devices can push and pull state through PSM, staying in sync. |
| **Multi-party coordination** | Multisig accounts use delta proposals to coordinate threshold signing across participants. |
| **Audit trail** | The append-only delta chain provides a verifiable history of all state changes. |
