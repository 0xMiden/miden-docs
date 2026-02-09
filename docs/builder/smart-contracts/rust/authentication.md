---
title: "Authentication"
sidebar_position: 10
description: "RPO-Falcon512 signature verification, nonce management, and replay protection in Miden contracts."
---

# Authentication

Miden uses RPO-Falcon512 digital signatures for transaction authentication. Because transactions execute on the client rather than on-chain validators, the system needs a way to prove that a transaction was authorized by the account owner. Without authentication, anyone could construct a valid proof that transfers assets out of an account. The nonce prevents replay attacks — without it, a valid proof could be resubmitted to execute the same state change twice.

## How authentication works

In Miden, authentication follows this flow:

1. **Key setup**: Store the public key hash in a known storage slot (typically slot 0)
2. **Transaction signing**: The client signs the transaction summary with the private key
3. **Verification**: The auth component verifies the signature against the stored public key
4. **Nonce increment**: The nonce is incremented to prevent replay attacks

The signature itself isn't passed as a function argument — it's provided through the **advice provider**, a special mechanism that supplies auxiliary data to the VM during proof generation.

## RPO-Falcon512 verification

The core function for signature verification:

```rust
use miden::rpo_falcon512_verify;

// Verify a Falcon512 signature
// pk: RPO256 hash of the public key
// msg: RPO256 hash of the message
rpo_falcon512_verify(pk, msg);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pk` | `Word` | RPO256 hash of the signer's public key |
| `msg` | `Word` | RPO256 hash of the message being verified |

The function panics (proof generation fails) if the signature is invalid.

:::info Where's the signature?
The actual signature data is loaded onto the advice stack by the host. The `rpo_falcon512_verify` function reads it from there. You don't pass the signature as an argument.
:::

## The advice provider

The advice provider is a mechanism for supplying auxiliary data during proof generation. For authentication:

### Requesting a signature

```rust
use miden::intrinsics::advice::emit_falcon_sig_to_stack;

// Request the host to push a Falcon signature onto the advice stack
emit_falcon_sig_to_stack(msg, pub_key);
```

This emits an `AUTH_REQUEST_EVENT` that tells the host: "I need a Falcon512 signature for this message with this public key." The host (client) provides the signature from the advice provider.

### Inserting data into the advice map

```rust
use miden::intrinsics::advice::adv_insert;

// Insert data into the advice map for later retrieval
adv_insert(key, &word_slice);
```

## Implementing an auth component

Here's a standard authentication component pattern:

```rust
#![no_std]
#![feature(alloc_error_handler)]

use miden::*;
use miden::intrinsics::advice::emit_falcon_sig_to_stack;

#[component]
struct AuthComponent {
    /// Slot 0: RPO256 hash of the Falcon512 public key
    #[storage(slot(0), description = "auth::rpo_falcon512::pub_key")]
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
        // Panics if signature is invalid → proof generation fails
        rpo_falcon512_verify(pub_key, msg);
    }
}
```

### Key points

1. **Public key storage**: The RPO256 hash of the public key is stored in slot 0 (convention for auth components)
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

## Hashing for signatures

Use `hash_words` to create message digests for signing:

```rust
use miden::hash_words;

// Hash multiple Words into a Digest
let words = [commitment, nonce_word, extra_data];
let digest: Word = hash_words(&words).into();
```

Other available hash functions:

```rust
use miden::crypto::hashes::{blake3_hash, sha256_hash};

// BLAKE3 (32-byte input → 32-byte output)
let hash: [u8; 32] = blake3_hash(input_bytes);

// SHA256 (32-byte input → 32-byte output)
let hash: [u8; 32] = sha256_hash(input_bytes);
```

## Security best practices

1. **Always increment nonce** on state-changing transactions to prevent replay attacks
2. **Hash the complete transaction summary** — include the delta commitment, nonce, and any relevant context
3. **Store public keys in slot 0** (convention) with the description `"auth::rpo_falcon512::pub_key"`
4. **Never expose private keys** in contract code — they exist only on the client side
5. **Use the standard Falcon512 scheme** unless you have specific requirements

Auth components are typically called via [cross-component calls](./cross-component-calls) from note scripts or [transaction scripts](./transaction-context). For access control and security patterns, see [Patterns & Security](./patterns).

:::info API Reference
Full API docs on docs.rs: [`miden`](https://docs.rs/miden/latest/miden/) (`rpo_falcon512_verify`)
:::
