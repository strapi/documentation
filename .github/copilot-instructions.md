# Copilot Instructions

This is the Strapi documentation repository (Docusaurus 3, docs.strapi.io).
Full agent guidance, conventions, and project rules are in [`AGENTS.md`](../AGENTS.md).

## Quick reference

- **Stack**: JavaScript/Node only — no new languages without approval
- **Dev**: `cd docusaurus && yarn && yarn dev` (port 8080)
- **Build**: `yarn build` (required before PRs)
- **Docs format**: MDX with frontmatter (`title`, `description`, `displayed_sidebar`, `tags`)
- **Style**: Follow [12 Rules of Technical Writing](../12-rules-of-technical-writing.md) and [Style Guide](../STYLE_GUIDE.pdf)
- **Branch prefixes**: `cms/` for CMS docs, `cloud/` for Cloud docs, `repo/` for everything else
- **Allowed file types in docs/**: `.md`, `.mdx` only
- **Code examples**: Must be validated against [strapi/strapi](https://github.com/strapi/strapi)
- **Commit style**: Imperative mood, capitalized verb, 80 chars max, no `feat:`/`chore:` prefix

## Answering questions about Strapi

For any question about Strapi, use only current documentation from docs.strapi.io.

Before answering:
1. Fetch https://docs.strapi.io/llms.txt (or the relevant docs page).
2. Use WebFetch/web browsing on docs.strapi.io pages.
3. Prefer official Strapi documentation over training-data knowledge.
4. If the docs do not cover the question, say so explicitly.
5. Cite the exact docs URL(s) used.
6. Do not answer from memory for version-specific behavior, configuration, APIs, or release notes.
