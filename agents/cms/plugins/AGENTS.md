# AGENTS.md (Plugins pages)

Scope
- Applies to all plugin pages under `docusaurus/docs/cms/plugins/`.
- Reuse repo‑wide rules for TL;DR, callouts, and code snippets; this guide encodes structure/headings specific to plugins.

Purpose
- Standardize how plugin docs present installation, configuration (UI + code), and usage, with clear package and marketplace info.

Frontmatter (recommended)
- `title`: Plugin name (e.g., “GraphQL plugin”).
- `description`: One concise sentence describing what the plugin enables.
- Optional: `tags` (include `plugins` + relevant areas).

Required Section Order
1) H1 title — matches `title` frontmatter.
2) TL;DR — 1–3 sentences about what the plugin adds and why it matters.
3) Identity card (plugin‑specific)
   - Use `<IdentityCard isPlugin>` with items in this order:
     - `<IdentityCardItem icon="navigation-arrow" title="Location">…</IdentityCardItem>`
       - Summarize where it’s used/configured (admin panel and/or server code).
     - `<IdentityCardItem icon="package" title="Package name">`@strapi/plugin-…`</IdentityCardItem>`
     - `<IdentityCardItem icon="plus-square" title="Additional resources">…</IdentityCardItem>`
       - Link to Strapi Marketplace page; optionally vendor site.
   - Add compatibility or maintenance notes (e.g., unmaintained) as admonitions below the card when needed.

4) Installation (H2)
   - Show package install commands (Tabs for yarn/npm if applicable).
   - Mention minimal Strapi version if required.

5) Configuration (H2)
   - Prefer 2 subsections (H3):
     - “Admin panel settings” — numbered steps, UI paths.
     - “Code-based configuration” — show `config/plugins.(js|ts)` (and other files) with code fences and file paths.
   - Include environment notes (e.g., disable in non‑production) under dedicated H3s when applicable.

Tabs reminder
- Installation: if both package managers are shown, use Tabs with `groupId="yarn-npm"` and values `yarn`/`npm` (labels `Yarn`/`NPM`).
- Code examples: when showing both JS and TS, use Tabs with `groupId="js-ts"` and values `js`/`ts` (labels `JavaScript`/`TypeScript`).

6) Usage (H2)
   - Explain how to use the plugin after configuration; split into H3 tasks (e.g., “Regenerating documentation”, “GraphQL API”).
   - Add API‑specific sub‑sections when relevant (REST/GraphQL endpoints, admin UI tools).

Optional Elements
- Screenshots or ThemedImage blocks for UIs (playgrounds, marketplaces).
- Marketplace/verification badges explanation when helpful.

Heading Conventions
- Use H2 for Installation, Configuration, Usage; H3 for sub‑tasks/settings.
- Keep headings action‑oriented and specific (“Disable in non‑production”).

Cross‑linking
- Link to related features (e.g., Content API), configuration pages, and Marketplace entries.
- Prefer relative links under `/cms/` and consistent link text.

Quality Checklist (before commit)
- TL;DR present and concise; IdentityCard present with Location/Package/Resources.
- Installation steps clear (yarn/npm tabs if needed) and versions noted when relevant.
- Configuration includes both UI and code‑based subsections with paths and fences.
- Usage section tasks are clear with examples/screenshots where helpful.
- Links to Marketplace and related docs included.

Templates
- See `agents/templates/plugin-template.md` for a ready‑to‑use skeleton aligned with these conventions.
