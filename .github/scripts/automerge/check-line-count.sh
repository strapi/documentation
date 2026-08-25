#!/usr/bin/env bash
#
# Criterion 4 — at most MAX_LINES changed lines (additions + deletions) in the
# documentation file. Generated llms*.txt churn is excluded.
#
# This threshold predicts nothing about quality: in the backtest a +91-line PR
# was merged untouched while a +4-line one drew the longest technical objection.
# It exists to bound the blast radius of a bad merge, not to judge the content.
#
# 30 comes from the observed distribution of clean single-file merges
# (1, 1, 2, 4, 4, 4, 6, 6, 8, 18, 24, 27, 41, 47): a natural break sits between
# 8 and 18, and 30 keeps 12 of 14 while excluding the two largest.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

MAX_LINES="${AUTOMERGE_MAX_LINES:-30}"

PR="${1:-}"
require_pr_number "$PR"

FILES=$(pr_files "$PR") || unknown "cannot read files of $REPO#$PR"

TOTAL=0
while IFS=$'\t' read -r path add del; do
  [ -z "$path" ] && continue
  is_llms_file "$path" && continue
  TOTAL=$((TOTAL + add + del))
done < <(echo "$FILES" | jq -r '.[] | [.filename, .additions, .deletions] | @tsv')

if [ "$TOTAL" -gt "$MAX_LINES" ]; then
  fail "changes $TOTAL lines, over the $MAX_LINES-line limit"
fi

pass "changes $TOTAL lines, within the $MAX_LINES-line limit"
