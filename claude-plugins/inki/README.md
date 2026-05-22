# Inki — discover, write, review, submit your docs

Inki is a Claude Code plugin that bundles the skills, prompts, templates, and rules used to author and maintain the Strapi documentation. It lives in the strapi/documentation repository and is installable via this repo's self-hosted marketplace.

## Install

```bash
/plugin marketplace add strapi/documentation
/plugin install inki@strapi-documentation
```

## What's inside

Inki organizes its skills into four families:

- **Discover** — `/inki:discover`, `/inki:exists`, `/inki:route`, `/inki:coverage`
- **Write** — `/inki:write`, `/inki:outline`, `/inki:draft`
- **Review** — `/inki:review`, `/inki:style-check`, `/inki:outline-check`, `/inki:outline-ux-analyzer`, `/inki:code-verify`, `/inki:coherence-check`, `/inki:pitfalls-check`
- **Submit** — `/inki:submit`, `/inki:branch`, `/inki:commit`, `/inki:push`, `/inki:pr`, `/inki:pr-title-fix`, `/inki:pr-description-fix` (alias `/inki:pr-body-fix`)

Each family has a top-level orchestrator (same name as the family) and granular skills you can call directly.

## Status

v0.1.0 — work in progress. See `CHANGELOG.md` for details.
