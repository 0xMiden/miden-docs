---
title: Architecture
sidebar_position: 1
---

# Architecture

PSM sits between Miden clients and the Miden network, providing an off-chain coordination layer for private account state.

## System overview

```mermaid
graph LR
    A["Miden Client A<br/>(Desktop)"] <-->|"gRPC / HTTP"| PSM["PSM Server"]
    B["Miden Client B<br/>(Mobile)"] <-->|"gRPC / HTTP"| PSM
    PSM <-->|"Validates state"| Node["Miden Node"]
```

- **Miden Client** handles transaction execution, proving, and local state management.
- **PSM Server** stores state snapshots and deltas, authenticates requests, validates changes against the network, and coordinates multi-party workflows.
- **Miden Node** is the network's RPC endpoint that PSM validates state against.

Each account is independently configured on PSM with its own authentication policy and storage. Clients interact with PSM through either gRPC or HTTP — both interfaces expose the same semantics.

## End-to-end transaction flow

Transactions proceed through a step-by-step process to ensure consistency and verifiability:

```mermaid
sequenceDiagram
    participant Client as Miden Client
    participant PSM as PSM Server
    participant Chain as Miden Network

    Client->>Client: 1. Execute transaction locally<br/>Generate delta
    Client->>PSM: 2. Submit delta for acknowledgment
    PSM->>PSM: 3. Validate delta against policies
    PSM->>PSM: Co-sign as "candidate"
    PSM-->>Client: Return ack signature
    Client->>Chain: 4. Submit ZK proof + state update
    Chain-->>PSM: 5. PSM monitors on-chain commitment
    alt Commitment matches candidate
        PSM->>PSM: Promote to "canonical"
        PSM-->>Client: Propagate confirmed delta
    else Commitment mismatch
        PSM->>PSM: Mark as "discarded"
        PSM-->>Client: Signal resync needed
    end
```

1. **Local execution**: The user computes a transaction locally, generating a delta (state change).
2. **Delta submission**: The user sends the delta to PSM for acknowledgment.
3. **PSM acknowledgment**: PSM validates the delta and co-signs it, designating it as a "candidate" state.
4. **Proof submission**: The user generates the ZK proof and submits it to the chain.
5. **Canonical confirmation**: PSM monitors the chain. If the on-chain commitment matches the candidate, the state becomes "canonical" and is propagated to other devices or signers.

## Multi-device sync

For users with multiple devices, PSM keeps state synchronized seamlessly:

```mermaid
sequenceDiagram
    participant Desktop as Desktop
    participant PSM as PSM Server
    participant Mobile as Mobile

    Desktop->>Desktop: Execute transaction
    Desktop->>PSM: Push delta
    PSM->>PSM: Validate & acknowledge
    Desktop->>Desktop: Submit proof to chain
    PSM->>PSM: Confirm canonical
    Mobile->>PSM: Get state
    PSM-->>Mobile: Return latest state
    Mobile->>Mobile: Replay delta locally
    Note over Mobile: State now matches Desktop
```

The desktop executes a transaction and pushes the delta to PSM. After on-chain confirmation, PSM propagates the canonical delta to the mobile device, which replays it locally — all without querying the chain directly.

## Account management

Accounts are configured with per-account authentication based on public keys (commitments). During setup, PSM records which keys are authorized to manage the account.

For each request, the client signs a payload with one of those keys and the server verifies the signature against the account's authorized keys. See [Components](./components.md) for details on the auth model.

## Canonicalization

Canonicalization is the process of validating that a state transition (delta) is valid against the on-chain commitment. It is optional and mainly used in multi-user setups.

```mermaid
stateDiagram-v2
    [*] --> candidate : push_delta
    candidate --> canonical : On-chain commitment matches
    candidate --> discarded : On-chain commitment mismatch
    canonical --> [*]
    discarded --> [*]
```

- **Candidate mode** (default): A background worker promotes or discards deltas after a configurable delay and network verification.
- **Optimistic mode**: Deltas become canonical immediately, skipping the verification window.

| Parameter | Default | Description |
|---|---|---|
| `delay_seconds` | 900 (15 min) | How long a candidate waits before the worker checks it. |
| `check_interval_seconds` | 60 (1 min) | How often the worker runs. |

## Common use cases

- **Single-user accounts**: Back up and sync state securely. If a device is lost, recover state from PSM.
- **Multi-user accounts**: Coordinate state and transactions between participants. PSM helps keep everyone on the latest canonical state.
