---
title: Operator Guide
sidebar_position: 4
---

This guide summarizes how to run and observe a PSM node.

## Prerequisites
- Rust toolchain (version 1.90.0 or greater).
- Docker client.

## Clone the repository
- Clone the repository: `git clone https://github.com/OpenZeppelin/private-state-manager.git`
- Build the server: `cargo build --release --bin server`

## Run using docker
- Docker compose: copy `.env.example` to `.env`, set paths, `docker-compose up --build -d`
- Cargo: `cargo run --bin server`

## Configuration (env vars)
- `PSM_STORAGE_PATH`: storage backend path (states/deltas)
- `PSM_METADATA_PATH`: metadata store path
- `PSM_KEYSTORE_PATH`: server key store (ack key)
- `PSM_ENV`: `dev` by default
- `RUST_LOG`: e.g. `info`, `debug`, or module-specific (`server::jobs::canonicalization=debug`)

## Ports
- HTTP: `:3000`
- gRPC: `:50051`

## Canonicalization
- Candidate mode (default): background worker promotes/discards after delay and network verification.
- Optimistic mode: deltas become canonical immediately.
- Defaults: delay 15m, check interval 60s (configurable).

## Troubleshooting
- Verify ack key via `GET /pubkey` matches what clients expect.
- Check logs for `ConflictPendingDelta` (concurrent proposals) and `CommitmentMismatch`.
- Ensure storage and metadata paths are writable and consistent.

## Links
- Repository: https://github.com/OpenZeppelin/private-state-manager
- Server README: [crates/server/README.md](https://github.com/OpenZeppelin/private-state-manager/blob/main/crates/server/README.md)