#!/usr/bin/env bash
#
# Criterion 2 — exactly one documentation file is changed.
#
# Generated llms*.txt files do not count towards the total: they are a
# mechanical by-product of editing a page, not a second edit.
#
# In the backtest, every PR that touched several pages needed the maintainer.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

FILES=$(pr_files "$PR") || unknown "cannot read files of $REPO#$PR"

DOC_FILES=()
while IFS= read -r path; do
  [ -z "$path" ] && continue
  is_llms_file "$path" && continue
  DOC_FILES+=("$path")
done < <(echo "$FILES" | jq -r '.[].filename')

COUNT=${#DOC_FILES[@]}

if [ "$COUNT" -eq 0 ]; then
  fail "changes no documentation file (only generated files?)"
fi

if [ "$COUNT" -gt 1 ]; then
  fail "changes $COUNT documentation files: $(IFS=', '; echo "${DOC_FILES[*]}")"
fi

pass "changes exactly one documentation file: ${DOC_FILES[0]}"
