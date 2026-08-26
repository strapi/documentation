#!/usr/bin/env bash
#
# Criterion 11 — the PR must not be a pure deletion.
#
# Deleting documentation is an editorial act: someone decided the content was
# wrong, obsolete, or redundant. Without this check a PR could quietly delete a
# paragraph and still satisfy every other criterion, since it would be one small
# edit to an existing page.
#
# The test is deliberately narrow: it fails only when the PR removes lines and
# adds none. Rewriting is not deletion — a unified diff renders any edited line
# as a '-' followed by a '+', so a stricter rule would block ordinary rewording.
# In the clean corpus, #3164 (+7/-1) and #3112 (+1/-1) are exactly that shape and
# must stay eligible.
#
# Generated llms*.txt churn is excluded; only the documentation file counts.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

FILES=$(pr_files "$PR") || unknown "cannot read files of $REPO#$PR"

ADDED=0
REMOVED=0
while IFS=$'\t' read -r path add del; do
  [ -z "$path" ] && continue
  is_llms_file "$path" && continue
  ADDED=$((ADDED + add))
  REMOVED=$((REMOVED + del))
done < <(echo "$FILES" | jq -r '.[] | [.filename, .additions, .deletions] | @tsv')

if [ "$REMOVED" -gt 0 ] && [ "$ADDED" -eq 0 ]; then
  fail "only removes content ($REMOVED line(s) deleted, none added)"
fi

pass "not a pure deletion (+$ADDED/-$REMOVED)"
