---
title: TypeScript Client
sidebar_position: 2
---

# MultiSig TypeScript Client

The `@openzeppelin/miden-multisig-client` package provides a high-level TypeScript SDK for private multisig workflows on Miden. It wraps the on-chain multisig contracts and PSM coordination, with support for multiple signer types including external wallets.

**Package**: [`@openzeppelin/miden-multisig-client`](https://www.npmjs.com/package/@openzeppelin/miden-multisig-client)
**Source**: [`packages/miden-multisig-client`](https://github.com/OpenZeppelin/private-state-manager/tree/main/packages/miden-multisig-client) in the PSM repository.

## Installation

```bash
npm install @openzeppelin/miden-multisig-client @miden-sdk/miden-sdk
```

## Setup

```typescript
import { MultisigClient, FalconSigner } from '@openzeppelin/miden-multisig-client';
import { WebClient, AuthSecretKey } from '@miden-sdk/miden-sdk';

// Initialize the Miden WebClient
const webClient = await WebClient.createClient('https://rpc.testnet.miden.io:443');

// Create a Falcon signer
const secretKey = AuthSecretKey.rpoFalconWithRNG(undefined);
const signer = new FalconSigner(secretKey);

// Create the multisig client and fetch PSM info
const client = new MultisigClient(webClient, {
  psmEndpoint: 'http://localhost:3000',
});
const { psmCommitment } = await client.initialize();
```

## Creating a multisig account

```typescript
const config = {
  threshold: 2,
  signerCommitments: [signer.commitment, otherSignerCommitment],
  psmCommitment,
  signatureScheme: 'falcon',
};

const multisig = await client.create(config, signer);
console.log('Account ID:', multisig.accountId);

// Register on PSM
await multisig.registerOnPsm();
```

## Loading an existing account

```typescript
const multisig = await client.load(accountId, signer);
```

## Syncing state

Fetch proposals, state, notes, and config in a single call:

```typescript
const { proposals, state, notes, config } = await multisig.syncAll();
```

## Creating proposals

All create methods return `{ proposal, proposals }`:

```typescript
// Send payment
const { proposal } = await multisig.createSendProposal(recipientId, faucetId, amount);

// Consume notes
await multisig.createConsumeNotesProposal(noteIds);

// Account management
await multisig.createAddSignerProposal(newCommitment, { newThreshold: 3 });
await multisig.createRemoveSignerProposal(signerToRemove);
await multisig.createChangeThresholdProposal(3);

// Switch PSM provider
await multisig.createSwitchPsmProposal(newEndpoint, newPubkey);
```

## Signing and executing

```typescript
// Sign a proposal
await multisig.signTransactionProposal(proposal.commitment);

// Execute when ready
if (proposal.status.type === 'ready') {
  await multisig.executeTransactionProposal(proposal.commitment);
}
```

## External wallet integration

For browser wallets where the signing key is external:

```typescript
// Sign the commitment with an external wallet
const signature = await wallet.sign(proposal.commitment);

// Submit the external signature
await multisig.signTransactionProposalExternal({
  commitment: proposal.commitment,
  signature,
  publicKey: wallet.publicKey,
  scheme: 'ecdsa',
});
```

### Supported signers

| Signer | Scheme | Use case |
|---|---|---|
| `FalconSigner` | Falcon | Local Falcon key (default) |
| `EcdsaSigner` | ECDSA | Local ECDSA key |
| `ParaSigner` | ECDSA | External EVM wallets via Para SDK |
| `MidenWalletSigner` | Any | Miden Wallet browser extension |

## Offline workflows

Export and import proposals for side-channel signing:

```typescript
// Export a proposal as JSON
const json = multisig.exportTransactionProposalToJson(proposal.commitment);

// Sign offline
const signedJson = multisig.signTransactionProposalOffline(proposal.commitment);

// Import on another device
const { proposal: imported } = multisig.importTransactionProposal(json);
```

## Full API reference

See the [`packages/miden-multisig-client/README.md`](https://github.com/OpenZeppelin/private-state-manager/tree/main/packages/miden-multisig-client) for the complete API reference.
