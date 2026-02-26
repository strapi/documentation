# AGENTS — Guides / How‑to / Tutorials

Scope
- Applies to all guide‑style pages under `docusaurus/docs/cms/` regardless of subfolder (e.g., configurations/guides, api/*/guides, plugins‑development/guides).
- Do not duplicate repo‑wide rules (snippets, callouts, TL;DR); follow root `AGENTS.md` and `12-rules-of-technical-writing.md`.

Purpose
- Encode the structure and heading conventions for guide‑style content (procedural pages).

Frontmatter (recommended)
- `title`: Clear, action‑oriented (verb + object) or concise noun phrase describing the task.
- `description`: One concise sentence stating the outcome of the procedure.
- Optional: tags relevant to the area (e.g., SSO, REST, RBAC).

Required Section Order
1) H1 title — matches `title` frontmatter.
2) Optional TL;DR — 1–2 sentences (only if it adds value beyond the intro).
3) Introduction — brief context, scope, and what the reader will accomplish (≤1 short paragraph).
4) Prerequisites — callout with concrete requirements (versions, roles/permissions, environment, enabled features).
5) Procedure — numbered steps (H2 "Steps" or multiple H2 sections per phase). Each step:
   - One action per step; include expected result when helpful.
   - Use UI paths (for admin steps) or file paths/code fences (for code steps).
   - Reference screenshots or diagrams where they clarify the action.
6) Validation — how to verify success (e.g., test endpoint, UI confirmation).
7) Next steps — follow‑up tasks, deeper docs (features, APIs, concepts).

Heading Conventions
- Use H2 for major sections (Prerequisites, Steps, Validation, Next steps); H3 for sub‑steps or task groupings.
- Step headings should be imperative and specific (e.g., "Enable SSO provider", "Add environment variables").

Content Conventions (procedural specifics)
- Steps must be strictly ordered and numbered; avoid mixing UI and code in a single step when avoidable.
- For repeated variants (e.g., REST/GraphQL/Client), keep a single "Step" and present each variant under the step (no duplicate headings per language) with <Tabs> and <TabItem> components (see `templates/components/tabs.md` for guidance).
- Include concrete UI paths (e.g., Settings → Single Sign‑On) and explicit file locations.

Cross‑linking
- Link to the feature being configured and relevant API references; prefer relative links under `/cms/`.

Quality Checklist (before commit)
- Intro is concise; prerequisites are complete and specific.
- Steps are numbered, imperative, one action per step, with clear outcomes.
- Screenshots/diagrams support complex steps where appropriate.
- Validation section present.
- Cross‑links to relevant features/APIs/concepts are included inline where helpful.

Tabs reminder
- For multi‑language examples, use Tabs with `groupId="js-ts"` and values `js`/`ts` (labels `JavaScript`/`TypeScript`).
- For install commands, use Tabs with `groupId="yarn-npm"` and values `yarn`/`npm` (labels `Yarn`/`NPM`).

Templates
- Start from `agents/templates/guide-template.md` to ensure frontmatter, H1/TL;DR placement, and step structure are consistent.