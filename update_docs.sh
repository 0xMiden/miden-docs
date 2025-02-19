#!/bin/bash

# Set the URLs of the repositories
MIDDEN_CLIENT_REPO="https://github.com/0xPolygonMiden/miden-client.git"
MIDDEN_NODE_REPO="https://github.com/0xPolygonMiden/miden-node.git"
MIDDEN_BASE_REPO="https://github.com/0xPolygonMiden/miden-base.git"
MIDEN_TUTORIAL_REPO="https://github.com/0xPolygonMiden/miden-tutorials"
MIDEN_VM_REPO="https://github.com/0xPolygonMiden/miden-vm"
MIDEN_COMPILER_REPO="https://github.com/0xPolygonMiden/compiler"

# Define the local directories where the docs will be placed
CLIENT_DIR="src/miden-client/"
NODE_DIR="src/miden-node/"
BASE_DIR="src/miden-base/"
TUTORIAL_DIR="src/miden-tutorials"
VM_DIR="src/miden-vm"
COMPILER_DIR="src/miden-compiler"

# Function to clone and copy docs from a repository
update_docs() {
    REPO_URL=$1
    DEST_DIR=$2
    BRANCH=${3:-main}  # Default to 'master' if no branch is specified
    TEMP_DIR=$(mktemp -d)

    # Clone the specified branch of the repository sparsely
    git clone --depth 1 --filter=blob:none --sparse -b "$BRANCH" "$REPO_URL" "$TEMP_DIR"

    # Navigate to the temporary directory
    cd "$TEMP_DIR" || exit

    # Set sparse checkout to include only the docs directory
    git sparse-checkout set docs

    # Move back to the original directory
    cd - > /dev/null

    # Remove the existing local directory if it exists
    rm -rf "$DEST_DIR"

    # Create the destination directory if it doesn't exist
    mkdir -p "$DEST_DIR"

    # Copy the docs directory from the temporary clone to your repository
    cp -r "$TEMP_DIR/docs/"* "$DEST_DIR/"

    # Clean up the temporary directory
    rm -rf "$TEMP_DIR"

    echo "Updated documentation from $REPO_URL (branch: $BRANCH) to $DEST_DIR"
}

# Update miden-client docs (using default branch)
update_docs "$MIDDEN_CLIENT_REPO" "$CLIENT_DIR"

# Update miden-node docs (using default branch)
update_docs "$MIDDEN_NODE_REPO" "$NODE_DIR"

# Update miden-base docs (using 'phklive-update-docs' branch)
update_docs "$MIDDEN_BASE_REPO" "$BASE_DIR"

# Update miden-tutorial docs (using default branch)
update_docs "$MIDEN_TUTORIAL_REPO" "$TUTORIAL_DIR"

# Update miden-vm docs (using default branch)
update_docs "$MIDEN_VM_REPO" "$VM_DIR"

# Update miden-compiler docs (using default branch)
update_docs "$MIDEN_COMPILER_REPO" "$COMPILER_DIR" "next"

echo "All documentation has been updated."
