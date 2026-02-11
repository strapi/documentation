# Agents folder

This directory stores authoring guidance, templates, and review prompts used to maintain the documentation repository. Nothing here is published on the website.

## What lives here

| Folder | Purpose | Entry point |
|--------|---------|-------------|
| `authoring/` | Area‑specific writing rules: expected sections, components, frontmatter, and conventions per doc type | `agents/authoring/AGENTS.cms.md` (CMS root) |
| `templates/` | Copy‑paste skeletons for new pages, with correct structure and placeholders | `agents/templates/README.md` |
| `prompts/` | Specialized prompts for reviewing and creating documentation (style, structure, UX) | `agents/prompts/README.md` |

How these pieces connect: **authoring guides** define the rules, **templates** encode them as ready‑to‑use skeletons, and **prompts** automate checking against them.

## Audience

- Human authors and reviewers who want consistent page structure and conventions.
- Automation and AI tools that scaffold or validate docs without touching published content.

## Quick start (human authors)

1) Find the right template in `agents/templates/README.md`.
2) Copy it into `docusaurus/docs/...`, fill in placeholders, and read the corresponding authoring guide for area‑specific conventions.
3) Open a PR following the commit and branch rules in `AGENTS.md`.

For the full step‑by‑step, see `agents/templates/README.md`.

## Quick start (AI tools)

- Read area guides (`agents/authoring/AGENTS.*.md`) for expected structure.
- Use templates (`agents/templates/*.md`) when scaffolding new pages.
- Use prompts (`agents/prompts/*.md`) to decide where and what to write, then run style, structure, and UX checks.
- Never write to `agents/**` when publishing docs; always target `docusaurus/docs/**`.

## Safety rails

- Excluded from build: `docusaurus/docusaurus.config.js` excludes `AGENTS.*`, `templates/**`, and `../agents/**` patterns.
- Not in sidebars: no agent files are referenced in `docusaurus/sidebars.js`.
- Excluded from LLMs: generators ignore `AGENTS` and `templates` (and any `agents/**`) paths.

## Do and Don't

- Do keep repo‑relative, clickable paths when linking files.
- Do keep templates minimal, with clear placeholders and path hints in code fences (e.g., `title="/config/<area>.js"`).
- Do group language variants (JS/TS) under a single example; separate with a divider rather than new headings.
- Don't add frontmatter to agent‑only files.
- Don't place agent files back under `docusaurus/docs/**`.
- Don't include agents/templates in search configs or LLM datasets.

## References

- Root agent guide: `AGENTS.md`
- Authoring area guides: `agents/authoring/AGENTS.*.md`
- Templates catalog: `agents/templates/README.md`
- Prompts catalog: `agents/prompts/README.md`
