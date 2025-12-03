#!/usr/bin/env bash
set -euo pipefail

# Root-level wrapper for the Strapi release analyzer.
# Usage: ./analyze-strapi-release-impact.sh [<github-release-url>]
# If no URL is provided, the analyzer auto-detects the latest strapi/strapi release.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/docusaurus/scripts/strapi-release-analyzer/index.js"

exec node "$NODE_SCRIPT" "$@"

