# Subject resolver

Shared logic for resolving an inki skill's **subject** argument (*what should be documented*) into a normalized brief that the research and write phases can consume. This is distinct from `target-resolver.md`, which resolves an existing file *to review*. The subject resolver starts from a topic or a source that describes a topic, and ends with a brief; the target resolver starts from (and ends with) concrete files on disk.

Skills that start a documentation effort from a subject (`document`, and optionally `research`) reference this file instead of duplicating the parsing rules.

The resolver takes whatever the user passed (after flags are stripped) and returns:

- `BRIEF`: a normalized brief, a short Markdown block with a `# title`, a one-paragraph summary of what must be documented, and any key facts, constraints, or links extracted from the source. This is what `/inki:research` and `/inki:write` consume.
- `SUBJECT_LABEL`: a short human label for headers, e.g. `topic: "MCP server"`, `Notion: Realtime API spec`, `Linear DOC-412`, `PDF: webhooks-rfc.pdf`.
- `SOURCE_KIND`: one of the types below (for logging and for deciding how much trust to place in the source).
- `CLEANUP`: an optional command to run after the skill finishes (temp-file removal). May be empty.

## Accepted source types

The subject is classified by inspecting its shape, in this order (first match wins):

| # | Source type | How to detect | Resolves to |
|---|-------------|---------------|-------------|
| 1 | Keyword topic | Short free text, no URL, no path, not multi-line | A brief built from the keywords plus a research pass |
| 2 | Notion page | A `notion.so` / `notion.site` URL, or `notion:` prefix | The page content fetched via the Notion MCP, distilled into a brief |
| 3 | Linear issue | A Linear issue ID (`ABC-123`) or a `linear.app/.../issue/...` URL | The issue title + description + relevant comments, via the Linear MCP |
| 4 | PDF file | A local path ending in `.pdf`, or a PDF URL | The extracted PDF text, distilled into a brief |
| 5 | Local text/markdown file | A path ending in `.md`/`.mdx`/`.txt` that exists on disk | The file content used directly as (or distilled into) the brief |
| 6 | Pasted content | Multi-line free text, or clearly prose/spec content | The pasted text used directly as the brief |

When a subject is ambiguous (e.g. a short string that could be a keyword or a bare Linear ID), prefer the more specific interpretation (Linear ID over keyword) only when the value matches the exact `^[A-Z]+-[0-9]+$` shape; otherwise treat it as a keyword. State the chosen interpretation in the `SUBJECT_LABEL` so the user can correct it.

## Resolution by type

### 1. Keyword topic

Use the keywords as the seed. The brief at this stage is thin on purpose: the research phase (`/inki:research`) is what fills it in. Produce:

```
# <topic, title-cased>

Document: <verbatim keywords>.
(Brief to be enriched by /inki:research.)
```

`SOURCE_KIND` = `keyword`. `CLEANUP` is empty.

### 2. Notion page

1. Fetch the page with the Notion MCP (`mcp__claude_ai_Notion__notion-fetch`) using the URL or page ID.
2. If the fetch fails (auth, not shared), report it and ask the user to paste the content instead (fall back to type 6).
3. Distill the page into a brief: keep the title, the core explanation, any API/config details, and links. Drop Notion-specific chrome (comments, status props) unless they state requirements.

`SOURCE_KIND` = `notion`. `SUBJECT_LABEL` = `Notion: <page title>`. `CLEANUP` is empty.

### 3. Linear issue

1. Fetch the issue with the Linear MCP (`mcp__claude_ai_Linear__get_issue`) using the ID or URL.
2. If the fetch fails, report it and fall back to asking for pasted content (type 6).
3. Build the brief from the issue title, description, and any comment that adds documentation-relevant facts. Note the issue ID so `/inki:submit` can later reference it (`Fixes <ID>` is NOT automatic: Linear issues are not GitHub issues; only mention it in the brief).

`SOURCE_KIND` = `linear`. `SUBJECT_LABEL` = `Linear <issue-id>`. `CLEANUP` is empty.

### 4. PDF file

1. Read the PDF with the Read tool, which extracts its text. The Read tool caps how many PDF pages it returns per call, so for a long PDF, read it across several calls (passing a page range each time) until you have the whole document.
2. If it is a URL, fetch it first to a temp file: `/tmp/inki-document-<slug>.pdf`, then read it.
3. Distill the extracted text into a brief: title, summary, and the facts/specs relevant to documentation. PDFs are often specs or RFCs, so extract requirements, not formatting.

`SOURCE_KIND` = `pdf`. `SUBJECT_LABEL` = `PDF: <filename>`. `CLEANUP` = `rm -f /tmp/inki-document-<slug>.pdf` if a temp file was created, else empty.

### 5. Local text/markdown file

Read the file. If it already reads like a brief (a topic description), use it verbatim as `BRIEF`. If it is raw notes, distill it into the brief shape. Do not confuse this with the *target* resolver: here the file describes what to document, it is not the page being reviewed.

`SOURCE_KIND` = `file`. `SUBJECT_LABEL` = the path. `CLEANUP` is empty.

### 6. Pasted content

The user pasted a description, spec, or notes directly:

1. Derive a slug from the first `# H1` or the first few words, falling back to `pasted`.
2. Use the pasted text as `BRIEF` directly (distill only if it is very long or noisy).

`SOURCE_KIND` = `pasted`. `SUBJECT_LABEL` = `pasted content (<slug>)`. `CLEANUP` is empty (nothing written to disk unless distillation needed a temp file).

## Notes

- The resolver only *produces a brief*. It never decides whether the topic is already documented: that is `/inki:research`'s job, run as the first phase of `/inki:document`.
- MCP-backed sources (Notion, Linear) depend on the claude.ai connectors being authenticated. In a headless run they may be unavailable; in that case, report clearly and fall back to pasted content rather than failing silently.
- Per the repo rule, never invent facts beyond what the source supports. If the source is thin, the brief stays thin and the research phase compensates; do not pad it.

## Cleanup contract

Always run `CLEANUP` after the skill finishes, including on failure. In a Claude-Code-driven run, invoke the `CLEANUP` command explicitly as the final step rather than relying on a bash `trap`.
