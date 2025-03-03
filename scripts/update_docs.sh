#!/bin/bash

# update_docs.sh - Script to fetch documentation from multiple repositories

# Set the URLs of the repositories
MIDEN_CLIENT_REPO="https://github.com/0xPolygonMiden/miden-client.git"
MIDEN_NODE_REPO="https://github.com/0xPolygonMiden/miden-node.git"
MIDEN_BASE_REPO="https://github.com/0xPolygonMiden/miden-base.git"
MIDEN_VM_REPO="https://github.com/0xPolygonMiden/miden-vm"
MIDEN_COMPILER_REPO="https://github.com/phklive/compiler"
MIDEN_TUTORIALS_REPO="https://github.com/0xPolygonMiden/miden-tutorials"

# Define the base imported directory
IMPORTED_DIR="src/imported"

# Define the local directories where the docs will be placed
CLIENT_DIR="$IMPORTED_DIR/miden-client/"
NODE_DIR="$IMPORTED_DIR/miden-node/"
BASE_DIR="$IMPORTED_DIR/miden-base/"
VM_DIR="$IMPORTED_DIR/miden-vm"
COMPILER_DIR="$IMPORTED_DIR/miden-compiler"
TUTORIALS_DIR="$IMPORTED_DIR/miden-tutorials"

# Remove existing imported directory
echo "Removing existing imported directories..."
rm -rf "$IMPORTED_DIR"
mkdir -p "$IMPORTED_DIR"

# Function to clone and copy docs from a repository
update_docs() {
    REPO_URL=$1
    DEST_DIR=$2
    BRANCH=${3:-main}  # Default to 'main' if no branch is specified
    TEMP_DIR=$(mktemp -d)

    echo "Fetching $REPO_URL (branch: $BRANCH)..."

    # Clone the specified branch of the repository sparsely
    git clone --depth 1 --filter=blob:none --sparse -b "$BRANCH" "$REPO_URL" "$TEMP_DIR"

    # Navigate to the temporary directory
    cd "$TEMP_DIR" || exit

    # Set sparse checkout to include only the docs directory
    git sparse-checkout set docs

    # Move back to the original directory
    cd - > /dev/null

    # Create the destination directory if it doesn't exist
    mkdir -p "$DEST_DIR"

    # Copy the docs directory from the temporary clone to your repository
    cp -r "$TEMP_DIR/docs/"* "$DEST_DIR/"

    # Clean up the temporary directory
    rm -rf "$TEMP_DIR"

    echo "Updated documentation from $REPO_URL (branch: $BRANCH) to $DEST_DIR"
}

# Update miden-client docs
update_docs "$MIDEN_CLIENT_REPO" "$CLIENT_DIR" "phklive-add-mdbook"

# Update miden-node docs
update_docs "$MIDEN_NODE_REPO" "$NODE_DIR" "phklive-add-mdbook"

# Update miden-base docs
update_docs "$MIDEN_BASE_REPO" "$BASE_DIR" "phklive-add-mdbook"

# Update miden-vm docs
update_docs "$MIDEN_VM_REPO" "$VM_DIR" "phklive-add-mdbook"

# Update miden-compiler docs
update_docs "$MIDEN_COMPILER_REPO" "$COMPILER_DIR" "phklive-add-mdbook"

# Update miden-tutorials docs
update_docs "$MIDEN_TUTORIALS_REPO" "$TUTORIALS_DIR" "phklive-add-mdbook"

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
EOF

echo "All documentation has been updated."

# Build SUMMARY.md from imported repositories
./scripts/build_summary.sh
