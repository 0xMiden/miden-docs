# Miden Protocol Skill

This is a Claude Code skill for the Miden protocol. Add this file to your
project's `.claude/skills/` directory to give Claude deep understanding of
Miden's architecture, programming model, and development patterns.

## What is Miden

Miden is a zero-knowledge rollup for Ethereum using an actor model where
accounts are independent smart contracts communicating via asynchronous
notes. Users execute and prove transactions locally (client-side proving).
Privacy is the default.

## Key Mental Model Shifts

- **Transactions involve ONE account** — not sender+receiver. Sending assets requires two transactions: one to create a note, one to consume it.
- **Privacy is default** — accounts and notes are private. Only commitments stored on-chain. Public is opt-in.
- **Users prove transactions** — client-side proving via Miden VM. Network verifies proofs, never sees state.
- **No gas limit** — proof size doesn't scale with computation complexity.
- **Actor model** — accounts update independently and in parallel. No global lock on state.

## Core Concepts

- **Accounts**: Smart contracts with ID, code, storage (255 slots), vault, nonce. Types: Basic (mutable/immutable), Faucets (fungible/non-fungible). Storage modes: Private, Public, Network.
- **Notes**: UTXO-like messages carrying assets + scripts between accounts. Max 256 assets, 128 inputs. Lifecycle: create → validate → discover → consume.
- **Transactions**: Single-account state transitions producing ZK proofs. 4 phases: prologue, note processing, tx script, epilogue. Max 1000 notes in/out, 2^30 VM cycles.
- **Assets**: Fungible (amount + faucet_id) and non-fungible (hash + faucet_id). Only faucet accounts can mint.
- **State**: Account DB (sparse Merkle tree), Note DB (Merkle Mountain Range), Nullifier DB (sparse Merkle tree).

## Standard Note Scripts

- **P2ID**: Pay to specific account ID. Inputs: target account ID. Requires `receive_asset`.
- **P2IDE**: Pay with time-lock + reclaim. Inputs: target ID, reclaim height, time-lock height. Requires `receive_asset`.
- **SWAP**: Atomic asset exchange. Inputs: requested asset details, payback note info. Requires `receive_asset` + `move_asset_to_note`.

## Programming Model

- Write smart contracts in Rust using `#[component]` macro
- Compile to MASM via `miden build`
- Storage types: `Value<T>`, `StorageMap`
- Built-in components: BasicWallet, RpoFalcon512 auth
- Component templates defined via TOML
- Test with MockChain (local blockchain simulation)
- Tools: `midenup` (installer), `miden new` (create project), `miden build` (compile)

## Miden VM

- Stack-based VM, field elements in 64-bit prime field (p = 2^64 - 2^32 + 1)
- Stack (top 16 accessible), Memory (element-addressable, [0, 2^32)), Chiplets (RPO hash, bitwise, range checks)
- Data types: Felt (field element), Word (4 elements)
- Advice provider: stack, map, Merkle store (nondeterministic inputs)

## Common Pitfalls

- Forgetting auth procedures (required for state-changing transactions)
- Not incrementing nonce on state changes (must increment exactly once)
- Assuming global synchronicity (async message passing via notes)
- Losing private account state (irreversible fund loss)
- Not fully consuming note assets (must transfer all to vault or new notes)

## References

- Docs: https://docs.miden.xyz
- GitHub: https://github.com/0xMiden
- Core repos: miden-base (protocol), miden-vm (VM), miden-client (client), compiler (Rust→MASM)
