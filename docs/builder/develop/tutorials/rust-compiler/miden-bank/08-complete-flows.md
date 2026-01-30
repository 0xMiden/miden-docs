---
sidebar_position: 8
title: "Part 8: Complete Flows"
description: "Walk through end-to-end deposit and withdrawal flows, understanding how all the pieces work together in the banking application."
---

# Part 8: Complete Flows

In this final section, we'll walk through the complete deposit and withdrawal flows, seeing how all the concepts from previous sections work together.

## What You'll Learn

- Complete deposit flow from note creation to balance update
- Complete withdraw flow including P2ID note creation
- Transaction lifecycle in Miden
- Running and verifying the flows

## The Complete Deposit Flow

### Step 1: Setup

Create the bank account with proper storage:

```rust title="integration/tests/deposit_test.rs"
// Create the bank account with storage slots
let bank_cfg = AccountCreationConfig {
    storage_slots: vec![
        // Slot 0: initialized flag (Value, starts as 0)
        miden_client::account::StorageSlot::Value(Word::default()),
        // Slot 1: balances map (StorageMap)
        miden_client::account::StorageSlot::Map(StorageMap::with_entries([])?),
    ],
    ..Default::default()
};

let mut bank_account =
    create_testing_account_from_package(bank_package.clone(), bank_cfg).await?;
```

### Step 2: Initialize the Bank

Use a transaction script to initialize:

```rust
// Build and execute the initialization transaction
let init_program = init_tx_script_package.unwrap_program();
let init_tx_script = TransactionScript::new((*init_program).clone());

let init_tx_context = mock_chain
    .build_tx_context(bank_account.id(), &[], &[])?
    .tx_script(init_tx_script)
    .build()?;

let executed_init = init_tx_context.execute().await?;
bank_account.apply_delta(&executed_init.account_delta())?;
mock_chain.add_pending_executed_transaction(&executed_init)?;
mock_chain.prove_next_block()?;

println!("Bank initialized successfully");
```

### Step 3: Create Deposit Note

Create a note with assets attached:

```rust
// Create a fungible asset to deposit
let deposit_amount: u64 = 1000;
let fungible_asset = FungibleAsset::new(faucet.id(), deposit_amount)?;
let note_assets = NoteAssets::new(vec![Asset::Fungible(fungible_asset)])?;

// Create the deposit note
let deposit_note = create_testing_note_from_package(
    deposit_note_package.clone(),
    sender.id(),  // Sender becomes the depositor
    NoteCreationConfig {
        assets: note_assets,
        ..Default::default()
    },
)?;
```

### Step 4: Execute Deposit

Bank consumes the note:

```rust
// Build transaction where bank consumes the deposit note
let tx_context = mock_chain
    .build_tx_context(bank_account.id(), &[deposit_note.id()], &[])?
    .build()?;

// Execute the transaction
let executed_transaction = tx_context.execute().await?;

// Apply state changes
bank_account.apply_delta(&executed_transaction.account_delta())?;
mock_chain.add_pending_executed_transaction(&executed_transaction)?;
mock_chain.prove_next_block()?;
```

### Step 5: Verify Balance

Check the depositor's balance was updated:

```rust
// Create the key for the depositor in the storage map
let depositor_key = Word::from([
    sender.id().prefix().as_felt(),
    sender.id().suffix(),
    faucet.id().prefix().as_felt(),
    faucet.id().suffix(),
]);

// Get balance from storage slot 1 (balances map)
let balance = bank_account.storage().get_map_item(1, depositor_key)?;

let expected_balance = Word::from([
    Felt::new(0),
    Felt::new(0),
    Felt::new(0),
    Felt::new(deposit_amount),
]);

assert_eq!(balance, expected_balance, "Balance should equal deposited amount");
```

