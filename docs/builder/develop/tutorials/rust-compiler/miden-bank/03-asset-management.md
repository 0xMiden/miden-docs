---
sidebar_position: 3
title: "Part 3: Asset Management"
description: "Learn how to handle fungible assets in Miden Rust contracts using vault operations and balance tracking."
---

# Part 3: Asset Management

In this section, you'll learn how to receive and send assets in Miden accounts. We'll implement the deposit logic that receives tokens into the bank's vault and tracks balances per depositor.

## What You'll Learn

- The `Asset` type structure for fungible assets
- Using `native_account::add_asset()` to receive assets
- Using `native_account::remove_asset()` to send assets
- Tracking balances in a `StorageMap`

## The Asset Type

Miden represents fungible assets as a `Word` (4 Felts) with this layout. Note that the following layout is displayed in reverse to how the VM & Assembly internally store Assets, due to the big/small endian differentiation:

```text
Asset Layout: [amount, 0, faucet_suffix, faucet_prefix]
              ━━━━━━━  ━  ━━━━━━━━━━━━━  ━━━━━━━━━━━━━
              index 0  1      index 2        index 3
```

| Index | Field           | Description                          |
| ----- | --------------- | ------------------------------------ |
| 0     | `amount`        | The quantity of tokens               |
| 1     | (reserved)      | Always 0 for fungible assets         |
| 2     | `faucet_suffix` | Second part of the faucet account ID |
| 3     | `faucet_prefix` | First part of the faucet account ID  |

Access these fields through `asset.inner`:

```rust
let amount = deposit_asset.inner[0];           // The token amount
let faucet_suffix = deposit_asset.inner[2];    // Faucet ID suffix
let faucet_prefix = deposit_asset.inner[3];    // Faucet ID prefix
```

## Receiving Assets with add_asset()

The `native_account::add_asset()` function adds an asset to the account's vault:

```rust title="contracts/bank-account/src/lib.rs"
pub fn deposit(&mut self, depositor: AccountId, deposit_asset: Asset) {
    // ... validation checks ...

    // Add asset to the bank's vault
    native_account::add_asset(deposit_asset);
}
```

When called:

- The asset is added to the account's internal vault
- The vault tracks all assets the account holds
- Multiple assets of the same type are combined automatically

:::info Vault vs Balance Tracking
The vault is managed by the Miden protocol automatically. Our `StorageMap` for balances is an **application-level** tracking of who deposited what, separate from the protocol-level vault.
:::

## Sending Assets with remove_asset()

The `native_account::remove_asset()` function removes an asset from the vault:

```rust title="contracts/bank-account/src/lib.rs"
fn create_p2id_note(&mut self, /* ... */) {
    // ... note creation logic ...

    // Remove the asset from the bank's vault
    native_account::remove_asset(asset.clone());

    // Add the asset to the output note
    output_note::add_asset(asset.clone(), note_idx);
}
```

:::warning Asset Must Exist
If you try to remove an asset that doesn't exist in the vault (or remove more than available), the transaction will fail.
:::

## Complete Deposit Implementation

Here's the full deposit logic with balance tracking:

```rust title="contracts/bank-account/src/lib.rs"
pub fn deposit(&mut self, depositor: AccountId, deposit_asset: Asset) {
    // ========================================================================
    // CONSTRAINT: Bank must be initialized
    // ========================================================================
    self.require_initialized();

    // Extract the fungible amount from the asset
    let deposit_amount = deposit_asset.inner[0];

    // ========================================================================
    // CONSTRAINT: Maximum deposit amount check
    // ========================================================================
    assert!(
        deposit_amount.as_u64() <= MAX_DEPOSIT_AMOUNT,
        "Deposit amount exceeds maximum allowed"
    );

    // Create key from depositor's AccountId and asset faucet ID
    // This allows tracking balances per depositor per asset type
    let key = Word::from([
        depositor.prefix,
        depositor.suffix,
        deposit_asset.inner[3], // asset prefix (faucet)
        deposit_asset.inner[2], // asset suffix (faucet)
    ]);

    // Update balance: current + deposit_amount
    let current_balance: Felt = self.balances.get(&key);
    let new_balance = current_balance + deposit_amount;
    self.balances.set(key, new_balance);

    // Add asset to the bank's vault
    native_account::add_asset(deposit_asset);
}
```

