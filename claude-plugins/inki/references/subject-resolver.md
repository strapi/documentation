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
| 1 | Strapi PR | A GitHub PR on a Strapi repo, in any of these forms: a `github.com/<owner>/<repo>/pull/<n>` URL (with or without the `https://`), an `<owner>/<repo> <n>` pair, a bare PR number, or free text naming a PR and a repo (e.g. "document PR 26597 from strapi/strapi") | `strapi/strapi` or `strapi/cloud`: a brief describing what the code change should document, built via `/inki:route`. `strapi/documentation`: stop, redirect to `/inki:review`. Any other repo: stop, not documented on docs.strapi.io (see below). |
| 2 | Notion page | A `notion.so` / `notion.site` URL, or `notion:` prefix | The page content fetched via the Notion MCP, distilled into a brief |
| 3 | Linear issue | A Linear issue ID (`ABC-123`) or a `linear.app/.../issue/...` URL | The issue title + description + relevant comments, via the Linear MCP |
| 4 | PDF file | A local path ending in `.pdf`, or a PDF URL | The extracted PDF text, distilled into a brief |
| 5 | Local text/markdown file | A path ending in `.md`/`.mdx`/`.txt` that exists on disk | The file content used directly as (or distilled into) the brief |
| 6 | Keyword topic | Short free text, no URL, no path, not multi-line, no PR reference | A brief built from the keywords plus a research pass |
| 7 | Pasted content | Multi-line free text, or clearly prose/spec content | The pasted text used directly as the brief |

Ordering matters (first match wins). A PR reference (type 1) is checked before Linear (a bare number is a PR candidate, not a Linear ID, which has the `ABC-123` shape) and before keyword/pasted. When a subject is ambiguous (e.g. a short string that could be a keyword or a bare Linear ID), prefer the more specific interpretation (Linear ID over keyword) only when the value matches the exact `^[A-Z]+-[0-9]+$` shape; otherwise treat it as a keyword. State the chosen interpretation in the `SUBJECT_LABEL` so the user can correct it.

## Resolution by type

### 1. Strapi PR

The subject refers to a GitHub pull request on a Strapi repository. First, parse the reference into `OWNER/REPO` and `PR_NUMBER`:

- Full URL (`https://github.com/<owner>/<repo>/pull/<n>`, or the same without `https://`): take owner, repo, and the trailing number; strip any `/files`, `/commits`, `#anchor` tail.
- `<owner>/<repo> <n>` pair (e.g. `strapi/strapi 26597`): owner/repo from the first token, number from the second.
- Free text naming a repo and a PR (e.g. "document PR 26597 from strapi/strapi"): extract the `owner/repo` and the number from the prose.
- Bare PR number (e.g. `26597`) with no repo anywhere: the repo is unknown. **Ask the user which repo the PR belongs to** (do not guess a default). Stop until they answer.

Then branch on the repo. Only two repos are documented on docs.strapi.io: `strapi/strapi` (the CMS) and `strapi/cloud` (Strapi Cloud).

- **If `OWNER/REPO` is `strapi/strapi` or `strapi/cloud`:** this is a code change to be documented. Build the brief using the routing logic of `/inki:route`, which covers both repos and maps the change to its docs area (`docs/cms/` for `strapi/strapi`, `docs/cloud/` for `strapi/cloud`): identify, from the PR's diff and description, what changed and which documentation pages/sections it affects. The brief captures the feature/change and the doc targets, so the write phase knows what to produce. Keep the PR reference in the brief so `/inki:submit` can mention it in the eventual docs PR (a cross-repo reference, not a `Fixes` that would auto-close).
- **If `OWNER/REPO` is `strapi/documentation`:** this is a documentation PR (content already written), not a subject to document. **Stop** and tell the user: "That is a documentation PR. To review it, run `/inki:review <PR url or number>` instead." Do not produce a brief.
- **Any other repo** (`strapi/design-system`, plugins, internal repos, etc.): that repo is not documented on docs.strapi.io, so there is nothing for inki to document. **Stop** and tell the user: "`<owner>/<repo>` is not documented on docs.strapi.io (only strapi/strapi and strapi/cloud are), so there is no doc to write from this PR." Do not produce a brief.

`SOURCE_KIND` = `strapi-pr`. `SUBJECT_LABEL` = `<owner>/<repo> PR #<n>`. `CLEANUP` is empty.

### 2. Notion page

1. Fetch the page with the Notion MCP (`mcp__claude_ai_Notion__notion-fetch`) using the URL or page ID.
2. If the fetch fails (auth, not shared), report it and ask the user to paste the content instead (fall back to type 7, pasted content).
3. Distill the page into a brief: keep the title, the core explanation, any API/config details, and links. Drop Notion-specific chrome (comments, status props) unless they state requirements.

`SOURCE_KIND` = `notion`. `SUBJECT_LABEL` = `Notion: <page title>`. `CLEANUP` is empty.

### 3. Linear issue

1. Fetch the issue with the Linear MCP (`mcp__claude_ai_Linear__get_issue`) using the ID or URL.
2. If the fetch fails, report it and fall back to asking for pasted content (type 7).
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

### 6. Keyword topic

Use the keywords as the seed. The brief at this stage is thin on purpose: the research phase (`/inki:research`) is what fills it in. Produce:

```
# <topic, title-cased>

Document: <verbatim keywords>.
(Brief to be enriched by /inki:research.)
```

`SOURCE_KIND` = `keyword`. `CLEANUP` is empty.

### 7. Pasted content

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