### Deposit Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        DEPOSIT FLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. CREATE NOTE                                                     │
│     ┌──────────────────────┐                                       │
│     │ Deposit Note         │                                       │
│     │  sender: User        │                                       │
│     │  assets: [1000 tok]  │                                       │
│     │  script: deposit-note│                                       │
│     └──────────────────────┘                                       │
│              │                                                      │
│              ▼                                                      │
│  2. BANK CONSUMES NOTE                                             │
│     ┌──────────────────────┐                                       │
│     │ Bank Account         │                                       │
│     │  vault += 1000 tokens│  ◄── Protocol adds assets to vault   │
│     └──────────────────────┘                                       │
│              │                                                      │
│              ▼                                                      │
│  3. NOTE SCRIPT EXECUTES                                           │
│     depositor = get_sender() → User's AccountId                    │
│     assets = get_assets()    → [1000 tokens]                       │
│     bank_account::deposit(depositor, asset)                        │
│              │                                                      │
│              ▼                                                      │
│  4. DEPOSIT METHOD RUNS                                            │
│     - require_initialized() ✓                                      │
│     - Check amount <= MAX_DEPOSIT ✓                                │
│     - balances[User] += 1000                                       │
│     - native_account::add_asset() (already in vault)               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## The Complete Withdraw Flow

### Step 1: Create Withdraw Request Note

After a deposit, create a withdrawal request:

```rust
let withdraw_amount = deposit_amount / 2;  // Withdraw half

// Compute P2ID tag for the sender
let p2id_tag = compute_p2id_tag_for_local_account(sender.id());
let p2id_tag_felt = Felt::new(p2id_tag as u64);

// Random serial number for the output note
let serial_num = Word::from([
    Felt::new(0x1234567890abcdef),
    Felt::new(0xfedcba0987654321),
    Felt::new(0xdeadbeefcafebabe),
    Felt::new(0x0123456789abcdef),
]);

// Note inputs: asset, serial, tag, aux, note_type
let withdraw_request_inputs = vec![
    // Asset (amount, 0, faucet_suffix, faucet_prefix)
    Felt::new(withdraw_amount),
    Felt::new(0),
    faucet.id().suffix(),
    faucet.id().prefix().as_felt(),
    // Serial number
    serial_num[0], serial_num[1], serial_num[2], serial_num[3],
    // Tag, aux, note_type
    p2id_tag_felt,
    Felt::new(0),  // aux
    Felt::new(1),  // note_type = Public
];

let withdraw_request_note = create_testing_note_from_package(
    withdraw_request_note_package.clone(),
    sender.id(),
    NoteCreationConfig {
        inputs: withdraw_request_inputs,
        ..Default::default()
    },
)?;
```

### Step 2: Execute Withdraw

Bank consumes the request and creates output note:

```rust
// Build expected P2ID output note
let recipient = build_p2id_recipient(sender.id(), serial_num)?;
let p2id_output_note_asset = FungibleAsset::new(faucet.id(), withdraw_amount)?;
let p2id_output_note_assets = NoteAssets::new(vec![p2id_output_note_asset.into()])?;
let p2id_output_note_metadata = NoteMetadata::new(
    bank_account.id(),
    NoteType::Public,
    p2id_tag,
    NoteExecutionHint::none(),
    Felt::new(0),  // aux
)?;

let p2id_output_note = Note::new(
    p2id_output_note_assets,
    p2id_output_note_metadata,
    recipient,
);

// Execute with expected output
let tx_context = mock_chain
    .build_tx_context(bank_account.id(), &[withdraw_request_note.id()], &[])?
    .extend_expected_output_notes(vec![OutputNote::Full(p2id_output_note.into())])
    .build()?;

let executed_tx = tx_context.execute().await?;
```

