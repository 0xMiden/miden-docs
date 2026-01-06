---
title: Multisig
sidebar_position: 2
---

How multisig accounts use PSM for coordination and execution.

Miden multisig accounts store their authentication logic on-chain, but their state (signers, metadata, proposals) is kept private. PSM acts as a coordination server.

## Flow
1) Propose: push `delta/proposal` including a `TransactionSummary` and optional proposer signature.
2) Sign: cosigners fetch pending proposals, verify details locally, and append their signatures.
3) Ready: once threshold is met, fetch proposal and build the final transaction advice map using all cosigner signatures + the PSM acknowledgement.
4) Execute: push the final transaction advice map and submit on-chain, verifying the PSM acknowledgement.
5) Sync: the clients can fetch the latest account state at any time from the server.

## Links
- Rust multisig client: https://github.com/OpenZeppelin/private-state-manager/crates/miden-multisig-client
- TypeScript multisig client: https://github.com/OpenZeppelin/private-state-manager/packages/miden-multisig-client
