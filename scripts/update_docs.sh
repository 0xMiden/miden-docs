#!/bin/bash

# update_docs.sh - Script to fetch documentation from multiple repositories

# Set the URLs of the repositories
MIDEN_CLIENT_REPO="https://github.com/0xPolygonMiden/miden-client.git"
MIDEN_NODE_REPO="https://github.com/0xPolygonMiden/miden-node.git"
MIDEN_BASE_REPO="https://github.com/0xPolygonMiden/miden-base.git"
MIDEN_VM_REPO="https://github.com/0xPolygonMiden/miden-vm"
MIDEN_COMPILER_REPO="https://github.com/0xPolygonMiden/compiler"
MIDEN_TUTORIALS_REPO="https://github.com/0xPolygonMiden/miden-tutorials"
AWESOME_MIDEN_REPO="https://github.com/phklive/awesome-miden"

# Define the base imported directory
IMPORTED_DIR="src/imported"

# Define the local directories where the docs will be placed
CLIENT_DIR="$IMPORTED_DIR/miden-client/"
NODE_DIR="$IMPORTED_DIR/miden-node/"
BASE_DIR="$IMPORTED_DIR/miden-base/"
VM_DIR="$IMPORTED_DIR/miden-vm"
COMPILER_DIR="$IMPORTED_DIR/miden-compiler"
TUTORIALS_DIR="$IMPORTED_DIR/miden-tutorials"
AWESOME_MIDEN_DIR="$IMPORTED_DIR/awesome-miden"

# Remove existing imported directory
echo "Removing existing imported directories..."
rm -rf "$IMPORTED_DIR"
mkdir -p "$IMPORTED_DIR"

# Function to clone and copy specified directories from a repository
update_docs() {
    REPO_URL=$1
    DEST_DIR=$2
    BRANCH=${3:-main}      # Default to 'main' if no branch is specified
    SOURCE_DIR=${4:-docs}  # Default to 'docs' if no source directory is specified
    TEMP_DIR=$(mktemp -d)

    echo "Fetching $REPO_URL (branch: $BRANCH), source dir: $SOURCE_DIR..."

    # Clone the specified branch of the repository sparsely
    git clone --depth 1 --filter=blob:none --sparse -b "$BRANCH" "$REPO_URL" "$TEMP_DIR"

    # Navigate to the temporary directory
    cd "$TEMP_DIR" || exit

    # Set sparse checkout to include only the specified directory
    git sparse-checkout set "$SOURCE_DIR"

    # Move back to the original directory
    cd - > /dev/null

    # Create the destination directory if it doesn't exist
    mkdir -p "$DEST_DIR"

    # Check if the source directory exists in the cloned repo
    if [ -d "$TEMP_DIR/$SOURCE_DIR" ]; then
        # Copy the contents from the temporary clone to your repository
        # Use /* to copy contents rather than the directory itself
        cp -r "$TEMP_DIR/$SOURCE_DIR/"* "$DEST_DIR/"
        echo "Updated documentation from $REPO_URL (branch: $BRANCH), source: $SOURCE_DIR to $DEST_DIR"
    else
        echo "Warning: Source directory $SOURCE_DIR not found in repository $REPO_URL (branch: $BRANCH)"
    fi

    # Clean up the temporary directory
    rm -rf "$TEMP_DIR"
}

# Update docs
update_docs "$MIDEN_CLIENT_REPO" "$CLIENT_DIR" "next"
update_docs "$MIDEN_NODE_REPO" "$NODE_DIR" "next"
update_docs "$MIDEN_BASE_REPO" "$BASE_DIR"
update_docs "$MIDEN_VM_REPO" "$VM_DIR" "next"
update_docs "$MIDEN_COMPILER_REPO" "$COMPILER_DIR" "next"
update_docs "$MIDEN_TUTORIALS_REPO" "$TUTORIALS_DIR"
update_docs "$AWESOME_MIDEN_REPO" "$AWESOME_MIDEN_DIR" "main" "."

# Create a README.md in the imported directory
cat > "$IMPORTED_DIR/README.md" << EOF
# Imported Documentation

This directory contains automatically imported documentation from various Miden repositories.
**Please do not modify these files directly** as they will be overwritten during the next documentation update.

If you want to make changes to any documentation, please contribute to the original repositories:

- [miden-client](https://github.com/0xPolygonMiden/miden-client)
- [miden-node](https://github.com/0xPolygonMiden/miden-node)
- [miden-base](https://github.com/0xPolygonMiden/miden-base)
- [miden-vm](https://github.com/0xPolygonMiden/miden-vm)
- [miden-compiler](https://github.com/phklive/compiler)
- [miden-tutorials](https://github.com/0xPolygonMiden/miden-tutorials)
- [awesome-miden](https://github.com/phklive/awesome-miden)
EOF

echo "All documentation has been updated."

# Build SUMMARY.md from imported repositories
./scripts/build_summary.sh
