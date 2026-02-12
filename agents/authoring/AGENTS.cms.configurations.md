# AGENTS.md (Configuration pages)

Scope
- Applies to all configuration pages under `docusaurus/docs/cms/configurations/` (recursively), including provider-specific pages (e.g., SSO providers).
- Follow repo‑wide rules for TL;DR, callouts, and code snippets; this guide only encodes structure and headings.

Purpose
- Ensure configuration pages present a consistent, predictable core while allowing H2 sections to adapt to the scope and complexity of the configuration area.

Frontmatter (mandatory)
- `title`: Configuration area name, e.g., "Database configuration".
- `description`: One concise sentence summarizing what the configuration controls.
- `displayed_sidebar: cmsSidebar`
- Optional: `sidebar_label` to fit navigation.
- Optional: `tags` specific to the configuration area.

Common Core (always present)
1) H1 title — matches `title` frontmatter unless instructed differently.
2) `<Tldr>` component — brief description of what the config file(s) control and where they live.
3) Intro paragraph — names the main file(s)/paths (e.g., `/config/admin`, `/config/api.js|ts`) and summarizes what the configuration controls.
4) Optional `:::caution` callout if changes require rebuilding the admin panel or restarting the server.

Thematic H2 Sections
- Configuration pages do **not** follow a single fixed H2 skeleton.
- Each H2 corresponds to a **thematic sub-domain** of the configuration, not a prescribed step.
- H2 names are descriptive and specific to the content (e.g., "`connection` configuration object", "Admin panel server", "Enabling a future flag").
- The number of H2s scales with content complexity. See "Scaling Patterns" below.

Scaling Patterns
- **Small** (single file, few options — e.g., API configuration):
  No H2s needed. Place a parameter table and an example directly under the intro.
- **Medium** (one file, moderate options — e.g., server, features):
  2–3 H2s. Typical pattern: one H2 for available options/structure, one for configuration examples, and optionally one for a related concept (e.g., "Future flags API").
- **Large** (many sub-domains — e.g., admin-panel, database):
  Multiple thematic H2s, each covering a distinct sub-domain with its own parameter table and examples. A single "Available options" table would be unreadable; split into sub-domains instead.

Building Blocks
Use these recurring patterns within H2 sections as applicable:

- **Parameter tables**: Columns `Parameter`, `Description`, `Type`, `Default`. Use a single table for flat option lists; use H3 subsections for nested objects.
- **Environment variable tables**: Columns `Variable`, `Purpose`, `Type`, `Default`. Include a sample `.env` block when relevant.
- **Code examples**: Always include a file path in the code fence title (e.g., `title="/config/server.js"`). Use `<Tabs groupId="js-ts">` for JavaScript/TypeScript variants.
- **Per-environment overrides**: Show `/config/env/{environment}/...` files when the configuration supports environment-specific values.
- **Minimal vs. full configurations**: Use `<Tabs>` with labels "Minimal configuration" and "Full configuration" when both are useful to the reader.
- **Advanced examples**: Use `<details>` blocks for edge-case or advanced scenarios (e.g., timezones, SSL, one-off cron jobs).

Heading Conventions
- Use H2 for thematic blocks; H3 for sub-topics, nested config objects, or specific tasks within a block.
- Prefer explicit, descriptive headings (e.g., "`connection` configuration object", "Admin panel server") over generic ones (e.g., "Options", "Settings").
- Use sentence case for all headings.

Templates
- Start from `agents/templates/configuration-template.md` for frontmatter, H1/TL;DR placement, and building block examples.
- Quick overview of all templates (paths and purposes): `agents/templates/README.md`.

Quality Checklist (before commit)
- TL;DR present and precise about file paths and scope.
- Intro paragraph states where the configuration lives (paths) and what it controls.
- H2 sections are thematic and appropriate for the page's complexity (not too many for small configs, not too few for large ones).
- Parameter tables use the standard column pattern and document all options.
- Code examples include file path titles and are runnable.
- JS/TS variants use `<Tabs groupId="js-ts">` consistently.
- Per-environment overrides documented when applicable.