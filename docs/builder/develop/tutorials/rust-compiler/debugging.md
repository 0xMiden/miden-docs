---
sidebar_position: 2
title: "Debugging Guide"
description: "Learn how to debug Miden Rust compiler contracts, interpret error messages, and troubleshoot common issues."
---

# Debugging Guide

This guide covers debugging techniques for Miden Rust compiler contracts. Since Miden contracts compile to a specialized VM (Miden VM), debugging requires understanding both Rust-level and VM-level error patterns.

## Overview

Debugging Miden contracts differs from traditional Rust debugging:
- **No traditional debugger** - You can't step through code with breakpoints
- **Compilation errors** - Often relate to VM constraints, not just Rust syntax
- **Runtime failures** - Occur during transaction execution, not standard Rust runtime
- **Assertions** - Primary debugging tool, fail the transaction with proof

## Using Assertions

The `assert!()` macro is your primary debugging tool. When an assertion fails, the transaction cannot be proven and fails during execution.

### Basic Assertions

```rust title="contracts/bank-account/src/lib.rs"
#[component]
impl Bank {
    pub fn deposit(&mut self, depositor: AccountId, asset: Asset) {
        // Ensure bank is initialized
        self.require_initialized();

        // Validate deposit amount
        let amount = asset.unwrap_fungible().amount().as_u64();
        assert!(
            amount <= MAX_DEPOSIT_AMOUNT,
            "Deposit amount exceeds maximum allowed"
        );

        // Continue with deposit logic...
    }

    fn require_initialized(&self) {
        let initialized: Word = self.initialized.read();
        assert!(
            initialized[0].as_u64() == 1,
            "Bank must be initialized before deposits"
        );
    }
}
```

### Debugging with Assertions

Add temporary assertions to trace execution:

```rust
pub fn complex_operation(&mut self, value: Felt) {
    // Debug: Verify we reach this point
    assert!(true, "Reached complex_operation");

    let computed = self.compute_something(value);

    // Debug: Check intermediate value
    assert!(
        computed.as_u64() > 0,
        "computed value should be positive"
    );

    // Debug: Check before final operation
    assert!(true, "About to perform final step");

    self.finalize(computed);
}
```

:::warning Remove Debug Assertions
Remember to remove debug assertions before deployment. They consume unnecessary resources and may reveal implementation details.
:::

## Compiler Error Interpretation

### Stack Index Errors

**Error:**
```
invalid stack index: only the first 16 elements on the stack are directly accessible
```

**Cause:** Your function has too many local variables or complex expressions that exceed the Miden VM stack limit.

**Solutions:**

1. **Reduce local variables:**
```rust
// Instead of:
let a = self.get_a();
let b = self.get_b();
let c = self.get_c();
let d = self.get_d();
// ... many more

// Use directly:
self.process(self.get_a(), self.get_b());
```

2. **Break into smaller functions:**
```rust
// Instead of one large function
fn do_everything(&mut self, a: Word, b: Word, c: Word, d: Word) {
    // Many operations...
}

// Split into stages
fn stage_one(&mut self, a: Word, b: Word) -> Felt {
    // First part
}

fn stage_two(&mut self, result: Felt, c: Word, d: Word) {
    // Second part
}
```

3. **Process in loops:**
```rust
// Instead of processing all at once
for asset in assets {
    self.process_single(asset);
}
```

### Function Argument Errors

**Error:**
```
error: expected at most 4 words of arguments
```

**Cause:** Miden functions can receive at most 4 Words (16 Felts) as arguments.

**Solutions:**

1. **Combine related values:**
```rust
// Instead of:
fn process(&mut self, a: Felt, b: Felt, c: Felt, d: Felt, e: Felt) // Too many

// Use Word:
fn process(&mut self, data: Word, extra: Felt) // Word = 4 Felts + 1 Felt = 5 Felts
```

2. **Use storage for large data:**
```rust
// Store data first, then reference by key
fn process_with_key(&mut self, key: Word) {
    let data = self.large_data.get(&key);
    // Process data...
}
```

3. **Split into multiple calls:**
```rust
// Instead of one call with many args
fn setup(&mut self, config: Word);
fn execute(&mut self, params: Word);
fn finalize(&mut self, options: Word);
```

### Advice Provider Errors

**Error:**
```
values not found in advice provider
```

**Cause:** The VM tried to read a value that wasn't provided. This often happens with:
- Map lookups with non-existent keys
- Reading uninitialized storage
- Stack overflow situations

**Solutions:**

1. **Check map key construction:**
```rust
// Ensure keys are constructed consistently
let key = Word::from([
    depositor.prefix().as_felt(),
    depositor.suffix(),
    faucet_prefix,
    faucet_suffix,
]);
// Same order everywhere!
```

2. **Initialize storage before reading:**
```rust
fn get_balance(&self, key: Word) -> Felt {
    // Map returns 0 for non-existent keys
    self.balances.get(&key)
}
```

3. **Reduce function complexity** (stack overflow masquerades as advice provider error):
```rust
// If you see this error in complex functions,
// try breaking them into smaller pieces
```

