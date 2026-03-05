---
title: Deployment
sidebar_position: 2
---

# How to Deploy

This page covers Guardian server configuration for production deployments.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection URL (required for Postgres backend) |
| `PSM_KEYSTORE_PATH` | `/var/psm/keystore` | Path for cryptographic key storage |
| `PSM_STORAGE_PATH` | — | Storage backend path (states and deltas) |
| `PSM_METADATA_PATH` | — | Metadata store path |
| `PSM_ENV` | `dev` | Environment mode |
| `RUST_LOG` | `info` | Log level (`debug`, `info`, `warn`, `error`) |

### Rate limiting

| Variable | Default | Description |
|---|---|---|
| `PSM_RATE_BURST_PER_SEC` | `10` | Max requests per second (burst) |
| `PSM_RATE_PER_MIN` | `60` | Max requests per minute (sustained) |

Rate limits are applied per client IP, with enhanced keying when `x-pubkey` or `account_id` is present. Exceeded limits return `429 Too Many Requests` with a `Retry-After` header.

### Request size limits

| Variable | Default | Description |
|---|---|---|
| `PSM_MAX_REQUEST_BYTES` | `1048576` (1 MB) | Maximum request body size |

Requests exceeding this limit receive `413 Payload Too Large`.

## Storage backends

Guardian uses a single storage backend per instance.

### Filesystem (default)

Stores state and deltas on disk. No external dependencies. Used when the binary is built without the `postgres` feature.

Ensure `PSM_STORAGE_PATH` points to a writable directory with sufficient disk space.

### PostgreSQL (optional)

Requires the `postgres` feature flag at build time. Migrations run automatically on startup.

```bash
DATABASE_URL=postgres://psm:password@localhost:5432/psm \
  cargo run --features postgres --package private-state-manager-server
```

## Metadata store

The metadata store can be configured independently from the storage backend. It supports both filesystem and PostgreSQL backends.

Ensure `PSM_METADATA_PATH` points to a writable directory (filesystem mode) or configure `DATABASE_URL` (Postgres mode).

## Logging

The server uses structured logging via the `tracing` crate.

```bash
# Debug level for entire server
RUST_LOG=debug cargo run --package private-state-manager-server

# Trace only canonicalization jobs
RUST_LOG=server::jobs::canonicalization=trace cargo run

# Multiple modules
RUST_LOG=server::jobs=debug,server::services=info cargo run
```

## Canonicalization configuration

When canonicalization is enabled (default), configure the verification window:

| Parameter | Default | Description |
|---|---|---|
| `delay_seconds` | 900 (15 min) | How long a candidate waits before verification |
| `check_interval_seconds` | 60 (1 min) | How often the canonicalization worker runs |

Set to **optimistic mode** to skip the verification window and mark deltas canonical immediately.

## Reproducible builds

The server binary supports reproducible builds. Building from the same source code and target architecture produces bit-for-bit identical binaries:

```bash
./crates/server/tests/verify-build-hash.sh
```

This is useful for verifying published binaries match the source code.
