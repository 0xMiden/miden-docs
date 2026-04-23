---
title: Client
sidebar_position: 1
---

# Miden client

The Miden client is the user-facing entry point to the Miden network. It manages accounts, builds and executes transactions, produces zero-knowledge proofs, and synchronises local state with the node. The same client logic ships across four consumer surfaces so you can pick the runtime that fits your application:

| Surface | Package | Best for |
| --- | --- | --- |
| **Rust library** | `miden-client` crate | Native services, proving infrastructure, tests |
| **Rust CLI** | `miden-client` binary | Scripting, local exploration, ops workflows |
| **Web SDK** | `@miden-sdk/miden-sdk` (npm) | Browser and Node apps, Electron, service workers |
| **React SDK** | `@miden-sdk/react` (npm) | React / Next.js / React Native dApps |

Navigate to each surface via the sidebar on the left.

## How the surfaces relate

- The **Rust library** contains the core state machine, transaction executor, prover, keystore abstraction, and note transport.
- The **Rust CLI** wraps the library and exposes its functionality as commands.
- The **Web SDK** compiles the Rust library to WebAssembly and exposes a typed JavaScript API (the `MidenClient` class). It is the canonical TypeScript/JavaScript entry point.
- The **React SDK** wraps the Web SDK with a `MidenProvider` and a family of hooks (`useMiden`, `useAccount`, `useSend`, …). It shares the exact same on-chain semantics.

Pick whichever surface matches your application — each section documents the full API for that runtime.

## Common topics

Errors, diagnostics, and other behaviour that is shared across all surfaces is documented once under **Common errors** in the sidebar.
