# Templates directory

This directory contains authoring skeletons for Strapi documentation. Use these files as starting points when creating new pages.

Why use a template
- Guarantees correct frontmatter (`title`, `description`, `displayed_sidebar`, `tags`) and H1 placement.
- Enforces the standard section order expected by reviewers and the Outline Checker prompt.
- Includes the required MDX components for each page type (`<Tldr>`, `<IdentityCard>`, `<Guideflow>`, Tabs, etc.).
- Reduces review friction: a page that follows the template passes structure checks on the first round.

How to use
1) Find the template that matches the page type in the catalog below.
2) Copy the file into the target path indicated and rename it.
3) Fill in the placeholders — the template comments explain what goes where.
4) Read the corresponding authoring guide (if available) for area‑specific conventions beyond what the template covers.
5) Delete any optional sections that don't apply to the page.

## Catalog

| Template | Target path | Purpose | Authoring guide |
|----------|-------------|---------|-----------------|
| `feature-template.md` | `docusaurus/docs/cms/features/` | Feature pages: TL;DR, intro, identity card, configuration, usage | `claude-plugins/inki/references/authoring/AGENTS.cms.features.md` |
| `plugin-template.md` | `docusaurus/docs/cms/plugins/` | Plugin pages: identity details, install steps, configuration (admin UI and code), usage tasks | `claude-plugins/inki/references/authoring/AGENTS.cms.plugins.md` |
| `configuration-template.md` | `docusaurus/docs/cms/configurations/` | Configuration pages: file location, available options, env variables, per‑environment overrides | `claude-plugins/inki/references/authoring/AGENTS.cms.configurations.md` |
| `guide-template.md` | `docusaurus/docs/cms/` (varies) | How‑to guides: prerequisites, numbered steps, validation, troubleshooting | `claude-plugins/inki/references/authoring/AGENTS.cms.guides.md` |
| `api-template.md` | `docusaurus/docs/cms/api/` | API reference pages: endpoints, auth, parameters, and the `<Endpoint>` 2‑column API block (HTTP request on one side, response/JS client on the other) | `claude-plugins/inki/references/authoring/AGENTS.cms.api.md` |
| `breaking-change-template.md` | `docusaurus/docs/cms/migration/**/breaking-changes/` | Breaking‑change pages: BreakingChangeIdCard, v4/v5 comparison, migration notes | — |

## What every template provides

- **Frontmatter block** with all required and recommended fields.
- **H1 title** matching the `title` frontmatter value.
- **`<Tldr>` component** at the top for the page summary.
- **Standard section headings** in the expected order for that page type.
- **Placeholder comments** (`<!-- ... -->`) explaining what content to write in each section.
- **Multi‑language patterns** using Tabs where applicable (see `claude-plugins/inki/references/templates/components/tabs.md` for Tabs/TabItem rules).
- **Progressive disclosure** using ExpandableContent where applicable (see `claude-plugins/inki/references/templates/components/expandable-content.md` for usage rules).
- **API request/response blocks** using the `<Endpoint>` 2‑column component where applicable (see `claude-plugins/inki/references/templates/components/endpoint.md` for `kind` `http`/`js` usage rules).
- **Tutorial steps** using the `<StepDetails>` component where applicable (see `claude-plugins/inki/references/templates/components/step-details.md` for usage rules).
- **"What's next?" navigation** using the `<NextSteps>` component where applicable (see `claude-plugins/inki/references/templates/components/next-steps.md` for usage rules).

## References

- Root agent guide: `AGENTS.md`
- Authoring area guides: `claude-plugins/inki/references/authoring/AGENTS.*.md`
- Tabs/TabItem rules: `claude-plugins/inki/references/templates/components/tabs.md`
- ExpandableContent rules: `claude-plugins/inki/references/templates/components/expandable-content.md`
- Annotation rules: `claude-plugins/inki/references/templates/components/annotation.md`
- Endpoint (2‑column API block, `kind` `http`/`js`) rules: `claude-plugins/inki/references/templates/components/endpoint.md`
- StepDetails (tutorial step) rules: `claude-plugins/inki/references/templates/components/step-details.md`
- NextSteps ("What's next?" block) rules: `claude-plugins/inki/references/templates/components/next-steps.md`
- ExternalLink (outbound link with trailing icon) rules: `claude-plugins/inki/references/templates/components/external-link.md`
- Icon (inline Phosphor icons in prose) rules: `claude-plugins/inki/references/templates/components/icon.md`
- Badge (plan / status / version flags via named aliases like `<GrowthBadge>`, `<NewBadge>`) rules: `claude-plugins/inki/references/templates/components/badge.md`
- Columns / ColumnLeft / ColumnRight (two-up side-by-side layout) rules: `claude-plugins/inki/references/templates/components/columns.md`
- SubtleCallout (low-emphasis "good to know" aside) rules: `claude-plugins/inki/references/templates/components/subtle-callout.md`
- Checklist / ChecklistItem (interactive checkbox lists) rules: `claude-plugins/inki/references/templates/components/checklist.md`
- MermaidWithFallback (live Mermaid diagram with static fallback) rules: `claude-plugins/inki/references/templates/components/mermaid-with-fallback.md`
- MultiLanguageSwitcher (language-switchable API request examples) rules: `claude-plugins/inki/references/templates/components/multi-language-switcher.md`