## Runtime Error Patterns

### Transaction Execution Failures

When `tx_context.execute().await` returns an error:

```rust
let result = tx_context.execute().await;
match result {
    Ok(executed) => {
        println!("Transaction succeeded");
    }
    Err(e) => {
        // Print full error chain
        println!("Transaction failed: {}", e);
        println!("Error chain:");
        let mut source = e.source();
        while let Some(s) = source {
            println!("  Caused by: {}", s);
            source = s.source();
        }
    }
}
```

### Common Runtime Errors

| Error Pattern | Likely Cause | Solution |
|---------------|--------------|----------|
| "assertion failed" | `assert!()` condition was false | Check the assertion message for context |
| "account not found" | Wrong account ID | Verify account was added to MockChain |
| "note not found" | Note ID mismatch | Check note was added with correct ID |
| "insufficient balance" | Not enough assets | Verify asset amounts before operation |

### Assertion Failure Debugging

When an assertion fails, the error message tells you which one:

```rust
// In your contract
assert!(amount <= MAX_DEPOSIT_AMOUNT, "Deposit exceeds max");

// Error output will include:
// "Deposit exceeds max"
```

Add context to assertions:

```rust
// Bad: No context
assert!(value > 0);

// Good: Clear context
assert!(
    value > 0,
    "Expected positive value for deposit amount"
);

// Better: Include the value (when possible)
// Note: Complex format strings may not work
assert!(
    amount.as_u64() <= MAX_DEPOSIT_AMOUNT,
    "Amount exceeds MAX_DEPOSIT_AMOUNT"
);
```

## Debugging Strategies

### 1. Isolate the Problem

```rust
#[tokio::test]
async fn debug_specific_operation() -> anyhow::Result<()> {
    // Minimal setup
    let mut builder = MockChain::builder();

    // Only what's needed to reproduce
    let account = create_minimal_account(&mut builder)?;

    let mock_chain = builder.build()?;

    // Single operation
    let result = execute_problematic_operation(&mock_chain, account.id()).await;

    // Check result
    println!("Result: {:?}", result);

    Ok(())
}
```

### 2. Add Logging in Tests

```rust
#[tokio::test]
async fn debug_flow() -> anyhow::Result<()> {
    println!("Step 1: Creating accounts...");
    let account = create_account()?;
    println!("  Account ID: {:?}", account.id());

    println!("Step 2: Executing transaction...");
    let result = execute_tx(&account).await;
    println!("  Result: {:?}", result);

    println!("Step 3: Checking storage...");
    let value = account.storage().get_item(0)?;
    println!("  Storage[0]: {:?}", value);

    Ok(())
}
```

### 3. Verify Pre-conditions

Before complex operations, verify the state is correct:

```rust
// In your contract
fn withdraw(&mut self, depositor: AccountId, amount: Felt) {
    // Verify pre-conditions
    self.require_initialized();

    let balance = self.get_balance(depositor);
    assert!(
        balance.as_u64() >= amount.as_u64(),
        "Insufficient balance for withdrawal"
    );

    // Proceed with withdrawal...
}
```

### 4. Test Edge Cases

```rust
#[tokio::test]
async fn test_zero_deposit() -> anyhow::Result<()> {
    // Test with zero amount
    let result = deposit(0).await;
    assert!(result.is_err(), "Zero deposit should fail");
    Ok(())
}

#[tokio::test]
async fn test_max_deposit() -> anyhow::Result<()> {
    // Test at exactly the limit
    let result = deposit(MAX_DEPOSIT_AMOUNT).await;
    assert!(result.is_ok(), "Max deposit should succeed");
    Ok(())
}

#[tokio::test]
async fn test_over_max_deposit() -> anyhow::Result<()> {
    // Test just over the limit
    let result = deposit(MAX_DEPOSIT_AMOUNT + 1).await;
    assert!(result.is_err(), "Over-max deposit should fail");
    Ok(())
}
```

## Debugging Checklist

When debugging a failing test or transaction:

- [ ] **Check assertion messages** - They often point directly to the problem
- [ ] **Verify storage initialization** - Ensure slots are set up correctly
- [ ] **Check account/note IDs** - Mismatched IDs cause "not found" errors
- [ ] **Verify asset amounts** - Insufficient assets cause runtime failures
- [ ] **Review key construction** - Map keys must be built consistently
- [ ] **Check execution order** - Initialize before deposit, deposit before withdraw
- [ ] **Look for stack overflow** - Complex functions may hit the 16-element limit
- [ ] **Verify function arguments** - Stay within the 4-Word limit

## Future Tooling

:::info Debugger Development
The Miden team is actively developing debugging tools. Future releases may include:
- Step-through debugging
- VM state inspection
- Execution traces
- Gas/cycle profiling

Check the [Miden repository](https://github.com/0xMiden/miden-vm) for updates.
:::

## Next Steps

- **[Common Pitfalls](./pitfalls)** - Avoid known issues
- **[Testing Guide](./testing)** - MockChain testing patterns
- **[Miden Bank Tutorial](./miden-bank/)** - See debugging in context
