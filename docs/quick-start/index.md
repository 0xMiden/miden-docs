---
sidebar_position: 1
title: Quick Start
description: Get started with Miden development by installing the Miden CLI and setting up your development environment.
---

Welcome to the Miden quick start guide! This hands-on guide will introduce you to core Miden components, regardless of your prior experience. In this tutorial, you will learn about:

- Miden Accounts: How Wallets and Accounts work on Miden
- Getting Tokens from a Faucet: Receive Assets into your Wallet
- Sending Tokens to another Account: Transfer from your Wallet to any other Miden Account
- Reading from the Network: How to interact with public Miden Accounts to retrieve data
- Building your first Smart Contract: Build & Deploy a simple "Hello Miden" Smart Contract

Before you can get started developing on Miden, you need to install the correct binaries and dependencies.

## Prerequisites

### Install Rust

Developers build Miden programs using the Rust programming language.

1. Install Rust using rustup by entering the following command in your terminal:

```bash title=">_ Terminal"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

After a successful installation you will see the following message:

### Successful Rust Install Message

2. Reload your PATH environment variable to include Cargo's bin directory:

```bash title=">_ Terminal"
. "$HOME/.cargo/env"
```

3. Verify that the installation was successful:

```bash title=">_ Terminal"
rustc --version
```

You will see output like the following:

<details>
<summary>Expected output</summary>

```text
rustc 1.92.0-nightly (fa3155a64 2025-09-30)
```

</details>

## Install Miden CLI

The Miden CLI provides all the tools required to build and deploy Miden programs.

### Install midenup

1. Install the Miden toolchain installer (midenup) using cargo:

```bash title=">_ Terminal"
cargo install midenup
```

:::info Important
Until this crate has been published to crates.io, it is only possible to install using `cargo install --git https://github.com/0xMiden/midenup.git`.
:::

2. Initialize the midenup environment:

```bash title=">_ Terminal"
midenup init
```

The `midenup init` command initializes the `$MIDENUP_HOME` directory and creates a symlink so that all executable Miden components can be accessed using the `miden` command.

### Configure PATH Environment Variable

**This is a critical step!** You must ensure `$MIDENUP_HOME/bin` is added to your shell `$PATH`. You can obtain the current value of `$MIDENUP_HOME` using `midenup show home`.

#### For Zsh (macOS default)

Add the following to your `~/.zshrc` file:

```bash title=">_ Terminal"
export MIDENUP_HOME="/Users/$(whoami)$/Library/Application Support/midenup"
export PATH=${MIDENUP_HOME}/bin:$PATH
```

Or if you want to use the default location:

```bash title=">_ Terminal"
export PATH="/Users/$(whoami)/Library/Application Support/midenup/bin:$PATH"
```

Then reload your shell configuration:

```bash title=">_ Terminal"
source ~/.zshrc
```

#### For Bash

Add the following to your `~/.bashrc` file:

```bash title=">_ Terminal"
export MIDENUP_HOME=$XDG_DATA_DIR/midenup
export PATH=${MIDENUP_HOME}/bin:$PATH
```

Then reload your shell configuration:

```bash title=">_ Terminal"
source ~/.bashrc
```

:::warning Critical Step
If you forget to do the step above, some functionality will not work as expected!
:::

#### For PowerShell (Windows)

:::note todo
Add instructions here
:::

### Install the Miden Toolchain

After initializing `midenup`, install the Miden toolchain:

```bash title=">_ Terminal"
midenup install stable
```

This installs the latest stable versions of all Miden components that work together.

#### Configure Miden Toolchain

After installing the Miden toolchain, run the following command to configure the Miden client:

```bash title=">_ Terminal"
miden-client init --network <NETWORK>
```

In order to initialize the client, you have to specify which network you want to initialize it with.

The client accepts the following options:

- `testnet`: When using the Miden Testnet
- `devnet`: When using the Miden Devnet
- `localhost`: When using your own local Miden node. This is best for testing and debugging

For this guide, we will be using the `testnet` option.

### Verify Installation

1. Check that midenup is working:

```bash title=">_ Terminal"
midenup show active-toolchain
```

<details>
<summary>Expected output</summary>

```text
stable
```

</details>

2. Verify that the `miden` command is available:

```bash title=">_ Terminal"
which miden
```

<details>
<summary>Expected output</summary>

```text
/Users/<USERNAME>/Library/Application Support/midenup/bin/miden
```

</details>

3. Test creating a new Miden project:

```bash title=">_ Terminal"
miden new my-first-project
```

<details>
<summary>Expected output</summary>

```text
# The command should run without errors and create a new project directory
# You should see a new directory called 'my-first-project' with files for Miden development:
my-first-project/
├── ...
├── ...
└── ...
```

</details>

If you encounter any issues with the `miden new` command, ensure that:

- Your PATH environment variable includes the midenup bin directory
- You've reloaded your shell configuration with `source ~/.zshrc` (or `source ~/.bashrc`)
- You're using a new terminal session

### Troubleshooting (TODO: UPDATE THIS)

#### "miden: command not found"

This error occurs when the PATH environment variable doesn't include the midenup bin directory. To fix:

1. Check your current PATH:

```bash title=">_ Terminal"
echo $PATH
```

<details>
<summary>Expected output (should include midenup bin directory)</summary>

```text
/Users/username/Library/Application Support/midenup/bin:/Users/username/.cargo/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

</details>

2. Look for `/Users/.../midenup/bin` in the output. If it's missing, add it:

```bash title=">_ Terminal"
export PATH="/Users/$(whoami)/Library/Application Support/midenup/bin:$PATH"
```

<details>
<summary>Expected output after adding PATH</summary>

```text
# After running the export command, verify with:
which miden
# Should output: /Users/username/Library/Application Support/midenup/bin/miden
```

</details>

3. Make changes permanent by adding to your `~/.bashrc` or `~/.zshrc` file (depending on your shell):

```bash title=">_ Terminal"
export PATH="/Users/$(whoami)/Library/Application Support/midenup/bin:$PATH"
```
