# AGENTS.md (Repository-wide agent guide)

Scope and precedence
- This file applies to the entire repository.
- Area‑specific AGENTS files (in `agents/authoring/`) may add or override rules for their scope.

Execution policy and invariants
- Stack: prefer JavaScript/Node; do not introduce new languages without approval.
- Do not modify `llms-full.txt` generation.
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
- When asked, paste changed files or generated artifacts.
- Use bullet lists for unordered information; numbers for sequences.
- Reference files with repo‑relative clickable paths.

PR and branch workflow
- Branch naming:
  - Branches touching only files in `/cms` and `/static` must be prefixed with `/cms`
  - Branches touching only files in `/cloud` and `/static` must be prefixed with `/cloud`
  - Other branches must be prefixed with `/repo`
  - If ambiguous, ask the user how to name the branch; user choice always supersedes auto-branch naming

Security and tokens
- Never commit secrets. Use `GITHUB_TOKEN` env var if needed; least privilege; rotate/revoke after use.

Links
- Contributing guide: CONTRIBUTING.md
- Style guide (PDF): STYLE_GUIDE.pdf
- 12 Rules of Technical Writing: 12-rules-of-technical-writing.md (canonical)
- External reference: https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04

## Directory of AGENTS guides

- CMS (canonical): `agents/authoring/AGENTS.cms.md`
- CMS – How‑to Guides: `agents/authoring/AGENTS.cms.guides.md`
- CMS – API docs: `agents/authoring/AGENTS.cms.api.md`
- CMS – Configurations: `agents/authoring/AGENTS.cms.configurations.md`
- CMS – Features: `agents/authoring/AGENTS.cms.features.md`
- CMS – Plugins: `agents/authoring/AGENTS.cms.plugins.md`
- Cloud docs: `agents/authoring/AGENTS.cloud.md`
- Snippets: `agents/authoring/AGENTS.snippets.md`

The `agents/templates/README.md` explains the purpose of the templates directory (authoring skeletons) and lists all templates with links.

## Documentation Review System

Specialized prompts for reviewing and creating Strapi documentation. Located in `agents/prompts/`.

| Prompt | Path | Status | Purpose |
|--------|------|--------|---------|
| **Orchestrator** | `agents/prompts/orchestrator.md` | ✅ Available | Coordinates Review and Create workflows |
| **Router** | `agents/prompts/router.md` | ✅ Available | Identifies doc type, determines placement, loads template and authoring guide |
| **Outliner** | `agents/prompts/outliner.md` | ✅ Available | Routes to Outline Checker, UX Analyzer, or Outline Generator |
| **Outline Checker** | `agents/prompts/outline-checker.md` | ✅ Available | Ensures template compliance, frontmatter, heading hierarchy |
| **Outline UX Analyzer** | `agents/prompts/outline-ux-analyzer.md` | ✅ Available | Checks reader experience, section order, cognitive load |
| **Style Checker** | `agents/prompts/style-checker.md` | ✅ Available | Ensures compliance to 12 Rules of Technical Writing |
| **Outline Generator** | `agents/prompts/outline-generator.md` | ✅ Available | Creates outlines from source material (Notion, Jira, specs) |
| **Drafter** | `agents/prompts/drafter-interface.md` | ✅ Available | Drafts documentation based on inputs from Router and Outliner |
| **Integrity Checker** | — | 🔜 Coming soon | Ensures production-ready compliance (broken links, formatting, etc.) |

### Shared Resources

The `agents/prompts/shared/` folder contains guides used by multiple prompts:

| Resource | Path | Purpose |
|----------|------|---------|
| **GitHub MCP Usage** | `agents/prompts/shared/github-mcp-usage.md` | How to fetch PR content using GitHub MCP tools |

### Workflows

**Review Mode** (existing content):
```
Router → Outliner (Checker) → Style Checker → Integrity Checker
```

**Create Mode** (new content):
```
Router → Outliner (Generator) → Drafter → Style Checker → Integrity Checker
```

### Usage

These prompts are designed for use in:
- **Claude Projects**: Import prompts as project knowledge
- **Claude.ai / ChatGPT**: Copy prompt content into the conversation
- **API integrations**: Use as system prompts

See `agents/prompts/README.md` for detailed usage instructions.

## General git usage rules

(see git-rules.md for details)

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