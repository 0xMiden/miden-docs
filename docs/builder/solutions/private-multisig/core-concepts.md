---
title: Core Concepts
sidebar_position: 1
---

# Core Concepts

## Transaction lifecycle

Every multisig transaction follows the same lifecycle: propose, sign, execute, sync.

```mermaid
sequenceDiagram
    participant P as Proposer
    participant PSM as PSM Server
    participant C1 as Cosigner 1
    participant C2 as Cosigner 2

    P->>P: Build TransactionSummary locally
    P->>PSM: push_delta_proposal<br/>(tx_summary + proposer signature)
    PSM->>PSM: Validate against current state

    C1->>PSM: get_delta_proposals
    PSM-->>C1: Pending proposals
    C1->>C1: Verify locally
    C1->>PSM: sign_delta_proposal

    C2->>PSM: get_delta_proposals
    PSM-->>C2: Pending proposals
    C2->>C2: Verify locally
    C2->>PSM: sign_delta_proposal

    Note over PSM: Threshold met

    P->>PSM: push_delta (with all signatures)
    PSM-->>P: Canonical delta with ack_sig
    P->>P: Execute on-chain with ZK proof
```

1. **Propose**: The proposer builds a `TransactionSummary` locally, signs it, and pushes it to PSM as a delta proposal.
2. **Sign**: Each cosigner fetches pending proposals, verifies the transaction details against their local state, and submits their signature.
3. **Execute**: Once the threshold is met, any participant pushes the final delta (with all signatures). PSM returns the acknowledged delta. The executor builds and submits the on-chain transaction.
4. **Sync**: All participants fetch the latest state from PSM to stay synchronized.

## Key architecture: 2-of-3 setup

A common configuration uses a 2-of-3 threshold:

| Key | Holder | Purpose |
|---|---|---|
| **Key 1** | User hot key | Daily transactions |
| **Key 2** | User cold key | Recovery and emergency override |
| **Key 3** | PSM service key | Co-signing and policy enforcement |

```mermaid
graph TD
    subgraph "Normal operation (Hot + PSM)"
        Hot["User Hot Key"] --> TX["Transaction"]
        PSMKey["PSM Service Key"] --> TX
    end

    subgraph "Emergency override (Hot + Cold)"
        Hot2["User Hot Key"] --> Override["Rotate PSM / Adjust policies<br/>Switch providers"]
        Cold["User Cold Key"] --> Override
    end
```

- **Normal operations**: Hot key + PSM's co-signature are sufficient.
- **Emergency override**: Hot + cold keys alone can rotate out PSM or switch providers.
- **PSM alone cannot move funds**: It holds only one key in the threshold.

## Transaction types

| Type | Description |
|---|---|
| **Transfer (P2ID)** | Send assets to another account |
| **Consume notes** | Spend incoming notes |
| **Add signer** | Add a new cosigner to the multisig account |
| **Remove signer** | Remove a cosigner |
| **Change threshold** | Update the required signature count |
| **Switch PSM** | Change the PSM provider endpoint |

## Signer types

The TypeScript SDK supports multiple signer backends:

| Signer | Scheme | Use case |
|---|---|---|
| `FalconSigner` | Falcon | Local Falcon key (default) |
| `EcdsaSigner` | ECDSA | Local ECDSA key |
| `ParaSigner` | ECDSA | External EVM wallets via [Para](https://getpara.com) SDK |
| `MidenWalletSigner` | Any | [Miden Wallet](https://github.com/demox-labs/miden-wallet) browser extension |

## Offline fallback

If PSM is unreachable, the SDKs support fully offline workflows:

```mermaid
sequenceDiagram
    participant A as Signer A
    participant File as JSON File<br/>(side channel)
    participant B as Signer B

    A->>A: Create proposal offline
    A->>File: Export proposal.json

    File-->>B: Share via email, chat, etc.
    B->>B: Sign proposal locally
    B->>File: Export signed proposal

    File-->>A: Return signed file
    A->>A: Collect enough signatures
    A->>A: Execute transaction on-chain
```

1. Create a proposal locally and export it as JSON.
2. Share the file with cosigners through any side channel.
3. Each cosigner signs offline and returns the signed file.
4. Once the threshold is met, execute the transaction on-chain.

This ensures multisig operations remain functional even without PSM connectivity.
