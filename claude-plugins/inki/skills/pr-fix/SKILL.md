---
name: pr-fix
description: "Rewrite the title or description/body of one or more open PRs on strapi/documentation to match git-rules.md. Strict one-by-one confirmation, or auto-edit with --yes."
argument-hint: "<title|description|body> [--yes|-y] [--include-old] [PR# or URL] [PR# or URL] ..."
user-invocable: true
---

# Rewrite PR title or description/body on strapi/documentation

**Scope:** designed for strapi/documentation (and its forks).

## Input

`$ARGUMENTS` is `<action> [flags] [PR identifiers...]`.

### Required action (first positional argument)

| Action | What it rewrites |
|---|---|
| `title` | The PR title |
| `description` | The PR body/description |
| `body` | Alias of `description` (matches `gh pr edit --body` vocabulary) |

If no action is given, or if the first token is not one of the above, report the error and stop.

### Optional flags (anywhere after the action)

- `--yes` or `-y` → `AUTO=true` (non-interactive: skip confirmation prompts)
- `--include-old` → `INCLUDE_OLD=true` (only meaningful when no PR identifiers are given; includes open PRs older than 30 days)

### Optional PR identifiers

Zero or more, each as a bare number (`2143`), a hashed number (`#2143`), or a full URL (`https://github.com/strapi/documentation/pull/2143`, with optional `/files` or `/changes` suffix).

If no PR identifiers are given:
- By default, list **recent open PRs** (created within the last 30 days) via:
  ```bash
  gh pr list --repo strapi/documentation --state open \
    --search "created:>=$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d '30 days ago' +%Y-%m-%d)" \
    --limit 100 --json number,title,body,author,createdAt
  ```
- If `--include-old` is set, drop the `--search` filter to list all open PRs.

The 30-day cutoff uses `createdAt` (not `updatedAt`) because bot activity bumps `updatedAt` on otherwise stale PRs.

## Step 0: Parse arguments

1. Read the first positional token as `ACTION` (must be `title`, `description`, or `body`). Normalize `body` → `description` internally.
2. Detect `--yes`/`-y` → `AUTO=true`. Remove from list.
3. Detect `--include-old` → `INCLUDE_OLD=true`. Remove from list.
4. For each remaining token, extract trailing digits to get the PR number:
   - `2143` → `2143`
   - `#2143` → `2143`
   - `https://github.com/strapi/documentation/pull/2143` → `2143`
   - `https://github.com/strapi/documentation/pull/2143/files` → `2143`
   Regex `[0-9]+$` after stripping trailing path segments and a leading `#`.
5. Report any token that doesn't yield a numeric PR ID and skip it.

## Step 1: Validate environment

```bash
command -v gh >/dev/null || { echo "gh CLI required"; exit 1; }
```

## Step 2: Load the canonical rules

Depending on `ACTION`:

- `title`: read `../_shared/pr-title-rules.md` and `../../references/git-rules.md` (section "Pull Request Titles").
- `description` (and `body`): read `../_shared/pr-description-rules.md` and `../../references/git-rules.md` (the description section). Layer the strict strapi/documentation overrides on top:
  1. Must start with "This PR ..."
  2. No headings (no `##`, no `###`)
  3. No "Test plan" section
  4. No checklists
  5. Flat text only
  6. Issue references at the very end

## Step 3: Fetch and classify each PR

For each PR number, fetch metadata:

```bash
gh pr view <num> --repo strapi/documentation --json number,title,body,author
```

Bucket each PR:

- **compliant** → silently skip (do not display, do not edit)
- **non-compliant** → produce a proposed rewrite

### Title non-compliance reasons

`feat:/chore:/fix:/docs:` (or any `word(scope):`) prefix, lowercase first word, vague wording (1-2 generic words like "Update docs"), missing verb or specific noun, ticket ID at start, emoji at start, length over 80 characters.

### Description non-compliance reasons

Missing "This PR ..." opener, contains `##`/`###` heading, contains "Test plan" section, contains `- [ ]` checklist, contains boilerplate sections, empty body, body is just "Updated docs" type vagueness, or **missing the `Direct preview link 👉 [here](...)` last line** (handled in Step 5).

A description whose only issue is the missing preview link is still non-compliant: surface it, and the fix is adding the link per Step 5 (the prose itself is left untouched).

## Step 4: Apply rewrites

### If `AUTO=true`

**Case A — PR identifiers were given explicitly**

Edit immediately without further prompting:

- For `ACTION=title`: `gh pr edit <num> --repo strapi/documentation --title "<proposed>"`
- For `ACTION=description`: write the proposed body to a tmpfile, then `gh pr edit <num> --repo strapi/documentation --body-file <tmpfile>`

Announce each change inline:

```
PR #<num>: edited — "<proposed title>"    (for title)
PR #<num>: edited (description rewritten)   (for description)
```

**Case B — No PR identifiers given** (targets all recent open PRs)

A batch confirmation is required as a safety bracket. Display the full list of proposed edits first:

```
Review batch (--yes without PR IDs targets all recent open PRs):

| PR# | Author | Current | Proposed | Reason |     (for title)
| PR# | Author | Reason | Preview of new description |  (for description)
| ... | ...    | ...     | ...      | ...    |

Compliant (no changes needed): N PRs

Type `y` to apply all, `n` to cancel, or `s <PR#> <PR#> ...` to skip specific PRs and apply the rest.
```

Branch on the user's single response:

- `y` → apply all listed edits.
- `n` → cancel entirely, edit nothing, exit.
- `s <PR#> <PR#> ...` → remove those PRs from the batch, then apply the remaining edits.

