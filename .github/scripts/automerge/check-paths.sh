#!/usr/bin/env bash
#
# Criterion 1 — every changed file is either a CMS/Cloud doc page or a generated
# llms*.txt file.
#
# This is the criterion that keeps the whole gate narrow. It excludes
# sidebars.js, workflows, components, styles, snippets and static assets without
# naming any of them: anything outside the two documentation trees fails.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

FILES=$(pr_files "$PR") || unknown "cannot read files of $REPO#$PR"

OFFENDERS=""
while IFS= read -r path; do
  [ -z "$path" ] && continue
  if is_doc_file "$path" || is_llms_file "$path"; then
    continue
  fi
  OFFENDERS="${OFFENDERS}${path}, "
done < <(echo "$FILES" | jq -r '.[].filename')

if [ -n "$OFFENDERS" ]; then
  fail "changes files outside docs/cms and docs/cloud: ${OFFENDERS%, }"
fi

pass "all changed files are under docs/cms, docs/cloud, or are generated llms files"
