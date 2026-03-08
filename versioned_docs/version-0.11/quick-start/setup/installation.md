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
v20.11.0
1.22.19
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

This creates the `$MIDENUP_HOME` directory and sets up symlinks for the `miden` command.

**Configure PATH**

Add the midenup bin directory to your PATH. First, check your current `$MIDENUP_HOME`:

```bash title=">_ Terminal"
midenup show home
```

Then add it to your shell configuration:

**For Zsh (macOS default):**

```bash title="~/.zshrc"
export MIDENUP_HOME="$HOME/Library/Application Support/midenup"
export PATH="$MIDENUP_HOME/bin:$PATH"
export PATH="$MIDENUP_HOME/opt:$PATH"
```

After editing, reload your shell:

```bash title=">_ Terminal"
source ~/.zshrc
```

**For Bash (Linux/Ubuntu):**

```bash title="~/.bashrc"
export MIDENUP_HOME="$HOME/.local/share/midenup"
export PATH="$MIDENUP_HOME/bin:$PATH"
export PATH="$MIDENUP_HOME/opt:$PATH"
```

After editing, reload your shell:

```bash title=">_ Terminal"
source ~/.bashrc
```

:::tip
On Linux, `midenup` uses XDG Base Directory paths. If `$XDG_DATA_HOME` is set, midenup installs to `$XDG_DATA_HOME/midenup`. Otherwise, it defaults to `~/.local/share/midenup`.
:::

**Install Miden Toolchain**

Install the latest stable Miden components:

```bash title=">_ Terminal"
midenup install stable
```

**Initialize Miden Client**

Configure the client for the network you'll use:

```bash title=">_ Terminal"
miden-client init --network testnet
```

Available networks:

- `testnet` - Miden's public test network
- `devnet` - Development network
- `localhost` - Local node for testing

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

```bash title=">_ Terminal"
which miden
```

<details>
<summary>Expected output</summary>

**macOS:**
```text
/Users/<USERNAME>/Library/Application Support/midenup/bin/miden
```

**Linux:**
```text
/home/<USERNAME>/.local/share/midenup/bin/miden
```

</details>

Test by creating a new project:

```bash title=">_ Terminal"
miden new my-test-project
```

If successful, you'll see a new directory with Miden project files.

### Troubleshooting

**"miden: command not found"**

This means the PATH isn't configured correctly. First, verify midenup installed successfully:

```bash title=">_ Terminal"
ls -la ~/.local/share/midenup/bin/  # Linux
ls -la ~/Library/Application\ Support/midenup/bin/  # macOS
```

You should see the `miden` executable. Then verify your PATH includes the midenup bin directory:

```bash title=">_ Terminal"
echo $PATH | grep midenup
```

If missing, add the PATH configuration to your shell profile (see [Configure PATH](#configure-path) above) and reload it:

```bash title=">_ Terminal"
source ~/.bashrc  # Linux
source ~/.zshrc   # macOS
```

**Installation takes too long**

Building Miden components from source can take 30-60 minutes. This is normal for first-time installations.

---
