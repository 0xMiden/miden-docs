---
title: Troubleshooting
sidebar_position: 3
---

# Troubleshooting Miden Guardian

## Server does not start

Check that storage paths are writable:

```bash
ls -ld /var/guardian/storage /var/guardian/metadata /var/guardian/keystore
```

For Postgres mode, confirm `DATABASE_URL` is set and reachable. The server panics on startup if it's missing.

## Public key changed unexpectedly

The Guardian key is loaded from the configured keystore path. Confirm the same `GUARDIAN_KEYSTORE_PATH` is used across restarts.

For production AWS deployments, confirm `GUARDIAN_ENV=prod` and `AWS_REGION` are set so acknowledgement keys are loaded from Secrets Manager rather than the filesystem.

## Authentication failures

Guardian requires signed requests. Each carries three headers — `x-pubkey`, `x-signature`, and `x-timestamp` — and the timestamp is validated against two rules:

- It must be within ±5 minutes of server time (`MAX_TIMESTAMP_SKEW_MS = 300_000`).
- It must be **strictly greater** than the last timestamp the server saw for that public key. The metadata store enforces this with a CAS update; a request with a timestamp equal to or below the previous one is rejected even if otherwise valid.

Common causes:

- Client clock is more than 5 minutes from server time.
- Timestamp was reused (replay attempt or accidental retry without re-signing).
- Request body changed after signing.
- Client is using the wrong Guardian public key — re-fetch `/pubkey`.

## Proposal stays pending

```bash
DEPLOY_STAGE=dev ./scripts/aws-deploy.sh logs
```

Common causes:

- Account state has not canonicalized yet (the 10-second pass hasn't run).
- The 10-minute submission grace period has not elapsed.
- Metadata backend is not writable.
- The pending-proposal count has hit `GUARDIAN_MAX_PENDING_PROPOSALS_PER_ACCOUNT` (default `20`); see [error code `pending_proposals_limit`](#common-error-codes).

## Rate limit errors

If requests are rejected under load, tune:

```bash
GUARDIAN_RATE_BURST_PER_SEC      # default 10
GUARDIAN_RATE_PER_MIN            # default 60
GUARDIAN_MAX_REQUEST_BYTES       # default 1048576
```

The HTTP rate-limit middleware responds with `429 Too Many Requests` and a `Retry-After` header plus `retry_after_secs` in the body. **Note:** these middleware-level rejections do not include a `code` field — only the Guardian application-level `rate_limit_exceeded` error does. See the table below.

## Common error codes

The server emits structured error codes via `GuardianError::code()`. The most common ones operators will hit:

| Code                    | What it means                                                                                                         | First thing to check                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `authentication_failed` | Auth headers missing or malformed, clock skew > 5 min, signature invalid, or the timestamp was already used.          | `x-pubkey` / `x-signature` / `x-timestamp` headers; client clock sync; the last timestamp you sent. |
| `account_not_found`     | The metadata store has no record for that account ID.                                                                 | Account ID is correct and `/configure` actually completed against this server.                      |
| `invalid_input`         | Generic 400 — request JSON, query parameters, or commitment shape failed validation.                                  | Request payload schema; commitment hex format.                                                      |
| `rate_limit_exceeded`   | Application-level rate limit hit. (The HTTP middleware also emits `429` responses, but those have no `code` field.)   | Tune `GUARDIAN_RATE_BURST_PER_SEC` / `GUARDIAN_RATE_PER_MIN`; check `Retry-After` on the response.  |
| `storage_error`         | The storage or metadata backend rejected an operation.                                                                | Filesystem permissions on the storage paths, or database health for Postgres mode.                  |
