# Private State Manager

Miden’s execution model requires clients to manage their own private state (accounts, notes, etc.) when working with privacy. While this design provides scalability and privacy benefits, it also introduces challenges for usability and security. Losing any part of the account state means losing access to the account itself, which creates the following risks:

- Solo-account users risk losing access if the state is not backed up.
- Shared-accounts users risk losing access by having a stale state due to a faulty or malicious participant withholding the state.

To address these challenges, Miden introduces the Private State Manager (PSM). The PSM is a system that allows clients to backup and sync their state securely without trust assumptions about other participants or the server operator.
