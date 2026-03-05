---
title: Running
sidebar_position: 1
---

# How to Run

This guide covers running a Guardian server locally for development or testing.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (recommended), or
- Rust toolchain 1.90+ (to build from source)

## Docker Compose (recommended)

The repository includes a Docker Compose configuration with PostgreSQL:

```bash
git clone https://github.com/OpenZeppelin/private-state-manager.git
cd private-state-manager
docker-compose up -d
```

This starts:

| Service | Port | Description |
|---|---|---|
| Guardian HTTP API | `localhost:3000` | REST endpoints |
| Guardian gRPC API | `localhost:50051` | gRPC service |
| PostgreSQL | `localhost:5432` | Metadata and state storage |

View logs:

```bash
docker-compose logs -f
```

Stop services:

```bash
docker-compose down
```

## Building from source

```bash
git clone https://github.com/OpenZeppelin/private-state-manager.git
cd private-state-manager

# With filesystem storage (default)
cargo build --release --bin server
cargo run --release --bin server

# With PostgreSQL storage
DATABASE_URL=postgres://psm:password@localhost:5432/psm \
  cargo run --features postgres --package private-state-manager-server
```

## Ports

| Protocol | Default Port | Description |
|---|---|---|
| HTTP | `3000` | REST API |
| gRPC | `50051` | gRPC service |

Both can be configured programmatically via the `ServerBuilder`:

```rust
use server::builder::ServerBuilder;

let builder = ServerBuilder::new()
    .http(true, 3000)
    .grpc(true, 50051);
```

## Verifying the server

Once running, check the server's acknowledgment public key:

```bash
curl http://localhost:3000/pubkey
# Returns: { "pubkey": "0x..." }
```

This endpoint is unauthenticated and confirms the server is operational.
