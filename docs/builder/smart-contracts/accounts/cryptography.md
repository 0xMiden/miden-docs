---
title: "Cryptography"
sidebar_position: 5
description: "RPO-Falcon512 signature verification and hashing primitives in Miden contracts."
---

# Cryptography

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

## Hashing

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

// BLAKE3 (32-byte input -> 32-byte output)
let hash: [u8; 32] = blake3_hash(input_bytes);

// SHA256 (32-byte input -> 32-byte output)
let hash: [u8; 32] = sha256_hash(input_bytes);
```

## Related

- [Authentication](./authentication) — auth component pattern, nonce management, and security best practices
- [Advice Provider](../transactions/advice-provider) — supplying auxiliary data during proof generation
