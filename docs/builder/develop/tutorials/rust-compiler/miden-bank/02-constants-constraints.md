---
sidebar_position: 2
title: "Part 2: Constants and Constraints"
description: "Learn how to define constants for business rules and use assertions to validate transactions in Miden Rust contracts."
---

# Part 2: Constants and Constraints

In this section, you'll learn how to define business rules using constants and enforce them with assertions. We'll implement deposit limits and initialization checks for our bank.

## What You'll Learn

- Defining constants in Miden Rust contracts
- Using `assert!()` for transaction validation
- Safe Felt comparison with `.as_u64()`
- How failed assertions affect transaction proving

## Defining Constants

Constants in Miden Rust contracts work just like regular Rust constants:

```rust title="contracts/bank-account/src/lib.rs"
/// Maximum allowed deposit amount per transaction.
///
/// Value: 1,000,000 tokens (arbitrary limit for demonstration)
const MAX_DEPOSIT_AMOUNT: u64 = 1_000_000;
```

Use constants for:

- Business rule limits (max amounts, timeouts)
- Magic numbers that need documentation
- Values used in multiple places

:::info Constants vs Storage
Constants are compiled into the contract code and cannot change. Use storage slots for values that need to be modified at runtime.
:::

## The assert!() Macro

The `assert!()` macro validates conditions during transaction execution:

```rust title="contracts/bank-account/src/lib.rs"
pub fn initialize(&mut self) {
    // Check not already initialized
    let current: Word = self.initialized.read();
    assert!(
        current[0].as_u64() == 0,
        "Bank already initialized"
    );

    // Set initialized flag to 1
    let initialized_word = Word::from([felt!(1), felt!(0), felt!(0), felt!(0)]);
    self.initialized.write(initialized_word);
}
```

When an assertion fails:

1. The Miden VM execution halts
2. No valid proof can be generated
3. The transaction is rejected

This is the primary mechanism for enforcing business rules in Miden contracts.

## Safe Felt Comparisons

:::warning Pitfall: Felt Comparison Operators
Never use `<`, `>`, `<=`, or `>=` operators directly on `Felt` values. They produce incorrect results due to field element ordering.
:::

**Wrong approach:**

```rust
// DON'T DO THIS - produces incorrect results
if deposit_amount > felt!(1_000_000) {
    // This comparison is unreliable!
}
```

**Correct approach:**

```rust
// CORRECT - convert to u64 first
if deposit_amount.as_u64() > MAX_DEPOSIT_AMOUNT {
    // This works correctly
}
```

The `.as_u64()` method extracts the underlying 64-bit integer from a Felt, allowing standard Rust comparisons.

## Implementing Deposit Validation

Here's our complete deposit validation with constraints:

```rust title="contracts/bank-account/src/lib.rs"
pub fn deposit(&mut self, depositor: AccountId, deposit_asset: Asset) {
    // Ensure the bank is initialized before accepting deposits
    self.require_initialized();

    // Extract the fungible amount from the asset
    let deposit_amount = deposit_asset.inner[0];

    // Validate deposit amount does not exceed maximum
    assert!(
        deposit_amount.as_u64() <= MAX_DEPOSIT_AMOUNT,
        "Deposit amount exceeds maximum allowed"
    );

    // ... rest of deposit logic
}
```

### The require_initialized() Guard

We use a helper method to check initialization state:

```rust title="contracts/bank-account/src/lib.rs"
/// Check that the bank is initialized.
///
/// # Panics
/// Panics if the bank has not been initialized.
fn require_initialized(&self) {
    let current: Word = self.initialized.read();
    assert!(
        current[0].as_u64() == 1,
        "Bank not initialized - deposits not enabled"
    );
}
```

This pattern:

- Centralizes the initialization check
- Provides a clear error message
- Can be reused across multiple methods

## How Assertions Affect Proving

When an assertion fails in the Miden VM:

```text
Transaction Execution Flow:
┌─────────────────────┐
│ User submits TX     │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ VM executes code    │
└──────────┬──────────┘
           ▼
    ┌──────┴──────┐
    │ Assertion?  │
    └──────┬──────┘
     Pass  │  Fail
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌────────────┐
│ Prove  │   │ TX Rejected│
│ Success│   │ No Proof   │
└────────┘   └────────────┘
```

Key points:

- Failed assertions prevent proof generation
- No state changes occur if the transaction fails
- Error messages help with debugging

## Testing Constraints

Write tests to verify your constraints work correctly:

```rust title="Example test (integration/tests/deposit_test.rs)"
#[tokio::test]
async fn deposit_exceeds_max_should_fail() -> anyhow::Result<()> {
    // Setup with amount > MAX_DEPOSIT_AMOUNT (1,000,000)
    let large_amount: u64 = 2_000_000;

    // ... setup code ...

    // Execute should fail due to max deposit constraint
    let result = tx_context.execute().await;

    assert!(
        result.is_err(),
        "Expected transaction to fail due to exceeding max deposit amount"
    );

    Ok(())
}
```

## Common Constraint Patterns

### 1. Balance Checks

```rust
fn require_sufficient_balance(&self, amount: Felt) {
    let balance = self.get_balance();
    assert!(
        balance.as_u64() >= amount.as_u64(),
        "Insufficient balance"
    );
}
```

:::danger Critical: Always Validate Before Subtraction
This pattern is **mandatory** for any operation that subtracts from a balance. Miden uses field element (Felt) arithmetic, which is modular. Without this check, subtracting more than the balance would NOT cause an error - instead, the value would silently wrap around to a large positive number, effectively allowing unlimited withdrawals. See [Common Pitfalls](../pitfalls#felt-arithmetic-underflowoverflow) for more details.
:::

### 2. State Checks

```rust
fn require_not_paused(&self) {
    let paused: Word = self.paused.read();
    assert!(
        paused[0].as_u64() == 0,
        "Contract is paused"
    );
}
```

## Key Takeaways

1. **Constants** define immutable business rules at compile time
2. **`assert!()`** enforces constraints - failures reject the transaction
3. **Always use `.as_u64()`** for Felt comparisons, never direct operators
4. **Helper methods** like `require_initialized()` centralize validation logic
5. **Failed assertions** mean no valid proof can be generated

:::tip View Complete Source
See the complete constraint implementation in the [miden-bank repository](https://github.com/keinberger/miden-bank/blob/main/contracts/bank-account/src/lib.rs).
:::

## Next Steps

Now that you can define and enforce business rules, let's learn how to handle assets in [Part 3: Asset Management](./asset-management).
