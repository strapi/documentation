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
