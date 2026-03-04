---
title: Private State Manager
sidebar_position: 0
---

# Private State Manager

The Private State Manager (PSM) is a system built by [OpenZeppelin](https://www.openzeppelin.com/) that allows Miden accounts to back up and sync their private state securely without trust assumptions about other participants or the server operator.

## The problem

Miden's execution model requires clients to manage their own private state — accounts, notes, storage — locally on-device. While this provides strong privacy and scalability, it introduces real challenges:

- **Solo-account users** risk losing access if local state is not backed up. Losing any part of the account state means losing access to the account itself.
- **Shared-account users** risk having stale state due to a faulty or malicious participant withholding updates.
- **Multi-device users** need all devices to see the same account state, but there is no public ledger to read from.

On a public chain, the ledger is a universally readable source of truth — every device and every signer can independently observe the latest state. In Miden's private account model, the canonical state is defined by the on-chain commitment, but it isn't readable in a way that keeps devices and signers automatically up to date. The coordination surface moves off-chain.

## What PSM provides

PSM addresses these challenges by acting as an off-chain coordination layer:

- **Backup and recovery** — Account state is stored on PSM, recoverable even if a device is lost.
- **Multi-device sync** — Multiple devices push and pull state through PSM, staying in sync with the latest canonical state.
- **Multi-party coordination** — Shared accounts use delta proposals to coordinate threshold signing across participants.
- **Integrity verification** — Every state change is validated against the Miden network and acknowledged with a cryptographic signature.

PSM is non-custodial. The provider cannot move funds unilaterally — it stores state and coordinates changes, but users retain cryptographic control over their accounts at all times.

import DocCard from '@theme/DocCard';

## Learn more

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './core-concepts/architecture',
        label: 'Architecture',
        description: 'How PSM fits between clients and the Miden network.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './core-concepts/data-structures',
        label: 'Data Structures',
        description: 'State, deltas, commitments, and delta proposals.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './core-concepts/components',
        label: 'Components',
        description: 'API, authentication, storage, and other server components.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './core-concepts/security',
        label: 'Security',
        description: 'Trust model, integrity guarantees, and edge cases.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './operator-guide/running',
        label: 'Operator Guide',
        description: 'How to run, deploy, and troubleshoot a PSM server.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: '../private-multisig/',
        label: 'Private Multisig',
        description: 'Multi-party threshold signature workflows powered by PSM.',
      }}
    />
  </div>
</div>

## Repository

- [private-state-manager](https://github.com/OpenZeppelin/private-state-manager) — PSM server, client SDKs, multisig client libraries, and specification
