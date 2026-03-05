---
title: Troubleshooting
sidebar_position: 3
---

# Troubleshooting

Common issues when operating a PSM server and how to resolve them.

## Server won't start

**Symptom**: Server exits immediately or fails to bind ports.

- Check that ports 3000 (HTTP) and 50051 (gRPC) are not already in use.
- If using Postgres, ensure `DATABASE_URL` is set and the database is reachable.
- Check logs with `RUST_LOG=debug` for detailed error messages.

## Acknowledgment key mismatch

**Symptom**: Clients report `ack_sig` verification failures.

- Verify the server's public key via `GET /pubkey` and compare with what clients expect.
- If the keystore was regenerated (new `PSM_KEYSTORE_PATH`), clients need to re-fetch the server's public key.
- Ensure `PSM_KEYSTORE_PATH` is persistent across restarts — a new key on every restart will break client verification.

## Authentication failures

**Symptom**: Requests return `400 AuthenticationFailed`.

- **Clock skew**: Client timestamp must be within 300 seconds of the server's time. Ensure NTP synchronization.
- **Replay rejection**: Each request's timestamp must be strictly greater than the account's `last_auth_timestamp`. Rapid-fire requests with the same timestamp will fail.
- **Wrong key**: The `x-pubkey` commitment must be in the account's cosigner allowlist. Verify the account's auth configuration.

## Deltas stuck as candidates

**Symptom**: Deltas remain in `candidate` status and never become `canonical`.

- Check that the canonicalization worker is running (default: checks every 60 seconds).
- Deltas must wait at least `delay_seconds` (default: 15 minutes) before the worker processes them.
- If the on-chain commitment doesn't match, deltas are `discarded`. Check that the transaction was actually submitted and confirmed on-chain.
- Inspect canonicalization logs: `RUST_LOG=server::jobs::canonicalization=debug`

## Storage and metadata path issues

**Symptom**: Server returns errors on state or delta operations.

- Ensure `PSM_STORAGE_PATH` and `PSM_METADATA_PATH` point to writable directories.
- For Postgres: verify the connection string and that migrations have run (they run automatically on startup).
- Check disk space — filesystem storage can grow with the number of accounts and deltas.

## Rate limiting

**Symptom**: Clients receive `429 Too Many Requests`.

- Default limits: 10 requests/second (burst), 60 requests/minute (sustained).
- Adjust via `PSM_RATE_BURST_PER_SEC` and `PSM_RATE_PER_MIN` environment variables.
- The `Retry-After` header in the response indicates how long to wait.

## Common error codes

| Error | Meaning |
|---|---|
| `AccountNotFound` | No account configured with this ID |
| `AuthenticationFailed` | Invalid signature, unknown key, or expired timestamp |
| `InvalidDelta` | Delta fails validation against current state or network |
| `CommitmentMismatch` | Delta's `prev_commitment` doesn't match current state |
| `ConflictPendingDelta` | Another candidate delta is already pending for this account |
| `TimestampExpired` | Request timestamp is outside the 300-second window |
| `TimestampReplay` | Request timestamp is not greater than last accepted timestamp |

## Links

- [Server README](https://github.com/OpenZeppelin/private-state-manager/tree/main/crates/server) — full server documentation
- [PSM Specification](https://github.com/OpenZeppelin/private-state-manager/tree/main/spec) — protocol specification
