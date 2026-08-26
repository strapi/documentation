#!/usr/bin/env bash
#
# Criterion 7 — no existing code-block line is removed or modified.
#
# Code inside a fence is what readers copy and paste. Adding to an example is
# low risk; rewriting or deleting a line that already worked is not, and a diff
# cannot tell "corrected" from "broken".
#
# Pure additions inside a fence are allowed, and that nuance matters: #3373 adds
# two table rows AND four lines to a config/server.js example, and is exactly
# the kind of PR this gate exists to merge.
#
# The tricky part is fence state. A unified diff interleaves three kinds of
# line, and they do not share one timeline:
#   ' ' context — exists in both the old and the new file
#   '-' removed — exists only in the old file
#   '+' added   — exists only in the new file
#
# So the parser tracks TWO fence states, one per side. A ``` on a context line
# toggles both; a ``` on a removed line toggles only the old side; a ``` on an
# added line toggles only the new side. Using a single flag would desynchronise
# on any hunk that rewrites a fence marker.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

DIFF=$(pr_diff "$PR") || unknown "cannot read the diff of $REPO#$PR"

FOUND=$(echo "$DIFF" | awk '
  function is_fence(s) {
    sub(/^[[:space:]]+/, "", s)
    return (s ~ /^(```|~~~)/)
  }

  /^diff --git/ {
    skip = ($0 ~ /llms.*\.txt/)
    old_fence = 0; new_fence = 0
    next
  }
  skip { next }
  /^--- |^\+\+\+ / { next }
  /^@@/ { next }

  # Context line: present on both sides.
  /^ / {
    body = substr($0, 2)
    if (is_fence(body)) { old_fence = !old_fence; new_fence = !new_fence }
    next
  }

  # Removed line: only the old side. If it sat inside a code block, an existing
  # code line is being deleted or rewritten.
  /^-/ {
    body = substr($0, 2)
    if (is_fence(body)) { old_fence = !old_fence; next }
    if (old_fence) {
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", body)
      if (body != "") print "removed: " body
    }
    next
  }

  # Added line: only the new side. Allowed inside a fence — pure additions are
  # in scope.
  /^\+/ {
    body = substr($0, 2)
    if (is_fence(body)) { new_fence = !new_fence }
    next
  }
')

if [ -n "$FOUND" ]; then
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  FIRST=$(echo "$FOUND" | head -1)
  fail "removes or rewrites $COUNT code-block line(s), first: $FIRST"
fi

pass "code blocks are untouched or only added to"
