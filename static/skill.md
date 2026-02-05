# Miden Skill — Claude Code Context

> **Usage:** Copy this file into your project's `.claude/` directory or reference it in your Claude Code settings to give Claude deep understanding of Miden's architecture and programming model.

## What is Miden

Miden is a zero-knowledge rollup for high-throughput, private applications settling on Ethereum. It uses an actor model where accounts are independent smart contracts communicating via asynchronous messages (notes). Users execute and prove transactions locally (client-side proving), and the network only verifies proofs. Privacy is the default — accounts and notes are private unless explicitly made public.

## Key Mental Model Shifts

- **Transactions involve ONE account** — not sender+receiver. Sending assets requires two transactions: one to create a note, one to consume it.
- **Privacy is default** — accounts and notes are private. Only commitments stored on-chain. Public is opt-in.
- **Users prove transactions** — client-side proving via Miden VM. Network verifies proofs, never sees state.
- **No gas limit** — proof size doesn't scale with computation complexity. Arbitrarily complex logic is possible.
- **Actor model** — accounts update independently and in parallel. No global lock on state.

## Core Concepts

### Accounts

Accounts are smart contracts. Every account has:

- **ID** (120-bit): Encodes account type, storage mode, version. Includes 9-bit PoW.
- **Code**: Collection of MASM procedures (the account's interface). Includes a required authentication procedure.
- **Storage**: Up to 255 slots. Each slot is either a **value slot** (32 bytes) or a **map slot** (sparse Merkle tree, only root stored in slot).
- **Vault**: Sparse Merkle tree holding fungible and non-fungible assets.
- **Nonce**: Counter incremented on each state change. Prevents replay attacks.

**Account types:**
- `RegularAccountUpdatableCode` / `RegularAccountImmutableCode` — user wallets and custom contracts
- `FungibleFaucet` / `NonFungibleFaucet` — asset issuers (always immutable)

**Storage modes:**
- **Private** — only 40-byte commitment on-chain. User keeps full state locally. Losing state = losing funds.
- **Public** — full state stored on-chain.
- **Network** — public state + network monitors for incoming notes and auto-executes transactions.

**Account components** are reusable modules merged to form an account:
- `BasicWallet` — `receive_asset`, `move_asset_to_note`, `create_note` procedures
- `RpoFalcon512` — signature verification auth component
- Components defined via TOML templates with storage layout and code

### Notes

Notes are the communication medium between accounts (UTXO-like). A note contains:

- **Assets**: 0–256 fungible or non-fungible assets
- **Script**: Code executed on consumption. Calls account interface methods. Turing-complete, no size limit.
- **Inputs**: Up to 128 values (max 1 KB). Arguments passed to the note script.
- **Serial number**: Random 32 bytes ensuring uniqueness. If leaked for private notes, privacy is compromised.
- **Metadata**: Sender account ID + tag (always public regardless of storage mode).

**Note lifecycle:** Create (in transaction) → Validate (operator checks proof) → Discover (clients query by tag) → Consume (in another transaction)

**Storage modes:** Public (full data on-chain) or Private (only hash on-chain, data kept off-chain).

**Nullifier** = `hash(serial_num, script_root, input_commitment, vault_hash)`. Prevents double-spending. Can't derive note hash from nullifier.

**RECIPIENT** = `hash(hash(hash(serial_num, [0; 4]), script_root), input_commitment)`. Only those knowing pre-image can consume.

### Standard Note Scripts

| Script | Purpose | Key Inputs | Required Account Procedures |
|--------|---------|------------|----------------------------|
| **P2ID** | Pay to specific account ID | 2 inputs: target account ID | `receive_asset` |
| **P2IDE** | Pay with time-lock + reclaim | 4 inputs: target ID, reclaim height, time-lock height | `receive_asset` |
| **SWAP** | Atomic asset exchange | 12 inputs: requested asset, payback note details | `receive_asset`, `move_asset_to_note` |

### Transactions

A transaction is a single-account state transition producing a ZK proof. Inputs: account + 0..1000 notes. Outputs: updated account + 0..1000 notes. Max 2^30 VM cycles.

**Four phases:**
1. **Prologue** — validates on-chain commitments, authenticates account state and notes
2. **Note processing** — executes note scripts sequentially. Each script calls account interface methods.
3. **Transaction script** — optional executor-defined code. Can sign, mint, create notes, modify storage.
4. **Epilogue** — calls auth procedure, computes fees, verifies nonce increment and asset conservation.

**Transaction types:**
- **Local** (client-side): User executes + proves. Private, cheaper, no gas limit. Supports delegated proving.
- **Network** (operator-executed): For public shared state contracts. Not yet fully implemented.

**Key rules:**
- Account state must change OR at least one note consumed (non-empty transaction).
- If state changes, nonce must increment exactly once.
- Sum of input assets = sum of output assets (unless faucet account).
- Auth procedure is always called in epilogue.

### Assets

- **Fungible**: Encoded with amount (max 2^63-1) + faucet_id. Examples: ETH, stablecoins.
- **Non-fungible**: Encoded by hashing asset data + faucet_id. Examples: NFTs.
- Only **faucet accounts** can mint assets.
- Stored in account vaults (sparse Merkle tree, unlimited) or notes (simple list, max 255).

### State Model

Three databases maintained by Miden nodes:

| Database | Structure | Purpose |
|----------|-----------|---------|
| **Account DB** | Sparse Merkle tree | Track account state commitments. Private = 40 bytes. Public = full state. |
| **Note DB** | Merkle Mountain Range (append-only) | Record notes. Witnesses don't go stale. Supports local proving without constant queries. |
| **Nullifier DB** | Sparse Merkle tree | Track consumed notes. Prevents double-spending. Records block number of consumption. |

## Miden VM

Stack-based VM operating on field elements in 64-bit prime field (p = 2^64 - 2^32 + 1).

- **Stack**: Push-down stack. Top 16 items directly accessible. Max depth 2^32. Min depth 16 (padded with zeros).
- **Memory**: Linear random-access. Element-addressable. Range [0, 2^32). Read/write individually or in batches of 4.
- **Chiplets**: Accelerated circuits — RPO hash, 32-bit binary ops, 16-bit range checks.
- **Advice provider**: Nondeterministic inputs for the prover.
  - **Advice stack**: 1D array of field elements
  - **Advice map**: Key-value (word → vector of elements)
  - **Merkle store**: Structured data reducible to Merkle paths

**Data types:**
- `Felt` — field element (0 to p-1)
- `Word` — 4 field elements (basic unit for operations and storage)

**Inputs/Outputs:**
- Public inputs: up to 16 stack values at start
- Secret inputs: via advice provider (unlimited)
- Outputs: stack values at end (max 16, use `truncate_stack` for cleanup)

## Programming Model

### Rust Smart Contracts

Write smart contracts in Rust, compile to MASM via the Miden compiler.

```rust
#[component]
mod my_component {
    // Storage definitions
    #[storage(slot = 0)]
    pub static MY_VALUE: Value<Felt>;

    #[storage(slot = 1)]
    pub static MY_MAP: StorageMap;

    // Account interface procedures
    pub fn my_procedure(/* args */) {
        // Read/write storage, manage assets, create notes
    }
}
```

**Key tools:**
- `midenup` — toolchain installer
- `miden new <project>` — create new project
- `miden build` — compile Rust to MASM
- **MockChain** — local blockchain simulation for testing

### MASM (Miden Assembly)

Low-level assembly mapping to VM instructions. Used as compilation target.

**Key instruction categories:**
- Stack: `push`, `drop`, `dup`, `swap`, `movup`, `movdn`, `padw`
- Memory: `mload`, `mstore`, `mloadw`, `mstorew`
- Arithmetic: `add`, `mul`, `sub`, `div`, `inv`, `neg`
- Bitwise: `and`, `or`, `xor`, `not`
- Crypto: `hash`, Merkle tree operations (`mtree_get`, `mtree_set`)
- U32: `u32add`, `u32mul`, `u32sub`, `u32div`, `u32and`, `u32xor`
- System: `assert`, `clk`
- I/O: `advpop`, `advpush`, `sdepth`

**Control flow:** `if.true ... else ... end`, `while.true ... end`, `repeat.N ... end`, `proc.name ... end`, `exec.name`, `call.name`

### Account Component Templates (TOML)

```toml
name = "My Component"
version = "1.0.0"
supported-types = ["RegularAccountUpdatableCode"]

[[storage]]
name = "my_value"
slot = 0
value = ["0x0", "0x0", "0x0", "0x0"]

[[storage]]
name = "my_map"
slot = 1
type = "map"
```

## Common Development Workflows

### Creating and sending assets
1. Create wallet account (BasicWallet + RpoFalcon512 components)
2. Mint tokens from a faucet via transaction script
3. Create P2ID note with assets via `wallets::basic::create_note` + `wallets::basic::move_asset_to_note`
4. Receiver consumes P2ID note — note script calls `wallets::basic::receive_asset`

### Building custom smart contracts
1. Define component with `#[component]` macro in Rust
2. Specify storage layout (Value slots, StorageMaps)
3. Implement interface procedures
4. Compile with `miden build`
5. Test with MockChain — create accounts, execute transactions, verify state changes

### Atomic swaps
1. Party A creates SWAP note with asset A, specifying requested asset B
2. Party B consumes SWAP note — receives asset A, payback note created with asset B for party A
3. Party A consumes payback note to receive asset B

### Foreign procedure invocation (FPI)
Note and transaction scripts can read foreign account state during execution. Example: reading oracle prices during a SWAP.

## Common Pitfalls

- **Forgetting auth procedures**: Every state-changing transaction needs authentication. The auth procedure is called in the epilogue.
- **Not incrementing nonce**: If account state changes, nonce MUST increment exactly once. Forgetting = invalid transaction.
- **Assuming global synchronicity**: Miden uses async message passing. No atomic cross-account operations (except via notes).
- **Losing private account state**: For private accounts, user is custodian. State loss = fund loss. Irreversible.
- **Breaking component interfaces**: Account consumers depend on exposed procedure roots. Changing interfaces breaks compatibility.
- **Leaking serial numbers**: For private notes, serial number leakage allows computing the nullifier, compromising privacy.
- **Not handling note assets fully**: All note assets must be transferred during consumption (to account vault or new notes).

## Key References

- Docs: https://docs.miden.xyz
- GitHub: https://github.com/0xMiden
- Core repos: `miden-base` (protocol), `miden-vm` (VM), `miden-client` (client library), `compiler` (Rust→MASM)
- Rust API docs: https://docs.rs/miden-objects, https://docs.rs/miden-client
