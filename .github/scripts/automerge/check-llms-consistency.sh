#!/usr/bin/env bash
#
# Criterion 8 — the committed llms*.txt files match a fresh regeneration.
#
# These files are generated from the documentation, so the question is not
# "does the diff look plausible" but "does running the generator reproduce
# exactly what was committed". Anything else means they were hand-edited or are
# stale relative to the page the PR changes.
#
# Unlike the other seven checks this one needs the repository and a yarn
# install, so it runs inside the workflow checkout rather than standalone. When
# a PR touches no llms file there is nothing to verify and it passes without
# building.
#
# Usage:
#   check-llms-consistency.sh <pr-number>            # inspect only, in a repo checkout
#   AUTOMERGE_REGENERATE=1 check-llms-consistency.sh <pr-number>   # actually rebuild

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

FILES=$(pr_files "$PR") || unknown "cannot read files of $REPO#$PR"

TOUCHED=$(echo "$FILES" | jq -r '[.[] | select(.filename | test("llms.*\\.txt$")) | .filename] | join(", ")')

if [ -z "$TOUCHED" ]; then
  pass "touches no generated llms file, nothing to verify"
fi

if [ "${AUTOMERGE_REGENERATE:-0}" != "1" ]; then
  unknown "touches generated files ($TOUCHED) but regeneration was not requested; set AUTOMERGE_REGENERATE=1 inside a repository checkout"
fi

# From here on we need to be in a checkout of the PR's head.
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || unknown "not inside a git repository"
cd "$REPO_ROOT/docusaurus" || unknown "no docusaurus directory at $REPO_ROOT"

if ! command -v yarn > /dev/null 2>&1; then
  unknown "yarn is not available"
fi

echo "Regenerating llms files..."
if ! yarn llms:generate-and-validate > /tmp/llms-regen.log 2>&1; then
  unknown "regeneration failed: $(tail -3 /tmp/llms-regen.log | tr '\n' ' ')"
fi

DRIFT=$(git diff --name-only -- 'static/llms*.txt')

if [ -n "$DRIFT" ]; then
  fail "committed llms files differ from a fresh regeneration: $(echo "$DRIFT" | tr '\n' ' ')"
fi

pass "llms files reproduce exactly ($TOUCHED)"
