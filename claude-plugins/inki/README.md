# Inki: research, write, review, submit your Strapi docs

Inki is a Claude Code plugin that keeps Strapi documentation _in key_ with the product, the documentation itself, and the conventions that tie them together.
The name combines _ink_ ✍️ with _Strapi_, and also is an acronym for **In**-key **K**nowledge **I**nterface.

It turns the way we author Strapi documentation into a toolkit anyone can install in 2 commands. It bundles the skills, prompts, templates, workflows, and editorial rules used to write and maintain the Strapi docs. By capturing not only our writing process but also our conventions, terminology, and documentation patterns, Inki helps keep new content aligned with both the product and the documentation ecosystem it belongs to. It lives in this repository (`claude-plugins/inki/`) and is installable through the repo's self-hosted marketplace.


## The problem it solves

Writing good Strapi docs means juggling a lot of tribal knowledge: what's already documented, which pages a code change affects, the style guide and the 12 rules of technical writing, verifying code blocks against the real source, naming branches correctly, writing PR descriptions the way `git-rules.md` demands.

Inki encodes all of it into one plugin, so high-quality docs become the easy default for the whole team.

## Install

```bash
/plugin marketplace add strapi/documentation
/plugin install inki@strapi-documentation
```

After install, the skills are available at `/inki:<skill>`, persistent across Claude Code sessions.

## The four families: a docs workflow end to end

Inki ships 22 skills organized into 4 families that mirror the life of a documentation change: figure out **where** the doc goes, **write** it, **review** it, then **submit** it. Each family has a top-level **orchestrator** with the same name that runs the whole stage, plus **granular skills** you can call on their own for finer control.

| Stage | Family | Orchestrator | Granular skills |
|-------|--------|-------------|-----------------|
| 1 | 🔍 Research | `/inki:research` | `exists`, `route`, `coverage` |
| 2 | ✍️ Write | `/inki:write` | `outline`, `draft` |
| 3 | 🔬 Review | `/inki:review` | `style-check`, `outline-check`, `outline-ux-analyzer`, `code-verify`, `coherence-check`, `pitfalls-check`, `pitfalls-add` |
| 4 | 🚀 Submit | `/inki:submit` | `branch`, `commit`, `push`, `pr`, `pr-fix` |

You can run the full chain for a new page, or jump straight to a single stage (e.g. just `/inki:review` on an existing file).

In the Review family, `/inki:review` runs the **six** read-only reviewers (`style-check`, `outline-check`, `outline-ux-analyzer`, `code-verify`, `coherence-check`, `pitfalls-check`). `pitfalls-add` belongs to the same family but is a separate writing skill (it adds an entry to the known-pitfalls catalog); `/inki:review` does not run it.

### The shortcut: `/inki:document`, all four stages, one command

If you just want to document a subject from scratch, `/inki:document <subject>` chains all four stages for you:

```
/inki:document "MCP server configuration"
   │
   ├─ 1. research ── is it already documented? where does it belong?   → [gate]
   ├─ 2. write ───── outline, then draft from the right template       → [gate]
   ├─ 3. review ──── the six reviewers run against the fresh draft      → [gate]
   └─ 4. submit ──── branch + commit + push + PR                        → [gate]
```

It pauses for your approval between each stage by default, so you stay in control. Add `--auto-approve` to chain all four without stopping (you review the resulting PR at the end). The `<subject>` is flexible: keywords, a Strapi code PR (`strapi/strapi` or `strapi/cloud`, the two repos published to docs.strapi.io, given by URL, `owner/repo number`, a bare number, or prose naming the PR), a Notion page URL, a Linear issue, a PDF (spec/RFC), a local file, or pasted notes. `/inki:document` resolves it into a brief and runs from there. A `strapi/documentation` PR is not a subject to document: `/inki:document` redirects you to `/inki:review`. A PR on a repo that is not published to docs.strapi.io (e.g. `strapi/design-system`) stops with an explanation.

One guard always holds, even with `--auto-approve`: if the research stage finds the subject is **already documented**, `/inki:document` stops and points you at the existing page rather than creating a duplicate. This detection is strongest for keyword or topic subjects (where research runs `exists` and gets a clear coverage verdict); for a feature name or a code PR it leans on the coverage and routing reports, which are less categorical.

### 1. 🔍 Research: figure out where the doc goes

Before writing a line, find out what already exists and where new content belongs, so you don't duplicate a page or put it in the wrong section.

- Run `/inki:research` and let it dispatch based on what you give it, or call a sub-skill directly:
  - `/inki:exists "MCP server"`: is this topic already documented? Searches the docs, the sidebars, and open PRs.
  - `/inki:route <strapi/strapi or strapi/cloud PR>`: given a code PR, which doc pages and sections need to change to cover it.
  - `/inki:coverage <feature>`: audit how well an existing feature is documented and what's missing.

