---
title: Tools
description: "Developer tools for building and interacting with the Miden network — clients, playground, and block explorer."
pagination_prev: null
---

# Tools

Developer tools for building on and interacting with the Miden network. Use the client SDKs inside your app, the Playground to prototype contracts in-browser, and the Explorer to inspect testnet state.

## Clients

<CardGrid cols={3}>
  <Card title="Rust client" href="./clients/rust-client/" eyebrow="Rust · SDK">
    Full-featured Rust library for Miden rollup integration — accounts, transactions, notes, proving.
  </Card>
  <Card title="Web SDK" href="./clients/web-client/" eyebrow="TypeScript · SDK">
    Browser-based client for managing accounts and transactions from a web app.
  </Card>
  <Card title="React SDK" href="./clients/react-sdk/" eyebrow="React · SDK">
    Hooks and components for Miden dApps.
  </Card>
</CardGrid>

## Environments

<CardGrid cols={2}>
  <Card title="Playground" href="./playground" eyebrow="Browser">
    Interactive environment for writing and testing Miden Assembly programs.
  </Card>
  <Card title="Explorer" href="./explorer" eyebrow="Testnet">
    Block explorer for inspecting accounts, notes, transactions, and blocks on the Miden testnet.
  </Card>
</CardGrid>
