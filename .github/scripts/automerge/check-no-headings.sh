#!/usr/bin/env bash
#
# Criterion 5 — no Markdown heading is added.
#
# A new heading changes the shape of a page: its table of contents, its anchors,
# the URL fragments other pages link to. That is a structural decision.
#
# In the backtest this was the strongest single predictor. It also catches, for
# free, every PR documenting a brand-new callable, since those always arrive as
# "### `someMethod()`" plus a signature and an example.
#
# Headings inside fenced code blocks are ignored: a `#` in a shell example is a
# comment, not a heading.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

DIFF=$(pr_diff "$PR") || unknown "cannot read the diff of $REPO#$PR"

FOUND=$(echo "$DIFF" | awk '
  # Track which file we are in, and skip generated llms files entirely.
  /^diff --git/ {
    skip = ($0 ~ /llms.*\.txt/)
    in_fence = 0
    next
  }
  skip { next }
  /^\+\+\+|^---/ { next }

  # A fence marker toggles code-block state, whether added or context.
  {
    line = $0
    sub(/^[+ -]/, "", line)
    if (line ~ /^[[:space:]]*(```|~~~)/) { in_fence = !in_fence; next }
  }

  # Added heading, outside a fence.
  /^\+/ && !in_fence {
    line = substr($0, 2)
    if (line ~ /^#{1,6}[[:space:]]/) { print line }
  }
')

if [ -n "$FOUND" ]; then
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  FIRST=$(echo "$FOUND" | head -1)
  fail "adds $COUNT heading(s), first: $FIRST"
fi

pass "adds no heading"
