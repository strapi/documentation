# Target resolver

Shared logic for resolving an inki skill's target argument to a concrete set of local files to operate on. Skills that accept a review target (`review`, and any future skill that reviews existing content) reference this file instead of duplicating the parsing rules.

The resolver takes whatever the user passed (after flags are stripped) and returns:

- `FILES`: a list of local file paths the sub-skills operate on.
- `SCOPE`: a short human label describing the target (used in report headers), e.g. `PR #3204 (1 doc file)`, `docusaurus/docs/cms/intro.md`, or `pasted content`.
- `UPSTREAM_PRS`: a list of referenced upstream code PRs (in `strapi/strapi` or `strapi/cloud`) that the documentation under review is documenting. Each entry is `{repo, number}`. Empty unless the target is a `strapi/documentation` PR whose description references one (see "Detecting upstream code PRs" below). The code-verifier and coherence-checker use it as the primary source of truth, because a docs PR that documents an unmerged code change must be verified against *that change*, not against `develop` or a stale local clone.
- `CLEANUP`: an optional command to run after the skill finishes (worktree teardown, temp-file removal). May be empty.

The repo is always `strapi/documentation`. Docs live under `docusaurus/docs/`.

## Accepted input types

The target is classified by inspecting its shape, in this order (first match wins):

| # | Input type | How to detect | Resolves to |
|---|-----------|---------------|-------------|
| 1 | Empty | No argument left after stripping flags | Changed `.md` files on the current branch |
| 2 | GitHub PR | URL `github.com/strapi/documentation/pull/<n>`, `#<n>`, or a bare integer | The PR's changed doc files, in a temporary worktree |
| 3 | docs.strapi.io URL | Starts with `https://docs.strapi.io/` (or `http://`) | The published source file the URL maps to, read from `origin/main` |
| 4 | Local path | Contains a `/` or ends in `.md`/`.mdx`, and exists on disk | That file, or all docs under it if a directory |
| 5 | Bare filename | A `.md`/`.mdx` name with no directory part, not found as a literal path | The unique file of that name under `docusaurus/docs/` |
| 6 | Pasted content | None of the above; the argument is multi-line or clearly Markdown body/frontmatter | A temp file written from the pasted text |

When a target is ambiguous (e.g. a bare integer that is also a plausible filename), prefer the PR interpretation only when the value is purely numeric; otherwise treat it as a filename. State the chosen interpretation in the report header so the user can correct it.

## Resolution by type

### 1. Empty

```bash
git diff main...HEAD --name-only -- '*.md' '*.mdx'
```

Operates on the current working tree. `CLEANUP` is empty.

### 2. GitHub PR

1. Extract the PR number: strip a leading `#`, strip URL tails (`/files`, `/changes`), then take the trailing `[0-9]+`.
2. Fetch the PR's changed files **and its title/body** (the body is needed to detect upstream code-PR references, see step 7):

   ```bash
   gh pr view <num> --repo strapi/documentation --json files,headRefName,title,body
   ```

   Take the changed paths from `.files[].path`.

3. Filter to `.md` and `.mdx` only. If the PR changes no documentation file, report that and stop.
4. Check the PR out in a temporary worktree so sub-skills see the PR's version, not `main`:

   ```bash
   WORKTREE=$(./claude-plugins/inki/scripts/pr-worktree.sh create <num>)
   ```

5. `FILES` = each path from step 3, prefixed with `$WORKTREE/`.
6. `CLEANUP` = `./claude-plugins/inki/scripts/pr-worktree.sh destroy <num>`.
7. Detect upstream code PRs referenced in the title/body and populate `UPSTREAM_PRS` (see "Detecting upstream code PRs" below).

`SCOPE` = `PR #<num> (<count> doc file[s])`. When `UPSTREAM_PRS` is non-empty, append ` — documents <repo>#<number>[, …]` so the report header makes the source of truth explicit.

### 3. docs.strapi.io URL

A `docs.strapi.io` URL points at the *published* page, so the review must run against the published source on `origin/main`, not a possibly-stale working copy. Check the page out in a temporary worktree on `origin/main` so the file sits at its real path under `docusaurus/docs/`. This keeps coherence-check and code-verify fully functional (relative links and sibling pages resolve), unlike a loose temp file:

1. Strip the origin (`https://docs.strapi.io`) and any trailing slash, query string, or `#anchor`.
2. The remaining path is the doc route, e.g. `/cms/features/strapi-mcp-server`.
3. Create the worktree (it fetches `origin/main` first); sub-skills see the published version, not the current branch. This never touches the working tree, so no stash or commit is needed first:

   ```bash
   WORKTREE=$(./claude-plugins/inki/scripts/main-worktree.sh create)
   ```

