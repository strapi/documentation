# AGENTS.md (Cloud docs)

Scope
- Applies to all documentation pages under `cloud/`.

Technical writing rules
- Follow CONTRIBUTING.md and STYLE_GUIDE.pdf.
- 12 Rules of Technical Writing: ../../12-rules-of-technical-writing.md

Frontmatter and structure
- Never modify an existing page's frontmatter properties (`title`, `description`, `displayed_sidebar`, `sidebar_label`, `tags`, `canonicalUrl`, etc.) as a side effect of another edit. Changing these silently breaks page titles, SEO, and canonical URLs. Only touch a frontmatter value when the user explicitly asks for it, and confirm the exact before/after change with the user first.
- Cloud page `title` values keep the `Cloud` qualifier (e.g., `Cloud project collaboration`, `Cloud project logs`, `Cloud project settings`). This keeps the "Cloud" notion in the browser tab title and search results. Do not shorten these to drop `Cloud`.

Content specifics
- Emphasize deployment, security, IAM, and operational runbooks.
- For provider steps (e.g., AWS), keep screenshots current and add troubleshooting.
- For Cloud plan availability, use the Cloud plan badges (`CloudStarterBadge`, `CloudProBadge`, `CloudBusinessBadge`); see `../../templates/components/badge.md`. There is no `FreeBadge`: if no badge is shown, the feature is available on the Starter plan.

Preflight checks before PR
- Run generators; ensure anchors present; verify file paths for code snippets.
