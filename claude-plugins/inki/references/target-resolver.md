# Target resolver

Shared logic for resolving an inki skill's target argument to a concrete set of local files to operate on. Skills that accept a review target (`review`, and any future skill that reviews existing content) reference this file instead of duplicating the parsing rules.

The resolver takes whatever the user passed (after flags are stripped) and returns:

- `FILES`: a list of local file paths the sub-skills operate on.
- `SCOPE`: a short human label describing the target (used in report headers), e.g. `PR #3204 (1 doc file)`, `docusaurus/docs/cms/intro.md`, or `pasted content`.
- `CLEANUP`: an optional command to run after the skill finishes (worktree teardown, temp-file removal). May be empty.

The repo is always `strapi/documentation`. Docs live under `docusaurus/docs/`.

## Accepted input types

The target is classified by inspecting its shape, in this order (first match wins):

| # | Input type | How to detect | Resolves to |
|---|-----------|---------------|-------------|
| 1 | Empty | No argument left after stripping flags | Changed `.md` files on the current branch |
| 2 | GitHub PR | URL `github.com/strapi/documentation/pull/<n>`, `#<n>`, or a bare integer | The PR's changed doc files, in a temporary worktree |
| 3 | docs.strapi.io URL | Starts with `https://docs.strapi.io/` (or `http://`) | The matching local source file |
| 4 | Local path | Contains a `/` or ends in `.md`/`.mdx`, and exists on disk | That file, or all docs under it if a directory |
| 5 | Bare filename | A `.md`/`.mdx` name with no directory part, not found as a literal path | The unique file of that name under `docusaurus/docs/` |
| 6 | Pasted content | None of the above; the argument is multi-line or clearly Markdown body/frontmatter | A temp file written from the pasted text |

When a target is ambiguous (e.g. a bare integer that is also a plausible filename), prefer the PR interpretation only when the value is purely numeric; otherwise treat it as a filename. State the chosen interpretation in the report header so the user can correct it.

## Resolution by type

### 1 — Empty

```bash
git diff main...HEAD --name-only -- '*.md' '*.mdx'
```

Operates on the current working tree. `CLEANUP` is empty.

### 2 — GitHub PR

1. Extract the PR number: strip a leading `#`, strip URL tails (`/files`, `/changes`), then take the trailing `[0-9]+`.
2. Fetch the PR's changed files:

   ```bash
   gh pr view <num> --repo strapi/documentation --json files,headRefName --jq '.files[].path'
   ```

3. Filter to `.md` and `.mdx` only. If the PR changes no documentation file, report that and stop.
4. Check the PR out in a temporary worktree so sub-skills see the PR's version, not `main`:

   ```bash
   WORKTREE=$(./claude-plugins/inki/scripts/pr-worktree.sh create <num>)
   ```

5. `FILES` = each path from step 3, prefixed with `$WORKTREE/`.
6. `CLEANUP` = `./claude-plugins/inki/scripts/pr-worktree.sh destroy <num>`.

`SCOPE` = `PR #<num> (<count> doc file[s])`.

### 3 — docs.strapi.io URL

Map the public URL to a local source file:

1. Strip the origin (`https://docs.strapi.io`) and any trailing slash, query string, or `#anchor`.
2. The remaining path is the doc route, e.g. `/cms/features/strapi-mcp-server`.
3. The source file is that route under `docusaurus/docs/`, trying `.md` then `.mdx`:
   - `docusaurus/docs/cms/features/strapi-mcp-server.md`
   - if absent, `…/strapi-mcp-server.mdx`
   - if the route ends in a segment that is a directory, try `…/<segment>/index.md` / `index.mdx`.
4. If no local file matches (e.g. the page is generated, or the route uses a sidebar alias), fall back to fetching the rendered page with WebFetch and treat the result as **pasted content** (type 6), noting in the report that the review ran against the published HTML, not local source.

`SCOPE` = the resolved local path, or `docs.strapi.io<route> (fetched)` for the fallback. `CLEANUP` is empty unless the fallback wrote a temp file.

### 4 — Local path

Use the path directly. If it is a directory, recursively collect `.md` and `.mdx` files under it. `CLEANUP` is empty.

`SCOPE` = the path.

### 5 — Bare filename

The user passed a filename with no directory, e.g. `strapi-mcp-server.md`:

```bash
find docusaurus/docs -type f \( -name '<name>' \) 2>/dev/null
```

- Exactly one match: use it.
- Multiple matches: list them and ask the user which one (or, with `--yes`, review all of them).
- No match: report that the file was not found and stop.

`SCOPE` = the resolved path.

### 6 — Pasted content

The user pasted Markdown directly (frontmatter, headings, prose) instead of a reference:

1. Derive a slug from the first `# H1` or frontmatter `title:`, falling back to `pasted`.
2. Write the content verbatim to `/tmp/inki-review-paste-<slug>.md`.
3. `FILES` = that temp file.
4. `CLEANUP` = `rm -f /tmp/inki-review-paste-<slug>.md`.

`SCOPE` = `pasted content (<slug>)`.

Note: coherence-check and code-verify are less reliable on pasted content, because the file is outside the docs tree (relative links and sibling-page lookups will not resolve). Note this limitation in the report when the target is pasted content.

## Cleanup contract

Always run `CLEANUP` after the skill finishes, including on failure. In a Claude-Code-driven run (where a bash `trap` may not survive across separate tool calls), invoke the `CLEANUP` command explicitly as the final step rather than relying on `trap`.
