# AGENTS.md (Repository-wide agent guide)

## Scope and precedence

- This file applies to the entire repository.
- Area‑specific AGENTS files (in `agents/`) may add or override rules for their scope.

## Project overview

This is the official Strapi documentation repository, built with Docusaurus 3. The main documentation website is at [docs.strapi.io](https://docs.strapi.io). This repository contains only documentation content — the actual Strapi codebase is in the separate [strapi/strapi](https://github.com/strapi/strapi) repository.

The documentation covers two products with different audiences:
- **CMS Docs** (`docs/cms/`) — Core Strapi CMS features and APIs
- **Cloud Docs** (`docs/cloud/`) — Strapi Cloud hosting platform

## Development commands and prerequisites

All development is done in the `/docusaurus` subdirectory (`cd docusaurus`).

### Core commands
- `yarn && yarn dev` — Install dependencies and start development server (port 8080)
- `yarn build` — Build the documentation (**required before submitting PRs**)
- `yarn serve` — Serve the built documentation locally


### Content generation and validation
- `yarn generate-llms` — Generate LLM-specific content files (`docusaurus/scripts/generate-llms.js` → generates `llms.txt`, uses `<Tldr>` when present)
- `yarn llms:generate-and-validate` — Generate and validate LLM code examples (`docusaurus/scripts/generate-llms-code.js --anchors --check-files` → generates `llms-code.txt`)
- `yarn validate:llms-code` — Validate existing LLM code examples
- `docusaurus/scripts/validate-prompts.js` — Validates prompt placeholders/structure

### Other scripts
- `yarn release-notes` — Generate release notes
- `yarn redirections-analysis` — Analyze URL redirections

### Prerequisites
- Node.js >= 18.15.0 <= 22.x.x
- Yarn >= 1.22.x

## Execution policy and invariants

- Stack: prefer JavaScript/Node; do not introduce new languages without approval.
- Do not modify `llms-full.txt` generation.
- Enable anchors and file checks by default for code extraction.

## Accepted languages and file types

Path‑based policy (applies to folders and all subfolders):
- `src/` (and `docusaurus/src/`): allow `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, `.scss`, `.html`.
- `docs/cms/`, `docs/cloud/`, `docs/snippets/`: allow only `.md`, `.mdx`.
- `static/`: allow image assets (`.png`, `.svg`, `.gif`, `.jpg`), `.html`, `.js`.
- `.github/workflows/`: allow only `.yml`.
- Also present elsewhere: `.scss`, `.css`, image assets (do not expand usage without approval).
- Not allowed without explicit approval: Python, Ruby, Go, Rust, etc. (no new stacks).

## Repository structure and file map

```
/
├── docusaurus/                 # Main Docusaurus application
│   ├── docs/                  # Documentation content
│   │   ├── cms/               # Strapi CMS documentation
│   │   └── cloud/             # Strapi Cloud documentation
│   ├── src/                   # React components and custom pages
│   ├── static/                # Static assets
│   ├── scripts/               # Build and utility scripts
│   ├── sidebars.js           # Sidebar configuration
│   └── docusaurus.config.js  # Main configuration
├── agents/                    # Documentation review and generation agents
│   ├── prompts/              # AI agent specifications
│   ├── templates/            # Content templates
│   └── authoring/            # Authoring guides
└── .cursor/rules/            # Cursor IDE rules for documentation agents
```

### Key files
- AI toolbar: `docusaurus/src/components/AiToolbar/openLLM.js`, `.../config/aiToolsConfig.js`, `.../config/aiPromptTemplates.js`
- Generators/validators: `docusaurus/scripts/generate-llms-code.js`, `docusaurus/scripts/generate-llms.js`, `docusaurus/scripts/validate-prompts.js`
- Authoring templates: `agents/templates/*.md` (see `agents/templates/INDEX.md`)
- Agent prompts: `agents/prompts/` (see table in Documentation Review System section)
- Components guidance: `agents/templates/components/tabs.md` (Tabs/TabItem rules)
- Configuration: `docusaurus.config.js`, `sidebars.js`, `package.json`

## Writing guidelines and content validation

### Style and quality
- Follow the [12 Rules of Technical Writing](12-rules-of-technical-writing.md)
- Use the [Style Guide](STYLE_GUIDE.pdf) for formatting conventions
- Disable linters/auto-formatters before saving to prevent rendering issues

### Content structure
- Use MDX format (Markdown + React components)
- Include proper frontmatter with `title`, `description`, `displayed_sidebar`, `tags`
- Use sentence case for headings
- Include `<Tldr>` components for page summaries
- Use numbered lists for procedures, bullet points for features/options

### Content validation
- Auto-generated files: `llms.txt`, `llms-full.txt`, `llms-code.txt` — content is optimized for AI consumption while maintaining human readability
- All code examples produced by AI agents MUST be validated against the actual [strapi/strapi](https://github.com/strapi/strapi) codebase
- Include both JavaScript and TypeScript variants when applicable
- Build process: LLM content generation → code example validation → link checking → static site generation

## Documentation Review System

### Directory of AGENTS guides

- CMS (canonical): `agents/authoring/AGENTS.cms.md`
- CMS – How‑to Guides: `agents/authoring/AGENTS.cms.guides.md`
- CMS – API docs: `agents/authoring/AGENTS.cms.api.md`
- CMS – Configurations: `agents/authoring/AGENTS.cms.configurations.md`
- CMS – Features: `agents/authoring/AGENTS.cms.features.md`
- CMS – Plugins: `agents/authoring/AGENTS.cms.plugins.md`
- Cloud docs: `agents/authoring/AGENTS.cloud.md`
- Snippets: `agents/authoring/AGENTS.snippets.md`

The `agents/templates/README.md` explains the purpose of the templates directory (authoring skeletons) and lists all templates with links.

### Specialized prompts

Located in `agents/prompts/`. Cursor IDE wrappers are in `.cursor/rules/`.

| Prompt | Path | Purpose |
|--------|------|---------|
| **Orchestrator** | `agents/prompts/orchestrator.md` | Coordinates Review and Create workflows |
| **Router** | `agents/prompts/router.md` | Identifies doc type, determines placement, loads template and authoring guide |
| **Outliner** | `agents/prompts/outliner.md` | Routes to Outline Checker, UX Analyzer, or Outline Generator |
| **Outline Checker** | `agents/prompts/outline-checker.md` | Ensures template compliance, frontmatter, heading hierarchy |
| **Outline UX Analyzer** | `agents/prompts/outline-ux-analyzer.md` | Checks reader experience, section order, cognitive load |
| **Outline Generator** | `agents/prompts/outline-generator.md` | Creates outlines from source material (Notion, Jira, specs) |
| **Style Checker** | `agents/prompts/style-checker.md` | Ensures compliance to 12 Rules of Technical Writing |
| **Drafter** | `agents/prompts/drafter.md` | Drafts documentation based on inputs from Router and Outliner |
| **Integrity Checker** | `agents/prompts/integrity-checker.md` | Coordinates technical verification (code examples, cross-page coherence) |

Shared resources: `agents/prompts/shared/github-mcp-usage.md` (how to fetch PR content using GitHub MCP tools).

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
- **Claude Code / Claude Projects**: Import prompts as project knowledge
- **Cursor IDE**: Use the `.cursor/rules/*.mdc` wrappers
- **Other AI tools (Copilot, Cline, Windsurf…)**: Copy prompt content or use as system prompts

See `agents/prompts/README.md` for detailed usage instructions.

## PR, branch, and git rules

See [`git-rules.md`](git-rules.md) for all commit, PR, and branch safety conventions.

### Branch naming
- `cms/` — branches touching only `docs/cms/` and `static/`
- `cloud/` — branches touching only `docs/cloud/` and `static/`
- `repo/` — everything else
- If ambiguous, ask the user; user choice always supersedes auto-branch naming

### Security and tokens
- Never commit secrets. Use `GITHUB_TOKEN` env var if needed; least privilege; rotate/revoke after use.

## Output and communication expectations

- When asked, paste changed files or generated artifacts.
- Use bullet lists for unordered information; numbers for sequences.
- Reference files with repo‑relative clickable paths.

## Links and references

- Contributing guide: `CONTRIBUTING.md`
- Style guide (PDF): `STYLE_GUIDE.pdf`
- 12 Rules of Technical Writing: `12-rules-of-technical-writing.md` ([external](https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04))

### 12 Rules (overview)
- Write for the audience; document the obvious.
- Use a direct, neutral tone and simple English.
- Be concise: short sentences and clear sectioning.
- Procedures use numbered steps; unordered info uses bullets; complex lists use tables.
- Avoid ambiguity; keep terminology consistent; define acronyms once; add visuals when helpful.
