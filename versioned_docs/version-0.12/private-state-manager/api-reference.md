---
title: API Reference
sidebar_position: 3
---

This page summarizes the HTTP/gRPC APIs provided by the **Private State Manager**. The semantics match across transports. 

## Authentication
PSM authorizes requests through the headers (HTTP) or metadata (gRPC):
- `x-pubkey`: Commitment to the public key of the signer.
- `x-signature`: Signature over the request payload. 

## HTTP endpoints
- `POST /configure`: create account with auth policy and initial state, returns PSM acknowledgement public key.
- `POST /delta`: push a delta, server verifies, signs `new_commitment`, sets status (candidate or canonical).
- `GET /delta?account_id&nonce`: fetch delta by nonce.
- `GET /delta/since?account_id&from_nonce`: merged canonical snapshot since a nonce.
- `GET /state?account_id`: latest state.
- `POST /delta/proposal`: create pending proposal (tx summary + optional sigs), returns proposal commitment.
- `GET /delta/proposal?account_id`: list pending proposals.
- `PUT /delta/proposal`: append cosigner signature to a pending proposal.
- `GET /pubkey`: returns PSM acknowledgement public key for verifying `ack_sig`.

## gRPC
Mirrors HTTP (same auth headers in metadata).

> Please refer to the [API specification](https://github.com/OpenZeppelin/private-state-manager/blob/main/spec/api.md) for more details.

## Rust client

The Rust client provides a wrapper around the HTTP API. Please refer to the [Rust client documentation](https://github.com/OpenZeppelin/private-state-manager/blob/main/crates/client/README.md) for more details.

## Web client
The Web client provides a Typescrip wrapper around the HTTP API. Please refer to the [Web client documentation](https://github.com/OpenZeppelin/private-state-manager/blob/main/packages/psm-client/README.md) for more details.
