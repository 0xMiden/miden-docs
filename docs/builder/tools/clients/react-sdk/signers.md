---
title: External signers
sidebar_position: 6
---

# External signers

The React SDK treats signing as a pluggable contract: `MidenProvider` accepts any `SignerContext` that exposes a `signCb` function, and hooks call into it whenever a transaction needs a signature. Prebuilt providers exist for the major wallet integrations; you can also build your own.

## Built-in signer providers

### Para (EVM wallets)

```tsx
import { ParaSignerProvider } from "@miden-sdk/para";
import { MidenProvider } from "@miden-sdk/react";

function App() {
  return (
    <ParaSignerProvider apiKey="your-api-key" environment="PRODUCTION">
      <MidenProvider config={{ rpcUrl: "testnet" }}>
        <YourApp />
      </MidenProvider>
    </ParaSignerProvider>
  );
}
```

Expose Para-specific data inside your app:

```tsx
import { useParaSigner } from "@miden-sdk/para";

const { para, wallet, isConnected } = useParaSigner();
```

### Turnkey

```tsx
import { TurnkeySignerProvider } from "@miden-sdk/miden-turnkey-react";

// Config is optional — defaults to https://api.turnkey.com and reads
// VITE_TURNKEY_ORG_ID from the environment.
<TurnkeySignerProvider>
  <MidenProvider config={{ rpcUrl: "testnet" }}>
    <YourApp />
  </MidenProvider>
</TurnkeySignerProvider>

// Or with explicit config:
<TurnkeySignerProvider
  config={{
    apiBaseUrl: "https://api.turnkey.com",
    defaultOrganizationId: "your-org-id",
  }}
>
  ...
</TurnkeySignerProvider>
```

Connect via passkey authentication:

```tsx
import { useSigner } from "@miden-sdk/react";
import { useTurnkeySigner } from "@miden-sdk/miden-turnkey-react";

function ConnectButton() {
  const { isConnected, connect, disconnect } = useSigner();
  if (!isConnected) return <button onClick={connect}>Connect</button>;

  const { client, account, setAccount } = useTurnkeySigner();
  return <button onClick={disconnect}>Disconnect ({account?.name})</button>;
}
```

### MidenFi wallet adapter

```tsx
import { MidenFiSignerProvider } from "@miden-sdk/wallet-adapter-react";

<MidenFiSignerProvider network="testnet">
  <MidenProvider config={{ rpcUrl: "testnet" }}>
    <YourApp />
  </MidenProvider>
</MidenFiSignerProvider>
```

## Unified signer interface

Every prebuilt provider exposes the same `useSigner` surface, so UI code that only cares about connect/disconnect stays signer-agnostic:

```tsx
import { useSigner } from "@miden-sdk/react";

function Header() {
  const { isConnected, connect, disconnect, name } = useSigner();

  if (!isConnected) return <button onClick={connect}>Connect {name}</button>;
  return <button onClick={disconnect}>Disconnect</button>;
}
```

## Custom signer providers

For a signing service that doesn't have a prebuilt provider — internal HSM, hardware wallet, or experimental integration — wire `SignerContext` directly:

```tsx
import { SignerContext, type SignerContextValue } from "@miden-sdk/react";

const signer: SignerContextValue = {
  name: "MyWallet",
  storeName: `mywallet_${userAddress}`, // unique per user for DB isolation
  isConnected: true,
  accountConfig: {
    publicKeyCommitment: userPublicKeyCommitment, // Uint8Array
    storageMode: "private",
    accountType: "RegularAccountUpdatableCode",
  },
  signCb: async (pubKey, signingInputs) => {
    // Route to your signing service
    return signature; // Uint8Array
  },
  connect: async () => {
    /* trigger wallet connection */
  },
  disconnect: async () => {
    /* clear session */
  },
};

function App() {
  return (
    <SignerContext.Provider value={signer}>
      <MidenProvider config={{ rpcUrl: "testnet" }}>
        <YourApp />
      </MidenProvider>
    </SignerContext.Provider>
  );
}
```

`storeName` is critical: each user's data lives in its own IndexedDB database, so make the `storeName` unique per signing identity (typically the wallet address or a derived hash).

## Custom `AccountComponent`s

Attach application-specific components — compiled from `.masp` packages, e.g. a DEX module — alongside the default auth and basic wallet components:

```tsx
import { type SignerAccountConfig } from "@miden-sdk/react";
import { AccountComponent } from "@miden-sdk/miden-sdk";

const myDexComponent: AccountComponent = await loadCompiledComponent();

const accountConfig: SignerAccountConfig = {
  publicKeyCommitment: userPublicKeyCommitment,
  accountType: "RegularAccountUpdatableCode",
  storageMode: "private",
  customComponents: [myDexComponent],
};
```

Components are appended to the `AccountBuilder` after the default basic wallet component and before `build()` is called, so the account always includes wallet functionality plus any extras you pass. The field is optional; leaving it unset (or passing an empty array) preserves the default behaviour.

## `MultiSignerProvider`

For apps that need to swap between multiple signer providers at runtime (e.g. "connect with Para" or "connect with Turnkey"), use `MultiSignerProvider` and `SignerSlot`:

```tsx
import { MultiSignerProvider, SignerSlot } from "@miden-sdk/react";

<MultiSignerProvider>
  <SignerSlot id="para">
    <ParaSignerProvider apiKey="...">{children}</ParaSignerProvider>
  </SignerSlot>

  <SignerSlot id="turnkey">
    <TurnkeySignerProvider>{children}</TurnkeySignerProvider>
  </SignerSlot>
</MultiSignerProvider>
```

Switch the active signer via `useMultiSigner()`:

```tsx
import { useMultiSigner } from "@miden-sdk/react";

const { activeSigner, setActiveSigner } = useMultiSigner();
// setActiveSigner("para" | "turnkey" | ...)
```

## Next

- [Recipes](./recipes.md) — end-to-end patterns with signer integration examples.
- [Setup](./setup.md) — client config and lifecycle.
