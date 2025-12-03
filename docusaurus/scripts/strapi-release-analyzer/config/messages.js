// Central CLI usage and error messages
//
// What this file is for
// - Keep all user‑facing CLI strings in one place so they’re easy to tweak
//   and (optionally) localize later.
//
// Where it’s used
// - index.js → main() prints these when required inputs or environment are
//   missing, or to show usage and helpful hints.

export const USAGE = '❌ Usage: node index.js <github-release-url> [--use-cache] [--cache-dir=PATH] [--limit=N-for-LLM] [--no-llm-call] [--strict=aggressive|balanced|conservative] [--model=NAME]'
export const USAGE_DEFAULTS = 'Defaults: fresh run (no cache reads) and refresh writes. Use --use-cache to enable reading existing cache and skip refresh.'
export const USAGE_EXAMPLE = 'Example: node index.js https://github.com/strapi/strapi/releases/tag/v5.29.0 --strict=aggressive'
export const USAGE_HINT = 'Note: All PRs are screened heuristically; --limit caps only LLM calls. Use --limit=0 for heuristics only (no ANTHROPIC_API_KEY required).'

export const WARN_NO_GITHUB_TOKEN = '⚠️  GITHUB_TOKEN not set — proceeding unauthenticated (lower rate limits)'

export const ERR_NEED_ANTHROPIC = '❌ ANTHROPIC_API_KEY is required when LLM calls are enabled'
export const ERR_NEED_LIMIT_ZERO_HINT = 'Set --limit=0 to run heuristics only without an Anthropic key.'
