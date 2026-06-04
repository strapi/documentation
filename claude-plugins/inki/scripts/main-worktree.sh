#!/usr/bin/env bash
# main-worktree.sh — Helper to manage a temporary, detached git worktree on origin/main.
#
# Used to review a published page (resolved from a docs.strapi.io URL) against the
# version on origin/main, with the file at its real path inside docusaurus/docs/ so
# that coherence-check and code-verify can resolve relative links and sibling pages.
#
# Subcommands:
#   create   Fetch origin/main and create a detached worktree at /tmp/inki-review-main.
#            Prints the worktree path on stdout.
#   destroy  Remove the worktree.
#
# Usage in a skill (bash):
#   WORKTREE=$(./main-worktree.sh create)
#   # ... review files inside $WORKTREE (e.g. $WORKTREE/docusaurus/docs/<path>) ...
#   ./main-worktree.sh destroy
#
# Detached (no temporary branch): the worktree only needs to read origin/main, never commit.

set -euo pipefail

usage() {
  echo "Usage: $0 {create|destroy}" >&2
  exit 1
}

[ $# -eq 1 ] || usage
ACTION="$1"

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
WORKTREE_DIR="/tmp/inki-review-main"

case "$ACTION" in
  create)
    # Clean up any leftover from a previous run.
    git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_DIR" 2>/dev/null || true
    rm -rf "$WORKTREE_DIR"

    # Refresh origin/main, then create a detached worktree pointing at it.
    git -C "$REPO_ROOT" fetch origin main >&2
    git -C "$REPO_ROOT" worktree add --detach "$WORKTREE_DIR" origin/main >&2
    echo "$WORKTREE_DIR"
    ;;
  destroy)
    git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_DIR" 2>/dev/null || true
    ;;
  *)
    usage
    ;;
esac
