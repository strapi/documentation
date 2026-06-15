#!/usr/bin/env bash
# gen-commands.sh -- Generate COMMANDS.md from each skill's SKILL.md frontmatter.
#
# Source of truth is the frontmatter of every skills/<name>/SKILL.md
# (name, description, argument-hint). This script only assembles them, so there
# is no separate copy to keep in sync: edit a skill's frontmatter, re-run this.
#
# Usage: ./scripts/gen-commands.sh        # writes ../COMMANDS.md
#        ./scripts/gen-commands.sh --check # exits non-zero if COMMANDS.md is stale
#
# macOS-compatible (bash 3.2, awk, sed).

set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
SKILLS_DIR="$PLUGIN_DIR/skills"
OUT="$PLUGIN_DIR/COMMANDS.md"

# Extract a single frontmatter field value from a SKILL.md.
# Strips surrounding quotes. Reads only the first YAML block (between the first two --- lines).
field() {
  local file="$1" key="$2"
  awk -v key="$key" '
    /^---[[:space:]]*$/ { c++; next }
    c==1 {
      # match "key:" at line start
      if ($0 ~ "^" key ":[[:space:]]") {
        sub("^" key ":[[:space:]]*", "")
        # strip surrounding double quotes
        gsub(/^"|"$/, "")
        print
        exit
      }
    }
  ' "$file"
}

# Order families and their skills explicitly so the doc reads top-down like the workflow.
# Format: "Heading|skill1 skill2 ..."
FAMILIES=(
  "Document — the full chain in one command|document"
  "Research — figure out where the doc goes|research exists route coverage"
  "Write — produce new content|write outline draft"
  "Review — check what you wrote|review style-check outline-check outline-ux-analyzer code-verify coherence-check pitfalls-check pitfalls-add"
  "Submit — get it to GitHub|submit branch commit push pr pr-fix"
)

emit() {
  cat <<'HEADER'
<!-- GENERATED FILE — do not edit by hand.
     Source: each skills/<name>/SKILL.md frontmatter. Regenerate with scripts/gen-commands.sh. -->

# Inki command reference

Every Inki skill is invoked as `/inki:<skill>`. This page lists each command, what it does, and its argument signature. For the shared flags (`--auto-approve`, `--no-log`, `--short-log`, `--log-dir`), see the "Common flags" section of the [README](./README.md). Typing `/inki:<skill> --help` also prints a command's usage.

HEADER

  local entry heading skills name desc hint
  for entry in "${FAMILIES[@]}"; do
    heading="${entry%%|*}"
    skills="${entry#*|}"
    printf '## %s\n\n' "$heading"
    for name in $skills; do
      local file="$SKILLS_DIR/$name/SKILL.md"
      [ -f "$file" ] || { printf -- '- `/inki:%s` — (missing SKILL.md)\n' "$name" >&2; continue; }
      desc="$(field "$file" description)"
      hint="$(field "$file" argument-hint)"
      printf '### `/inki:%s`\n\n' "$name"
      printf '%s\n\n' "$desc"
      if [ -n "$hint" ]; then
        printf '```\n/inki:%s %s\n```\n\n' "$name" "$hint"
      else
        printf '```\n/inki:%s\n```\n\n' "$name"
      fi
    done
  done
}

if [ "${1:-}" = "--check" ]; then
  tmp="$(mktemp)"
  emit > "$tmp"
  if ! diff -q "$tmp" "$OUT" >/dev/null 2>&1; then
    echo "COMMANDS.md is stale. Run scripts/gen-commands.sh to regenerate." >&2
    rm -f "$tmp"
    exit 1
  fi
  rm -f "$tmp"
  echo "COMMANDS.md is up to date."
  exit 0
fi

emit > "$OUT"
echo "Wrote $OUT"
