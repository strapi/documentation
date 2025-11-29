# AGENTS.md (CMS docs)

Scope
- Applies to all documentation pages under `cms/`.

Technical writing rules
- Follow CONTRIBUTING.md and STYLE_GUIDE.pdf.
- 12 Rules of Technical Writing: https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04
- Voice: address the reader as “you”, use active voice, short sentences.

Frontmatter and structure
- Always provide `title`, optional `description`, and meaningful headings (H2/H3).
- Include a <Tldr> section at the top summarizing the page.

MDX and code blocks
- Use MDX Tabs for language variants (JS/TS) under the same example.
- Always specify code fence language and prefer `title=` with nearby `path:` lines.

Preflight checks before PR
- `npm run generate:llms-code` (anchors + file checks by default)
- `npm run generate:llms`
- Validate links/anchors and skim `llms-code.txt` for correctness.
