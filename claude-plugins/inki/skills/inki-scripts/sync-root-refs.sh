#!/usr/bin/env bash
# sync-root-refs.sh — Mirror canonical root reference files into the inki plugin.
# The repo root is the canonical source; the plugin's references/ holds copies for plugin autonomy.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ] || [ ! -d "$REPO_ROOT/docusaurus/docs" ]; then
  echo "error: run this script from inside a strapi/documentation clone" >&2
  exit 1
fi
PLUGIN_REFS="$REPO_ROOT/claude-plugins/inki/skills/inki-references"

mkdir -p "$PLUGIN_REFS"

for f in git-rules.md 12-rules-of-technical-writing.md; do
  if [ -f "$REPO_ROOT/$f" ]; then
    cp "$REPO_ROOT/$f" "$PLUGIN_REFS/$f"
  fi
done

echo "Synced root refs into $PLUGIN_REFS"