### If `AUTO=false`

For each non-compliant PR, display the proposal and wait for input.

**For `ACTION=title`:**

```
PR #<num> — author: @<login>
  Current: <current title>
  Proposed: <proposed title>
  Reason: <short explanation>
  [y]es / [n]o / [e]dit <new title> / [s]kip
```

Branch on response:
- `y` → `gh pr edit <num> --repo strapi/documentation --title "<proposed>"`
- `n` or `s` → record as skipped
- `e <new title>` → edit with the user-provided title

**For `ACTION=description`:**

```
PR #<num> — author: @<login>
  Title: <current title (for context, not edited here)>

  --- Current description ---
  <current body>

  --- Proposed description ---
  <proposed body>

  Reason: <short explanation>
  [y]es / [n]o / [e]dit / [s]kip
```

Branch:
- `y` → write proposed body to tmpfile, `gh pr edit <num> --repo strapi/documentation --body-file <tmpfile>`
- `n` or `s` → record as skipped
- `e` → open temp file with proposal pre-filled, let user edit, re-display, ask `y`/`n`

## Step 5: Vercel preview link handling (description action only)

Every compliant strapi/documentation PR description ends with a Vercel preview link, where `<page-path>` begins with a leading `/` (e.g. `/cms/plugins-development/extend-mcp-server`):

```
Direct preview link 👉 [here](https://<deployment>.vercel.app<page-path>)
```

`pr-fix description` ensures this line exists. Behaviour:

1. **Line already present** → preserve it verbatim as the last line of the rewritten description. Do not rebuild or re-point it.
2. **Line missing** → treat its absence as a description non-compliance reason (see Step 3) and add it:

   a. Fetch the PR's Vercel preview deployment URL:
      ```bash
      gh pr view <num> --repo strapi/documentation --json comments \
        -q '.comments[] | select(.author.login | test("vercel"; "i")) | .body' \
        | grep -oE 'https://[a-z0-9-]+\.vercel\.app' | head -1
      ```
      If no `*.vercel.app` URL is found (deployment not ready, no Vercel comment yet), skip the link for this PR, note it in the Reason line, and continue with the rest of the rewrite.

   b. Determine the target page path. Prefer the **newly added** page:
      ```bash
      gh pr view <num> --repo strapi/documentation --json files \
        -q '[.files[] | select(.path | test("^docusaurus/docs/.*\\.(md|mdx)$"))][0].path'
      ```
      Filter to **added** files when the API exposes file status; if several added pages exist, take the first. If no added page, fall back to the first modified `docs/*.md(x)` file. Convert the file path to a URL path by stripping the `docusaurus/docs` prefix and the `.md`/`.mdx` extension (e.g. `docusaurus/docs/cms/plugins-development/extend-mcp-server.md` → `/cms/plugins-development/extend-mcp-server`).

   c. Build the candidate line:
      ```
      Direct preview link 👉 [here](https://<deployment>.vercel.app<page-path>)
      ```

   d. **Confirm the target before editing** (unless `AUTO=true`): show the user the candidate page path and ask whether to use it, target a different page, or use the deployment root. In `AUTO=true`, use the newly-added page without prompting.

   e. Optionally verify the URL resolves (HTTP 200) with `curl -s -o /dev/null -w '%{http_code}' -L --max-time 25 <url>` and surface a non-200 in the Reason line, but still add the line (the deployment may finish building shortly after).

**Line ordering.** The preview link is the **last line** of the description, matching `/inki:pr` ("append as the last line"). When `Fixes`/`Documents` references are also present, the order is:

```
<body paragraph or bullets>

Fixes #<n>   /   Documents [#<n>](url)

Direct preview link 👉 [here](https://<deployment>.vercel.app<page-path>)
```

References come first, the preview link last. This keeps a single, unambiguous tail order across both skills.

## Step 6: Final summary

After all PRs are processed:

```
| PR# | Action  | New title/description |
|-----|---------|------------------------|
| ... | edited  | ...                    |
| ... | skipped | (unchanged)            |
```

Include PRs classified as compliant in a separate count below the table (e.g., `Compliant (no changes needed): 5 PRs`).

## Rules

- In interactive mode (`AUTO=false`), never edit without explicit confirmation.
- In auto mode (`AUTO=true`), still respect the compliant filter — never rewrite content that already passes the rules.
- Never propose content that itself fails the rules.
- `title` action only modifies the title. `description`/`body` action only modifies the body. Cross-pollination is not allowed.
- If the rewrite would change meaning (not just form), surface that in the Reason line so the user can intervene. In auto mode, this is informational only — the edit still proceeds.

## Examples

Interactive title rewrite on a single PR:
```
/inki:pr-fix title 3204
```

Interactive description rewrite from a URL:
```
/inki:pr-fix description https://github.com/strapi/documentation/pull/3204
```

Body alias (same behavior as description):
```
/inki:pr-fix body 3204
```

Auto title rewrite on multiple PRs:
```
/inki:pr-fix title --yes 3204 3202 #3199
```

Auto title rewrite on all recent open PRs (with batch review):
```
/inki:pr-fix title --yes
```

Auto title rewrite on all open PRs including stale ones:
```
/inki:pr-fix title --yes --include-old
```
