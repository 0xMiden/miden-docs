---
title: SDKs
sidebar_position: 0
---

# PSM Client SDKs

PSM provides official client libraries for Rust and TypeScript. Both SDKs handle authentication, request signing, and server acknowledgement verification.

| SDK | Transport | Package | Use case |
|---|---|---|---|
| [Rust](./rust-sdk.md) | gRPC | `private-state-manager-client` | Backend services, CLI tools, native apps |
| [TypeScript](./typescript-sdk.md) | HTTP | `@openzeppelin/psm-client` | Web apps, Node.js services |

Both SDKs expose the same operations:

- **Configure** an account with initial state and authentication policy
- **Push deltas** to update account state
- **Get state** to retrieve the latest account snapshot
- **Delta proposals** for multi-party coordination (create, sign, list)

Choose the SDK that matches your runtime. The gRPC and HTTP APIs are semantically identical — you can switch between them without changing application logic.
