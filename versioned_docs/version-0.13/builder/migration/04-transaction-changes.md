---
sidebar_position: 4
title: "Transaction Changes"
description: "Transaction event and data extraction changes"
---

# Transaction Changes

:::warning Breaking Change
`TransactionEvent` was renamed to `TransactionEventId`, and event data extraction is now handled separately.
:::

## Quick Fix

```rust title="src/events.rs"
// Before
use miden_protocol::TransactionEvent;

// After
use miden_protocol::TransactionEventId;
use miden_protocol::TransactionEventData;
```

---

## TransactionEvent Renamed

`TransactionEvent` was renamed to `TransactionEventId`, and event data extraction is now handled separately.

```diff title="src/events.rs"
- use miden_protocol::TransactionEvent;
-
- fn handle_event(event: TransactionEvent) {
-     let data = event.data();
-     let event_type = event.event_type();
- }

+ use miden_protocol::TransactionEventId;
+ use miden_protocol::TransactionEventData;
+
+ fn handle_event(event_id: TransactionEventId, data: TransactionEventData) {
+     // Event ID and data are now separate
+     let event_type = event_id.event_type();
+     let payload = data.payload();
+ }
```

---

## Event Processing

Event processing now uses separate ID and data objects:

```diff title="src/processor.rs"
- // Before: combined event object
- for event in transaction.events() {
-     match event {
-         TransactionEvent::NoteCreated(data) => { ... }
-         TransactionEvent::AccountUpdated(data) => { ... }
-     }
- }

+ // After: ID-based matching with separate data
+ for (event_id, event_data) in transaction.events() {
+     match event_id {
+         TransactionEventId::NoteCreated => {
+             let note_data = event_data.as_note_created()?;
+         }
+         TransactionEventId::AccountUpdated => {
+             let account_data = event_data.as_account_updated()?;
+         }
+     }
+ }
```

:::info Good to know
The separation of event ID and data allows for more efficient event filtering without deserializing data.
:::

---

## Migration Steps

1. Replace all `TransactionEvent` imports with `TransactionEventId`
2. Add `TransactionEventData` imports where needed
3. Update event handling to use separate ID and data objects
4. Use typed accessor methods on `TransactionEventData`

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `TransactionEvent not found` | Renamed | Use `TransactionEventId` |
| `event.data() not found` | Data separated | Use `TransactionEventData` |
