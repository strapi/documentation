# AGENTS.md (Repository-wide Agent Guide)

Scope and precedence
- This file applies to the entire repository.
- Subdirectory AGENTS.md files may add/override rules for their scope.

Execution policy and invariants
- Stack: prefer JavaScript/Node; do not introduce new languages without approval.
- Do not modify `llms-full.txt` generation.
- Claude links must use `q` on `/new`; ChatGPT uses its reviewed param; keep locale logic.
- Enable anchors and file checks by default for code extraction.

Accepted languages and file types
- Path‑based policy (applies to folders and all subfolders):
  - `src/` (and `docusaurus/src/` when applicable): allow `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, `.scss`, `.html`.
  - `docs/cms/`, `docs/cloud/`, `docs/snippets/`: allow only `.md`, `.mdx`.
  - `static/`: allow image assets (`.png`, `.svg`, `.gif`, `.jpg`), `.html`, `.js`.
  - `.github/workflows/`: allow only `.yml`.
- Also present elsewhere in the repo: `.scss`, `.css`, image assets (do not expand usage without approval).
- Not allowed without explicit approval: Python, Ruby, Go, Rust, etc. (no new stacks).

Key scripts and how to run
- `docusaurus/scripts/generate-llms.js` → generates `llms.txt` (uses <Tldr> when present).
- `docusaurus/scripts/generate-llms-code.js --anchors --check-files` → generates `llms-code.txt` with section anchors and file existence status.
- `docusaurus/scripts/validate-prompts.js` → validates prompt placeholders/structure.

File map (important paths)
- AI toolbar: `docusaurus/src/components/AiToolbar/openLLM.js`, `.../config/aiToolsConfig.js`, `.../config/aiPromptTemplates.js`.
- Generators/validators: `docusaurus/scripts/generate-llms-code.js`, `docusaurus/scripts/generate-llms.js`, `docusaurus/scripts/validate-prompts.js`.
 - Authoring templates: `agents/templates/*.md` (see `agents/templates/INDEX.md`).
 - Components guidance: `agents/templates/components/tabs.md` (Tabs/TabItem rules).

Output and communication expectations
- When asked, paste changed files or first 300 lines of generated artifacts.
- Use bullet lists for unordered information; numbers for sequences.
- Reference files with repo‑relative clickable paths.

PR and branch workflow
- Branch naming: `repo/agents-md-first-version` (this change) and `chore/*` for similar tasks.
- Always run the generators/validators before requesting review.

Security and tokens
- Never commit secrets. Use `GITHUB_TOKEN` env var if needed; least privilege; rotate/revoke after use.

Links
- Contributing guide: CONTRIBUTING.md
- Style guide (PDF): STYLE_GUIDE.pdf
- 12 Rules of Technical Writing: 12-rules-of-technical-writing.md (canonical)
- External reference: https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04

## Directory of AGENTS Guides

- CMS (canonical): `agents/cms/AGENTS.md`
- CMS – Concepts/Intro/Overview: `agents/cms/AGENTS.concepts.md`
- CMS – How‑to Guides: `agents/cms/AGENTS.guides.md`
- CMS – API docs: `agents/cms/api/AGENTS.md`
- CMS – Configurations: `agents/cms/configurations/AGENTS.md`
- CMS – Features: `agents/cms/features/AGENTS.md`
- CMS – Migration/Breaking Changes: `agents/cms/migration/AGENTS.md`
- CMS – Plugins: `agents/cms/plugins/AGENTS.md`
- Cloud docs: `agents/cloud/AGENTS.md`
- Snippets: `agents/snippets/AGENTS.md`

Templates Index (authoring skeletons)
- `agents/templates/INDEX.md`

Legacy mirrors (prefer the canonical guides above):
- `cms/AGENTS.md`, `cloud/AGENTS.md`, `snippets/AGENTS.md`

## Git Usage Rules

- Commit messages
  - Start with a capitalized action verb in imperative mood (e.g., Add, Update, Fix).
  - Keep to 80 characters max; be succinct about what/why.
  - Do not prefix with "feat:", "chore:", or similar keywords.
  - Do not use PR-style phrasing (never start a commit with "This PR …").

- PR descriptions
  - Start with "This PR …" followed by a one‑sentence summary.
  - End the sentence with a period, or a colon if followed by bullets.
  - Use bullet points for optional extra details.
  - Do not add sections like Summary/Changes/Motivation/How to validate.
  - Do not include manual test instructions unless absolutely necessary.
  - Screenshots or GIFs are welcome when they help.

- Branch and history safety
  - Never force‑push, rebase shared branches, or push to `main` without explicit maintainer consent.
  - Never delete local or remote branches unless explicitly instructed by the maintainer.
  - Get explicit consent before any history rewrite (rebase, squash, filter‑branch).
  - Prefer creating a new branch over rewriting history; propose the plan first.
  - When asked to stay low profile, do not open PRs unless explicitly requested; share progress in this chat.

- Pushing and PRs
  - When pushing a new branch, set upstream (no PR auto‑creation).
  - Open PRs only when requested and follow the description rules above.
  - Titles must not start with feat:/chore:/fix:; keep titles short and clear.
  - For the full, detailed guidance and examples, see: `git-rules.md`.

## 12 Rules (Overview)

- Canonical in-repo source: `12-rules-of-technical-writing.md`.
- Full text (external): https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04
- Summary highlights:
  - Write for the audience; document the obvious.
  - Use a direct, neutral tone and simple English.
  - Be concise: short sentences and clear sectioning.
  - Procedures use numbered steps; unordered info uses bullets; complex lists use tables.
  - Avoid ambiguity; keep terminology consistent; define acronyms once; add visuals when helpful.
