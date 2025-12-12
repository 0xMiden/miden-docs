---
sidebar_position: 1
---

# Introduction

![Miden Docs Background](/img/docs-background.png)

:::note
Welcome to the Miden docs – your one-stop shop for all things Miden.
:::

Miden is a rollup for high-throughput, private applications.

Using Miden, builders can create novel, high-throughput, private applications for payments, DeFi, asset management, and more. Applications and users are secured by Ethereum and Agglayer.

If you want to join the technical discussion, please check out the following:

- [Telegram](https://t.me/BuildOnMiden)
- [Miden GitHub](https://github.com/0xMiden)
- [Roadmap](https://miden.xyz/roadmap)

:::warning
- These docs are a work in progress.
- Some topics have been discussed in greater depth, while others require additional clarification.
:::

## Status and features

Miden is currently at release v0.12 – approaching mainnet readiness, with parts of the protocol still being refined and new zk-rollup features under active development for the 2026 launch.

:::warning
Breaking changes may still occur in some components.
:::

### Feature highlights

#### Private accounts

The Miden operator only tracks a commitment to account data in the public database. Users can execute smart contracts only when they know the interface and the state.

#### Private notes

Like private accounts, the Miden operator only tracks a commitment to notes in the public database. Users need to communicate note details to each other offchain (via a side-channel) in order to consume private notes in transactions.

#### Public accounts

Miden supports public smart contracts like Ethereum. The code and state of those accounts are visible to the network and anyone can execute transactions against them.

#### Public notes

With public notes, users are able to store all note details onchain, thus eliminating the need to communicate note details via side-channels.

#### Local transaction execution

The Miden client supports local transaction execution and proof generation. The Miden operator verifies the proof and, if valid, updates the state database accordingly.

#### Delegated proving

The Miden client supports delegated proving, allowing users to offload proof generation to an external service when using low-powered devices.

#### Standardized smart contracts

Currently, there are three different standardized smart contracts available. A basic wallet contract for sending and receiving assets, plus fungible and non-fungible faucets to mint and burn assets.

All accounts are written in [MASM](https://0xmiden.github.io/miden-vm/user_docs/assembly/main.html).

#### Customized smart contracts

Accounts can expose any interface by combining custom account components. Account components can be simple smart contracts, like the basic wallet, or they can be entirely custom-made and reflect any logic due to the underlying Turing-complete Miden VM.

#### P2ID, P2IDR, and SWAP note scripts

Currently, there are three different standardized note scripts available. Two different versions of pay-to-id scripts of which P2IDR is reclaimable, and a swap script that allows for simple token swaps.

#### Customized note scripts

Users are also able to write their own note scripts. Note scripts are executed when notes are consumed, and can express arbitrary logic thanks to the underlying Turing-complete Miden VM.

#### Simple block building

The Miden operator running the Miden node builds the blocks containing transactions.

#### Maintaining state

The Miden node stores all necessary information in its state databases and provides this information via its RPC endpoints.

### Work-In-Progress features

:::warning
The following features are currently under active development.
:::

#### Network transactions

Transaction execution and proving can be outsourced to the network and to the Miden operator. These transactions will be required for public shared state, and they can be useful if the user's device is not powerful enough to prove transactions efficiently.

#### Rust compiler

In order to write account, note, or transaction scripts in Rust, there will be a compiler from Rust to Miden Assembly.

#### Block and epoch proofs

The Miden node will recursively verify transactions and, in doing so, build batches of transactions, blocks, and epochs.

## Benefits of Miden

- Ethereum security.
- Developers can build applications that are infeasible on other systems. For example:
  - **onchain order book exchange** due to parallel transaction execution and updatable transactions.
  - **complex, incomplete information mechanisms** due to client-side proving and cheap complex computations.
  - **safe wallets** due to hidden account state.
- Stronger privacy than on Ethereum or Solana – starting with Web2-level confidentiality, and evolving toward full self-sovereignty.
- Transactions can be recalled and updated.
- Lower fees due to client-side proving.
- dApps on Miden are safe to use due to account abstraction and compile-time safe Rust smart contracts.

## License

Licensed under the [MIT License](http://opensource.org/licenses/MIT).
