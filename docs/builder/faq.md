# FAQ

## How is privacy implemented in Miden?

Miden leverages zero-knowledge proofs and client side execution and proving to provide security and privacy.

## Does Miden support encrypted notes?

At the moment, Miden does not have support for encrypted notes but it is a planned feature.

## Why does Miden have delegated proving?

Miden leverages delegated proving for a few technical and practical reasons:

1. **Computational:** Generating zero-knowledge proofs is a computationally intensive work. The proving process requires significant processing power and memory, making it impractical for some end-user devices (like smartphones) to generate.
2. **Technical architecture**:
Miden's architecture separates concerns between:
    - **Transaction Creation**: End users create and sign transactions
    - **Proof Generation**: Specialized provers generate validity proofs
    - **Verification**: The network verifies these proofs
3. **Proving efficiency**:
Delegated provers can use optimized hardware that wouldn't be available to end-user devices, specifically designed for the mathematical operations needed in STARK proof generation.

## What is the lifecycle of a transaction?

### 1. Transaction Creation

- User creates a transaction specifying the operations to perform (transfers, contract interactions, etc.)
- Client performs preliminary validation of the transaction and its structure
- The user authorizes the specified state transitions by signing the transaction

### 2. Transaction Submission

- The signed transaction is submitted to Miden network nodes
- The transaction enters the mempool (transaction pool) where it waits to be selected to be included in the state
- Nodes perform basic validation checks on the transaction structure and signature

### 3. Transaction Selection

- A sequencer (or multiple sequencers in a decentralized setting) selects transactions from the mempool
- The sequencer groups transactions into bundles based on state access patterns and other criteria
- The transaction execution order is determined according to protocol mechanism

### 4. Transaction Execution

- The current state relevant to the transaction is loaded
- The Miden VM executes the transaction operations
- **State Transition Computation**: The resulting state transitions are computed
- An execution trace of the transaction is generated which captures all the computation

### 5. Proof Generation

- A STARK based cryptographic proof is generated attesting to the correctness of the execution
- A proof for the aggregated transaction is created

### 6. Block Production

- The aggregated bundle of transactions along with their proofs are assembled into a block
- A recursive proof attesting to all bundle proofs is generated
- The block data structure is finalized with the aggregated proof

### 7. L1 Submission

- Transaction data is posted to the data availability layer
- The block proof and state delta commitment are submitted to the Miden contract (that is bridged to Ethereum/Agglayer)
- The L1 contract verifies validity of the proof
- Upon successful verification, the L1 contract updates the state root

### 8. Finalization

- Transaction receipts and events are generated
- The global state commitment is updated to reflect the new state
- The transaction is now considered finalized on the L1
- Users and indexers get notified/updated about the transaction completion

## Do notes in Miden support recency conditions?

Yes, Miden enables consumption of notes based on time conditions, such as:

- A specific block height being reached
- A timestamp threshold being passed
- An oracle providing specific data
- Another transaction being confirmed

## What does a Miden operator do in Miden?

A Miden operator is an entity that maintains the infrastructure necessary for the functioning of the Miden rollup. Their roles may involve:

1. Running Sequencer Nodes
2. Operating the Prover Infrastructure
3. Submitting Proofs to L1
4. Maintaining Data Availability
5. Participating in the Consensus Mechanism

## How does bridging works in Miden?

Miden does not yet have a fully operational bridge, work in progress.

## What does the gas fee model of Miden look like?

Miden does not yet have a fully implemented fee model, work in progress.

## What is a note in Miden?

A note is a data structure in Miden that represents assets and the conditions under which those assets can be consumed. Notes are the primary mechanism for transferring assets between accounts. Each note contains assets, a script that defines the conditions for consumption, and metadata such as the sender and tag.

## What is the difference between a public and a private transaction?

In a public transaction, the transaction details and execution trace are visible to the network. In a private transaction, execution happens on the client side and only the proof is submitted to the network; the inputs and outputs remain private. This allows users to transact without revealing sensitive information to third parties.

## What programming languages can I use to build on Miden?

Smart contracts and programs on Miden are written in **MASM (Miden Assembly)**. For building client-side applications that interact with the Miden network, you can use **Rust** (via the Miden Rust Client) or **TypeScript/JavaScript** (via the Miden Web Client).

## What is the difference between the Rust Client and the Web Client?

The **Rust Client** is designed for backend applications, command-line tools, and environments where Rust is available. The **Web Client** is compiled to WebAssembly and is designed for browser-based applications. Both clients expose similar functionality for creating accounts, managing notes, and submitting transactions.

## Is there a testnet? How do I connect to it?

Yes, Miden has a public testnet. You can connect to it by configuring the Miden client to point to the testnet node endpoint. Refer to the [Miden documentation](https://docs.miden.xyz/) for the current testnet RPC URL and setup instructions.

## Is Miden EVM-compatible?

No, Miden is not EVM-compatible. Miden uses its own virtual machine (Miden VM) and its own assembly language (MASM). If you are coming from Ethereum development, you will need to learn MASM to write smart contracts on Miden.

## How do I test my Miden smart contracts locally?

Miden provides a **MockChain** utility in the Rust SDK that allows you to simulate the Miden network locally. You can create accounts, mint assets, send notes, and consume notes in a local test environment without connecting to any network.

## What is `midenup` and how do I install it?

`midenup` is the official toolchain manager for Miden. It allows you to install and manage different versions of the Miden toolchain. You can install it by running:

```bash
cargo install midenup
midenup init
midenup install stable
```

After installation, make sure to add the Miden binary path to your `PATH`:

```bash
echo 'export PATH="$HOME/.local/share/midenup/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Can I try Miden without installing anything?

Yes. Miden provides a browser-based playground where you can write and run MASM programs directly in your browser without any local setup. Visit the [Miden Playground](https://playground.miden.xyz/) to get started.

## Where can I get help if I'm stuck?

The best places to get help are:

- **Telegram**: Join the [BuildOnMiden](https://t.me/BuildOnMiden) community where developers actively answer questions.
- **GitHub Discussions**: Open a discussion in the [Miden docs repository](https://github.com/0xMiden/docs/discussions).
- **Documentation**: Check the official [Miden docs](https://docs.miden.xyz/) for guides and references.
