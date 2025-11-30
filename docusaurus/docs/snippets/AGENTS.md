# AGENTS.md (Snippets)

Scope
- Applies to all snippet files under `docusaurus/docs/snippets/` (recursively).
- Snippets are reusable inserts referenced from other pages; they are not standalone pages.

Purpose
- Ensure snippets are self‑contained, consistent, and easy to reuse across multiple pages.

Content Conventions
- No frontmatter and no H1 titles. Use headingless content or, when needed, a short H3.
- Keep prose minimal; focus on the smallest self‑contained block that adds value.
- Avoid page‑specific context (“as seen above/below”); write snippets to stand alone wherever they are embedded.

Code Fences
- Always specify a language on fenced code blocks.
- Prefer adding a `title=` hint when it clarifies context (e.g., the filename or purpose).
- When relevant, include a nearby `path:` line before/after the fence to help tooling infer source files.
- Group language variants (JS/TS) as consecutive fences under the same snippet rather than duplicating prose.

Linking and References
- Prefer relative links within `/cms/` where possible; avoid absolute URLs unless necessary.
- Use `<ExternalLink />` for external resources when appropriate.
- Do not rely on page‑local anchors unless they are guaranteed to exist in all embedding pages.

Images and Media
- Avoid heavy media in snippets. If an image is essential, reference assets from `/static/` and ensure accessibility (alt text).

Reusability and Dependencies
- A snippet must not require prior imports or frontmatter in the embedding page to render correctly (unless clearly documented inline).
- If a snippet depends on a specific Strapi version or feature flag, state it briefly at the top as a note.

Naming and Location
- Name files descriptively using kebab‑case, reflecting purpose (e.g., `supported-databases.md`).
- Place provider‑ or feature‑specific snippets in subfolders for discoverability.

Quality Checklist (before commit)
- No frontmatter, no H1; content is self‑contained and minimal.
- All code fences have a language; add `title=` and `path:` hints where applicable.
- Links are valid and relative when possible; external links use `<ExternalLink />`.
- No page‑specific assumptions; snippet can be embedded in multiple contexts safely.
- Regenerate `llms-code.txt` and verify the snippet metadata (language and file path) is correctly extracted.