### Balance Key Design

We construct a composite key for balance tracking:

```rust
let key = Word::from([
    depositor.prefix,      // Who deposited
    depositor.suffix,
    deposit_asset.inner[3], // Which asset type (faucet ID)
    deposit_asset.inner[2],
]);
```

This design allows:

- **Per-depositor tracking**: Each user has their own balance
- **Per-asset tracking**: Different token types are tracked separately
- **Unique keys**: The combination ensures no collisions

### Balance Arithmetic

Felt arithmetic works naturally for additions:

```rust
let current_balance: Felt = self.balances.get(&key);
let new_balance = current_balance + deposit_amount;
self.balances.set(key, new_balance);
```

For withdrawals, use subtraction:

```rust
let new_balance = current_balance - withdraw_amount;
```

:::warning Underflow Protection
Felt subtraction can underflow (wrap around). Always validate that the balance is sufficient before subtracting.
:::

## Querying Balances

Provide a public method to query balances:

```rust title="contracts/bank-account/src/lib.rs"
/// Get the balance for a depositor.
pub fn get_balance(&self, depositor: AccountId) -> Felt {
    let key = Word::from([depositor.prefix, depositor.suffix, felt!(0), felt!(0)]);
    self.balances.get(&key)
}
```

:::info Simplified Key
This example uses a simplified key without the asset type. For multi-asset support, include the faucet ID in the key.
:::

## Complete Withdraw Implementation

Withdrawing is the reverse - update the balance and remove from vault:

```rust title="contracts/bank-account/src/lib.rs"
pub fn withdraw(
    &mut self,
    depositor: AccountId,
    withdraw_asset: Asset,
    serial_num: Word,
    tag: Felt,
    aux: Felt,
    note_type: Felt,
) {
    // Extract the fungible amount from the asset
    let withdraw_amount = withdraw_asset.inner[0];

    // Create key from depositor's AccountId and asset faucet ID
    let key = Word::from([
        depositor.prefix,
        depositor.suffix,
        withdraw_asset.inner[3],
        withdraw_asset.inner[2],
    ]);

    // Update balance: current - withdraw_amount
    let current_balance: Felt = self.balances.get(&key);
    let new_balance = current_balance - withdraw_amount;
    self.balances.set(key, new_balance);

    // Create a P2ID note to send the requested asset back to the depositor
    self.create_p2id_note(serial_num, &withdraw_asset, depositor, tag, aux, note_type);
}
```

The `create_p2id_note()` function (covered in [Part 7](./output-notes)) handles:

- Removing the asset from the vault
- Creating an output note for the depositor

## Asset Flow Summary

```text
DEPOSIT FLOW:
┌───────────┐   deposit_note    ┌────────────┐
│ Depositor │ ──────────────────▶ Bank Vault │
│  Wallet   │    (with asset)   │  + Balance │
└───────────┘                   └────────────┘

WITHDRAW FLOW:
┌────────────┐   P2ID note      ┌───────────┐
│ Bank Vault │ ──────────────────▶ Depositor │
│  - Balance │   (with asset)   │  Wallet   │
└────────────┘                  └───────────┘
```

## Key Takeaways

1. **Asset layout**: `[amount, 0, faucet_suffix, faucet_prefix]`
2. **`native_account::add_asset()`** adds assets to the vault
3. **`native_account::remove_asset()`** removes assets from the vault
4. **Balance tracking** is application-level logic using `StorageMap`
5. **Composite keys** allow per-user, per-asset balance tracking

:::tip View Complete Source
See the complete deposit and withdraw implementations in the [miden-bank repository](https://github.com/keinberger/miden-bank/blob/main/contracts/bank-account/src/lib.rs).
:::

## Next Steps

Now that you understand asset management, let's learn how to trigger these operations with [Part 4: Note Scripts](./note-scripts).
