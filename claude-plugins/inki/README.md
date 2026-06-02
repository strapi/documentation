# Inki — discover, write, review, submit your docs

Inki is a Claude Code plugin bundling the skills, prompts, templates, and rules used to author and maintain the Strapi documentation. It lives in this repository (`claude-plugins/inki/`) and is installable via the repo's self-hosted marketplace.

## Install

```bash
/plugin marketplace add strapi/documentation
/plugin install inki@strapi-documentation
```

After install, the skills are available at `/inki:<skill>`. The plugin is persistent across Claude Code sessions.

## Skill families

**Notation for skill arguments:**

- `<arg>` = required argument.
- `[arg]` = optional argument.
- `<brief>` = a topic description, either as inline text (e.g., "MCP server feature, AI tools section, similar to existing AI pages") or as a path to a `.md` file containing the description.
- `<outline>` = path to an outline file produced by `/inki:outline`.
- `<path>` = path to a documentation file (under `docusaurus/docs/`).
- `<topic>` = a keyword or short phrase to search for (e.g., "MCP server").
- `[hint]` = an optional issue reference (e.g., `Fixes #2143`) or short topic hint passed through to the PR.
- `[PR#]` = a pull request number (e.g., `2143`).

### Discover — before you write

Find out what already exists, where to put new content, what's missing.

- `/inki:discover <input>` — orchestrator: dispatches to the right sub-skill based on input shape.
- `/inki:exists <topic>` — search docs + sidebars + open PRs for a topic.
- `/inki:route <strapi/strapi PR>` — given a code PR, identify which docs to update.
- `/inki:coverage <feature>` — audit documentation coverage of a Strapi feature.

### Write — produce new content

- `/inki:write [--yes] <brief>` — orchestrator: outline then draft.
- `/inki:outline <brief>` — generate an outline from a brief and template.
- `/inki:draft <outline>` — draft a page from an outline + template + authoring guide.

### Review — check what you wrote

- `/inki:review [--yes] [--fix] <path | filename | PR | docs.strapi.io URL | pasted content>` — orchestrator: runs all 6 review sub-skills against any supported target.
- `/inki:style-check <path>` — style lint (deterministic + AI).
- `/inki:outline-check <path>` — verify outline matches template.
- `/inki:outline-ux-analyzer <path>` — audit pedagogical UX.
- `/inki:code-verify <path>` — verify code blocks.
- `/inki:coherence-check <path>` — check cross-page coherence.
- `/inki:pitfalls-check <path>` — audit against known pitfalls.

### Submit — get it to GitHub

- `/inki:submit [--yes] [hint]` — orchestrator: branch + commit + push + PR.
- `/inki:branch` — create a properly prefixed branch.
- `/inki:commit` — stage + commit with a compliant message.
- `/inki:push` — push with validation.
- `/inki:pr [issue]` — open a PR with a compliant title and description.
- `/inki:pr-fix <title|description|body> [--yes] [--include-old] [PR# or URL...]` — rewrite the title or body of existing PRs (`body` is an alias of `description`).

### Common flags

- `--yes` / `-y` — non-interactive mode: skip confirmation prompts. Useful for chaining skills or scripting.
- `--include-old` (only on `pr-fix`) — when no PR IDs are listed, include open PRs older than 30 days. By default, stale PRs are excluded to avoid bumping them with a title/description change notification.

## How it integrates with this repo

- The canonical rules (`git-rules.md`, `12-rules-of-technical-writing.md`) live at the repo root. They are auto-synced into `claude-plugins/inki/references/` by a GitHub Action.
- The agent prompts, templates, and authoring guides live inside the plugin at `claude-plugins/inki/references/`. They used to live in `agents/`; that folder now contains only a pointer README.

## Editing rules

- Edit the canonical rules at the **repo root**, not in `claude-plugins/inki/references/`. The plugin copies are synced automatically. CI fails if you edit only the plugin copies.
- Edit agent prompts, templates, and authoring guides inside `claude-plugins/inki/references/`. These are now the canonical home.

## Status

v0.1.0 — initial release. See `CHANGELOG.md` for details.

## License

MIT (inherits from the strapi/documentation repository).
