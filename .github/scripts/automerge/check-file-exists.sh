#!/usr/bin/env bash
#
# Criterion 3 — the documentation file already exists on the base branch.
#
# Creating a page is an information-architecture decision: where it belongs in
# the tree, what it is called, how readers reach it. That is the maintainer's
# call, never the gate's. Editing an existing page is not.
#
# Renames count as creations here — a moved page changes its URL, which is a
# navigation decision with the same weight as a new one.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

FILES=$(pr_files "$PR") || unknown "cannot read files of $REPO#$PR"

NEW=$(echo "$FILES" \
  | jq -r '[.[] | select(.status == "added" or .status == "renamed" or .status == "removed") | "\(.filename) (\(.status))"] | join(", ")')

if [ -n "$NEW" ]; then
  fail "does not only edit existing pages: $NEW"
fi

pass "edits existing pages only"
