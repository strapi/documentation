#!/usr/bin/env bash
set -euo pipefail

# Wrapper executable for the Node analyzer to allow ./strapi-release-analyzer.sh ...
# Passes through all arguments. Detects repo root relative to this script.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/index.js"

exec node "$NODE_SCRIPT" "$@"

