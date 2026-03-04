---
title: Getting Started
sidebar_position: 3
---

# Getting Started

This guide covers running a PSM server and making your first API calls. For client SDK setup, see the [SDK pages](./sdks/).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (for the recommended setup)
- Or: Rust 1.90+ (to build from source)

## Running the server

### Docker Compose (recommended)

The PSM repository includes a Docker Compose configuration with PostgreSQL:

```bash
git clone https://github.com/OpenZeppelin/private-state-manager.git
cd private-state-manager
docker-compose up -d
```

This starts:

| Service | Port | Description |
|---|---|---|
| PSM HTTP API | `localhost:3000` | REST endpoints |
| PSM gRPC API | `localhost:50051` | gRPC service |
| PostgreSQL | `localhost:5432` | Metadata and state storage |

### From source

```bash
git clone https://github.com/OpenZeppelin/private-state-manager.git
cd private-state-manager

# With filesystem storage (default)
cargo run --package private-state-manager-server

# With PostgreSQL storage
DATABASE_URL=postgres://psm:password@localhost:5432/psm \
  cargo run --features postgres --package private-state-manager-server
```

## Configuration

The server is configured through environment variables:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection URL (required for Postgres backend) |
| `PSM_KEYSTORE_PATH` | `/var/psm/keystore` | Path for cryptographic key storage |
| `PSM_RATE_BURST_PER_SEC` | `10` | Max requests per second (burst) |
| `PSM_RATE_PER_MIN` | `60` | Max requests per minute (sustained) |
| `PSM_MAX_REQUEST_BYTES` | `1048576` | Max request body size (1 MB) |
| `RUST_LOG` | `info` | Log level (`debug`, `info`, `warn`, `error`) |

### Storage backends

PSM supports two storage backends:

- **Filesystem** (default): Stores state and deltas on disk. No external dependencies.
- **PostgreSQL**: Requires the `postgres` feature flag. Migrations run automatically on startup.

## Quick example

Once the server is running, you can configure an account and push state:

```bash
# 1. Check the server's public key (unauthenticated)
curl http://localhost:3000/pubkey

# 2. Configure an account
curl -X POST http://localhost:3000/configure \
  -H 'content-type: application/json' \
  -H 'x-pubkey: 0x<your-public-key>' \
  -H 'x-signature: 0x<signature>' \
  -H 'x-timestamp: <unix-ms>' \
  -d '{
    "account_id": "0x<account-id>",
    "auth": {
      "MidenFalconRpo": {
        "cosigner_commitments": ["0x<pubkey-commitment>"]
      }
    },
    "initial_state": { "data": "<base64-encoded-state>", "account_id": "0x<account-id>" }
  }'

# 3. Push a delta
curl -X POST http://localhost:3000/delta \
  -H 'content-type: application/json' \
  -H 'x-pubkey: 0x<your-public-key>' \
  -H 'x-signature: 0x<signature>' \
  -H 'x-timestamp: <unix-ms>' \
  -d '{
    "account_id": "0x<account-id>",
    "nonce": 1,
    "prev_commitment": "0x<commitment>",
    "delta_payload": { "data": "<base64-encoded-delta>" }
  }'

# 4. Retrieve current state
curl -G http://localhost:3000/state \
  -H 'x-pubkey: 0x<your-public-key>' \
  -H 'x-signature: 0x<signature>' \
  -H 'x-timestamp: <unix-ms>' \
  --data-urlencode 'account_id=0x<account-id>'
```

:::note
All endpoints except `/pubkey` require authentication headers. See [Authentication](./authentication.md) for details on generating signatures.
:::

## Next steps

- [Authentication](./authentication.md) — understand the signing model
- [Rust SDK](./sdks/rust-sdk.md) — integrate PSM in a Rust application
- [TypeScript SDK](./sdks/typescript-sdk.md) — integrate PSM in a web or Node.js application
