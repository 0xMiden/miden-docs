---
title: "Faucets and Policies"
description: "Build fungible token faucets and choose standard mint, burn, send, and receive policies."
---

# Faucets and Policies

In Miden, a token issuer is an account. A fungible faucet account can mint and burn the fungible asset identified by that faucet's account ID. The standard faucet components give builders a reusable way to create token issuers without hand-writing the entire faucet interface.

Use this page when you need to create a faucet account, decide who can mint or burn, or understand how faucet behavior relates to standard notes.

:::info v0.14 differences
The current unstable standards surface uses a unified `FungibleFaucet` component and a richer `TokenPolicyManager`. The v0.14 snapshot uses separate `BasicFungibleFaucet` and `NetworkFungibleFaucet` components plus mint-policy components. Use the versioned docs if you are building against v0.14.
:::

## Faucet component

The current standard fungible faucet component is `FungibleFaucet`.

| Surface | Entry point |
|---------|-------------|
| Rust component | `miden_standards::account::faucets::FungibleFaucet` |
| Rust builder/helper | `FungibleFaucetBuilder`, `create_fungible_faucet` |
| MASM component | `miden::standards::faucets::fungible` |
| Account type | `FungibleFaucet` account |

Public storage is typical for shared token faucets because clients can discover faucet state and metadata. Private storage is possible, but it changes who can observe the faucet's state.

## Token identity

A fungible asset is tied to its faucet account ID. The faucet's metadata describes the token, while the account ID identifies the asset issuer.

| Field | Meaning |
|-------|---------|
| Symbol | Short token symbol. |
| Decimals | Display precision for client UX. |
| Max supply | Upper bound enforced by the faucet component. |
| Metadata | Optional display fields such as token name, description, logo URI, and external link. |
| Faucet account ID | The issuer ID used when constructing fungible assets and checking balances. |

When an account checks its balance for a fungible token, it queries by the faucet account ID.

## Choose policy modules

Policy modules decide which operations are allowed for a token faucet.

| Policy area | Current standard examples | Use it for |
|-------------|---------------------------|------------|
| Mint | `MintAllowAll`, `MintOwnerOnly` | Gate mint operations. |
| Burn | `BurnAllowAll`, `BurnOwnerOnly` | Gate burn operations. |
| Send | `TransferAllowAll`, `BasicBlocklist`, `OwnerControlledBlocklist` | Gate assets leaving accounts through notes. |
| Receive | `TransferAllowAll`, `BasicBlocklist`, `OwnerControlledBlocklist` | Gate assets entering account vaults. |

`TokenPolicyManager` owns the active policy roots and validates policy changes. Authority for changing policies comes from the account's access-control setup, such as owner-controlled or role-based authority.

## Mint with notes

Minting does not directly credit a recipient's account vault. A faucet creates a note carrying the minted asset, and the recipient consumes that note to receive the asset.

For standard flows:

- The faucet creates a mint note or a P2ID note containing the minted asset.
- The recipient discovers and consumes the note.
- The recipient's account must be able to receive the asset, usually by including `BasicWallet`.

This is the same two-transaction note model described in [What are Notes?](../notes/).

## Burn returned assets

Burning is also note-based. A burn note returns assets to the faucet and executes the standard burn behavior. Use `BurnNote` from `miden-standards` rather than hand-writing a burn script unless your protocol needs custom conditions.

## When to write a custom faucet

Use `FungibleFaucet` when supply, metadata, minting, burning, and transfer policies match the standard pattern.

Write a custom faucet component when:

- Minting depends on application state, proofs, allowlists, or rate limits.
- Supply policy is more complex than a fixed max supply and a standard authority check.
- You need custom public methods beyond the standard faucet interface.

Even then, consider reusing standard auth, ownership, and wallet components where they fit. Custom faucet logic does not require custom authentication or custom note formats by default.

## Related pages

- [Account components](./account-components) - composing faucets with standard auth and ownership components
- [Standard notes](./standard-notes) - mint and burn notes
- [Assets, Vault, and Faucet migration notes](../../migration/asset-vault-faucet) - v0.14 asset and faucet changes
- [`miden-standards` faucet source](https://github.com/0xMiden/protocol/tree/next/crates/miden-standards/src/account/faucets) - current implementation
