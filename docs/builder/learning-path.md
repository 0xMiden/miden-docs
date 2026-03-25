# Learning Path for New Developers

This page is designed to help you navigate the Miden documentation from complete beginner to active builder. Follow the levels in order, or jump to the level that matches your current experience.

---

## Level 1: Understand

Start here if you are new to Miden or to ZK rollups in general. The goal is to build a mental model of what Miden is and how it works before writing any code.

- **[What is Miden?](https://docs.miden.xyz/)**: Read the overview to understand Miden's purpose and architecture.
- **[Key Concepts](https://docs.miden.xyz/concepts/)**: Learn the core primitives: accounts, notes, assets, and transactions.
- **[FAQ](./faq.md)**: Read through the FAQ to get answers to common questions about privacy, proving, and bridging.

By the end of this level you should be able to explain what a note is, what client-side proving means, and why Miden is different from EVM chains.

---

## Level 2: Experiment

Start interacting with Miden without setting up a full local environment.

- **[Miden Playground](https://playground.miden.xyz/)**: Write and run MASM programs directly in your browser.
- **[MASM Basics](https://docs.miden.xyz/masm/)**: Learn the basics of Miden Assembly: the language used to write smart contracts and programs on Miden.

By the end of this level you should be able to write and execute a simple MASM program in the playground.

---

## Level 3: Build Locally

Set up your local development environment and start building real programs.

- **[Install the Miden Toolchain](https://docs.miden.xyz/install/)**: Install `midenup` and the Miden toolchain on your machine.
- **[Rust Client Quickstart](https://docs.miden.xyz/rust-client/)**: Use the Miden Rust Client to create accounts, mint assets, and send notes locally using `MockChain`.
- **[Web Client Quickstart](https://docs.miden.xyz/web-client/)**: Use the Miden Web Client if you are building a browser-based application.

> **Tip:** If you are on Ubuntu or Linux and `miden` is not found after installation, add the binary path to your shell:
> ```bash
> echo 'export PATH="$HOME/.local/share/midenup/bin:$PATH"' >> ~/.bashrc
> source ~/.bashrc
> ```

By the end of this level you should be able to run a local transaction using MockChain and understand the full transaction lifecycle.

---

## Level 4: Build Seriously

You are ready to build production-ready applications and contribute to the ecosystem.

- **[Miden Rollup Architecture](https://docs.miden.xyz/architecture/)**: Deep dive into how the sequencer, prover, and operator work together.
- **[Account Interfaces](https://docs.miden.xyz/accounts/)**: Learn how to design custom account types and note scripts.
- **[Connect to Testnet](https://docs.miden.xyz/testnet/)**: Deploy and test your application on the Miden public testnet.
- **[Contribute to Miden](https://github.com/0xMiden/docs/blob/main/CONTRIBUTING.md)**: Fix bugs, improve docs, or build open-source tooling for the ecosystem.

By the end of this level you should be able to build and deploy a complete application on Miden testnet.

---

## Still Stuck?

- Join the **[BuildOnMiden Telegram](https://t.me/BuildOnMiden)** community.
- Open a **[GitHub Discussion](https://github.com/0xMiden/docs/discussions)**.
