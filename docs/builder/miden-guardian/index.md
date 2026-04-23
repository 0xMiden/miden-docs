---
title: Miden Guardian
sidebar_position: 0
---

# Miden Guardian

Miden Guardian is a system built by [OpenZeppelin](https://www.openzeppelin.com/) that allows Miden accounts to back up and sync their private state securely without trust assumptions about other participants or the server operator.

## The problem

Miden's execution model requires clients to manage their own private state — accounts, notes, storage — locally on-device. While this provides strong privacy and scalability, it introduces real challenges:

- **Solo-account users** risk losing access if local state is not backed up. Losing any part of the account state means losing access to the account itself.
- **Shared-account users** risk having stale state due to a faulty or malicious participant withholding updates.
- **Multi-device users** need all devices to see the same account state, but there is no public ledger to read from.

On a public chain, the ledger is a universally readable source of truth — every device and every signer can independently observe the latest state. In Miden's private account model, the canonical state is defined by the on-chain commitment, but it isn't readable in a way that keeps devices and signers automatically up to date. The coordination surface moves off-chain.

## What Guardian provides

Guardian addresses these challenges by acting as an off-chain coordination layer:

- **Backup and recovery** — Account state is stored on Guardian, recoverable even if a device is lost.
- **Multi-device sync** — Multiple devices push and pull state through Guardian, staying in sync with the latest canonical state.
- **Multi-party coordination** — Shared accounts use delta proposals to coordinate threshold signing across participants.
- **Integrity verification** — Every state change is validated against the Miden network and acknowledged with a cryptographic signature.

Guardian is non-custodial. The provider cannot move funds unilaterally — it stores state and coordinates changes, but users retain cryptographic control over their accounts at all times.

## Learn more

<CardGrid cols={2}>
  <Card title="Architecture" href="./core-concepts/architecture" eyebrow="Core concepts">
    How Guardian fits between clients and the Miden network.
  </Card>
  <Card title="Data structures" href="./core-concepts/data-structures" eyebrow="Core concepts">
    State, deltas, commitments, and delta proposals.
  </Card>
  <Card title="Components" href="./core-concepts/components" eyebrow="Core concepts">
    API, authentication, storage, and other server components.
  </Card>
  <Card title="Security" href="./core-concepts/security" eyebrow="Core concepts">
    Trust model, integrity guarantees, and edge cases.
  </Card>
  <Card title="Operator guide" href="./operator-guide/running" eyebrow="Run it">
    How to run, deploy, and troubleshoot a Guardian server.
  </Card>
  <Card title="Private multisig" href="../private-multisig/" eyebrow="Solutions">
    Multi-party threshold signature workflows powered by Guardian.
  </Card>
</CardGrid>

## Repository

- [Miden Guardian](https://github.com/OpenZeppelin/guardian) — Guardian server, client SDKs, multisig client libraries, and specification
