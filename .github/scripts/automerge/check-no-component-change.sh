#!/usr/bin/env bash
#
# Criterion 12 — no MDX import or component usage is introduced or altered.
#
# These pages are MDX: they can import and render React components (<Tabs>,
# <ApiCall>, <Tldr>, <ScreenshotNumberReference>…). A malformed component breaks
# the build and the CI catches it, but a well-formed one used wrongly does not —
# it renders something the maintainer never approved.
#
# Adding prose or a table row to a page that already uses components is fine.
# What fails is adding an `import` line, or opening a new component tag.

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

    # Fence state, so JSX inside a code sample is documentation, not markup.
    if (probe ~ /^(```|~~~)/) {
      if (kind == " " || kind == "+") in_fence = !in_fence
      next
    }
    if (in_fence) next
    if (kind != "+" && kind != "-") next

    # ES import at the top of an MDX file.
    if (probe ~ /^import[[:space:]]/) { print kind "import: " probe; next }

    # A capitalised JSX tag: <Tabs>, <ApiCall …>, </TabItem>. Lowercase tags are
    # plain HTML and are left alone.
    if (probe ~ /<\/?[A-Z][A-Za-z0-9]*/) {
      match(probe, /<\/?[A-Z][A-Za-z0-9]*/)
      print kind "component: " substr(probe, RSTART, RLENGTH)
    }
  }
')

if [ -n "$FOUND" ]; then
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  FIRST=$(echo "$FOUND" | head -1)
  fail "changes $COUNT MDX import/component line(s), first: $FIRST"
fi

pass "no MDX import or component change"
