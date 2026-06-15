---
name: pr-fix
description: "Rewrite the title or description/body of one or more open PRs on strapi/documentation to match git-rules.md. Strict one-by-one confirmation, or auto-edit with --auto-approve."
argument-hint: "<title|description|body> [--auto-approve] [--include-old] [PR# or URL] [PR# or URL] ..."
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

- `--auto-approve` (aliases `--auto`, `--yes`, `-y`) → `AUTO=true` (non-interactive: skip confirmation prompts)
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

0. If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not edit any PR.
1. Read the first positional token as `ACTION` (must be `title`, `description`, or `body`). Normalize `body` → `description` internally.
2. Detect `--auto-approve` (aliases `--auto`/`--yes`/`-y`) → `AUTO=true`. Remove from list.
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

Missing "This PR ..." opener, contains `##`/`###` heading, contains "Test plan" section, contains `- [ ]` checklist, contains boilerplate sections, empty body, body is just "Updated docs" type vagueness, **missing the trailing "Direct preview link 👉 [here](...)" line** (see Step 5 for the construction logic).

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
Review batch (--auto-approve without PR IDs targets all recent open PRs):

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

The proposed description MUST end with a Vercel preview link line. If the original description has one as its last line, preserve it. If it does not, build one and append it.

### How to build the Vercel preview link

The link has two parts: the **deployment host** (`https://documentation-git-<...>-strapijs.vercel.app`) and the **page path**.

#### Deployment host: read it from the Vercel bot comment first

Do NOT naively build the host from the branch name. Vercel truncates long branch slugs to a ~63-character DNS label and appends a short hash (e.g. branch `cms/move-mcp-plugin-api-to-plugins-dev` deploys to `documentation-git-cms-move-mcp-plugin-api-to-pl-704ff2-strapijs.vercel.app`, NOT `documentation-git-cms-move-mcp-plugin-api-to-plugins-dev-strapijs.vercel.app`). A slug-built host for a long branch will fail to resolve.

1. **Primary method, extract the real host from the Vercel bot comment:**
   ```bash
   gh pr view <num> --repo strapi/documentation --json comments \
     -q '.comments[] | select(.author.login | test("vercel"; "i")) | .body' \
     | grep -oE 'https://documentation-git-[a-z0-9-]+\.vercel\.app' | sort -u | head -1
   ```
   This returns the exact deployed host, hash and all.

2. **Fallback, build the slug from the branch name** (only when no Vercel comment exists yet, e.g. a brand-new PR whose deployment has not been posted):
   - Read the head branch (`gh pr view <num> --repo strapi/documentation --json headRefName`).
   - Replace `/` with `-`: `cms/mcp-server` → `cms-mcp-server`.
   - Host: `https://documentation-git-<branch-slug>-strapijs.vercel.app`.
   - This only works for short branch names. If the branch slug would exceed ~50 characters, the slug-built host is unreliable; note in the Reason line that the link should be verified once Vercel posts its comment.

#### Page path

3. Identify the primary page path to deep-link to:
   - Fetch the PR's changed files via `gh pr view <num> --repo strapi/documentation --json files --jq '.files[].path'`.
   - Filter to `.md`/`.mdx` files under `docusaurus/docs/`.
   - Prefer the **newly added** page (a file added by the PR). If several added pages exist, take the first. If none were added, pick the most representative modified page; if several are equally central, prefer the hub/parent page (e.g., `cms/features/users-permissions.md` over its sub-pages).
   - Strip the `docusaurus/docs/` prefix and the `.md`/`.mdx` extension: `docusaurus/docs/cms/features/users-permissions.md` → `/cms/features/users-permissions`.
   - If no `.md`/`.mdx` files are touched (rare for a docs PR), fall back to the root path (empty string).

#### Assemble and verify

4. Assemble the line (`<host>` from step 1/2, `<page-path>` with its leading `/`):

   ```
   Direct preview link 👉 [here](<host><page-path>)
   ```

5. **Verify the URL resolves** before proposing it:
   ```bash
   curl -s -o /dev/null -w '%{http_code}' -L --max-time 25 "<url>"
   ```
   A non-200 (or `000` host-resolution failure) means the host is wrong; re-derive from the Vercel comment (step 1) rather than the slug. Surface the status in the Reason line.

6. Append the line as the last line of the proposed description, separated from the body by a blank line.

### Examples

- Long branch `cms/move-mcp-plugin-api-to-plugins-dev`: the Vercel comment yields host `https://documentation-git-cms-move-mcp-plugin-api-to-pl-704ff2-strapijs.vercel.app`; added page `cms/plugins-development/extend-mcp-server` → `https://documentation-git-cms-move-mcp-plugin-api-to-pl-704ff2-strapijs.vercel.app/cms/plugins-development/extend-mcp-server`
- Short branch `repo/contact-support-mention` (slug fallback safe) + page `cms/intro` → `https://documentation-git-repo-contact-support-mention-strapijs.vercel.app/cms/intro`

### Edge cases

- If the description already has a preview link **but it points to a wrong/outdated page** (e.g., the branch was renamed, or a different page is now more representative), the skill MAY propose a corrected line and surface the reason. Do not silently replace — surface the proposed change in the `Reason` so the user can opt out.
- For PRs from external forks, the standard `strapijs.vercel.app` pattern still works (Vercel deploys all branches under the strapijs subdomain), so no special handling needed.
- If the description body is itself compliant but the Vercel link is the ONLY missing piece, classify the PR as non-compliant on the basis of the missing link alone, and propose the addition.

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
/inki:pr-fix title --auto-approve 3204 3202 #3199
```

Auto title rewrite on all recent open PRs (with batch review):
```
/inki:pr-fix title --auto-approve
```

Auto title rewrite on all open PRs including stale ones:
```
/inki:pr-fix title --auto-approve --include-old
```
