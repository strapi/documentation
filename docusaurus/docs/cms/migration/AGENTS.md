# AGENTS.md (Migration and Breaking Changes)

Scope
- Applies to all migration pages under `docusaurus/docs/cms/migration/` (recursively), including `v4-to-v5` and its breaking-change subpages.
- Follows repo‑wide rules for TL;DR, callouts, and code snippets; this guide focuses on structure and headings.

Purpose
- Make migration docs predictable: clarify what changed, who is affected, how to move, and how to verify.

Frontmatter (recommended)
- `title`: Clear and scoped (e.g., “v4 to v5 — Breaking changes”).
- `description`: One sentence stating what the page helps accomplish (migrate, understand changes, assess impact).
- Optional: tags for discoverability (e.g., migration, breaking changes, upgrade).

Migration Overview Pages (e.g., v4→v5 introductions)
1) H1 title — matches `title` frontmatter.
2) TL;DR — 1–3 sentences summarizing scope and outcome (what version to what version; who should read).
3) Audience and scope — who is affected; supported paths; what is NOT covered.
4) Migration paths (H2) — outline typical routes; include a simple decision table/list.
5) High‑level steps (H2) — numbered sequence of phases; link each step to deeper pages.
6) Compatibility notes (H2) — deprecations vs. removals; timelines if relevant.
7) Key references (H2) — link to Breaking changes, Templates, Additional resources.
8) Next steps (H2) — where to go after reading.

Breaking Changes — Index Page
1) H1 title — “Breaking changes” with version scope (e.g., “v4→v5 Breaking changes”).
2) TL;DR — a short statement of the nature of changes and an impact overview.
3) Read me first (H2) — a caution callout about backups, version control, and testing.
4) Categories (H2) — group by area (Admin panel, API, Database, Plugins, Configurations, TypeScript, etc.). Each category lists links to subpages.
5) Deprecations vs removals (H2) — clarify differences and timelines; link to deprecation notes where needed.
6) Global migration tips (H2) — common patterns, codemods links, and order of operations.

Breaking Changes — Per‑Topic Page
1) H1 title — area and change (e.g., “Document IDs replace numeric ids”).
2) TL;DR — what changed + why; one‑sentence impact.
3) Affected versions/components (H2) — Strapi versions, plugins, environments.
4) What changed (H2) — concise description; include tables when listing options/flags.
5) Impact (H2) — what breaks; who is affected; severity.
6) Before / After (H2) — side‑by‑side code or two sub‑sections; include multiple languages as variants under the same example.
7) Migration steps (H2) — numbered, actionable steps; separate UI and code steps; include file paths and commands.
8) Edge cases (H2) — known exceptions, caveats, performance considerations.
9) Validation (H2) — how to verify the change worked (tests, CLI output, UI state).
10) Related links (H2) — link to features, APIs, configuration, and other breaking changes.

Heading Conventions
- Use H2 for major sections; H3 for sub‑sections (e.g., Parameters, Examples, Variants under examples).
- Keep titles short and descriptive; prefer imperative for steps (e.g., “Update configuration files”).

Admonitions and Guidance
- Use `:::caution` for high‑risk operations; `:::tip` for helpful hints; `:::note` for clarifications.
- For large refactors, consider a short “order of operations” list near the top of steps.

Quality Checklist (before commit)
- TL;DR articulates the change and impact in 1–3 sentences.
- Overview/Index pages clearly route readers to the right subpages.
- Per‑topic pages include Before/After and a numbered migration sequence.
- Examples include file paths and group language variants under the same example.
- Validation steps present; edge cases documented when applicable.
- Links to related docs (features/APIs/configuration) are included.