### Withdraw Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       WITHDRAW FLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. CREATE WITHDRAW REQUEST NOTE                                    │
│     ┌──────────────────────────────┐                               │
│     │ Withdraw Request Note        │                               │
│     │  sender: User                │                               │
│     │  inputs: [asset, serial,     │                               │
│     │           tag, aux, type]    │                               │
│     │  assets: (none)              │                               │
│     └──────────────────────────────┘                               │
│              │                                                      │
│              ▼                                                      │
│  2. BANK CONSUMES REQUEST                                          │
│     ┌──────────────────────────────┐                               │
│     │ Note script executes:        │                               │
│     │  - Parse inputs              │                               │
│     │  - Call bank::withdraw()     │                               │
│     └──────────────────────────────┘                               │
│              │                                                      │
│              ▼                                                      │
│  3. WITHDRAW METHOD RUNS                                           │
│     - balances[User] -= 500                                        │
│     - create_p2id_note()                                           │
│              │                                                      │
│              ▼                                                      │
│  4. P2ID NOTE CREATED                                              │
│     - Recipient::compute(serial, script_root, [user_id])           │
│     - output_note::create(tag, aux, type, hint, recipient)         │
│     - native_account::remove_asset(500 tokens)                     │
│     - output_note::add_asset(500 tokens, note_idx)                 │
│              │                                                      │
│              ▼                                                      │
│  5. OUTPUT NOTE READY                                              │
│     ┌──────────────────────────────┐                               │
│     │ P2ID Output Note             │                               │
│     │  recipient: User (only)      │                               │
│     │  assets: [500 tokens]        │                               │
│     │  tag: routing to User        │                               │
│     └──────────────────────────────┘                               │
│              │                                                      │
│              ▼                                                      │
│  6. USER CONSUMES P2ID NOTE                                        │
│     User's wallet receives 500 tokens                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Running the Tests

Execute the complete flows:

```bash title=">_ Terminal"
# Run all integration tests
cargo test -p integration -- --nocapture

# Run specific tests
cargo test -p integration deposit_test -- --nocapture
cargo test -p integration withdraw_test -- --nocapture

# Test failure cases
cargo test -p integration deposit_exceeds_max_should_fail -- --nocapture
cargo test -p integration deposit_without_init_should_fail -- --nocapture
```

Expected output:

```text
Bank initialized successfully
Bank deposit successful
Withdraw test passed!
test withdraw_test ... ok

test result: ok. 4 passed; 0 failed
```

## Summary: All Components

Here's how all the pieces fit together:

| Component | Type | Purpose |
|-----------|------|---------|
| `bank-account` | Account Component | Manages balances and vault |
| `deposit-note` | Note Script | Processes incoming deposits |
| `withdraw-request-note` | Note Script | Requests withdrawals |
| `init-tx-script` | Transaction Script | Initializes the bank |

| Storage Slot | Type | Content |
|--------------|------|---------|
| 0 | `Value` | Initialization flag |
| 1 | `StorageMap` | Depositor balances |

| API | Purpose |
|-----|---------|
| `active_note::get_sender()` | Identify note creator |
| `active_note::get_assets()` | Get attached assets |
| `active_note::get_inputs()` | Get note parameters |
| `native_account::add_asset()` | Receive into vault |
| `native_account::remove_asset()` | Send from vault |
| `output_note::create()` | Create output note |
| `output_note::add_asset()` | Attach assets to note |

## What's Next

Congratulations! You've built a complete banking application with the Miden Rust compiler. You now understand:

- Account components with storage
- Note scripts for receiving messages
- Transaction scripts for owner operations
- Cross-component communication
- Asset management and output notes

### Continue Learning

- **[Testing with MockChain](../testing)** - Deep dive into testing patterns
- **[Debugging Guide](../debugging)** - Troubleshoot common issues
- **[Common Pitfalls](../pitfalls)** - Avoid known gotchas

### Build More

Use these patterns to build:
- Token faucets
- DEX contracts
- NFT marketplaces
- Multi-signature wallets
- And more!

:::tip View Complete Source
Explore the complete banking application:
- [All Contracts](https://github.com/keinberger/miden-bank/tree/main/contracts)
- [Integration Tests](https://github.com/keinberger/miden-bank/tree/main/integration/tests)
- [Test Helpers](https://github.com/keinberger/miden-bank/blob/main/integration/src/helpers.rs)
:::

Happy building on Miden!
