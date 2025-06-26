#!/bin/bash

# Test script for Strapi documentation validation
# Usage: ./test-validation.sh [PR_NUMBER|BRANCH_NAME|FILE_PATH]

set -e

cd "$(dirname "$0")" # Go to script directory
cd .. # Go to docusaurus root

VALIDATOR_SCRIPT="scripts/style-validation/validate-content-style-enhanced.js"

echo "🎯 Strapi Documentation Validation Test Script"
echo "=============================================="

# Check if enhanced validator exists
if [ ! -f "$VALIDATOR_SCRIPT" ]; then
    echo "❌ Enhanced validator not found: $VALIDATOR_SCRIPT"
    echo "💡 Make sure you've created the enhanced validator file"
    exit 1
fi

# Function to test PR by number
test_pr() {
    local pr_number=$1
    echo "🔍 Testing PR #$pr_number"
    
    # Get PR info using GitHub CLI
    if command -v gh >/dev/null 2>&1; then
        echo "📊 Fetching PR information..."
        PR_INFO=$(gh pr view $pr_number --json headRefOid,baseRefOid,headRefName,baseRefName)
        
        HEAD_SHA=$(echo "$PR_INFO" | jq -r '.headRefOid')
        BASE_SHA=$(echo "$PR_INFO" | jq -r '.baseRefOid')
        HEAD_BRANCH=$(echo "$PR_INFO" | jq -r '.headRefName')
        BASE_BRANCH=$(echo "$PR_INFO" | jq -r '.baseRefName')
        
        echo "📋 PR Details:"
        echo "   Base: $BASE_BRANCH ($BASE_SHA)"
        echo "   Head: $HEAD_BRANCH ($HEAD_SHA)"
        
        # Checkout PR
        echo "🔄 Checking out PR..."
        gh pr checkout $pr_number
        
        # Run validation
        echo "🚀 Running validation in diff mode..."
        node $VALIDATOR_SCRIPT --diff --base $BASE_SHA --head $HEAD_SHA --verbose
    else
        echo "❌ GitHub CLI (gh) not found. Please install it or use manual testing."
        echo "💡 Install with: brew install gh (on macOS) or see https://cli.github.com/"
        exit 1
    fi
}

# Function to test current branch against main
test_branch() {
    local branch_name=$1
    echo "🔍 Testing branch: $branch_name"
    
    # Ensure we're on the right branch
    if [ "$branch_name" != "current" ]; then
        echo "🔄 Checking out branch: $branch_name"
        git checkout $branch_name
    fi
    
    CURRENT_BRANCH=$(git branch --show-current)
    echo "📋 Current branch: $CURRENT_BRANCH"
    
    # Show changed files
    echo "📄 Changed documentation files:"
    CHANGED_FILES=$(git diff --name-only origin/main HEAD | grep -E '\.(md|mdx)$' | grep 'docs/' || echo "None")
    
    if [ "$CHANGED_FILES" = "None" ]; then
        echo "   No documentation files changed"
        echo "✅ Nothing to validate"
        return 0
    else
        echo "$CHANGED_FILES" | sed 's/^/   /'
    fi
    
    echo ""
    echo "🚀 Running validation in diff mode..."
    node $VALIDATOR_SCRIPT --diff --base origin/main --head HEAD --verbose
}

# Function to test specific file
test_file() {
    local file_path=$1
    echo "🔍 Testing file: $file_path"
    
    if [ ! -f "$file_path" ]; then
        echo "❌ File not found: $file_path"
        exit 1
    fi
    
    echo "📋 Testing modes:"
    echo ""
    
    echo "1️⃣ Standard mode (full file analysis):"
    echo "----------------------------------------"
    node $VALIDATOR_SCRIPT --verbose "$file_path"
    
    echo ""
    echo "2️⃣ Diff mode (changed lines only):"
    echo "----------------------------------------"
    node $VALIDATOR_SCRIPT --diff --base origin/main --head HEAD --verbose "$file_path"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS] [TARGET]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help     Show this help message"
    echo "  -l, --list     List changed files in current branch"
    echo ""
    echo "TARGET (choose one):"
    echo "  PR_NUMBER      Test a specific PR (e.g., 123)"
    echo "  BRANCH_NAME    Test a specific branch (e.g., feature/new-docs)"
    echo "  FILE_PATH      Test a specific file (e.g., docs/api/content-types.md)"
    echo "  current        Test current branch against main (default)"
    echo ""
    echo "Examples:"
    echo "  $0 123                           # Test PR #123"
    echo "  $0 feature/api-docs              # Test specific branch"
    echo "  $0 docs/api/content-types.md     # Test specific file"
    echo "  $0 current                       # Test current branch"
    echo "  $0 --list                        # Show changed files"
}

# Function to list changed files
list_files() {
    echo "📄 Documentation files changed in current branch:"
    CHANGED_FILES=$(git diff --name-only origin/main HEAD | grep -E '\.(md|mdx)$' | grep 'docs/' || echo "")
    
    if [ -z "$CHANGED_FILES" ]; then
        echo "   No documentation files changed"
    else
        echo "$CHANGED_FILES" | sed 's/^/   ✏️  /'
    fi
}

# Parse arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    -l|--list)
        list_files
        exit 0
        ;;
    ""|current)
        test_branch current
        ;;
    [0-9]*)
        test_pr "$1"
        ;;
    docs/*)
        test_file "$1"
        ;;
    *)
        if [ -f "$1" ]; then
            test_file "$1"
        else
            test_branch "$1"
        fi
        ;;
esac

echo ""
echo "✅ Test completed!"