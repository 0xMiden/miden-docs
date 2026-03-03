FAQ

How is privacy implemented in Miden?

Miden leverages zero-knowledge proofs and client side execution and proving to provide security and privacy.

Does Miden support encrypted notes?

At the moment, Miden does not have support for encrypted notes but it is a planned feature.

Why does Miden have delegated proving?

Miden leverages delegated proving for a few technical and practical reasons:

1. Computational: Generating zero-knowledge proofs is a computationally intensive work. The proving process requires significant processing power and memory, making it impractical for some end-user devices (like smartphones) to generate.
2. Technical architecture:
Miden's architecture separates concerns between:
    - Transaction Creation: End users create and sign transactions
    - Proof Generation: Specialized provers generate validity proofs
    - Verification: The network verifies these proofs
3. Proving efficiency:
Delegated provers can use optimized hardware that wouldn't be available to end-user devices, specifically designed for the mathematical operations needed in STARK proof generation.

What is the lifecycle of a transaction?

1. Transaction Creation

- User creates a transaction specifying the operations to perform (transfers, contract interactions, etc.)
- Client performs preliminary validation of the transaction and its structure
- The user authorizes the specified state transitions by signing the transaction

2. Transaction Submission

- The signed transaction is submitted to Miden network nodes
- The transaction enters the mempool (transaction pool) where it waits to be selected to be included in the state
- Nodes perform basic validation checks on the transaction structure and signature

3. Transaction Selection

- A sequencer (or multiple sequencers in a decentralized setting) selects transactions from the mempool
- The sequencer groups transactions into bundles based on state access patterns and other criteria
- The transaction execution order is determined according to protocol mechanism

4. Transaction Execution

- The current state relevant to the transaction is loaded
- The Miden VM executes the transaction operations
- State Transition Computation: The resulting state transitions are computed
- An execution trace of the transaction is generated which captures all the computation

5. Proof Generation

- A STARK based cryptographic proof is generated attesting to the correctness of the execution
- A proof for the aggregated transaction is created

6. Block Production

- The aggregated bundle of transactions along with their proofs are assembled into a block
- A recursive proof attesting to all bundle proofs is generated
- The block data structure is finalized with the aggregated proof

7. L1 Submission

- Transaction data is posted to the data availability layer
- The block proof and state delta commitment are submitted to the Miden contract (that is bridged to Ethereum/Agglayer)
- The L1 contract verifies validity of the proof
- Upon successful verification, the L1 contract updates the state root

8. Finalization

- Transaction receipts and events are generated
- The global state commitment is updated to reflect the new state
- The transaction is now considered finalized on the L1
- Users and indexers get notified/updated about the transaction completion

Do notes in Miden support recency conditions?

Yes, Miden enables consumption of notes based on time conditions, such as:

- A specific block height being reached
- A timestamp threshold being passed
- An oracle providing specific data
- Another transaction being confirmed

What does a Miden operator do in Miden?

A Miden operator is an entity that maintains the infrastructure necessary for the functioning of the Miden rollup. Their roles may involve:

1. Running Sequencer Nodes
2. Operating the Prover Infrastructure
3. Submitting Proofs to L1
4. Maintaining Data Availability
5. Participating in the Consensus Mechanism

How does bridging works in Miden?

Miden does not yet have a fully operational bridge, work in progress.

## What does the gas fee model of Miden look like?

Miden does not yet have a fully implemented fee model, work in progress.

What is a note in Miden?

A note is the primary mechanism for transferring assets and communicating between accounts in Miden. Unlike account-to-account transfers on most blockchains, Miden uses a note-based model where assets are wrapped in notes that are consumed by recipient accounts. Each note contains assets, a script that defines the conditions under which it can be consumed, and inputs that parameterize that script.

What is the difference between a public and a private transaction?

In a public transaction, the transaction details — including inputs, outputs, and state changes — are visible on-chain. In a private transaction, execution happens client-side and only a validity proof is submitted to the network. The network verifies the proof without learning the details of the transaction. This is one of Miden's core differentiators: privacy is not a layer added on top, but a property built into the transaction model itself.

What programming languages can I use to build on Miden?

Miden supports two primary development paths:

- Rust: Using the Miden Rust Compiler, you can write smart contracts in Rust. The compiler transpiles Rust code into Miden Assembly (MASM) which runs on the Miden VM.
- Miden Assembly (MASM): A low-level assembly language that runs directly on the Miden VM. MASM can be written manually for more fine-grained control.

For interacting with the network programmatically, Miden provides:

- Rust Client: A Rust library for backend developers
- Web Client: A TypeScript library for frontend and browser-based applications

What is the difference between the Rust Client and the Web Client?

Both clients allow you to deploy accounts, create transactions, and interact with the Miden network — but they are designed for different use cases:

Rust Client | Web Client 
Language | Rust | TypeScript 
Environment | Backend / native applications | Browser / frontend applications 
State storage | Local filesystem | Browser storage 
Best for | Programmatic interaction, scripts, server-side apps | Web applications, dApps 

If you are building a backend service or running scripts, use the Rust Client. If you are building a browser-based application, use the Web Client.

Is there a testnet? How do I connect to it?

Yes, Miden has a public testnet. You can connect to it at:

```
rpc.testnet.miden.io:443
```

To get testnet tokens, visit the [Miden Faucet](https://faucet.testnet.miden.io/). To explore accounts and transactions on testnet, use [Miden Scan](https://testnet.midenscan.com/).

Is Miden EVM-compatible?

No. Miden uses its own virtual machine (the Miden VM) and its own assembly language (MASM). It is not EVM-compatible and does not run Solidity contracts. This is an intentional architectural decision — the Miden VM is purpose-built for efficient STARK proof generation, which requires a different design than the EVM.

How do I test my Miden smart contracts locally?

Miden provides MockChain — a local testing environment that simulates the Miden network without requiring a live node connection. MockChain allows you to write unit tests for your smart contracts, verify state transitions, and debug issues before deploying to testnet. See the [Testing with MockChain](/builder/develop/tutorials/rust-compiler/testing) guide for details.

## What is `midenup` and how do I install it?

`midenup` is the official Miden toolchain installer, similar to `rustup` for Rust. It manages Miden toolchain versions and installs the `miden` CLI. To install it, follow the [Quick Start guide](/builder/quick-start/).

> Note for Ubuntu/Linux users: After installation, you may need to add the Miden binaries to your PATH manually. If `miden --version` returns "command not found" after installing, run:
> ```bash
> echo 'export PATH="/home/YOUR_USERNAME/.local/share/midenup/bin:$PATH"' >> ~/.bashrc
> source ~/.bashrc
> ```
> Replace `YOUR_USERNAME` with your actual username.

Can I try Miden without installing anything?

Yes. The [Miden Playground](https://playground.miden.xyz) is a browser-based environment where you can write and run MASM programs without any local setup. It is the recommended starting point for developers who want to explore Miden before committing to a full local installation.

Where can I get help if I'm stuck?

- [Build On Miden Telegram](https://t.me/BuildOnMiden) — the most active community channel for developer questions
- [GitHub Issues](https://github.com/0xMiden/miden-docs/issues) — for documentation bugs or gaps
- [Miden Docs](https://docs.miden.xyz) — full technical reference
