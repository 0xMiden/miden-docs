---
title: Explorer
sidebar_position: 4
description: "Block explorer for the Miden network — inspect accounts, notes, transactions, and blocks on-chain."
---

# Miden Explorer

A block explorer for the Miden network. Inspect account state, note commitments, transactions, and blocks — the canonical way to verify what landed on-chain after submitting a transaction.

<CardGrid cols={2}>
  <Card title="Open MidenScan ↗" href="https://testnet.midenscan.com" eyebrow="External · testnet">
    Search by account ID, transaction ID, note ID, or block height. Referenced throughout the tutorials as the verification surface.
  </Card>
  <Card title="Miden Foundation explorer ↗" href="https://explorer.testnet.miden.io/" eyebrow="External · testnet">
    The Miden Foundation's explorer instance — alternative view of the same testnet state.
  </Card>
</CardGrid>

## What you can inspect

<CardGrid cols={2}>
  <Card title="Accounts" eyebrow="State">
    Account IDs, state commitments, storage roots, vaults, and nonces.
  </Card>
  <Card title="Notes" eyebrow="Messages">
    Public note commitments, consumption status, and metadata where surfaced.
  </Card>
  <Card title="Transactions" eyebrow="Execution">
    Inputs, outputs, state deltas, and proof verification status.
  </Card>
  <Card title="Blocks" eyebrow="Network">
    Block headers, included transactions, and aggregated proofs.
  </Card>
</CardGrid>

<Callout variant="tip" title="Finding your deployment">
When your client prints an account ID or transaction ID after a successful submit, paste it into the explorer's search bar to watch state commitments land on-chain.
</Callout>

## Related

<CardGrid cols={2}>
  <Card title="Deploy your first contract" href="../get-started/your-first-smart-contract/deploy" eyebrow="Tutorial">
    Full deploy walkthrough with MidenScan verification steps built in.
  </Card>
  <Card title="Accounts & state" href="../smart-contracts/accounts/" eyebrow="Reference">
    How accounts and state commitments work on-chain.
  </Card>
</CardGrid>
