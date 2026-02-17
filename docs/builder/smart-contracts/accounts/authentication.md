---
title: "Authentication"
sidebar_position: 6
description: "Authentication component pattern, nonce management, and security best practices for Miden contracts."
---

# Authentication

Miden uses RPO-Falcon512 digital signatures for transaction authentication. Because transactions execute on the client rather than on-chain validators, the system needs a way to prove that a transaction was authorized by the account owner. Without authentication, anyone could construct a valid proof that transfers assets out of an account. The nonce prevents replay attacks — without it, a valid proof could be resubmitted to execute the same state change twice. For details on the cryptographic primitives, see [Cryptography](./cryptography).

## How authentication works

In Miden, authentication follows this flow:

1. **Key setup**: Store the public key hash in a dedicated storage field (e.g., `pub_key`)
2. **Transaction signing**: The client signs the transaction summary with the private key
3. **Verification**: The auth component verifies the signature against the stored public key using [RPO-Falcon512](./cryptography)
4. **Nonce increment**: The nonce is incremented to prevent replay attacks

The signature itself isn't passed as a function argument — it's provided through the **advice provider**, a special mechanism that supplies auxiliary data to the VM during proof generation.

## The advice provider

The advice provider supplies auxiliary data during proof generation — see [Advice Provider](../transactions/advice-provider) for the full API.

## Implementing an auth component

Here's a standard authentication component pattern:

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
        let nonce = Word::from(self.incr_nonce());
        let msg: Word = hash_words(&[commitment, nonce]).into();

        // 3. Request signature from advice provider
        emit_falcon_sig_to_stack(msg, pub_key);

        // 4. Verify the signature
        // Panics if signature is invalid -> proof generation fails
        rpo_falcon512_verify(pub_key, msg);
    }
}
```

### Key points

1. **Public key storage**: Store the RPO256 hash of the public key in a dedicated storage field (slot IDs are derived from the field name)
2. **Message construction**: Hash the delta commitment (state changes) with the new nonce
3. **Signature request**: `emit_falcon_sig_to_stack` asks the host to provide the signature
4. **Verification**: `rpo_falcon512_verify` checks the signature. If invalid, proof generation fails

## Nonce management

The nonce prevents replay attacks — each transaction must use a unique nonce:

```rust
// Increment and return the new nonce
let new_nonce: Felt = self.incr_nonce();

// Or via the module function
let new_nonce: Felt = native_account::incr_nonce();
```

The nonce is automatically included in the transaction's proof. If someone tries to replay a transaction, the nonce won't match and verification will fail.

## Security best practices

1. **Always increment nonce** on state-changing transactions to prevent replay attacks
2. **Hash the complete transaction summary** — include the delta commitment, nonce, and any relevant context
3. **Store public keys in a dedicated storage field** (e.g., `pub_key`) with the description `"auth::rpo_falcon512::pub_key"`
4. **Never expose private keys** in contract code — they exist only on the client side
5. **Use the standard Falcon512 scheme** unless you have specific requirements

Auth components are typically called via [cross-component calls](../cross-component-calls) from note scripts or [transaction scripts](../transactions/transaction-context). For access control and security patterns, see [Patterns & Security](../patterns).

:::info API Reference
Full API docs on docs.rs: [`miden`](https://docs.rs/miden/latest/miden/) (`rpo_falcon512_verify`)
:::

## Related

- [Cryptography](./cryptography) — RPO-Falcon512 verification and hashing primitives
- [Advice Provider](../transactions/advice-provider) — supplying auxiliary data during proof generation
- [Patterns & Security](../patterns) — access control, rate limiting, and anti-patterns
