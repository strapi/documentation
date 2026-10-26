#!/usr/bin/env bash
#
# Criterion 12 — no MDX import line is introduced or altered.
#
# An import pulls content or code into the page from somewhere else: a shared
# snippet, a component that is not registered globally. What the page ends up
# saying then depends on a file the diff does not show, so the diff alone is not
# enough to judge the change.
#
# Using a component is not an import and is not checked here. The badges, Tabs,
# StepDetails and Annotation are registered as global MDX components, the
# authoring guides prescribe them, and a page that renders one is doing what the
# guides ask. Criterion 1 already keeps every changed file inside the two
# documentation trees, so nothing under src/ can reach this gate in the first
# place.
#
# Imports inside fenced code blocks are ignored: an import in a JavaScript sample
# is documentation, not markup.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

DIFF=$(pr_diff "$PR") || unknown "cannot read the diff of $REPO#$PR"

FOUND=$(echo "$DIFF" | awk '
  /^diff --git/ { skip = ($0 ~ /llms.*\.txt/); in_fence = 0; next }
  skip { next }
  /^--- |^\+\+\+ / { next }
  /^@@/ { next }

  {
    kind = substr($0, 1, 1)
    body = substr($0, 2)
    probe = body
    gsub(/^[[:space:]]+/, "", probe)

    # Fence state, so an import in a code sample is left alone.
    if (probe ~ /^(```|~~~)/) {
      if (kind == " " || kind == "+") in_fence = !in_fence
      next
    }
    if (in_fence) next
    if (kind != "+" && kind != "-") next

    if (probe ~ /^import[[:space:]]/) { print kind probe }
  }
')

if [ -n "$FOUND" ]; then
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  FIRST=$(echo "$FOUND" | head -1)
  fail "changes $COUNT import line(s), first: $FIRST"
fi

pass "no MDX import change"
