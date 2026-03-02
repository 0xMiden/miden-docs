Miden Learning Path

New to Miden? This page gives you a clear, structured path from complete beginner to active builder so you always know exactly what to do next.

The path is divided into four levels. Each level builds on the previous one. You don't need to complete every item before moving forward, but the order is intentional.

Level 1 — Understand (No Setup Required)

Start here if you're new to Miden or ZK-based blockchains. No installation needed everything in this level runs in your browser or requires only reading.

Goal: Understand what Miden is, why it exists, and how it works at a high level.

Resource | What You'll Learn 
[Introduction](/builder/) | What Miden is and what makes it different 
[Core Concepts](/core-concepts/) | Accounts, notes, transactions, and the actor model 
[Miden Smart Contracts](/builder/smart-contracts/) | How contracts work on Miden vs other chains 
[Glossary](/builder/glossary) | Key terms used throughout the documentation 

Level 2 — Experiment (Browser Only)

Once you understand the concepts, explore them hands-on. The Miden Playground requires no installation everything runs in your browser.

Goal: Write and run your first Miden programs without any local setup.

Resource | What You'll Learn 
[Miden Playground](https://playground.miden.xyz) | Interactive environment for writing MASM programs 
[Miden Wallet](https://chromewebstore.google.com/detail/miden-wallet/ablmompanofnodfdkgchkpmphailefpb) | Experience client-side proving in the browser 
[Miden Faucet](https://faucet.testnet.miden.io/) | Get testnet tokens 
[Miden Scan](https://testnet.midenscan.com/) | Explore accounts and transactions on testnet 
[FAQ](/builder/faq) | Answers to common questions 

Level 3 — Build Locally

When the browser playground isn't enough, set up a full local development environment. This level requires installing Rust and the Miden toolchain on your machine.

Goal: Run Miden locally, connect to testnet, and submit real transactions.
Step 1 — Install the toolchain

Follow the [Quick Start guide](/builder/quick-start/) to install Rust and midenup.

> **Ubuntu/Linux users:** After running `midenup install stable`, you may need to add the Miden binaries to your PATH manually. If `miden --version` returns "command not found", run:
> ```bash
> echo 'export PATH="/home/YOUR_USERNAME/.local/share/midenup/bin:$PATH"' >> ~/.bashrc
> source ~/.bashrc
> ```
> Replace `YOUR_USERNAME` with your actual username.

Step 2 — Connect to a node

You have two options:

- Testnet (recommended for beginners): Connect directly to `rpc.testnet.miden.io:443` — no setup required
- Local node (optional, for development): Follow the [Miden Node Setup](/builder/develop/tutorials/miden_node_setup) tutorial to run a node on your own machine

Most users should start with testnet.

Step 3 — Interact via client

Choose your preferred interface:

Interface | Best For 
[Rust Client](/builder/develop/tutorials/rust-client/) | Backend developers, programmatic interaction via Rust 
[Web Client](/builder/develop/tutorials/web-client/) | Frontend developers, browser-based applications (TypeScript) 

Level 4 — Build Seriously

Ready to write real smart contracts? This level covers the Miden Rust compiler and a full end-to-end application.

Goal: Write, test, and deploy Miden smart contracts in Rust.

Prerequisites for this level
- Completed Level 3
- Basic Rust programming experience

Start here

Resource | What You'll Learn 
[Rust Compiler Overview](/builder/develop/tutorials/rust-compiler/) | How the Miden Rust compiler works 
[Miden Bank Tutorial](/builder/develop/tutorials/rust-compiler/miden-bank/) | Build a complete banking application end-to-end 
[Testing with MockChain](/builder/develop/tutorials/rust-compiler/testing) | How to test your contracts locally 
[Debugging Guide](/builder/develop/tutorials/rust-compiler/debugging) | Troubleshoot issues in your contracts 
[Common Pitfalls](/builder/develop/tutorials/rust-compiler/pitfalls) | Avoid known mistakes 

How to Contribute

Once you've explored Miden, consider contributing back:

- Non-technical: Fix typos in docs, help in [Telegram](https://t.me/BuildOnMiden), give feedback
- Some technical: Build projects in the playground, create MASM templates, submit GitHub Issues for bugs you encounter
- Technical: Contribute to the Rust Client, Web Client, or Miden VM

See the [contributing guidelines](https://github.com/0xMiden/.github/blob/main/CONTRIBUTING.md) for details.

Get Help

Stuck at any level? Here's where to go:

- [Miden Docs](https://docs.miden.xyz) — full technical reference
- [Build On Miden Telegram](https://t.me/BuildOnMiden) — community support
- [GitHub Issues](https://github.com/0xMiden/miden-docs/issues) — report documentation bugs and gaps
