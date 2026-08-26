#!/usr/bin/env bash
#
# Criterion 6 — no `warning` or `caution` admonition is added.
#
# Those two carry more weight than the surrounding prose: they tell readers that
# something can break or cause data loss. Publishing that claim without a human
# reading it is a different risk from adding a note or a tip, which are
# informational and stay in scope.
#
# Docusaurus supports :::warning, :::caution, :::danger, and the ::: [type]
# spelling with a custom title.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

BLOCKED_TYPES="${AUTOMERGE_BLOCKED_ADMONITIONS:-warning|caution|danger}"

PR="${1:-}"
require_pr_number "$PR"

DIFF=$(pr_diff "$PR") || unknown "cannot read the diff of $REPO#$PR"

FOUND=$(echo "$DIFF" | awk -v types="$BLOCKED_TYPES" '
  /^diff --git/ { skip = ($0 ~ /llms.*\.txt/); next }
  skip { next }
  /^\+\+\+/ { next }
  /^\+/ {
    line = substr($0, 2)
    gsub(/^[[:space:]]+/, "", line)
    if (line ~ "^:::[[:space:]]*(" types ")([[:space:]]|$)") { print line }
  }
')

if [ -n "$FOUND" ]; then
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  FIRST=$(echo "$FOUND" | head -1)
  fail "adds $COUNT blocking admonition(s), first: $FIRST"
fi

pass "adds no warning, caution or danger admonition"