4. The source file is that route under `$WORKTREE/docusaurus/docs/`, trying `.md` then `.mdx`:
   - `$WORKTREE/docusaurus/docs/cms/features/strapi-mcp-server.md`
   - if absent, `…/strapi-mcp-server.mdx`
   - if the route ends in a segment that is a directory, try `…/<segment>/index.md` / `index.mdx`.
5. `FILES` = the first candidate that exists. `CLEANUP` = `./claude-plugins/inki/scripts/main-worktree.sh destroy`.
6. If the local working tree (in the main checkout) has uncommitted changes to the same path, note in the report header that the review ran against `origin/main` and that those local uncommitted changes were **not** included.
7. If no candidate exists on `origin/main` (e.g. the page is generated, or the route uses a sidebar alias), destroy the worktree and fall back to fetching the rendered page with WebFetch, treating the result as **pasted content** (type 6). Note in the report that the review ran against the published HTML, not local source.

`SCOPE` = `docs.strapi.io<route> (origin/main)`, or `docs.strapi.io<route> (fetched)` for the WebFetch fallback. `CLEANUP` tears down the worktree (or removes the WebFetch temp file in the fallback).

### 4. Local path

Use the path directly. If it is a directory, recursively collect `.md` and `.mdx` files under it. `CLEANUP` is empty.

`SCOPE` = the path.

### 5. Bare filename

The user passed a filename with no directory, e.g. `strapi-mcp-server.md`:

```bash
find docusaurus/docs -type f \( -name '<name>' \) 2>/dev/null
```

- Exactly one match: use it.
- Multiple matches: list them and ask the user which one (or, with `--non-interactive`, review all of them).
- No match: report that the file was not found and stop.

`SCOPE` = the resolved path.

### 6. Pasted content

The user pasted Markdown directly (frontmatter, headings, prose) instead of a reference:

1. Derive a slug from the first `# H1` or frontmatter `title:`, falling back to `pasted`.
2. Write the content verbatim to `/tmp/inki-review-paste-<slug>.md`.
3. `FILES` = that temp file.
4. `CLEANUP` = `rm -f /tmp/inki-review-paste-<slug>.md`.

`SCOPE` = `pasted content (<slug>)`.

Note: coherence-check and code-verify are less reliable on pasted content, because the file is outside the docs tree (relative links and sibling-page lookups will not resolve). Note this limitation in the report when the target is pasted content.

## Detecting upstream code PRs

A `strapi/documentation` PR usually documents a change that ships in a `strapi/strapi` (CMS) or `strapi/cloud` (Cloud) PR. When the docs PR is still open, that code PR is frequently **unmerged**, so neither `develop` nor a local clone reflects the behavior being documented yet. Verifying the docs against `develop` then produces false "this config key/value does not exist" findings (a real failure mode: a security-defaults PR was flagged as wrong because the scaffolding change lived in an unmerged upstream PR). Detecting the reference lets the code-verifier and coherence-checker target the right source.

This runs **only for type 2 (a `strapi/documentation` GitHub PR)**; for all other target types `UPSTREAM_PRS` is empty.

1. Take the PR `title` and `body` fetched in step 2.
2. Scan for references to a code PR in either documented repo. Match all of these forms, case-insensitive:
   - `strapi/strapi#<n>` and `strapi/cloud#<n>` (cross-repo shorthand)
   - full URLs: `https://github.com/strapi/strapi/pull/<n>`, `https://github.com/strapi/cloud/pull/<n>` (ignore any `/files`, `/commits` tail)
   - Do **not** match a bare `#<n>` with no `owner/repo` prefix: inside a `strapi/documentation` PR body, `#1234` refers to documentation, not code.
3. Deduplicate by `(repo, number)`. For each unique hit, add `{repo, number}` to `UPSTREAM_PRS`, preserving the order they appear in the body.
4. If nothing matches, `UPSTREAM_PRS` is empty — verification falls back to its normal source order (local clone, then `develop`).

These references are passed through to the dispatched agents (the `review` skill hands `UPSTREAM_PRS` to the code-verifier and coherence-checker); the resolver only detects them, it does not fetch the code itself. Fetching the PR diff/files is the code-verifier's job, using `gh pr diff <number> --repo <repo>` or `gh pr view <number> --repo <repo> --json files`, or GitHub MCP per `references/prompts/shared/github-mcp-usage.md`.

## Cleanup contract

Always run `CLEANUP` after the skill finishes, including on failure. In a Claude-Code-driven run (where a bash `trap` may not survive across separate tool calls), invoke the `CLEANUP` command explicitly as the final step rather than relying on `trap`.
