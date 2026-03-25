# Glossary

## Account

An account is a data structure that represents an entity (user account, smart contract) of the Miden blockchain, they are analogous to smart contracts.

## Account builder

Account builder provides a structured way to create and initialize new accounts on the Miden network with specific properties, permissions, and initial state.

## AccountCode

Represents the executable code associated with an account.

## AccountComponent

An AccountComponent can be described as a modular unit of code to represent the functionality of a Miden Account. Each AccountCode is composed of multiple AccountComponent's.

## AccountId

The AccountId is a value that uniquely identifies each account in Miden.

## AccountIdVersion

The AccountIdVersion represents the different versions of account identifier formats supported by Miden.

## AccountStorage

The AccountStorage is a key-value store associated with an account. It is made up of storage slots.

## Asset

An Asset represents a digital resource with value that can be owned, transferred, and managed within the Miden blockchain.

## AssetVault

The AssetVault is used for managing assets within accounts. It provides a way for storing and transfering assets associated with each account.

## Batch

A Batch allows multiple transactions to be grouped together, these batches will then be aggregated into blocks, improving network throughput.

## Block

A Block is a fundamental data structure which groups multiple batches together and forms the blockchain's state.

## Canonicalization

The background process by which [Miden Guardian](./miden-guardian/) promotes candidate deltas to canonical status by verifying them against the Miden network.

## Delta

A Delta represents the changes between two states `s` and `s'`. Applying a Delta `d` to `s` would result in `s'`.

## Delta Proposal

A coordination mechanism in [Miden Guardian](./miden-guardian/) that allows multiple signers to propose, review, and co-sign state changes before they are promoted to a canonical delta.

## Felt

A Felt or Field Element is a data type used for cryptographic operations. It represents an element in the finite field used in Miden.

## Kernel

A fundamental module of the MidenVM that acts as a base layer by providing core functionality and security guarantees for the protocol.

## Local Transaction

A Local Transaction is a transaction that is executed and proven locally on the user's device using the Miden client. The resulting proof is then submitted to the network for verification.

## Miden Assembly

An assembly language specifically designed for the Miden VM. It's a low-level programming language with specialized instructions optimized for zero-knowledge proof generation.

## Miden Guardian

Infrastructure built by OpenZeppelin for managing private account state on Miden. Guardian provides a server and client SDKs for backing up, syncing, and coordinating state across devices and parties without trust assumptions. See the [Miden Guardian documentation](./miden-guardian/).

## midenup

midenup is the official Miden toolchain manager. It is used to install and manage Miden development components, including the Miden client and CLI.

## MultiSig

A multi-signature account on Miden that requires a configurable threshold (N-of-M) of authorized signers to approve transactions before execution. MultiSig workflows are coordinated through [Miden Guardian](./miden-guardian/).

## Network Transaction

A Network Transaction is a transaction where execution and proof generation are delegated to a Miden network operator rather than performed locally by the user.

## Note

A Note is a fundamental data structure that represents an offchain asset or a piece of information that can be transferred between accounts. Miden's UTXO-like (Unspen