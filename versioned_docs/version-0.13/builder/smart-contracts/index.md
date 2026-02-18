---
title: "Miden Smart Contracts"
sidebar_position: 0
description: "Reference documentation for building Miden smart contracts in Rust using the Miden compiler SDK."
---

# Miden Smart Contracts

This section is the complete reference for building smart contracts on Miden using Rust and the compiler SDK (v0.9.0). If you're new to Miden, start with the [Toolchain & Project Structure](./getting-started) guide below, or follow the hands-on [Miden Bank Tutorial](../develop/tutorials/rust-compiler/miden-bank/).

All Miden Rust contracts compile under these constraints: `#![no_std]`, Rust 2024 edition, targeting `wasm32-unknown-unknown` → Miden Assembly → ZK proof.

import DocCard from '@theme/DocCard';

## Overview

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './overview',
        label: 'What is a Miden Smart Contract',
        description: 'Execution model, accounts, notes, and the transaction lifecycle.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './getting-started',
        label: 'Toolchain & Project Structure',
        description: 'The Miden toolchain, project layout, and how Rust source becomes a deployable .masp file.',
      }}
    />
  </div>
</div>

## Core Concepts

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './accounts/',
        label: 'Accounts',
        description: 'Components, storage, custom types, operations, cryptography, and authentication.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './notes/',
        label: 'Notes',
        description: 'Programmable UTXOs for asset transfers.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './transactions/',
        label: 'Transactions',
        description: 'Transaction context, scripts, and the advice provider.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './cross-component-calls',
        label: 'Cross-Component Calls',
        description: 'WIT bindings and generate!() for inter-component calls.',
      }}
    />
  </div>
</div>

## Reference

<div className="row">
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './types',
        label: 'Types',
        description: 'Core types: Felt, Word, AccountId, NoteId, and more.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './patterns',
        label: 'Patterns & Security',
        description: 'Access control, rate limiting, spending limits, and anti-patterns.',
      }}
    />
  </div>
  <div className="col col--4">
    <DocCard
      item={{
        type: 'link',
        href: './api-reference',
        label: 'Cheatsheet',
        description: 'Every function, type, trait, and macro at a glance.',
      }}
    />
  </div>
</div>
