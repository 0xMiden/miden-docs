#!/bin/bash

# update_docs.sh - Script to fetch documentation from multiple repositories

# Set the URLs of the repositories
MIDEN_CLIENT_REPO="https://github.com/0xPolygonMiden/miden-client.git"
MIDEN_NODE_REPO="https://github.com/0xPolygonMiden/miden-node.git"
MIDEN_BASE_REPO="https://github.com/0xPolygonMiden/miden-base.git"
MIDEN_VM_REPO="https://github.com/0xPolygonMiden/miden-vm"
MIDEN_COMPILER_REPO="https://github.com/phklive/compiler"

# Define the local directories where the docs will be placed
CLIENT_DIR="src/miden-client/"
NODE_DIR="src/miden-node/"
BASE_DIR="src/miden-base/"
VM_DIR="src/miden-vm"
COMPILER_DIR="src/miden-compiler"

# Remove existing Miden directories
echo "Removing existing Miden directories..."
rm -rf "$CLIENT_DIR" "$NODE_DIR" "$BASE_DIR" "$VM_DIR" "$COMPILER_DIR"

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

echo "All documentation has been updated."

# Build SUMMARY.md from imported repositories
./build_summary.sh
