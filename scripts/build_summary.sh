#!/bin/bash

# build_summary.sh - Script to build a SUMMARY.md by combining existing SUMMARY.md files

# Define the source directory and output file
SRC_DIR="src/imported"
OUTPUT_FILE="src/SUMMARY.md"

echo "Building aggregated SUMMARY.md."

# Initialize the SUMMARY.md file with a header
echo "# Summary" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Initialize the SUMMARY.md with the first chapters
echo "- [Introduction](./index.md)" >> "$OUTPUT_FILE"
echo "- [Roadmap](./roadmap.md)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to process a specific repository
process_repo() {
    repo_name=$1
    repo_dir="$SRC_DIR/$repo_name"
    
    # Skip if not a directory
    if [ ! -d "$repo_dir" ]; then
        echo "Warning: Directory $repo_dir not found, skipping..." >&2
        return
    fi

    echo "Processing $repo_name..."

    # Define the expected location for SUMMARY.md
    summary_file="$repo_dir/src/EXPORTED.md"

    # If SUMMARY.md exists in this repo
    if [ -f "$summary_file" ]; then
        echo "Found summary at $summary_file"
        
        # Create a temporary file to process the content
        temp_file=$(mktemp)
        
        # Skip the first 4 lines
        tail -n +5 "$summary_file" > "$temp_file"
        
        # Use Perl for more reliable text processing (available on most Unix systems)
        perl -pe "s|\(\.\/|\(imported\/$repo_name\/src\/|g; s|\(([a-zA-Z0-9_-]+\.md)|\(imported\/$repo_name\/src\/\$1|g;" "$temp_file" >> "$OUTPUT_FILE"
        
        # Add a blank line after each repository's content
        echo "" >> "$OUTPUT_FILE"
        
        # Clean up temporary file
        rm -f "$temp_file"
    else
        echo "Warning: No EXPORTED.md found at $summary_file, skipping..." >&2
    fi
}

# Process repositories in a specific order
process_repo "miden-base"       
process_repo "miden-tutorials" 
process_repo "miden-client"   
process_repo "miden-node"     
process_repo "miden-vm"      
process_repo "miden-compiler"

echo "- [FAQ](./faq.md)" >> "$OUTPUT_FILE"
echo "- [Glossary](./glossary.md)" >> "$OUTPUT_FILE"
echo "- [Useful links](imported/awesome-miden/README.md)" >> "$OUTPUT_FILE"

echo "Aggregated SUMMARY.md has been created successfully at $OUTPUT_FILE"
