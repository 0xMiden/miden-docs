Miden Learning Path
New to Miden? This page gives you a clear, structured path from complete beginner to active builder — so you always know exactly what to do next.
The path is divided into four levels. Each level builds on the previous one. You don't need to complete every item before moving forward, but the order is intentional.

Level 1 — Understand (No Setup Required)
Start here if you're new to Miden or ZK-based blockchains. No installation needed — everything in this level runs in your browser or requires only reading.
Goal: Understand what Miden is, why it exists, and how it works at a high level.
ResourceWhat You'll LearnIntroductionWhat Miden is and what makes it differentCore ConceptsAccounts, notes, transactions, and the actor modelMiden Smart ContractsHow contracts work on Miden vs other chainsGlossaryKey terms used throughout the documentation

Level 2 — Experiment (Browser Only)
Once you understand the concepts, explore them hands-on. The Miden Playground requires no installation — everything runs in your browser.
Goal: Write and run your first Miden programs without any local setup.
ResourceWhat You'll LearnMiden PlaygroundInteractive environment for writing MASM programsMiden WalletExperience client-side proving in the browserMiden FaucetGet testnet tokensMiden ScanExplore accounts and transactions on testnetFAQAnswers to common questions

Level 3 — Build Locally
When the browser playground isn't enough, set up a full local development environment. This level requires installing Rust and the Miden toolchain on your machine.
Goal: Run Miden locally, connect to testnet, and submit real transactions.
Step 1 — Install the toolchain
Follow the Quick Start guide to install Rust and midenup.

Ubuntu/Linux users: After running midenup install stable, you may need to add the Miden binaries to your PATH manually. If miden --version returns "command not found", run:
bashecho 'export PATH="/home/YOUR_USERNAME/.local/share/midenup/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
Replace YOUR_USERNAME with your actual username.

Step 2 — Connect to a node
You have two options:

Testnet (recommended for beginners): Connect directly to rpc.testnet.miden.io:443 — no setup required
Local node (optional, for development): Follow the Miden Node Setup tutorial to run a node on your own machine

Most users should start with testnet.
Step 3 — Interact via client
Choose your preferred interface:
InterfaceBest ForRust ClientBackend developers, programmatic interaction via RustWeb ClientFrontend developers, browser-based applications (TypeScript)

Level 4 — Build Seriously
Ready to write real smart contracts? This level covers the Miden Rust compiler and a full end-to-end application.
Goal: Write, test, and deploy Miden smart contracts in Rust.
Prerequisites for this level

Completed Level 3
Basic Rust programming experience

Start here
ResourceWhat You'll LearnRust Compiler OverviewHow the Miden Rust compiler worksMiden Bank TutorialBuild a complete banking application end-to-endTesting with MockChainHow to test your contracts locallyDebugging GuideTroubleshoot issues in your contractsCommon PitfallsAvoid known mistakes

How to Contribute
Once you've explored Miden, consider contributing back:

Non-technical: Fix typos in docs, help in Telegram, give feedback
Some technical: Build projects in the playground, create MASM templates, submit GitHub Issues for bugs you encounter
Technical: Contribute to the Rust Client, Web Client, or Miden VM

See the contributing guidelines for details.

Get Help
Stuck at any level? Here's where to go:

Miden Docs — full technical reference
Build On Miden Telegram — community support
GitHub Issues — report documentation bugs and gaps
