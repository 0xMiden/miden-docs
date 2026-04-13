---
sidebar_position: 1
title: Installation
description: Get started with Miden development by installing Miden tools using the `midenup` toolchain.
---

This guide walks you through installing the Miden development tools using the `midenup` toolchain manager.

## Prerequisites

### Install Rust

Miden development requires Rust. Install it using rustup:

```bash title=">_ Terminal"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

Reload your PATH environment variable:

```bash title=">_ Terminal"
. "$HOME/.cargo/env"
```

Verify the installation:

```bash title=">_ Terminal"
rustc --version
```

<details>
<summary>Expected output</summary>

```text
rustc 1.92.0-nightly (fa3155a64 2025-09-30)
```

</details>

### Install Node.js & Yarn

For TypeScript development with the Miden Web Client, you'll need Node.js and Yarn.

**Install Node.js:**

```bash title=">_ Terminal"
# Install Node.js using the official installer or package manager
# For macOS with Homebrew:
brew install node

# For Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# For Windows, download from nodejs.org
```

**Install Yarn:**

```bash title=">_ Terminal"
# Install Yarn globally via npm
npm install -g yarn
```

**Verify installations:**

```bash title=">_ Terminal"
node --version && yarn --version
```

<details>
<summary>Expected output</summary>

```text
v22.x.x  # or higher
1.22.x   # or higher
```

</details>

### Install Miden CLI

**Install midenup**

The Miden toolchain installer makes it easy to manage Miden components:

```bash title=">_ Terminal"
cargo install midenup
```

:::info
Until published to crates.io, install using: `cargo install --git https://github.com/0xMiden/midenup.git`
:::

**Initialize midenup**

```bash title=">_ Terminal"
midenup init
```

This creates the `$MIDENUP_HOME` directory and sets up the `miden` command by creating a symlink in your Cargo bin directory (`$CARGO_HOME/bin/`, typically `~/.cargo/bin/`). Since Rust users already have this directory in their PATH, no additional PATH configuration is needed.

Verify it works:

```bash title=">_ Terminal"
which miden
```

<details>
<summary>Expected output</summary>

```text
/Users/<USERNAME>/.cargo/bin/miden    # macOS
/home/<USERNAME>/.cargo/bin/miden     # Linux
```

</details>

**Install Miden Toolchain**

Install the latest stable Miden components:

```bash title=">_ Terminal"
midenup install stable
```

:::note
You may see `No artifact found. Proceeding to install from source` during installation. This is expected — it means pre-built binaries aren't available for your platform, so midenup compiles components from source. This can take 15-30 minutes.
:::

### Verify Installation

Check that everything is working correctly:

```bash title=">_ Terminal"
midenup show active-toolchain
```

<details>
<summary>Expected output</summary>

```text
stable
```

</details>

Test by creating a new project:

```bash title=">_ Terminal"
miden new my-test-project
cd my-test-project
```

If successful, you'll see a new directory with Miden project files. The `cd` command enters the project directory, which you'll need for the following guides.

### Troubleshooting

**"miden: command not found"**

Ensure `$CARGO_HOME/bin` (typically `~/.cargo/bin/`) is in your PATH. This should already be configured if you installed Rust via rustup. Verify with:

```bash title=">_ Terminal"
echo $PATH | tr ':' '\n' | grep cargo
```

**"config error: missing field" when running `miden client` commands**

If you have config files from a previous Miden installation, they may be incompatible with the current version. Delete the old config and database, then re-initialize:

```bash title=">_ Terminal"
rm -f miden-client.toml store.sqlite3
miden client init
```

## Set Up React App

The TypeScript examples in this Quick Start use the [`@miden-sdk/react`](https://www.npmjs.com/package/@miden-sdk/react) hooks library. Scaffold a new project with:

```bash title=">_ Terminal"
yarn create-miden-app
cd miden-app/
yarn install
yarn dev
```

The generated project already has `MidenProvider` wired up in `src/providers.tsx`, so you can start using the hooks immediately — no additional provider setup needed. The RPC endpoint is read from `src/config.ts` (`MIDEN_RPC_URL`), which defaults to `"testnet"` and can be overridden with the `VITE_MIDEN_RPC_URL` environment variable if you want to point at a custom node or devnet.

For each TypeScript snippet in the following pages:

1. Create a new file under `src/components/` (for example `src/components/CreateWallet.tsx`) and paste the snippet.
2. Open `src/components/AppContent.tsx`, import the component, and render it inside the existing component tree.
3. `yarn dev` reloads automatically — trigger the example from the browser.

See the [`@miden-sdk/react` README](https://github.com/0xMiden/miden-client/blob/main/packages/react-sdk/README.md) for the full list of provider options (`rpcUrl`, `autoSyncInterval`, `prover`, etc.).

---
