#!/usr/bin/env bash
# sync-root-refs.sh — Mirror canonical root reference files into the inki plugin.
# The repo root is the canonical source; the plugin's references/ holds copies for plugin autonomy.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
PLUGIN_REFS="$REPO_ROOT/claude-plugins/inki/references"

mkdir -p "$PLUGIN_REFS"

for f in git-rules.md 12-rules-of-technical-writing.md; do
  if [ -f "$REPO_ROOT/$f" ]; then
    cp "$REPO_ROOT/$f" "$PLUGIN_REFS/$f"
  fi
done

echo "Synced root refs into $PLUGIN_REFS"