The output tells you whether to edit an existing page or create a new one, and exactly where it should live.

### 2. ✍️ Write: do the actual writing

Turn a topic brief into a drafted page, grounded in the right template and authoring guide so the structure and tone are correct from the start.

- `/inki:write <brief>` runs the whole stage: it generates an outline, then drafts the page from it.
- Or drive it in two steps:
  - `/inki:outline <brief>`: produce an outline from the brief and the matching template. Review and tweak it.
  - `/inki:draft <outline>`: draft the page from that outline, the template, and the relevant authoring guide.

A `<brief>` can be inline text (e.g. "MCP server feature, AI tools section, similar to existing AI pages") or a path to a `.md` file describing what you want.

### 3. 🔬 Review: check what you wrote

One command runs six reviewers in parallel against your page and returns a single report, sorted by severity.

```
/inki:review https://github.com/strapi/documentation/pull/1234
   │
   ├─ style-check ──────── deterministic lint + AI judgment
   ├─ outline-check ─────── structure vs the official template
   ├─ outline-ux-analyzer ─ pedagogical UX: beginner → advanced flow
   ├─ code-verify ───────── every code block vs the real Strapi source  ⭐
   ├─ coherence-check ───── terminology + links vs related pages
   └─ pitfalls-check ────── deprecated patterns, known mistakes
   │
   └─ one report, issues sorted by severity
```

What makes it powerful:

1. **It accepts anything.** A local file, a bare filename, a GitHub PR number or URL, a published `docs.strapi.io` URL, or pasted Markdown. It resolves the target itself (cloning a worktree for a PR if needed) and cleans up after.
2. **Six reviewers in parallel, one verdict.** No human reviewer runs all six checks by hand, every time, consistently.
3. **`--fix` closes the loop.** It can auto-apply the style fixes, not just flag them.

The standout sub-skill is **`/inki:code-verify`**: it reads every fenced code block in a page and checks it against the actual `strapi/strapi` source: syntax, whether referenced functions and types really exist, and consistency with the surrounding prose. It proves the code in the docs matches the code that ships.

### 4. 🚀 Submit: get it to GitHub

Once the page passes review, one command takes it all the way to an open PR, delegating to four granular skills that each already know our conventions.

```
/inki:submit
   │
   ├─ /inki:branch ── auto-detects the right prefix (cms/, cloud/, repo/) from the files touched
   ├─ /inki:commit ── compliant message, respects protected paths
   ├─ /inki:push ──── validates the branch name against git-rules.md
   └─ /inki:pr ────── opens a PR with a compliant title + flat description (no headings, no test plan)
```

Composition, not duplication: `submit` doesn't reinvent git logic. Each sub-skill encodes a slice of `git-rules.md` once and is reused everywhere. Already opened a PR and need to fix its title or description? `/inki:pr-fix` rewrites them to match `git-rules.md`.

## Command reference

