# Authoring guides

This directory contains area‑specific writing rules for Strapi documentation. Each file defines the expected structure, section order, frontmatter, components, and conventions for a particular section of the docs.

These guides are the reference that writers follow when creating or editing pages, and that the Outline Checker prompt validates against.

## How to use

1) Identify which area of the docs the page belongs to (features, plugins, configurations, etc.).
2) Read the corresponding guide below for section order, required components, and area‑specific conventions.
3) Use the matching template from `agents/templates/` as a starting point for new pages.

## Catalog

| Guide | Scope | Matching template |
|-------|-------|-------------------|
| `AGENTS.cms.md` | All CMS docs — shared rules, frontmatter, TL;DR, code blocks, Tabs | — (root rules, no template) |
| `AGENTS.cms.api.md` | API reference pages under `docusaurus/docs/cms/api/` | `agents/templates/api-template.md` |
| `AGENTS.cms.configurations.md` | Configuration pages under `docusaurus/docs/cms/configurations/` | `agents/templates/configuration-template.md` |
| `AGENTS.cms.features.md` | Feature pages under `docusaurus/docs/cms/features/` | `agents/templates/feature-template.md` |
| `AGENTS.cms.guides.md` | How‑to guides across CMS docs | `agents/templates/guide-template.md` |
| `AGENTS.cms.plugins.md` | Plugin pages under `docusaurus/docs/cms/plugins/` | `agents/templates/plugin-template.md` |
| `AGENTS.cloud.md` | Cloud documentation under `docusaurus/docs/cloud/` | — |
| `AGENTS.snippets.md` | Shared snippets under `docusaurus/docs/snippets/` | — |

## Precedence

- The root `AGENTS.md` (at repo level) defines repository‑wide rules.
- `AGENTS.cms.md` adds CMS‑wide rules that apply to all CMS areas.
- Area‑specific guides (e.g., `AGENTS.cms.features.md`) add or override rules for their scope.

When rules conflict, the most specific guide wins.

## References

- Root agent guide: `AGENTS.md`
- Templates catalog: `agents/templates/README.md`
- Prompts catalog: `agents/prompts/README.md`
