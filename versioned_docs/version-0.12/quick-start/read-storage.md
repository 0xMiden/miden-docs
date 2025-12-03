---
sidebar_position: 4
title: Read Storage Values
description: Learn how to query account storage data and interact with deployed smart contracts.
---

import { CodeTabs } from '@site/src/components';

# Read Storage Values

Let's explore how to interact with public accounts and retrieve their storage data.

## Understanding Account Storage

Miden accounts contain several types of data you can read.

**Account Components:**

- **Vault**: Contains the account's assets (tokens)
- **Storage**: Key-value data store with up to 255 slots
- **Code**: The account's smart contract logic (MAST root)
- **Nonce**: Nonce that increments with each state change to prevent double spend

**Storage Visibility:**

- **Public accounts**: All data is publicly accessible and can be read by anyone
- **Private accounts**: Only commitments are public; full data is held privately

## Set Up Development Environment

To run the code examples in this guide, you'll need to set up a development environment. If you haven't already, follow the setup instructions in the [Accounts](./accounts#set-up-development-environment) guide.

## Reading from a Public Smart Contract

Let's interact with a counter contract deployed on the Miden testnet. This contract maintains a simple counter value in its storage at storage slot `0`.

### Reading the Count of a Counter contract

<CodeTabs
tsFilename="src/lib/read-count.ts"
rustFilename="integration/src/bin/read-count.rs"
example={{
rust: {
code: `use miden_client::{
    account::AccountId,
    builder::ClientBuilder,
    keystore::FilesystemKeyStore,
    rpc::{Endpoint, GrpcClient},
};
use miden_client_sqlite_store::ClientBuilderSqliteExt;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize RPC connection
    let endpoint = Endpoint::testnet();
    let timeout_ms = 10_000;
    let rpc_client = Arc::new(GrpcClient::new(&endpoint, timeout_ms));

    // Initialize keystore
    let keystore_path = std::path::PathBuf::from("./keystore");
    let keystore: FilesystemKeyStore<rand::prelude::StdRng> =
        FilesystemKeyStore::new(keystore_path).unwrap().into();

    let store_path = std::path::PathBuf::from("./store.sqlite3");

    // Initialize client to connect with the Miden Testnet.
    // NOTE: The client is our entry point to the Miden network.
    // All interactions with the network go through the client.
    let mut client = ClientBuilder::new()
        .rpc(rpc_client)
        .sqlite_store(store_path)
        .authenticator(keystore.clone().into())
        .in_debug_mode(true.into())
        .build()
        .await?;

    client.sync_state().await?;

    //------------------------------------------------------------
    // READ PUBLIC STATE OF THE COUNTER ACCOUNT
    //------------------------------------------------------------

    let counter_account_id = AccountId::from_hex("0xf3e8e740c0d3960013418eecb98ccf")?;

    client.import_account_by_id(counter_account_id).await?;

    let counter_account = client
        .get_account(counter_account_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Account not found"))?;

    println!(
        "Count: {:?}",
        counter_account
            .account()
            .storage()
            .slots()
            .first()
            .ok_or_else(|| anyhow::anyhow!("No storage slots found"))?
    );

    Ok(())
}
` },
  typescript: {
    code:`import { WebClient, AccountId } from "@demox-labs/miden-sdk";

export async function demo() {
    // Initialize client to connect with the Miden Testnet.
    // NOTE: The client is our entry point to the Miden network.
    // All interactions with the network go through the client.
    const nodeEndpoint = "https://rpc.testnet.miden.io:443";

    // Initialize client
    const client = await WebClient.createClient(nodeEndpoint);
    await client.syncState();

    const accountId = AccountId.fromHex("0xf3e8e740c0d3960013418eecb98ccf");

    // Import the account into the client's database
    let account = await client.getAccount(accountId);
    if (account === undefined) {
    account = await client.getAccount(accountId);
    }

    // Define counter account instance
    const counter = await client.getAccount(accountId);

    // Get the count from the counter account by querying the first
    // storage slot.
    const count = counter?.storage().getItem(0);

    // Convert the 4th value of the WORD Storage value to a number.
    // NOTE: The WORD Storage value is an array of 4 values, each of which is a 64-bit unsigned integer.
    // NOTE: The 4th value is the u64 number of the counter.
    console.log("Count:", Number(count?.toU64s()[3]));
}
`
}
}}
/>

<details>
<summary>Expected output</summary>

```text
Count: 43
```

</details>

## Reading Account Token Balances

You can also query the assets (tokens) held by an account:

<CodeTabs
tsFilename="src/lib/token-balance.ts"
rustFilename="integration/src/bin/token-balance.rs"
example={{
rust: {
code: `use miden_client::{
    account::AccountId,
    builder::ClientBuilder,
    keystore::FilesystemKeyStore,
    rpc::{Endpoint, GrpcClient},
};
use miden_client_sqlite_store::ClientBuilderSqliteExt;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize RPC connection
    let endpoint = Endpoint::testnet();
    let timeout_ms = 10_000;
    let rpc_client = Arc::new(GrpcClient::new(&endpoint, timeout_ms));

    // Initialize keystore
    let keystore_path = std::path::PathBuf::from("./keystore");
    let keystore: FilesystemKeyStore<rand::prelude::StdRng> =
        FilesystemKeyStore::new(keystore_path).unwrap().into();

    let store_path = std::path::PathBuf::from("./store.sqlite3");

    // Initialize client to connect with the Miden Testnet.
    // NOTE: The client is our entry point to the Miden network.
    // All interactions with the network go through the client.
    let mut client = ClientBuilder::new()
        .rpc(rpc_client)
        .sqlite_store(store_path)
        .authenticator(keystore.clone().into())
        .in_debug_mode(true.into())
        .build()
        .await?;

    client.sync_state().await?;

    //------------------------------------------------------------
    // READ TOKEN BALANCE OF AN ACCOUNT
    //------------------------------------------------------------

    let alice_account_id = AccountId::from_hex("0x49e27aa5fa5686102fde8e81b89999")?;
    let faucet_account_id = AccountId::from_hex("0x9796be9c72f137206676f7821a9968")?;

    client.import_account_by_id(alice_account_id).await?;

    let alice_account = client
        .get_account(alice_account_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Account not found"))?;

    let balance = alice_account
        .account()
        .vault()
        .get_balance(faucet_account_id)?;

    println!("Alice's TEST token balance: {:?}", balance);

    Ok(())
}
`},
  typescript: {
    code:`import { WebClient, AccountId } from "@demox-labs/miden-sdk";

export async function demo() {
    // Initialize client to connect with the Miden Testnet.
    // NOTE: The client is our entry point to the Miden network.
    // All interactions with the network go through the client.
    const nodeEndpoint = "https://rpc.testnet.miden.io:443";

    // Initialize client
    const client = await WebClient.createClient(nodeEndpoint);
    await client.syncState();

    const aliceId = AccountId.fromHex("0x49e27aa5fa5686102fde8e81b89999");
    const faucetId = AccountId.fromHex("0x9796be9c72f137206676f7821a9968");

    // Import the account into the client's database
    let aliceAccount = await client.getAccount(aliceId);
    if (aliceAccount === undefined) {
        await client.importAccountById(aliceId);
        aliceAccount = await client.getAccount(aliceId);
    }

    const balance = aliceAccount?.vault().getBalance(faucetId);
    console.log("Alice's TEST token balance:", Number(balance));
}
`
}
}}
/>

<details>
<summary>Expected output</summary>

```text
Alice's TEST token balance: 900
```

</details>

---
