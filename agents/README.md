# Agents folder

This directory stores agent‑only guides and authoring templates used to maintain the documentation repository. These files are:

- Not built by Docusaurus (excluded via `docusaurus/docusaurus.config.js`)
- Not visible on the website and not indexed by search
- Ignored by LLM generators (`llms.txt` and `llms-code.txt`)

Use the Templates Index to get started:
- `agents/templates/INDEX.md`

Primary areas:
- Guides for authors: `agents/cms/*/AGENTS.md`, `agents/cloud/AGENTS.md`, `agents/snippets/AGENTS.md`
- Authoring skeletons: `agents/templates/*.md`

When editing:
- Keep paths repo‑relative and clickable.
- Avoid frontmatter in agent‑only files.
- Do not move files back under `docusaurus/docs/**`.
