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

## Delta

A Delta represents the changes between two states `s` and `s'`. By applying a Delta `d` to `s` would result in `s'`.

## Felt

A Felt or Field Element is a data type used for cryptographic operations. It represents an element in the finite field used in Miden.

## Kernel

A fundamental module of the MidenVM that acts as a base layer by providing core functionality and security guarantees for the protocol.

## Miden Assembly

An assembly language specifically designed for the Miden VM. It's a low-level programming language with specialized instructions optimized for zero-knowledge proof generation.

## Note

A Note is a fundamental data structure that represents an off-chain asset or a piece of information that can be transferred between accounts. Miden's UTXO-like (Unspent Transaction Output) model is designed around the concept of notes. There are output notes which are new notes created by the transaction and input notes which are consumed (spent) by the transaction.

## Note script

A Note script is a program that defines the rules and conditions under which a note can be consumed.

## Note tag

A Note tag is an identifier or metadata associated with notes that provide additional filtering capabilities.

## Note ID

Note ID is a unique identifier assigned to each note to distinguish it from other notes.

## Nullifier

A nullifier is a cryptographic commitment that marks a note as spent, preventing it from being consumed again.

## Prover

A Prover is responsible for generating zero-knowledge proofs that attest to the correctness of the execution of a program without revealing the underlying data.

## Word

A Word is a data structure that represents the basic unit of computation and storage in Miden, it is composed or four Felt's.
