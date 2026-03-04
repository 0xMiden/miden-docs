---
title: Rust SDK
sidebar_position: 1
---

# Rust SDK

The Rust PSM client communicates with the server over gRPC. It handles Falcon RPO authentication and server signature verification.

**Source**: [`crates/client`](https://github.com/OpenZeppelin/private-state-manager/tree/main/crates/client) in the PSM repository.

## Installation

```toml
[dependencies]
private-state-manager-client = { git = "https://github.com/OpenZeppelin/private-state-manager", package = "private-state-manager-client" }
```

## Client setup

### Without authentication

Use this only for the server public key endpoint:

```rust
use private_state_manager_client::PsmClient;

let client = PsmClient::connect("https://testnet-psm.miden.network:50051").await?;
```

### With authentication

All endpoints except public key discovery require a signer:

```rust
use miden_objects::crypto::dsa::rpo_falcon512::SecretKey;
use private_state_manager_client::signature::Signer;

// Generate a new Falcon keypair
let secret_key = SecretKey::new();
let signer = Signer::new(secret_key);

// Get the public key hex for account configuration
let pubkey_hex = signer.public_key_hex();

let client = PsmClient::connect("https://testnet-psm.miden.network:50051")
    .await?
    .with_signer(signer);
```

## Common operations

### Configure an account

```rust
use private_state_manager_client::auth;

let auth_config = auth::miden_falcon_rpo_auth(vec![pubkey_hex]);

// Configure the account on PSM with initial state and auth policy
client.configure(&account_id, auth_config, initial_state).await?;
```

### Push a delta

```rust
let response = client.push_delta(&account_id, nonce, prev_commitment, delta_payload).await?;
```

### Get current state

```rust
let state = client.get_state(&account_id).await?;
```

### Get deltas

```rust
// Single delta by nonce
let delta = client.get_delta(&account_id, nonce).await?;

// Merged delta since a nonce
let merged = client.get_delta_since(&account_id, from_nonce).await?;
```

## Verifying server acknowledgements

After pushing a delta, verify the server's acknowledgement signature to confirm it processed the change:

```rust
use private_state_manager_client::verify_commitment_signature;

let response = client.push_delta(&account_id, 1, prev_commitment, delta).await?;

if let Some(delta) = &response.delta {
    if !delta.ack_sig.is_empty() {
        let is_valid = verify_commitment_signature(
            &delta.new_commitment,
            server_pubkey,
            &delta.ack_sig,
        )?;
        assert!(is_valid, "Server signature verification failed");
    }
}
```

## Full API reference

See the [`crates/client/README.md`](https://github.com/OpenZeppelin/private-state-manager/tree/main/crates/client) for the complete API documentation.
