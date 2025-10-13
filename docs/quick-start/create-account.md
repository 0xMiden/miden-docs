---
sidebar_position: 2
title: Create Account
description: Learn how to create a Miden account using the Miden CLI.
---

# Create a Miden Account

Welcome to your first step into the Miden ecosystem! This guide will teach you how to create and understand Miden accounts.

## Understanding Miden Accounts

Think of a Miden account as your smart, programmable wallet that can:

On Miden, an Account is your on-chain container for code and assets. You'll use accounts to:

- **Hold and transfer assets**
- **Execute smart contract code**
- **Store private data securely**
- **Interact with other accounts and Miden components (Notes, Assets, etc...)**

Unlike traditional blockchain addresses, Miden accounts are **intelligent actors** that can perform complex operations and maintain their own state. Miden utilizes the [Actor model](https://en.wikipedia.org/wiki/Actor_model).

## Core Account Details

### Account ID

Every Miden account has a **120-bit Account ID** (not a public key!) that uniquely identifies it on the network. This ID encodes:

- Account type (wallet, faucet, etc.)
- Storage mode (public, private, network)
- Version information

### Modular Architecture

Miden accounts are built from **reusable components** that provide modular functionality. This architecture allows for flexible account creation by combining different specialized components.

**What are Account Components?**

Account components are modular, reusable units of functionality that define specific capabilities of an account. Each component consists of:

1. **Component Code**: A library of functions that can read/write to component storage slots
2. **Component Metadata**: Describes the component's name, version, and storage layout

For a detailed explanation of the Account Component specification, see our [Protocol Documentation](https://0xmiden.github.io/miden-docs/imported/miden-base/src/account/component.html).

**Purpose of Components:** They enable flexible account creation by allowing developers to mix and match specialized functional modules as building blocks.

**Example Account Composition:** A typical user wallet combines a `BasicWallet` component (for asset operations) with an `RpoFalcon512` authentication component (for signature verification). This modular approach lets developers create specialized accounts by combining exactly the components they need.

This modular approach allows developers to create specialized accounts by combining the exact components they need, rather than having monolithic account types.

### Storage Modes: Different Privacy Levels

| Mode        | Privacy | Description                 | Use Case                                    |
| ----------- | ------- | --------------------------- | ------------------------------------------- |
| **Public**  | Low     | Full state visible on-chain | Transparent operations                      |
| **Network** | Low     | Network-assisted proving    | Transparent and Automated applications      |
| **Private** | High    | Only commitments on-chain   | Personal wallets, confidential transactions |

### Account Structure

Every account contains:

- **Vault**: Secure asset storage
- **Storage**: Key-value data store (up to 255 slots)
- **Code**: Smart contract logic (MAST root)
- **Nonce**: Anti-replay counter
- **Components**: Authentication component, etc...

### Account Types in Miden

Miden supports four account types that define protocol-level capabilities:

- **Basic Mutable/Immutable**: Regular accounts (mutable = updatable code, immutable = fixed code)
- **Fungible/Non-Fungible Faucets**: Specialized accounts that can mint and distribute tokens

**Key Distinction: Account Type vs Components**

The **account type** defines fundamental protocol rules, i.e. what the account is allowed to do:

- Can it issue new assets? (faucets can, basic accounts cannot)
- Can its code be updated? (mutable vs immutable)
- What protocol-level permissions does it have?

**Components** are the building blocks that implement the actual functionality within those rules. They provide the specific capabilities like asset management, authentication, etc.

Example: A `BasicMutable` account type can be composed of wallet + authentication components, while a `FaucetFungible` account type uses faucet + authentication components.

### Miden Account Interface

```rust
pub struct MidenAccount {
    /// Immutable, 120-bit ID encoding type, storage mode and version.
    pub id: [u8; 15],

    /// Determines mutability of the account (immutable, mutable).
    pub account_type: AccountType,

    /// Storage placement preference (public/network/private).
    pub storage_mode: StorageMode,

    /// Root commitment of the account CODE (MAST root).
    pub code_commitment: [u8; 32],

    /// Root commitment of the account STORAGE (slots / maps). Think of this as the "root hash" of the Account's storage merkle tree.
    pub storage_commitment: [u8; 32],

    /// Vault commitment. For compact headers we keep only an optional aggregate commitment.
    /// Indexers can materialize a richer view (e.g., list of assets) off-chain.
    pub vault_commitment: Option<[u8; 32]>,

    /// Monotonically increasing counter; must increment exactly once when state changes.
    pub nonce: u64,

    /// Merged set of account components that defined this account's interface and storage.
    /// Accounts are composed by merging components (e.g. wallet component + an auth component).
    pub components: Vec<ComponentDescriptor>,

    /// Authentication procedure metadata (e.g. "RpoFalcon512").
    pub authentication: AuthenticationDescriptor,
}
```

<details>
<summary>Stricter type definition for the Account:</summary>

```rust
//! Optional, stricter types for Miden accounts.
//! Use these in place of the simplified `[u8; _]` and `String` fields if you prefer.
//!
//! Mapping from the simplified `MidenAccount` fields:
//! - id                   -> AccountId
//! - account_type         -> AccountType
//! - storage_mode         -> StorageMode
//! - code_commitment      -> Commitment
//! - storage_commitment   -> Commitment
//! - vault_commitment     -> Option<Commitment>
//! - components           -> Vec<ComponentDescriptor>
//! - authentication       -> AuthenticationDescriptor

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};

/// 120-bit Account ID (15 bytes).
#[derive(Clone, Copy, PartialEq, Eq, Hash, Default)]
pub struct AccountId(pub [u8; 15]);

/// 32-byte cryptographic commitment (e.g., code root, storage root, vault root).
#[derive(Clone, Copy, PartialEq, Eq, Hash, Default)]
pub struct Commitment(pub [u8; 32]);

/// High-level account kind & mutability.
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum AccountType {
    /// Regular account with updatable code.
    BasicMutable,
    /// Regular account with immutable code.
    BasicImmutable,
    /// Faucet that can issue fungible assets.
    FaucetFungible,
    /// Faucet that can issue non-fungible assets.
    FaucetNonFungible,
}
impl Default for AccountType {
    fn default() -> Self { AccountType::BasicMutable }
}

/// Where the account’s state lives.
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum StorageMode {
    /// State stored on-chain and publicly readable.
    Public,
    /// Public, with proving/execution provided by special network nodes.
    Network,
    /// Only a commitment is on-chain; full state is held privately by the owner.
    Private,
}
impl Default for StorageMode {
    fn default() -> Self { StorageMode::Public }
}

/// Minimal descriptor for a merged component (wallet, faucet, auth, etc.).
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct ComponentDescriptor {
    /// Human-readable name, e.g., "wallet/basic" or "auth/rpo_falcon512".
    pub name: String,
    /// Optional semantic version tag.
    pub version: Option<String>,
}

/// Metadata describing the account’s authentication procedure.
/// The procedure itself lives in the account code; this is just a hint for clients/tools.
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct AuthenticationDescriptor {
    /// Commitment (MAST root) of the authentication procedure.
    pub procedure_root: Commitment,
    /// Optional label for the scheme (e.g., "RpoFalcon512", "Multisig").
    pub scheme: Option<String>,
    /// Optional hint to where auth material lives (e.g., a storage slot index).
    pub storage_hint: Option<u8>,
}

/// A stricter version of the account interface using the types above.
/// Replace your simplified `MidenAccount` with this if you want strong typing end-to-end.
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
#[derive(Clone, PartialEq, Eq, Default)]
pub struct MidenAccount {
    /// Immutable 120-bit ID encoding kind & storage mode (and versioning).
    pub id: AccountId,

    /// Account classification and mutability.
    pub account_type: AccountType,

    /// Storage placement (public / network / private).
    pub storage_mode: StorageMode,

    /// Commitment (root) of the account code (MAST root).
    pub code_commitment: Commitment,

    /// Commitment (root) of the account storage.
    pub storage_commitment: Commitment,

    /// Optional commitment of the vault (assets held by the account).
    pub vault_commitment: Option<Commitment>,

    /// Monotonic counter incremented once per state change by the auth procedure.
    pub nonce: u64,

    /// Components merged into this account (wallet, faucet, auth, etc.).
    pub components: Vec<ComponentDescriptor>,

    /// Metadata about the authentication procedure.
    pub authentication: AuthenticationDescriptor,
}
```

</details>

## Create a Miden Wallet

### Miden Browser Wallet

The following Chrome extension wallet allows you to easily create a Miden Wallet using a simple UI flow: [Miden Browser Wallet](https://chromewebstore.google.com/detail/miden-wallet/ablmompanofnodfdkgchkpmphailefpb?hl=en)

### Using the CLI

Now that you have Miden installed and configured, you need to create a Miden account to interact with the network. This guide will show you how to use the `miden account` command to create your first Miden account.

#### Prerequisites

Before creating an account:

- Make sure to have the Miden CLI installed and configured (completed in the [Installation](./index.md#install-miden-cli) guide)

#### Creating Your Account

##### Step 1: Create a New Wallet Account

Use the `miden account` command to create a new Miden account:

```bash
miden client new-wallet
```

:::info
To directly publish your account on-chain, make sure to add the `--deploy` flag to this command and run `miden client new-wallet --deploy`.
:::

:::note todo
Add alias for directly creating new wallet (`miden new-wallet`)
:::

<details>
<summary>Expected output</summary>

```text
Successfully created new wallet.
To view account details execute miden-client account --show 0x05bd1f642cd368800cc95956b2696a
Config updated successfully
Setting account 0x05bd1f642cd368800cc95956b2696a as the default account ID.
You can unset it with `miden-client account --default none`.
```

</details>

##### Step 2: List Account to verify Account creation

Check that your account was created successfully:

:::warning
Reach out to midenup guys to create native handler for `miden account show` (should corresopnd to miden-client account)
:::

```bash
miden client account
```

:::note todo
Consider adding alias for listing accounts directly (`miden accounts`)
:::

<details>
<summary>Expected output</summary>

```bash
| Account ID | Type | Storage Mode | Nonce | Status |
|------------|------|--------------|-------|--------|
| 0x970e3e4dbcd09b8035532edaa87bc9 | Regular | private | 0 | New |
```

</details>

#### Step 3: List Account details

`miden client account -s <ACCOUNT_ID>`

<details>
<summary>Expected output</summary>

```text
Account Information
==================

| Field              | Value                                                                    |
|-------------------|--------------------------------------------------------------------------|
| Address           | mtst1qztsu0jdhngfhqp42vhd42rme9cqzkzy89e                                |
| Account ID (hex)  | 0x970e3e4dbcd09b8035532edaa87bc9                                        |
| Account Commitment| 0x404a762b9a19e70bc8752381b17f909bc0bbab02c0b4636d8923d088ac8ebc04      |
| Type              | Regular                                                                   |
| Storage mode      | private                                                                   |
| Code Commitment   | 0x6a11161925930dae89cc24cbddf0d161cead39b0fe88c262d4e790cff35be01d      |
| Vault Root        | 0x3e128c57f6cfa0d44ab1308994171af13cb513422add28d1916b3ff254fef82d      |
| Storage Root      | 0x5f95d38174f10c8ce91a0202763b0813fdcbb2714704cda411af6483ebc8d012      |
| Nonce             | 0                                                                         |

Assets:

| Asset Type | Faucet | Amount |
|------------|---------|---------|
| | | |

Storage:

| Item Slot Index | Item Slot Type | Value/Commitment |
|-----------------|----------------|------------------|
| 0 | Value | 0xa52ef6357625c54a2eaefd11b8cfc2ee3429c37d9f8a827e23886857ea284834 |
```

</details>

#### Account Management

##### List All Accounts

To see all your accounts:

```bash
miden client account --list
```

<details>
<summary>Expected output</summary>

```bash
| Account ID | Type | Storage Mode | Nonce | Status |
|------------|------|--------------|-------|--------|
| 0x08597c42ef04608022345b43dc870f | Regular | private | 0 | New |
```

</details>

##### Switch Between Accounts

If you have multiple accounts, you can set the default account using the following account:

```bash
miden client account --default <account-id>
```

<details>
<summary>Expected output</summary>

```bash
Config updated successfully
Setting default account to 0x970e3e4dbcd09b8035532edaa87bc9...
```

</details>

#### Understanding Local Files Created by the CLI

:::danger Danger
The private keys associated with Miden Accounts are stored locally on the machine where the CLI is installed, in the `/keystore` folder. Make sure you do not expose this to anyone, as they can use it to get access to your account.
:::

When you work with Miden commands, several local files and directories are created to store your data and configuration. Here's a comprehensive overview of what gets created:

##### Core Files

###### `miden-client.toml`

This is the main configuration file for the Miden client:

```toml
store_filepath = "store.sqlite3"
secret_keys_directory = "keystore"
token_symbol_map_filepath = "token_symbol_map.toml"
component_template_directory = "./templates"

[rpc]
endpoint = "https://rpc.testnet.miden.io"
timeout_ms = 10000
```

**Purpose**: Configures how the Miden client connects to the network and where to store data.

###### `store.sqlite3`

A SQLite database that stores Miden-related data.

**Purpose**: Persistent storage for all your Miden account data, transaction history, and blockchain state.

###### `keystore/`

Directory containing private keys and cryptographic material.

:::warning
The files inside of the `keystore/` folder are NOT encrypted! As mentioned perviously, make sure you do not expose this to anyone, as they can use it to get access to your private keys.
:::

**Purpose**: Storage of your private keys. Files are non-encrypted and should never be shared.

##### Template Files

###### `templates/` Directory

Contains pre-built smart contract templates:

- **`basic-wallet.mct`** - Basic wallet component for receiving and sending assets
- **`basic-fungible-faucet.mct`** - Faucet component for distributing tokens
- **`basic-auth.mct`** - Authentication component for access control

**Purpose**: These are compiled Miden components (`.mct` files) that are used by the Miden client as building blocks.

##### File Structure Overview

```
your-project/
├── miden-client.toml     # Client configuration
├── store.sqlite3         # Main database
├── keystore/             # Non-encrypted private keys
└── templates/            # Smart contract templates
    ├── basic-wallet.mct
    ├── basic-fungible-faucet.mct
    └── basic-auth.mct
```
