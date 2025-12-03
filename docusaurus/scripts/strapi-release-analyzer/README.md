# Strapi Release Analyzer — Documentation Impact

This tool scans a Strapi GitHub release and triages merged PRs by whether they likely require documentation updates. It produces:

- A terminal summary with per‑PR verdicts (✅ Yes, ❌ No, ⚠️ Maybe)
- A Markdown report saved to `release-analysis/<tag>-doc-analysis.md`

## Quick start

- Fresh LLM run (default: fresh/no cache):
  - `node docusaurus/scripts/strapi-release-analyzer/index.js <github-release-url>`
- Heuristics‑only (no LLM calls):
  - `node docusaurus/scripts/strapi-release-analyzer/index.js <github-release-url> --limit=0`
- Reuse previous cache (opt‑in):
  - `node docusaurus/scripts/strapi-release-analyzer/index.js <github-release-url> --use-cache`

Environment:
- `ANTHROPIC_API_KEY` required unless using `--limit=0`
- `GITHUB_TOKEN` recommended to avoid rate limits

## CLI flags

- `--use-cache` Use cached PR analyses and LLM results when available
- `--limit=0`   Heuristics‑only mode (no LLM calls)
- `--strict=conservative|balanced|aggressive` Strictness of downgrades (default: conservative)
- `--model=NAME` Override LLM model (default set in script)

Defaults: a plain run is fresh (recomputes, does not read cache) and writes results to a versioned cache folder `.cache/v2/<tag>/`.

## Output

Terminal per‑PR lines:
- Shows analysis provenance, any downgrade notes, and a Final verdict with icon
- Footer includes counts for Analyzed, Skipped, and how many PRs might require docs updates

Markdown report:
- Header: totals + “PRs that might require docs updates: N”
- Sections:
  - “Requires Docs Updates (Yes)” — PR, 📝 Summary, 🧠 Decision rationale, 📌 Targets
  - “No Docs Updates (No)” — PR, 📝 Summary, 🧭 Decision type, 🧪 Initial LLM verdict (if any), ❌ Final verdict, 🧠 Reason
  - “Uncertain (Maybe)” — included only if any remain

## How decisions are made

1) Parse release and fetch PRs
2) Heuristic triage (classify impact, suggest candidate docs pages)
3) Conservative pre‑LLM gates (obvious No)
   - Micro UI‑only changes
   - Regression/restore to expected behavior
   - Bug‑like with weak signals
4) LLM suggestions (when allowed by routing)
   - Minimal contract: `summary`, `needsDocs`, `docsWorthy`, `newPage`, `rationale`, `targets[]`
5) Conservative post‑LLM downgrades
   - Micro UI‑only or regression
   - Coverage likely already present in `llms-full.txt`
   - Invalid/unresolvable targets without `newPage`
   - Section‑heavy pages lacking anchors
   - Bug‑like without strong signals (see exceptions below)

### Strong signals and exceptions

Strong docs‑worthy signals (hasStrongDocsSignals):
- Config/env changes; server routes/controllers; HTTP verbs/paths; GraphQL/REST schema
- CLI flags/options
- Content‑type schema changes (attributes/type/enum/relation)
- Migration/breaking language (breaking, deprecate, rename setting, v4→v5)
- Security/auth/proxy tokens (ctx.request.secure, trust proxy, SameSite, JWT, session)
- Upload MIME/file‑type restrictions (allowedTypes/deniedTypes, mime/mimetype, content‑type)

Exceptions (conservative mode):
- Feature parity restorations for configurable features (e.g., v4→v5 parity, restored/missing field)
- Upload restriction PRs (treated as docs‑worthy security/config)
- Pure locale additions are excluded as docs‑worthy

## Key functions (map)

- `main()` — Orchestrates the run, prints terminal summary, writes report
- `parseReleaseNotes()` — Reads GitHub release, extracts PR numbers
- `analyzePR()` — Fetches PR details/files; applies skip rules; returns normalized analysis
- `generateDocSuggestionsWithClaude()` — Calls LLM with rubric and minimal JSON contract
- `generateMarkdownReport()` — Builds the Markdown report from analyses
- `classifyImpact()` — Early heuristic for user‑facing vs non‑user‑facing changes
- `hasStrongDocsSignals()` — Tight detector for config/API/schema/migration/security/upload signals
- `isMicroUiChange()` — Flags cosmetic/UI‑only edits
- `isRegressionRestore()` — Flags restore‑to‑expected behavior
- `isFeatureParityRestoration()` — Treats v4→v5 parity restorations as docs‑worthy
- `isUploadRestriction()` — Detects upload MIME/file‑type restriction PRs
- `isLocaleAddition()` — Excludes pure locale additions (conservative)
- `resolvePageForTarget()` — Maps suggested targets to known docs pages
- `readLlmsFullIndex()` — Loads `llms-full.txt` (grounding + coverage checks)

## Tips and troubleshooting

- Too many Yes verdicts? Tighten strong signals or raise coverage thresholds.
- Too many No verdicts (false negatives)? Extend strong signals for the affected domain or add a focused exception.
- Heuristics‑only dry run: `--limit=0` (useful without API keys)
- Cache behavior: plain run is fresh; add `--use-cache` to reuse prior results.

