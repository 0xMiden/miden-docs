---
title: Client
sidebar_position: 1
---

# Miden client

The Miden client is the user-facing entry point to the Miden network. It manages accounts, builds and executes transactions, produces zero-knowledge proofs, and synchronises local state with the node. The same client logic ships across four consumer surfaces so you can pick the runtime that fits your application:

| Surface | Package | Best for |
| --- | --- | --- |
| [**Rust library**](./rust-client/library.md) | `miden-client` crate | Native services, proving infrastructure, tests |
| [**Rust CLI**](./rust-client/cli/index.md) | `miden-client` binary | Scripting, local exploration, ops workflows |
| [**Web SDK**](./web-client/index.md) | `@miden-sdk/miden-sdk` (npm) | Browser and Node apps, Electron, service workers |
| [**React SDK**](./react-sdk/index.md) | `@miden-sdk/react` (npm) | React / Next.js / React Native dApps |

## How the surfaces relate

- The **Rust library** contains the core state machine, transaction executor, prover, keystore abstraction, and note transport.
- The **Rust CLI** wraps the library and exposes its functionality as commands.
- The **Web SDK** compiles the Rust library to WebAssembly and exposes a typed JavaScript API (the `MidenClient` class). It is the canonical TypeScript/JavaScript entry point.
- The **React SDK** wraps the Web SDK with a `MidenProvider` and a family of hooks (`useMiden`, `useAccount`, `useSend`, …). It shares the exact same on-chain semantics.

Pick whichever surface matches your application — each section documents the full API for that runtime.

## Common topics

Errors, diagnostics, and other behaviour that is shared across all surfaces is documented once in [Common errors](./common-errors.md).
