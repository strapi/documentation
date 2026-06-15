# Inki Changelog

## Unreleased

### Added

- `/inki:document [--auto-approve] [--fix-rounds <N>] <subject>` skill: end-to-end orchestrator chaining all four families (research → write → review → submit) for a single subject. Gated between each phase by default; `--auto-approve` chains without pauses and runs a review-fix loop (review → apply fixes → re-review, up to `--fix-rounds` iterations, default 3). Stops if research finds the subject is already documented (no duplicate pages). The `<subject>` is flexible: keywords, a Notion page URL, a Linear issue, a PDF (path or URL), a local file, or pasted text.
- `references/subject-resolver.md`: centralized resolution of a *subject to document* into a normalized brief (keywords, Notion, Linear, PDF, local file, pasted content). Distinct from `target-resolver.md`, which resolves an existing file *to review*. Consumed by `/inki:document`.
- `/inki:pitfalls-add [--auto-approve] <pitfall>` skill: adds a new, source-verified entry to the known-pitfalls catalog. The writing counterpart to the read-only `pitfalls-checker` agent (which stays read-only and only suggests running this skill).
- Run logging: every run writes a verbose Markdown report tree to `~/.inki/logs/<YYYY-MM-DD-slug>/` with one subdirectory per phase (research/write/review/submit), including each reviewer agent's raw report by default. Overridable with `--log-dir <path>` or the `INKI_LOG_DIR` env var; never written inside the worked-on repo (`.inki/` is also gitignored as a safety net). `--no-log` disables it; `--short-log` trims to the consolidated per-phase reports. Centralized in `references/logging.md`.
- `agents/` layer: six read-only review subagents (`style-checker`, `outline-checker`, `ux-analyzer`, `code-verifier`, `coherence-checker`, `pitfalls-checker`), each with a write-excluding tool allowlist and a model tier matched to its task (opus for code/coherence/UX, sonnet for outline/pitfalls, haiku for style).
- `references/STYLE_GUIDE.pdf`: the authoritative Strapi style guide, synced from the repo root. Wired into the `style-checker` agent for formatting and capitalization judgment.
- `/inki:pr-fix <action>` skill, with `action` being `title`, `description`, or `body` (alias of `description`). Replaces the previous separate `pr-title-fix`, `pr-description-fix`, and `pr-body-fix` skills.
- `--auto-approve` non-interactive auto mode (with `--auto`, `--yes`, `-y` kept as aliases) on `/inki:document`, `/inki:pr-fix`, `/inki:review`, `/inki:submit`, `/inki:write`, and `/inki:outline`. Skips confirmation prompts so the skills can be chained or scripted.
- `--include-old` flag on `/inki:pr-fix`: when no PR IDs are listed, include open PRs older than 30 days. By default, stale PRs are excluded to avoid bumping them with a title/description change notification.
- Safety bracket on `--auto-approve` mode: when `--auto-approve` is used without explicit PR IDs, the skill presents a batch-review prompt (`y` / `n` / `s <PR#>` to skip individual items) before applying any edit.
- URL parsing across skills: `/inki:pr-fix`, `/inki:route`, and `/inki:review` accept bare PR numbers (`3204`), hashed numbers (`#3204`), full URLs (`https://github.com/.../pull/3204`), and URLs with sub-paths (`/files`, `/commits`).
- `references/target-resolver.md`: centralized target resolution for `/inki:review`. The skill now accepts a path, a directory, a bare markdown filename, a GitHub PR, a `docs.strapi.io` URL, pasted Markdown content, or no argument (changed files on the current branch).
- `scripts/main-worktree.sh` helper: create or destroy a detached `origin/main` worktree, used by `/inki:review` for docs.strapi.io URL resolution.
- `scripts/pr-worktree.sh` helper: create or destroy a PR-checkout worktree, used by `/inki:review` for PR-scope reviews.
- `scripts/style-lint.sh` migrated into the plugin (previously at the repo root). Wired into `/inki:style-check`. Added acronyms: JWKS, OIDC, JWE, JWS.
- Notation legend in the README to explain skill argument placeholders (`<arg>`, `[arg]`, etc.).

### Changed

- Renamed the first family from "Discover" to "Research" to align with the standard writer workflow (research → write → review → publish). The orchestrator slash command changed from `/inki:discover` to `/inki:research`. Sub-skills (`/inki:exists`, `/inki:coverage`, `/inki:route`) are unchanged.
- `/inki:review` now accepts more target types (path, directory, bare filename, PR, docs.strapi.io URL, pasted content, or no argument). Target resolution is centralized in `references/target-resolver.md`.
- `/inki:review` resolves a `docs.strapi.io` URL against the published `origin/main` source in a temporary worktree (never a stale working copy or a destructive pull), keeping coherence-check and code-verify fully functional, and flags local uncommitted changes that were excluded.
- `/inki:pr-fix description` (PR description rewrite): build the Vercel preview link from the bot comment when available (real host, including hash for long branch names), with the branch slug as a fallback for brand-new PRs. Verify the link returns HTTP 200 before publishing.
- PR recency filter on `/inki:pr-fix`: switched from `updatedAt` to `createdAt` so bot-bumped PRs are not incorrectly classified as recently active.
- Hardened `_shared/push-rules.md` and `_shared/pr-rules.md` to apply to forks (removed restrictive working-dir check on git skills) and to make the "Do not" lists explicit (each item now starts with "Do not").
- Read `git-rules.md` from `references/` instead of the repo root, so the plugin is autonomous.
- Removed references to private `strapi-docs-product-merger` repo from the plugin. Inki is now self-contained.
- Rewrote orphan `agents/...` paths in migrated prompts and authoring guides to use `inki/references/` consistently.

### Fixed

- `plugin.json` author field: expect object schema (`{ name }`), not string.
- Pitfalls catalog clarification: `known-pitfalls.md` is a reference catalog, not a prompt — the `pitfalls-check` skill loads it as data.
- `code-verify` and `coverage` skills: document the Strapi codebase prerequisite (path to a local clone or fallback to GitHub fetch).

## v0.1.0 — 2026-05-22

### Added

- Plugin scaffolding (`.claude-plugin/plugin.json`, README, CHANGELOG).
- Self-hosted marketplace manifest at `.claude-plugin/marketplace.json`.
- Research family: `/inki:research`, `/inki:exists`, `/inki:route`, `/inki:coverage`.
- Write family: `/inki:write`, `/inki:outline`, `/inki:draft`.
- Review family: `/inki:review`, `/inki:style-check`, `/inki:outline-check`, `/inki:outline-ux-analyzer`, `/inki:code-verify`, `/inki:coherence-check`, `/inki:pitfalls-check`.
- Submit family: `/inki:submit`, `/inki:branch`, `/inki:commit`, `/inki:push`, `/inki:pr`, `/inki:pr-fix <title|description|body>`.
- 1-way root → plugin sync GitHub Action with drift guard.
- Migration of prompts, templates, and authoring guides into `claude-plugins/inki/references/`.
- Pointer README at the previous location for backward discoverability.
