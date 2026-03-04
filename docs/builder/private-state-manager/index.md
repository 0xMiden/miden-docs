---
title: Private State Manager
sidebar_position: 0
---

# Private State Manager

The Private State Manager (PSM) is infrastructure built by [OpenZeppelin](https://www.openzeppelin.com/) for managing private account state on Miden. It provides a server and client SDKs for backing up, syncing, and coordinating state without trust assumptions about the server operator.

PSM enables workflows that require multi-device synchronization and multi-party coordination, such as multisig accounts where multiple signers must agree on transactions before execution.

import DocCard from '@theme/DocCard';

## Learn

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './overview',
        label: 'Overview',
        description: 'What PSM is, how it works, and where it fits in the Miden ecosystem.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './core-concepts',
        label: 'Core Concepts',
        description: 'State, deltas, delta proposals, commitments, and canonicalization.',
      }}
    />
  </div>
</div>

## Build

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './getting-started',
        label: 'Getting Started',
        description: 'Install, run the server, and push your first state update.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './authentication',
        label: 'Authentication',
        description: 'Falcon RPO auth model, request signing, and replay protection.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './sdks/',
        label: 'SDKs',
        description: 'Rust and TypeScript client libraries for interacting with PSM.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './multisig/',
        label: 'MultiSig',
        description: 'Multi-party threshold signature workflows powered by PSM.',
      }}
    />
  </div>
</div>

## Repositories

| Repository | Description |
|---|---|
| [private-state-manager](https://github.com/OpenZeppelin/private-state-manager) | PSM server, client SDKs, and multisig client libraries |
| [MultiSig](https://github.com/OpenZeppelin/MultiSig) | MultiSig reference application (frontend + coordinator) |
