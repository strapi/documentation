# Strapi Release Analyzer — Documentation Impact

This script analyzes a Strapi GitHub release and explains, for each merged pull request, whether documentation is likely required. It combines lightweight heuristics with a grounded LLM call, applies conservative guardrails, and produces a human‑readable report. Teams can use it as a pre‑release checklist to spot pages that should be updated or created.

The tool reads the release notes from GitHub, extracts the referenced PRs, inspects their titles, bodies and changed files, and then correlates the result with the existing documentation index built from `llms-full.txt`. When the heuristics indicate that a change might be docs‑worthy, the script asks the LLM for a minimal JSON suggestion (summary, rationale and proposed target pages). The suggestion is then verified and possibly downgraded using conservative rules to avoid false positives.

## Running the analyzer

This tool is a Node.js script. It requires network access to GitHub and (optionally) an LLM provider. From the repository root:

1) Install and enter the analyzer directory

`cd docusaurus/scripts/strapi-release-analyzer && npm ci`

2) Run on a specific release URL or let it auto‑detect the latest Strapi release

`node index.js <github-release-url>`

or

`npm start -- <github-release-url>`

Notes:
- If you omit the release URL entirely, the tool auto‑fetches the latest release from `strapi/strapi`.
- By default, a run is “fresh”: it recomputes everything and overwrites prior cache entries.

Useful flags:
- `--use-cache` reuses previous results and skips recomputation where possible (disables the default fresh run).
- `--limit=N` caps the number of PRs for which an LLM call is made; all PRs still go through heuristics. Use `--limit=0` or `--no-llm-call` for a heuristics‑only pass (no LLM key required).
- `--quiet` shows a compact progress bar only.
- `--strict=conservative|balanced|aggressive` tunes routing and downgrades (default: conservative).
- `--model=NAME` overrides the default Claude model (also configurable via `CLAUDE_MODEL`).
- `--cache-dir=PATH` specifies where cached PR analyses are stored.

Environment variables:
- `ANTHROPIC_API_KEY` is required when LLM calls are enabled (i.e., when `--limit` is not `0`).
- `GITHUB_TOKEN` is optional but recommended to increase GitHub API rate limits.

## What the script produces

While it runs, the analyzer prints a per‑PR log that shows how each decision was made. It always ends with a final verdict and an icon: ✅ means the PR likely requires documentation, ❌ means it does not, and ⚠️ indicates uncertainty. At the end of the run, the terminal summarizes how many PRs were analyzed, how many were skipped (tests, CI, chores) and how many “might require docs updates”.

The scripts generate a Markdown report saved under `release-analysis/<tag>-doc-analysis.md`. The report starts with totals and a single line that tells you how many PRs are considered docs‑worthy. It then groups items into “Requires Docs Updates (Yes)” and “No Docs Updates (No)”. Each Yes item includes a concise summary of what changed, a short decision rationale, and the suggested documentation targets. Each No item explains the decision type (heuristic‑only or LLM‑assisted), shows the initial LLM verdict if relevant, then states the final verdict and a single, merged reason. The goal is to be skimmable while preserving enough context to audit the call.

## How decisions are made

The process has five phases:
1. The script parses the release notes and fetches the referenced PRs, including their changed files.
2. It performs a quick heuristic triage: it derives a one‑line summary, classifies the likely impact (user‑facing or not), and proposes a handful of candidate documentation pages by token similarity.
3. Under conservative policy, it applies obvious “No” gates before calling the LLM: purely cosmetic UI changes, restore‑to‑expected behavior and bug‑like PRs with weak signals are filtered out here.
4. If a PR survives routing, the script calls the LLM with a grounded prompt and a minimal JSON contract that asks for a summary, a yes/no decision, an optional request for a new page, a rationale and a list of target docs paths and anchors.
5. The suggestion is verified and possibly downgraded: UI‑only or regression changes are rejected, targets must resolve to known docs pages unless a new page is explicitly requested, section‑heavy pages must include anchors, and a coverage cross‑check against `llms-full.txt` can veto fixes that merely restore already‑documented behavior.

The conservative policy includes narrow, positive signals that allow “Yes” to survive when the change introduces new capabilities or configuration:
• configuration and environment flags; routes, controllers and HTTP methods; GraphQL or OpenAPI schema changes; CLI flags and options; content‑type schema changes; migration and deprecation cues;
• security and deployment changes such as `ctx.request.secure`, “trust proxy”, SameSite and secure cookies, JWT/session and related authentication tokens;
• upload‑plugin restrictions that add MIME or file‑type allow/deny rules.

There are also explicit exceptions. Feature parity restorations for configurable features (for example, a “v4 → v5” restoration of a configuration field in the Content Manager) are treated as docs‑worthy even if the PR is labeled as a fix. Upload file‑type restriction changes are likewise preserved as docs‑worthy. On the other hand, pure locale additions are excluded under conservative policy because they rarely merit a documentation change beyond internal lists.

## Documentation index (llms‑full.txt)

The analyzer cross‑references candidate documentation pages against a prebuilt index from `llms-full.txt`. On startup it looks for this file in common locations and falls back to `llms.txt` if needed:

- `static/llms-full.txt`
- `docusaurus/static/llms-full.txt`
- repository root `llms-full.txt`

If none of these are found, the run continues without the index, which weakens page‑target suggestions and anchor checks but still yields useful heuristics.

## Internals you might care about

The code is modular. The entrypoint orchestrates the run, while small modules handle specialized tasks:

- Prompts: `prompts/claude.js` builds the grounded LLM prompt used for suggestions.
- Config: `config/constants.js` centralizes tunable patterns and keywords; `config/reasons.js` maps internal reason codes to concise text; `config/messages.js` holds CLI usage and error strings.
- Utils:
  - `utils/detectors.js` contains the routing/downgrade detectors (`hasStrongDocsSignals`, `isMicroUiChange`, `isRegressionRestore`, `isFeatureParityRestoration`, `isUploadRestriction`).
  - `utils/tokens.js` provides `tokenize` and `collectHighSignalTokens` used for lightweight similarity and coverage checks.
  - `utils/classify.js` implements `classifyImpact` and `categorizePRByDocumentation`.
  - `utils/pages.js` resolves suggested target pages from `llms-full.txt` and proposes candidates.

The main loop in `index.js` applies pre‑LLM gates, decides whether to call the LLM, and then applies post‑LLM guards before writing the report. Strictness is set to conservative by default, which also collapses any residual “Maybe” outcomes into “No” in both the terminal and the Markdown report.

## Troubleshooting and tuning
If the report contains too many “Yes” entries, tighten strong‑signal detection or increase coverage thresholds. If it contains too many “No” entries, extend strong signals for the affected domain (for example, add a security/configuration token) or add a narrow exception similar to the upload‑restriction rule. To gauge distribution without cost, use `--limit=0`. While iterating on heuristics, keep the default fresh run; re‑enable caching with `--use-cache` for stable, repeatable comparisons.
