---
sidebar_position: 1
---

# Introduction

![Miden book image](/img/book.png)

:::note
Welcome to the Miden book! The one-stop shop where you can find everything Miden related.
:::

Miden is a rollup for high-throughput, private applications.

Using Miden, builders can create novel, high-throughput, private applications for payments, DeFi, digital assets, and gaming. Applications and users are secured by Ethereum and AggLayer.

If you want to join the technical discussion, please check out the following:

- [Telegram](https://t.me/BuildOnMiden)
- [Miden Github](https://github.com/0xMiden)
- [Roadmap](https://miden.xyz/roadmap)

:::warning

- These docs are still work-in-progress.
- Some topics have been discussed in greater depth, while others require additional clarification.
  :::

## Status and features

Miden is currently on release v0.8 This is an early version of the protocol and its components.

:::warning
We expect breaking changes on all components.
:::

At the time of writing, Miden doesn't offer all the features you may expect from a zkRollup yet. During 2025, we expect to gradually implement more features.

### Feature highlights

#### Private accounts

The Miden operator only tracks a commitment to account data in the public database. Users can only execute smart contracts when they know the interface and the state.

#### Private notes

Like private accounts, the Miden operator only tracks a commitment to notes in the public database. Users need to communicate note details to each other off-chain (via a side channel) in order to consume private notes in transactions.

#### Public accounts

Miden supports public smart contracts like Ethereum. The code and state of those accounts are visible to the network and anyone can execute transactions against them.

#### Public notes

With public notes, the users are be able to store all note details on-chain, thus, eliminating the need to communicate note details via side-channels.

#### Local transaction execution

The Miden client allows for local transaction execution and proving. The Miden operator verifies the proof and, if valid, updates the state DBs with the new data.

#### Delegated proving

The Miden client allows for proof generation by an external service if the user choses to do so , e.g., if on a low powered device.

#### Standardized smart contracts

Currently, there are three different standardized smart contracts available. A basic wallet smart contract that sends and receives assets, and fungible and non-fungible faucets to mint and burn assets.

All accounts are written in [MASM](https://0xmiden.github.io/miden-vm/user_docs/assembly/main.html).

#### Customized smart contracts

Accounts can expose any interface putting custom account components together. Account components can be simple smart contracts, like the basic wallet, or they can be entirely custom made and reflect any logic due to the underlying Turing-complete Miden VM.

#### P2ID, P2IDR, and SWAP note scripts

Currently, there are three different standardized note scripts available. Two different versions of pay-to-id scripts of which P2IDR is reclaimable, and a swap script that allows for simple token swaps.

#### Customized note scripts

Users are also able to write their own note scripts. Note scripts are executed during note consumption and they can be arbitrarily complex due to the underlying Turing-complete Miden VM.

#### Simple block building

The Miden operator running the Miden node builds the blocks containing transactions.

#### Maintaining state

The Miden node stores all necessary information in its state DBs and provides this information via its RPC endpoints.

### Planned features

:::warning
The following features are at a planning stage only.
:::

#### Network transactions

Transaction execution and proving can be outsourced to the network and to the Miden operator. Those transactions will be necessary when it comes to public shared state, and they can be useful if the user's device is not powerful enough to prove transactions efficiently.

#### Rust compiler

In order to write account code, note or transaction scripts, in Rust, there will be a Rust -> Miden Assembly compiler.

#### Block and epoch proofs

The Miden node will recursively verify transactions and in doing so build batches of transactions, blocks, and epochs.

## Benefits of Miden

- Ethereum security.
- Developers can build applications that are infeasible on other systems. For example:
  - **on-chain order book exchange** due to parallel transaction execution and updatable transactions.
  - **complex, incomplete information games** due to client-side proving and cheap complex computations.
  - **safe wallets** due to hidden account state.
- Better privacy properties than on Ethereum - first web2 privacy, later even stronger self-sovereignty.
- Transactions can be recalled and updated.
- Lower fees due to client-side proving.
- dApps on Miden are safe to use due to account abstraction and compile-time safe Rust smart contracts.

## License

Licensed under the [MIT license](http://opensource.org/licenses/MIT).
