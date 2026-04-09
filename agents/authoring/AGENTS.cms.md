# AGENTS.md (CMS docs)

Scope
- Applies to all documentation pages under `cms/`.

Technical writing rules
- Follow CONTRIBUTING.md and STYLE_GUIDE.pdf.
- 12 Rules of Technical Writing: ../../12-rules-of-technical-writing.md
- Voice: address the reader as “you”, use active voice, short sentences.

Frontmatter and structure
- Always provide `title`, optional `description`, and meaningful headings (H2/H3).
- Include a <Tldr> section at the top summarizing the page.

Templates
- CMS authoring templates live in `agents/templates/` (guide, API, configuration, feature, migration, plugin). Start from a template to ensure structure and frontmatter are correct.
- For a quick overview of available templates (paths and purposes), see `agents/templates/INDEX.md`.

MDX and code blocks
- Use MDX Tabs for language variants (JS/TS) under the same example.
- Always specify code fence language. Use `title="<file path>"` (e.g., `title="/config/server.js"`) to show the file path in the code block header — never prefix the path with `path:` inside the title.
- Never place a code block, table, or other structured element immediately after a heading or another block without an introductory sentence. Every block must be preceded by a complete sentence (subject + verb) that tells the reader what the block contains or demonstrates. End the sentence with a colon when it directly introduces the block. Examples: "The function accepts the following parameters:", "The following example shows how to configure the server:".

Preflight checks before PR
- `npm run generate:llms-code` (anchors + file checks by default)
- `npm run generate:llms`
- Validate links/anchors and skim `llms-code.txt` for correctness.
