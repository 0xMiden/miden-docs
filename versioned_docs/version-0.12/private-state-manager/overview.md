---
title: Overview
sidebar_position: 1
---

Private State Manager (PSM) lets Miden accounts (single or multisig) keep their private state backed up, synchronized, and verifiable without trusting a server operator.

## Core concepts
- Account State: canonical snapshot of an account (ID, commitment, nonce, vault, storage, etc).
- Account Delta: append-only change that transitions the account; includes a `TransactionSummary` plus metadata.

## Account management
Accounts are configured with per-account authentication based on Falcon public keys (commitments). During configuration, the PSM records which keys are authorized to manage the account. 
For each request, the client signs a payload with one of those keys and the server verifies the signature against the account’s authorized keys. PSM stores states, deltas, and proposals so clients can sync and verify over time.

## End-to-end flow
1) Configure account: set auth keys and initial account state (account ID, storage, vault, etc.).
2) When sending a transaction on-chain: 
a) client builds a `TransactionSummary` and sends it to the server.
b) the server validates the transaction against the current state and returns an acknowledgement (signature over the transaction summary commitment).
c) client executes the transaction, optionally passing the acknowledgement as advice.
d) the on-chain component verifies the user signature and optionally the PSM acknowledgement, then executes the transaction.
3) State sync: the clients can fetch the account state at any time from the server.

```
[1 Configure] -> [State Stored]
[2 Build TxSummary] -> [3 Ack Signed/Stored]
[4 Execute] -> [5 Verify on-chain] -> [Canonical State]
```

## Common use cases
- Single-user accounts: a single user can use the PSM to backup and sync their state securely. In case their device is lost, they can recover their state from the PSM.
- Multi-user accounts: a multi-user account can use the PSM to backup and sync their state securely. The PSM helps to coordinate the state and transactions between the participants.

## Canonicalization
Canonicalization is the process of validating that certain state transition is valid against the on-chain commitment. It is optional and mainly used in multi-user setups.

It consists of a state machine that tracks the status of the delta:
- Candidate: a transaction is accepted and stored but not yet confirmed against the on-chain commitment.
- Canonical: after some pre-defined window of time, the transaction is confirmed against the on-chain commitment and becomes the source of truth.

## Transaction Proposals

In cases where a transaction requires more than one signature, the PSM can be used to distribute a transaction proposal (delta), and coordinate the signatures between the participants.

Once the threshold is met, any participant can promote the proposal to a candidate delta and execute the transaction from there it follows the same validation path to become canonical.
