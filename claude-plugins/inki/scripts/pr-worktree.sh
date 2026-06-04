#!/usr/bin/env bash
# pr-worktree.sh — Helper to manage a temporary git worktree for reviewing a PR.
#
# Subcommands:
#   create <pr-num>   Fetch the PR head and create a worktree at /tmp/inki-review-pr-<pr-num>.
#                    Prints the worktree path on stdout.
#   destroy <pr-num>  Remove the worktree and the temporary branch.
#
# Usage in a skill (bash):
#   WORKTREE=$(./pr-worktree.sh create 3204)
#   trap "$(dirname "$0")/pr-worktree.sh destroy 3204" EXIT
#   # ... run sub-skills on files inside $WORKTREE ...
#
# The temporary branch is named `inki-tmp-review-<pr-num>` and points to the PR head.
# The worktree path is /tmp/inki-review-pr-<pr-num>.

set -euo pipefail

usage() {
  echo "Usage: $0 {create|destroy} <pr-num>" >&2
  exit 1
}

[ $# -eq 2 ] || usage
ACTION="$1"
PR_NUM="$2"

[[ "$PR_NUM" =~ ^[0-9]+$ ]] || { echo "PR number must be numeric: $PR_NUM" >&2; exit 1; }

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
WORKTREE_DIR="/tmp/inki-review-pr-${PR_NUM}"
TMP_BRANCH="inki-tmp-review-${PR_NUM}"

case "$ACTION" in
  create)
    # Clean up any leftover from a previous run.
    git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_DIR" 2>/dev/null || true
    git -C "$REPO_ROOT" branch -D "$TMP_BRANCH" 2>/dev/null || true
    rm -rf "$WORKTREE_DIR"

    # Fetch the PR head into a local branch, then create the worktree.
    git -C "$REPO_ROOT" fetch origin "pull/${PR_NUM}/head:${TMP_BRANCH}" >&2
    git -C "$REPO_ROOT" worktree add "$WORKTREE_DIR" "$TMP_BRANCH" >&2
    echo "$WORKTREE_DIR"
    ;;
  destroy)
    git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_DIR" 2>/dev/null || true
    git -C "$REPO_ROOT" branch -D "$TMP_BRANCH" 2>/dev/null || true
    ;;
  *)
    usage
    ;;
esac
