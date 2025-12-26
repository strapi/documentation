# Agents folder

This directory stores agent‑only guides and authoring templates used to maintain the documentation repository.

What lives here
- Authoring guidance for writers/humans: `agents/cms/*/AGENTS.md`, `agents/cloud/AGENTS.md`, `agents/snippets/AGENTS.md`.
- Authoring skeletons for new pages: `agents/templates/*.md` and the index at `agents/templates/INDEX.md`.

Audience
- Human authors and reviewers who want consistent page structure and conventions.
- Automation and AI tools that scaffold or validate docs without touching published content.

Visibility and indexing
- Not built by Docusaurus (excluded via config).
- Not visible on the website and not indexed by search.
- Ignored by LLM generators (`llms.txt` and `llms-code.txt`).

Author workflow (human)
1) Pick the right template from `agents/templates/INDEX.md`.
2) Copy the file into `docusaurus/docs/...` and tailor the placeholders.
3) Keep section order and component usage from the template (e.g., `<Tldr>`, `<Guideflow>`, `<IdentityCard>`, Tabs for JS/TS variants).
4) Prefer paragraphs; only use bullets for discrete options or variants.
5) Run the generators locally to sanity‑check code extraction:
   - `npm run llms:generate-and-validate` (or the equivalent Yarn script under `docusaurus/`).
6) Open a PR with granular commits (one task per commit) and follow commit message rules in `AGENTS.md`.

Agent workflow (tools)
- Read area guides (e.g., `agents/cms/features/AGENTS.md`) to understand expected structure.
- Use `agents/templates/*.md` as the source of truth when scaffolding new pages.
- When transforming content, keep path‑hinted fences and language labels; group language variants under a single example.
- Never write to `agents/**` when publishing docs; always target `docusaurus/docs/**` for public pages.

Safety rails
- Excluded from build: `docusaurus/docusaurus.config.js` excludes `AGENTS.*`, `templates/**`, and `../agents/**` patterns.
- Not in sidebars: no agent files are referenced in `docusaurus/sidebars.js`.
- Excluded from LLMs: generators ignore `AGENTS` and `templates` (and any `agents/**`) paths.

Language groups (Tabs) — high level
- Use Tabs only for multi‑language variants of the same example.
- Keep shared context above the Tabs; keep each variant minimal.
- For full rules and examples, see the component guidance referenced from the root `AGENTS.md`.

Do and Don’t
- Do keep repo‑relative, clickable paths when linking files.
- Do keep templates minimal, with clear placeholders and path hints in code fences (e.g., `title="path: ./config/<area>.js"`).
- Do group language variants (JS/TS) under a single example; separate with a divider rather than new headings.
- Don’t add frontmatter to agent‑only files.
- Don’t place agent files back under `docusaurus/docs/**`.
- Don’t include agents/templates in search configs or LLM datasets.

References
- Root agent guide: `AGENTS.md`
- CMS area guides: `agents/cms/*/AGENTS.md`
- Templates catalog: `agents/templates/INDEX.md`
