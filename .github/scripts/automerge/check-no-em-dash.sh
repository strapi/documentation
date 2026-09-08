#!/usr/bin/env bash
#
# Criterion 13: no em dash is introduced.
#
# Strapi technical documentation does not use em dashes. They are also one of the
# strongest tells of unedited AI-generated prose, which matters here: the PRs this
# workflow evaluates are written by an agent. On 2026-09-04 an em dash reached
# PR #3443 and had to be stripped by hand at review time.
#
# The real fix is upstream: the self-healing prompts now run
# claude-plugins/inki/scripts/style-lint.sh before committing, so an em dash should
# never reach a PR in the first place. This check is the net under that, and it is
# only ever a test: it reports, it never edits the PR.
#
# Both spellings count. `&mdash;`, `&#8212;` and `&#x2014;` render as the same
# character in MDX, so they are the same violation as the literal one.
#
# Not in scope: the double hyphen ( -- ), which style-lint.sh also rejects but which
# is a separate criterion, and the en dash, which is not a documented violation.
#
# Two exclusions, matching style-lint.sh:
#   - fenced code blocks, where an em dash is data rather than prose
#   - URLs, where it is part of an address and cannot be rewritten

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

DIFF=$(pr_diff "$PR") || unknown "cannot read the diff of $REPO#$PR"

EM_DASH=$'\xe2\x80\x94'

FOUND=$(echo "$DIFF" | EM_DASH="$EM_DASH" awk '
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

  # Added line, outside a fence.
  /^\+/ && !in_fence {
    line = substr($0, 2)

    # Blank out URLs first: an em dash inside an address is not prose we can
    # rewrite, and neither is one inside an entity-looking query string.
    stripped = line
    gsub(/https?:\/\/[^[:space:])"]*/, " ", stripped)

    if (index(stripped, ENVIRON["EM_DASH"]) > 0) { print line; next }
    if (tolower(stripped) ~ /&(mdash|#8212|#x2014);/) { print line }
  }
')

if [ -n "$FOUND" ]; then
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  FIRST=$(echo "$FOUND" | head -1 | cut -c1-70)
  fail "adds $COUNT line(s) containing an em dash, first: $FIRST"
fi

pass "adds no em dash"
