# Glossary

## Account

A Miden account is a fundamental data structure in the Polygon Miden blockchain that represents an entity (user, contract, etc.) on the Miden rollup. 
An account involves four core components: identity, state, (account)builder pattern, and storage management.

## Account builder

Account builder provides a structured way to create and initialize new accounts on the Miden network with specific properties, permissions, and initial state.

## AccountCode

AccountCode is a core component that represents the executable code associated with an account on the Miden blockchain. It represents two functionalities:
- As a smart contract logic that governs how an account behaves when invoked through transactions.
- As an executable that is compiled on the Miden Virtual Machine.

## AccountComponent

AccountComponent can be described as a modular unit of code to represent the functionality of a Miden Account. It follows the component-based architecture of Miden that allows accounts to be composed of multiple specialized components rather than having a monolithic structure.

## Account Component Template

Account Component Template is a standardized pattern for creating account components with specific structures and behaviors.

## AccountId

AccountId is a value that uniquely identifies each account in Miden that can be used as an address for directing transactions to their intended accounts and also as a reference to retrieve account state from the global state tree.

## AccountIdAnchor

AccountIdAnchor serves as a secure reference point for an account's identity. Through cryptographic commitments, it functions as a privacy-preserving identifier that enables account verification without revealing specific account details.

## AccountIdV0

AccountIdV0 is similar to AccountID but represents the initial version (v0) of the account identifier.

## AccountIdVersion

AccountIdVersion represents the different versions of account identifier formats supported by Miden. It can be used to determine how account identifiers should be interpreted, processed, and validated.

## AccountStorage

AccountStorage is a structure implemented in Sparse Merkle Tree to store and prove key-value pairs that represent an account's state. It is made up of storage slots that can only be accessed or modified by accounts that use authentication mechanisms as defined by Miden.

## AccountStorageMode

AccountStorageMode is an enum value that defines different ways an account can interact with its storage. There are three such modes of Account Storage: ReadOnly, ReadWrite, and Append.

## AccountType

The behaviour and capability of an account in Miden can vary based on their types. For now, there are four such types of accounts: Fungible, Regular, FungibleFaucet, and Sealed.

## Asset

Asset represents a digital resource with value that can be owned, transferred, and managed within the system. It represents something of value, unique identification, ownership model, and programmable property.

## Assembler

The assembler module translates Miden Assembly language into executable bytecode for the Miden Virtual Machine (VM).

## AssetVault

AssetVault is used for managing assets within accounts. It provides a way for storing, interfacing, and securing asset(s) associated with each account.

## Batches

Batches allow multiple transactions to be grouped together, share verification overhead, and improve throughput on the network.

## Block

Block is a fundamental data structure that groups multiple transactions together and forms the blockchain's sequential record. A block consists of block header, transaction data, and state information.

## Delta

Delta is a structured data serialization format used for representing objects and data structures in Miden.

## Felt

A Felt or Field Element is a fundamental data type used for cryptographic operations. It represents an element in a finite field, which is a mathematical structure used by Miden.

## Kernel

A fundamental module of the Miden architecture that acts as a base layer by providing core functionality and security guarantees for the protocol.

## Miden Assembly

An assembly language specifically designed for the Miden VM. It's a low-level programming language with specialized instructions optimized for zero-knowledge proof generation.

## Note

Note is a fundamental data structure that represents an off-chain asset or a piece of information that can be transferred between accounts. Miden's UTXO-like (Unspent Transaction Output) model is designed around the concept of notes. There are output notes which are new notes created by the transaction and input notes which are consumed (spent) by the transaction.

## Note script

Note script is a program that defines the rules and conditions under which a note can be spent.

## Note tag

Note tag is an identifier or metadata associated with notes that provide additional classification and functionality.

## Note ID

Note ID is a unique identifier assigned to each note to distinguish it from all other notes in the system.

## Nullifier

A nullifier is a cryptographic commitment that marks a note as spent, preventing it from being used again.

## Partial notes

Partial notes allow for dividing a note into smaller portions, enabling more flexible value transfers without creating entirely new notes.

## Procedure

Procedures in Miden enable developers to organize code into logical, reusable units that can be called from multiple places. A procedure is defined using the `proc` keyword followed by a name and terminated with `end` in Miden Assembly code.

## Prover

Prover is responsible for generating zero-knowledge proofs that verify the correctness of program execution without revealing the underlying data.

## Word

Word is a fundamental data structure that represents the basic unit of computation and storage.
