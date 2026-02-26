# AGENTS.md (Features pages)

Scope
- Applies to all feature pages under `docusaurus/docs/cms/features/` (recursively).
- Do not duplicate repo‑wide rules (code snippets, callouts, TL;DR conventions); follow root `AGENTS.md` and `12-rules-of-technical-writing.md`.

Purpose
- Encode the expected structure and heading conventions for “Features” pages to ensure consistency.

Frontmatter (mandatory)
- `title`: Feature name (singular, title case).
- `description`: One concise sentence describing what the feature enables.
- `displayed_sidebar`: Always use `cmsSidebar`.
- `tags`: Include `features` and relevant keywords (e.g., `admin panel`).

Required Section Order
1) H1 title (Feature name)
   - The H1 should preferably match the `title` frontmatter, unless instructed otherwise.

2) TL;DR block
   - Place a `<Tldr>` block immediately after H1.
   - Use 1–3 sentences summarizing what the feature does and why it matters.

3) Short introduction
   - 1–2 paragraphs that set context (what problem it solves, where it fits, related features).

4) Identity card
   - Add an identity card block right after the intro:
     - `<IdentityCard>` wrapper with 4 items in this order and with these titles:
       - `<IdentityCardItem icon="credit-card" title="Plan">…</IdentityCardItem>`
       - `<IdentityCardItem icon="user" title="Role & permission">…</IdentityCardItem>`
       - `<IdentityCardItem icon="toggle-right" title="Activation">…</IdentityCardItem>`
       - `<IdentityCardItem icon="desktop" title="Environment">…</IdentityCardItem>`
   - Keep labels consistent with existing pages (examples: “Free feature”; “Available and activated by default”).

5) Configuration (H2)
   - Explain how to enable/configure the feature before usage.
   - Prefer 2 standard subsections (H3):
     - “Admin panel configuration” — numbered steps with clear UI paths; include an optional “Path to configure the feature:” line when helpful.
     - “Code-based configuration” — show file paths and code fences; align with repo‑wide snippet rules.
    - Admin panel configuration and Code-based configuration might feature specific sections with H4 when appropriate

6) Usage (H2)
   - Show how to perform core tasks with the feature.
   - Use H3 subsections per task (e.g., “Filtering assets”, “Publishing content”).
   - When relevant, add API usage subsections (e.g., “Usage with the REST API”, “Usage with GraphQL”). If these topics point to other pages, use `<CustomDocCardsWrapper/>` and `<CustomDocCard>` components (see `docusaurus/src/components/` folder)

Optional Elements
- Prerequisites callout if setup is required before configuration.
- Guideflow embeds or ThemedImage diagrams when they improve clarity.
- Feature flag badge note when the feature requires enabling a future flag.

Heading Conventions
- Use H2 for major sections (Configuration, Usage); H3 for subsections.
- Keep headings action‑oriented and specific (e.g., “Admin panel configuration”, not “Configuration details”).

Cross‑linking
- Link to related features (e.g., Content‑type Builder, Content Manager) and relevant API references.
- Prefer relative links within `/cms/` and use the consistent link text used across docs.

Quality Checklist (before commit)
- TL;DR present and concise (1–3 sentences).
- Intro present (≤2 short paragraphs).
- Identity card present with the 4 standard items in order.
- Configuration section includes both admin panel and code‑based subsections (when applicable).
- Usage section covers core tasks with clear H3 subsections.
- Headings follow H2/H3 pattern; section order matches this guide.
- Links and references to related features/APIs are included where helpful.

Templates
- See `agents/templates/feature-template.md` for a ready‑to‑use skeleton aligned with these conventions.
