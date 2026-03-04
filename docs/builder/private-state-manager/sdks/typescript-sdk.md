---
title: TypeScript SDK
sidebar_position: 2
---

# TypeScript SDK

The TypeScript PSM client communicates with the server over HTTP. It provides a typed interface for all PSM operations.

**Package**: [`@openzeppelin/psm-client`](https://www.npmjs.com/package/@openzeppelin/psm-client)
**Source**: [`packages/psm-client`](https://github.com/OpenZeppelin/private-state-manager/tree/main/packages/psm-client) in the PSM repository.

## Installation

```bash
npm install @openzeppelin/psm-client
```

## Client setup

```typescript
import { PsmHttpClient } from '@openzeppelin/psm-client';

const client = new PsmHttpClient('http://localhost:3000');
```

### Setting up a signer

All endpoints except `getPubkey()` require authentication. Provide a signer that implements the `Signer` interface:

```typescript
import type { Signer, SignatureScheme } from '@openzeppelin/psm-client';

const signer: Signer = {
  commitment: '0x...',
  publicKey: '0x...',
  scheme: 'falcon' as SignatureScheme,
  signAccountIdWithTimestamp: async (accountId: string, timestamp: number) => '0x...',
  signCommitment: async (commitmentHex: string) => '0x...',
};

client.setSigner(signer);
```

## Common operations

### Get server public key

This is the only unauthenticated endpoint:

```typescript
const { commitment, pubkey } = await client.getPubkey();
```

### Configure an account

```typescript
await client.configure({
  account_id: '0x...',
  auth: {
    MidenFalconRpo: {
      cosigner_commitments: ['0x...', '0x...'],
    },
  },
  initial_state: { data: '<base64-encoded-account>', account_id: '0x...' },
});
```

### Get account state

```typescript
const state = await client.getState(accountId);
console.log('Commitment:', state.commitment);
```

### Push a delta

```typescript
const result = await client.pushDelta({
  account_id: accountId,
  nonce: 1,
  prev_commitment: '0x...',
  delta_payload: { data: '<base64-encoded-delta>' },
});
```

### Get deltas

```typescript
// Single delta by nonce
const delta = await client.getDelta(accountId, 5);

// Merged delta since a nonce
const merged = await client.getDeltaSince(accountId, 3);
```

### Delta proposals

```typescript
// Create a proposal
const response = await client.pushDeltaProposal({
  account_id: accountId,
  nonce: 1,
  delta_payload: {
    tx_summary: { data: '<base64-tx-summary>' },
    signatures: [],
  },
});

// List pending proposals
const proposals = await client.getDeltaProposals(accountId);

// Sign a proposal
await client.signDeltaProposal({
  account_id: accountId,
  commitment: response.commitment,
  signature: { scheme: 'falcon', signature: '0x...' },
});
```

## Error handling

The client throws `PsmHttpError` for non-2xx responses:

```typescript
import { PsmHttpError } from '@openzeppelin/psm-client';

try {
  await client.getState(accountId);
} catch (error) {
  if (error instanceof PsmHttpError) {
    console.error(`HTTP ${error.status}: ${error.statusText}`);
    console.error('Body:', error.body);
  }
}
```

## Full API reference

See the [`packages/psm-client/README.md`](https://github.com/OpenZeppelin/private-state-manager/tree/main/packages/psm-client) for the complete API documentation.
