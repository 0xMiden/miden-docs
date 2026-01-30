---
title: Multisig
sidebar_position: 2
---

Miden multisig accounts store their commitment on-chain, but their state (storage, code, vault, etc.) is kept private. Then the PSM acts as a coordination server, for keeping the state and transactions in sync between the participants.

## Flow
1) **Propose**: push delta/proposal including a `TransactionSummary` and optional proposer signature.
2) **Sign**: cosigners fetch pending proposals, verify details locally, and append their signatures.
3) **Ready**: once threshold is met, fetch proposal and build the final transaction advice map using all cosigner signatures + the PSM acknowledgement.
4) **Execute**: push the final transaction advice map and submit on-chain, verifying the PSM acknowledgement.
5) **Sync**: the clients can fetch the latest account state at any time from the server.

## Links
- [Rust multisig client](https://github.com/OpenZeppelin/private-state-manager/tree/main/crates/miden-multisig-client)
- [TypeScript multisig client](https://github.com/OpenZeppelin/private-state-manager/tree/main/packages/miden-multisig-client)
