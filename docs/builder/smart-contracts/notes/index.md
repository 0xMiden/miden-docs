---
title: "Notes"
sidebar_position: 0
description: "Miden's programmable UTXOs — create, consume, and script notes for asset transfers between accounts."
---

# Notes

Notes are Miden's mechanism for transferring assets between accounts. They work like programmable UTXOs — each note carries assets and a script that determines who can consume it and what happens when they do. Assets can't transfer directly between accounts; they must move through notes, which ensures privacy (the network doesn't see account-to-account links) and enables programmable conditions on transfers.

## Note lifecycle

```
1. Creator account calls output_note::create() → NoteIdx
2. Creator adds assets with output_note::add_asset()
3. Note exists on-chain (or privately)
4. Consumer account processes the note in a transaction
5. Note script runs, assets transfer to consumer
```

import DocCard from '@theme/DocCard';

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './note-scripts',
        label: 'Note Scripts',
        description: 'Write custom note consumption logic.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './note-types',
        label: 'Note Types',
        description: 'Built-in note types: P2ID, SWAPP, and more.',
      }}
    />
  </div>
</div>

<div className="row">
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './reading-notes',
        label: 'Reading Notes',
        description: 'Read active note and input note data.',
      }}
    />
  </div>
  <div className="col col--6">
    <DocCard
      item={{
        type: 'link',
        href: './output-notes',
        label: 'Output Notes',
        description: 'Create notes and attach assets.',
      }}
    />
  </div>
</div>
