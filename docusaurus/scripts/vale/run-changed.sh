#!/usr/bin/env bash
# Lint only changed documentation files (for PRs). Exits 0 when nothing changed.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCUSAURUS_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

BASE_REF="${VALE_BASE_REF:-origin/main}"

cd "${DOCUSAURUS_DIR}/.."
git fetch origin main --quiet 2>/dev/null || true

FILES=()
while IFS= read -r file; do
  [[ -n "${file}" ]] && FILES+=("${file}")
done < <(git diff --name-only "${BASE_REF}"...HEAD 2>/dev/null | grep -E '^docusaurus/docs/.*\.(md|mdx)$' | sed 's|^docusaurus/||' || true)

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No changed documentation files under docusaurus/docs/."
  exit 0
fi

echo "Checking ${#FILES[@]} changed file(s)..."
exec "${SCRIPT_DIR}/run.sh" "${FILES[@]}"
