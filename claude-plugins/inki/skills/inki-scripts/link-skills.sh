#!/usr/bin/env bash
# link-skills.sh — Expose the Inki skills and agents in each agent's well-known folder.
# claude-plugins/inki/ is the single source of truth; the links are committed.
#
# Usage:
#   ./link-skills.sh           # create missing links, replace stale ones, prune dead inki-* links
#   ./link-skills.sh --check   # report problems only; exit 1 if any

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SKILL_DIRS=(.claude/skills .agents/skills .cursor/skills)
AGENT_DIRS=(.claude/agents)

CHECK=false
[ "${1:-}" = "--check" ] && CHECK=true
PROBLEMS=0

cd "$REPO_ROOT"

# ensure_link <link path> <relative target>
ensure_link() {
  local link="$1" target="$2"
  if [ -L "$link" ] && [ "$(readlink "$link")" = "$target" ]; then
    return
  fi
  if $CHECK; then
    echo "missing or stale: $link -> $target"
    PROBLEMS=$((PROBLEMS + 1))
    return
  fi
  if [ -e "$link" ] && [ ! -L "$link" ]; then
    echo "error: $link exists and is not a link; remove it first" >&2
    exit 1
  fi
  ln -sfn "$target" "$link"
  echo "linked: $link -> $target"
}

# prune_dead <dir>: remove inki-* links whose target no longer exists
prune_dead() {
  local dir="$1" link
  for link in "$dir"/inki-*; do
    [ -L "$link" ] || continue
    [ -e "$link" ] && continue
    if $CHECK; then
      echo "dead: $link"
      PROBLEMS=$((PROBLEMS + 1))
    else
      rm "$link"
      echo "pruned: $link"
    fi
  done
}

for dir in "${SKILL_DIRS[@]}"; do
  $CHECK || mkdir -p "$dir"
  for skill in claude-plugins/inki/skills/inki-*/; do
    name="$(basename "$skill")"
    ensure_link "$dir/$name" "../../claude-plugins/inki/skills/$name"
  done
  [ -d "$dir" ] && prune_dead "$dir"
done

for dir in "${AGENT_DIRS[@]}"; do
  $CHECK || mkdir -p "$dir"
  for agent in claude-plugins/inki/agents/inki-*.md; do
    name="$(basename "$agent")"
    ensure_link "$dir/$name" "../../claude-plugins/inki/agents/$name"
  done
  [ -d "$dir" ] && prune_dead "$dir"
done

if $CHECK; then
  if [ "$PROBLEMS" -gt 0 ]; then
    echo "$PROBLEMS link problem(s). Run claude-plugins/inki/skills/inki-scripts/link-skills.sh to fix."
    exit 1
  fi
  echo "All Inki links are in place."
fi
