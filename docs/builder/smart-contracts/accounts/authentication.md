---
title: "Authentication"
sidebar_position: 6
description: "Authentication component pattern and nonce management for Miden accounts."
---

# Authentication

Miden uses RPO-Falcon512 digital signatures for transaction authentication. Because transactions execute on the client rather than on-chain validators, the system needs a way to prove that a transaction was authorized by the account owner. Without authentication, anyone could construct a valid proof that transfers assets out of an account. The nonce prevents replay attacks — without it, a valid proof could be resubmitted to execute the same state change twice. For details on the cryptographic primitives, see [Cryptography](./cryptography).

## How authentication works

An auth component stores the RPO256 hash of the account owner's Falcon512 public key in a dedicated storage slot. During transaction execution, it computes a message digest from the transaction's delta commitment and the incremented nonce, requests the signature from the advice provider via `emit_falcon_sig_to_stack`, and verifies it with `rpo_falcon512_verify`. If verification fails, proof generation fails and the transaction is rejected before reaching the network.

The signature itself isn't passed as a function argument — it's provided through the **advice provider**, a special mechanism that supplies auxiliary data to the VM during proof generation.

## The advice provider

The advice provider supplies auxiliary data during proof generation — see [Advice Provider](../transactions/advice-provider) for the full API.

## Auth component implementation

```rust
#![no_std]
#![feature(alloc_error_handler)]

use miden::*;
use miden::intrinsics::advice::emit_falcon_sig_to_stack;

#[component]
struct AuthComponent {
    /// RPO256 hash of the Falcon512 public key
    #[storage(description = "auth::rpo_falcon512::pub_key")]
    pub_key: Value,
}

#[component]
impl AuthComponent {
    /// Verify the caller has the correct private key.
    /// Called during transaction execution to authenticate state changes.
    pub fn auth(&mut self) {
        // 1. Read the stored public key hash
        let pub_key: Word = self.pub_key.read();

        // 2. Build the message to verify (transaction summary)
        let commitment = self.compute_delta_commitment();
        let nonce = Word::from(self.incr_nonce()); // Felt → [0, 0, 0, nonce_felt]
        let msg: Word = hash_words(&[commitment, nonce]).into();

        // 3. Request signature from advice provider
        emit_falcon_sig_to_stack(msg, pub_key);

        // 4. Verify the signature
        // Panics if signature is invalid -> proof generation fails
        rpo_falcon512_verify(pub_key, msg);
    }
}
```

## Nonce management

The nonce prevents replay attacks — each transaction must use a unique nonce:

```rust
// Increment and return the new nonce
let new_nonce: Felt = self.incr_nonce();

// Or via the module function
let new_nonce: Felt = native_account::incr_nonce();
```

The nonce is automatically included in the transaction's proof. If someone tries to replay a transaction, the nonce won't match and verification will fail.

Auth components are typically called via [cross-component calls](../cross-component-calls) from note scripts or [transaction scripts](../transactions/transaction-context). For access control and security patterns, see [Patterns & Security](../patterns).

:::info API Reference
Full API docs on docs.rs: [`miden`](https://docs.rs/miden/latest/miden/) (`rpo_falcon512_verify`)
:::

## Related

- [Cryptography](./cryptography) — RPO-Falcon512 verification and hashing primitives
- [Advice Provider](../transactions/advice-provider) — supplying auxiliary data during proof generation
- [Patterns & Security](../patterns) — access control, rate limiting, and anti-patterns
