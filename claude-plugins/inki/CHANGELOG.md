# Inki Changelog

## v0.1.0 — 2026-05-22

### Added

- Plugin scaffolding (`.claude-plugin/plugin.json`, README, CHANGELOG).
- Self-hosted marketplace manifest at `.claude-plugin/marketplace.json`.
- Discover family: `/inki:discover`, `/inki:exists`, `/inki:route`, `/inki:coverage`.
- Write family: `/inki:write`, `/inki:outline`, `/inki:draft`.
- Review family: `/inki:review`, `/inki:style-check`, `/inki:outline-check`, `/inki:outline-ux-analyzer`, `/inki:code-verify`, `/inki:coherence-check`, `/inki:pitfalls-check`.
- Submit family: `/inki:submit`, `/inki:branch`, `/inki:commit`, `/inki:push`, `/inki:pr`, `/inki:pr-fix <title|description|body>`.
- 1-way root → plugin sync GitHub Action with drift guard.
- Migration of prompts, templates, and authoring guides into `claude-plugins/inki/references/`.
- Pointer README at the previous location for backward discoverability.
