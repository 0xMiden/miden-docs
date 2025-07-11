# Getting started with Cargo

As part of the Miden compiler toolchain, we provide a Cargo extension, `cargo-miden`, which provides
a template to spin up a new Miden project in Rust, and takes care of orchestrating `rustc` and
`midenc` to compile the Rust crate to a Miden package.

## Installation

> [!WARNING]
> Currently, `midenc` (and as a result, `cargo-miden`), requires the nightly Rust toolchain, so
> make sure you have it installed first:
>
> ```bash
> rustup toolchain install nightly-2025-03-20
> ```
>
> NOTE: You can also use the latest nightly, but the specific nightly shown here is known to
> work.

To install the extension, clone the compiler repo first:

```bash
git clone https://github.com/0xMiden/compiler
```

Then, run the following in your shell in the cloned repo folder:

```bash
cargo install --path tools/cargo-miden --locked
```

This will take a minute to compile, but once complete, you can run `cargo help miden` or just
`cargo miden` to see the set of available commands and options.

To get help for a specific command, use `cargo miden help <command>` or `cargo miden <command> --help`.

## Creating an example project

If you're new to Miden and want to explore some example projects, you can use the `cargo miden example` command to create a project from one of our templates:

```bash
cargo miden example <example-name>
```

To see the list of available examples, run:

```bash
cargo miden example --help
```

Available examples include:
- **basic-wallet** - A basic wallet account implementation (creates both the wallet and a paired p2id-note)
- **p2id-note** - A pay-to-ID note script (creates both the note and a paired basic-wallet)
- **counter-contract** - A simple counter contract (creates both the contract and a paired counter-note)
- **counter-note** - A note script for interacting with the counter contract (creates both the note and paired counter-contract)
- **fibonacci** - A Fibonacci sequence calculator demonstrating basic computations
- **collatz** - An implementation of the Collatz conjecture
- **is-prime** - A prime number checker
- **storage-example** - Demonstrates storage operations in Miden

Note that some examples create paired projects. For instance, running `cargo miden example basic-wallet` will create a directory containing both the `basic-wallet` account and the `p2id-note` script that interacts with it.

## Creating a new project

Your first step will be to create a new Rust project set up for compiling to Miden:

```bash
cargo miden new foo
```

In this above example, this will create a new directory `foo`, containing a Cargo project for a
crate named `foo`, generated from our Miden project template.

The template we use sets things up so that you can pretty much just build and run. Since the
toolchain depends on Rust's native WebAssembly target, it is set up just like a minimal WebAssembly
crate, with some additional tweaks for Miden specifically.

Out of the box, you will get a Rust crate that depends on the Miden SDK, and sets the global
allocator to a simple bump allocator we provide as part of the SDK, and is well suited for most
Miden use cases, avoiding the overhead of more complex allocators.

As there is no panic infrastructure, `panic = "abort"` is set, and the panic handler is configured
to use the native WebAssembly `unreachable` intrinsic, so the compiler will strip out all of the
usual panic formatting code.

## Compiling to Miden package

Now that you've created your project, compiling it to Miden package is as easy as running the
following command from the root of the project directory:

```bash
cargo miden build --release
```

This will emit the compiled artifacts to `target/miden/release/foo.masp`.


## Running a compiled Miden VM program


> [!WARNING]
> To run the compiled Miden VM program you need to have `midenc` installed. See [`midenc` docs](./midenc.md) for the installation instructions.


The compiled Miden VM program can be run from the Miden package with the following:

```bash
midenc run target/miden/release/foo.masp --inputs some_inputs.toml
```

See `midenc run --help` for the inputs file format.



## Examples

Check out the [examples](https://github.com/0xMiden/compiler/tree/next/examples) for some `cargo-miden` project examples.