The summary below covers the most common usage. For a per-command reference of every skill and its argument signature, see [COMMANDS.md](./COMMANDS.md) (curated, not auto-generated; mirrors each skill's frontmatter). You can also type `/inki:<skill> --help` to print a single command's usage.

**Notation for skill arguments:**

- `<arg>` = required argument.
- `[arg]` = optional argument.
- `<brief>` = a topic description, either as inline text (e.g., "MCP server feature, AI tools section, similar to existing AI pages") or as a path to a `.md` file containing the description.
- `<outline>` = path to an outline file produced by `/inki:outline`.
- `<path>` = path to a documentation file (under `docusaurus/docs/`).
- `<topic>` = a keyword or short phrase to search for (e.g., "MCP server").
- `[hint]` = an optional issue reference (e.g., `Fixes #2143`) or short topic hint passed through to the PR.
- `[PR#]` = a pull request number (e.g., `2143`).

### Document: the full chain in one command

- `/inki:document [--auto-approve] <subject>`: run all four stages (research → write → review → submit) for one subject. Gated between each stage by default; `--auto-approve` chains without pauses. `<subject>` can be keywords, a Strapi code PR (`strapi/strapi` or `strapi/cloud`; URL, `owner/repo number`, bare number, or prose), a Notion URL, a Linear issue, a PDF path/URL, a local file, or pasted text. Stops if research finds the subject is already documented; a `strapi/documentation` PR is redirected to `/inki:review`, and a PR on any other repo stops (not on docs.strapi.io).

### Research: before you write

Find out what already exists, where to put new content, what's missing.

- `/inki:research <input>`: orchestrator: dispatches to the right sub-skill based on input shape.
- `/inki:exists <topic>`: search docs + sidebars + open PRs for a topic.
- `/inki:route <strapi/strapi or strapi/cloud PR>`: given a code PR, identify which docs to update.
- `/inki:coverage <feature>`: audit documentation coverage of a Strapi feature.

### Write: produce new content

- `/inki:write [--auto-approve] <brief>`: orchestrator: outline then draft.
- `/inki:outline <brief>`: generate an outline from a brief and template.
- `/inki:draft <outline>`: draft a page from an outline + template + authoring guide.

### Review: check what you wrote

- `/inki:review [--auto-approve] [--fix] <path | filename | PR | docs.strapi.io URL | pasted content>`: orchestrator: runs all 6 review sub-skills against any supported target.
- `/inki:style-check <path>`: style lint (deterministic + AI).
- `/inki:outline-check <path>`: verify outline matches template.
- `/inki:outline-ux-analyzer <path>`: audit pedagogical UX.
- `/inki:code-verify <path>`: verify code blocks.
- `/inki:coherence-check <path>`: check cross-page coherence.
- `/inki:pitfalls-check <path>`: audit against known pitfalls.
- `/inki:pitfalls-add [--auto-approve] <pitfall>`: add a new, source-verified entry to the known-pitfalls catalog (the writing counterpart to the read-only `pitfalls-check`).

### Submit: get it to GitHub

- `/inki:submit [--auto-approve] [hint]`: orchestrator: branch + commit + push + PR.
- `/inki:branch`: create a properly prefixed branch.
- `/inki:commit`: stage + commit with a compliant message.
- `/inki:push`: push with validation.
- `/inki:pr [issue]`: open a PR with a compliant title and description.
- `/inki:pr-fix <title|description|body> [--auto-approve] [--include-old] [PR# or URL...]`: rewrite the title or body of existing PRs (`body` is an alias of `description`).

### Common flags

- `--auto-approve` (aliases `--auto` / `--yes` / `-y`): non-interactive mode: skip confirmation prompts. Useful for chaining skills or scripting. `--auto-approve` is the canonical form; `--auto`, `--yes`, and `-y` are kept as aliases. On `/inki:document` it also runs the review-fix loop automatically.
- `--fix-rounds <N>` (on `/inki:document`): cap the number of review→fix→re-review iterations. Default 3.
- `--no-log` / `--log-dir <path>` / `--short-log`: logging controls. By default, every skill that produces a report or modifies files writes a verbose Markdown report tree to `~/.inki/logs/<YYYY-MM-DD-slug>/` (override with `--log-dir` or the `INKI_LOG_DIR` env var; logs never go inside the worked-on repo). `--no-log` disables it; `--short-log` trims the verbose per-agent reports, keeping only the consolidated per-phase reports. The git-plumbing skills (`branch`, `commit`, `push`, `pr`) do not take these flags: a single git step has no report of its own, and its work is captured in `submit`'s log.
- `--include-old` (only on `pr-fix`): when no PR IDs are listed, include open PRs older than 30 days. By default, stale PRs are excluded to avoid bumping them with a title/description change notification.

## How it integrates with this repo

- The canonical rules (`git-rules.md`, `12-rules-of-technical-writing.md`) live at the repo root. They are auto-synced into `claude-plugins/inki/references/` by a GitHub Action.
- The agent prompts, templates, and authoring guides live inside the plugin at `claude-plugins/inki/references/`. They used to live in `agents/`; that folder now contains only a pointer README.

## Editing rules

- Edit the canonical rules at the **repo root**, not in `claude-plugins/inki/references/`. The plugin copies are synced automatically. CI fails if you edit only the plugin copies.
- Edit agent prompts, templates, and authoring guides inside `claude-plugins/inki/references/`. These are now the canonical home.

## Status

v0.2.1: orchestrators now always invoke their sub-skills (never raw git/gh), and `/inki:pr` omits the preview link when no docs page changed. v0.2.0 added review agents, the `/inki:document` orchestrator, run logging, and command tooling. See `CHANGELOG.md` for details.

## For plugin developers: refreshing changes

When you edit a skill in this plugin and want to see your changes locally, the marketplace cache keeps the previously-installed version of each `SKILL.md` until you fully reinstall the plugin. `/plugin marketplace update` refreshes metadata (skill names and descriptions visible in the skill list) but does not refresh the content of skill files.

To pick up local edits to skill files, run this 4-step cycle:

```
/plugin uninstall inki@strapi-documentation
/plugin marketplace update strapi-documentation
/plugin install inki@strapi-documentation
/reload-plugins
```

This cycle is only needed during plugin development. End users running `/plugin install` get the latest version whenever they update the marketplace.

## License

MIT (inherits from the strapi/documentation repository).
