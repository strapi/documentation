#!/usr/bin/env bash
#
# Shared helpers for the auto-merge eligibility checks.
#
# Every check script sources this file, takes a PR number as its only argument,
# and exits:
#   0 — criterion satisfied (this check does not block auto-merge)
#   1 — criterion violated (auto-merge must not happen)
#   2 — the check could not run (missing tool, API failure, bad usage)
#
# Exit 2 matters: "I cannot tell" is never the same answer as "this is fine".
# The caller must treat 2 as blocking, but report it differently from 1.

REPO="${AUTOMERGE_REPO:-strapi/documentation}"

# Paths that may appear in an auto-mergeable PR.
DOC_PREFIXES=("docusaurus/docs/cms/" "docusaurus/docs/cloud/")
LLMS_PATTERN="^docusaurus/static/llms.*\.txt$"

die_usage() {
  echo "usage: $(basename "$0") <pr-number>" >&2
  exit 2
}

# pass/fail/unknown print a one-line verdict and exit with the right code, so
# each script ends in a single readable statement.
pass()    { echo "PASS: $*"; exit 0; }
fail()    { echo "FAIL: $*"; exit 1; }
unknown() { echo "UNKNOWN: $*" >&2; exit 2; }

require_pr_number() {
  [ -n "${1:-}" ] || die_usage
  case "$1" in
    ''|*[!0-9]*) die_usage ;;
  esac
}

# Fetch the list of changed files once and cache it per PR, so running all
# eight checks on one PR costs one API call for files rather than eight.
#
# Uses the REST endpoint rather than `gh pr view --json files`: the latter only
# returns path/additions/deletions, while REST also returns `status`
# (added/modified/removed/renamed), which criterion 3 needs to tell a new page
# from an edited one.
#
# Each element: {filename, status, additions, deletions}
pr_files() {
  local pr="$1"
  local cache="${TMPDIR:-/tmp}/automerge-files-$pr.json"

  if [ ! -s "$cache" ]; then
    if ! gh api "repos/$REPO/pulls/$pr/files" --paginate \
      --jq '[.[] | {filename, status, additions, deletions}]' > "$cache" 2>/dev/null; then
      rm -f "$cache"
      return 1
    fi
  fi
  cat "$cache"
}

# Same caching for the diff. Checks 5, 6 and 7 all parse it.
pr_diff() {
  local pr="$1"
  local cache="${TMPDIR:-/tmp}/automerge-diff-$pr.patch"

  if [ ! -s "$cache" ]; then
    if ! gh pr diff "$pr" --repo "$REPO" > "$cache" 2>/dev/null; then
      rm -f "$cache"
      return 1
    fi
  fi
  cat "$cache"
}

is_llms_file() {
  [[ "$1" =~ $LLMS_PATTERN ]]
}

is_doc_file() {
  local path="$1"
  local prefix
  for prefix in "${DOC_PREFIXES[@]}"; do
    case "$path" in
      "$prefix"*) return 0 ;;
    esac
  done
  return 1
}

# Added lines only, with the leading '+' stripped. Excludes the +++ file header.
added_lines() {
  grep -E '^\+' | grep -v '^+++' | sed 's/^+//'
}
