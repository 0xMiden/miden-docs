# FAQ

## How is encryption implemented in Miden?

Miden leverages Zero Knowledge proofs and commitment schemes to provide security and privacy. It does so by using rescue prime hash function and commitment schemes with sparse merkle trees. 

## Does Miden support encrypted notes?

At the moment, Miden does not have support for encrypted notes but it is a planned feature.

## What are Transient Notes used for?

Transient Notes can be used in the context of a single transaction batch and as a mechanism for atomic transfers. Some of their use cases can be:

1. Executing complex operations in Defi that require multiple atomic steps (e.g., swap, provide liquidity, and stake in one atomic transaction)
2. Facilitating privacy-preserving transfers between accounts without revealing the connection on-chain
3. Enabling conditional logic for multiple transactions
4. Allowing different parts of a transaction batch to communicate without requiring persistent state changes

## Why does Miden have delegated proving?

Miden leverages delegated proving for a few technical and practical reasons:

1. **Computational:** Generating STARK proofs is computationally intensive work. The proving process requires significant processing power and memory, making it impractical for most end-user devices (like smartphones or regular laptops) to generate proofs directly.
2. **Technical architecture**:
Miden's architecture separates concerns between:
    - **Transaction Creation**: End users create and sign transactions
    - **Proof Generation**: Specialized provers generate validity proofs
    - **Verification**: The network verifies these proofs
3. **Proving efficiency**:
Delegated provers can implement advanced techniques that wouldn't be typically possible in user-facing devices. The generation of optimal STARK proofs requires a certain amount of specialization and optimizations.
4. **Hardware Optimization**:
By delegating the proving, dedicated proving services can use optimized hardware (GPUs, FPGAs, or ASICs) specifically designed for the mathematical operations needed in STARK proof generation.

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
- The block proof and state delta commitment are submitted to the Miden contract (that is bridged to Ethereum/AggLayer)
- The L1 contract verifies validity of the proof
- Upon successful verification, the L1 contract updates the state root

### 8. Finalization

- Transaction receipts and events are generated
- The global state commitment is updated to reflect the new state
- The transaction is now considered finalized on the L1
- Users and indexers get notified/updated about the transaction completion

## Do notes in Miden support time conditions?

Yes, Miden enables future spending of notes with commitments that allows for conditional execution based on time-locked conditions. 

These notes contain state transitions that only become valid after certain conditions are met in the future, such as:

- A specific block height being reached
- A timestamp threshold being passed
- An oracle providing specific data
- Another transaction being confirmed

## What does a Miden operator do?

A Miden operator is an entity that maintains the infrastructure necessary for the functioning of the Miden rollup. Their roles may involve:

1. Running Sequencer Nodes
2. Operating the Prover Infrastructure
3. Submitting Proofs to L1
4. Maintaining Data Availability
5. Participating in the Consensus Mechanism

## How bridging works in Miden?

Miden doesn't have a fully operational, mainnet-deployed bridge yet. 

## What does the gas fee model of Miden look like?

Miden doesn't have a fully implemented and activated gas fee model in production yet.

## What are the different databases in Miden and what do they do?

1. Account database: Maintains account states, smart contract data, and all other persistent information
2. Note database: Tracks available notes that users can use or spend in transactions
3. Nullifier database: When a note is spent, its nullifier is recorded to ensure it cannot be spent again
4. Transaction database: Records historical queries, receipt generation, and transaction verification

## Does Miden support recursive verification?

Yes. Miden implements recursive verification by allowing STARK proofs to verify other STARK proofs.
The Miden VM functions as a single and specialized circuit that can efficiently verify STARK proofs, takes a serialized STARK proof as input. It recomputes commitment verification, FRI protocol steps, and field arithmetic. As a result, the VM outputs a binary indicating if the proof is valid.
