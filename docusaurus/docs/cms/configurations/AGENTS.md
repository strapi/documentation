# AGENTS.md (Configuration pages)

Scope
- Applies to all configuration pages under `docusaurus/docs/cms/configurations/` (recursively), including provider-specific pages (e.g., SSO providers).
- Follow repo‑wide rules for TL;DR, callouts, and code snippets; this guide only encodes structure and headings.

Purpose
- Ensure configuration pages present a consistent, predictable flow from overview to concrete setup and examples.

Frontmatter (recommended)
- `title`: Configuration area (Title Case), e.g., “Database configuration”.
- `description`: One concise sentence summarizing what the configuration controls.
- Optional: tags specific to the configuration area.
 - Optional: `displayed_sidebar: cmsSidebar` and `sidebar_label` to fit navigation.

Required Section Order
1) H1 title — matches `title` frontmatter.
2) TL;DR — brief description of what the config file(s) control and where they live.
3) Overview — short intro that names the main file(s)/paths (e.g., `/config/admin`, `/config/api.js|ts`).
4) Configuration structure (H2)
   - Break down objects/keys (use tables or H3 subsections for nested structures).
5) Configuration tasks (H2)
   - Present common tasks as H3 subsections (e.g., “Admin panel configuration”, “Code-based configuration”, “Creating a cron job”, “Enabling cron jobs”).
   - Use numbered steps in each task; include UI paths or file paths.
6) Examples (H2)
   - Provide one or more concrete examples (config files, env usage) with file paths.
7) Environment‑specific notes (H2) — when applicable
   - Describe per‑environment overrides (e.g., `./config/env/{environment}/...`) and env var helpers (`env()` casting).
8) Related links (H2)
   - Link to features using this configuration and to guides that modify these settings.

Templates
- Start from `docusaurus/docs/cms/templates/configuration-template.md` to keep frontmatter, H1/TL;DR placement, tables, env vars, and JS/TS Tabs consistent.

Heading Conventions
- Use H2 for major blocks (Structure, Tasks, Examples, Environment, Related links); H3 for specific tasks or nested keys.
- Prefer explicit, descriptive headings (e.g., “`connection` configuration object”, “Admin panel configuration”).

Quality Checklist (before commit)
- TL;DR present and precise about file paths and scope.
- Overview states where the configuration lives (paths) and what it controls.
- Structure section catalogs keys and their meaning (tables/H3 where needed).
- Tasks section provides actionable, numbered steps for common scenarios.
- Examples include paths and runnable config snippets.
- Environment notes present when settings differ by environment.
- Related links to features/guides included.
