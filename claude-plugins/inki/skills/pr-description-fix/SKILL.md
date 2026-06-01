---
name: pr-description-fix
description: "Rewrite the description of one or more open PRs on strapi/documentation to match git-rules.md. Strict one-by-one confirmation, or auto-edit with --yes."
argument-hint: "[--yes|-y] [--include-old] [PR# or URL] [PR# or URL] ... (no PR args = all recent open PRs)"
user-invocable: true
---

# Rewrite PR descriptions on strapi/documentation

**Scope:** designed for strapi/documentation (and its forks).

## Input

`$ARGUMENTS` accepts:

- Zero or more PR identifiers, each as either a bare number (e.g. `2143`), a hashed number (e.g. `#2143`), or a full URL (e.g. `https://github.com/strapi/documentation/pull/2143`).
- An optional flag, anywhere in the argument list, to skip interactive confirmation:
  - `--yes` (preferred form)
  - `-y` (short alias)

If no PR identifiers are given:
- By default, list **recent open PRs** (created within the last 30 days) via `gh pr list --repo strapi/documentation --state open --search "created:>=$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d '30 days ago' +%Y-%m-%d)" --limit 100 --json number,body,title,author,createdAt`.
- If `--include-old` is set, list all open PRs (no recency filter): `gh pr list --repo strapi/documentation --state open --limit 100 --json number,body,title,author,createdAt`.

The 30-day cutoff uses `createdAt` (not `updatedAt`) because bot activity (auto-sync, llms regeneration, self-healing) bumps `updatedAt` on otherwise stale PRs. Filtering on `createdAt` better captures the intent: "PRs recently opened that may not have been titled compliantly yet."

## Step 0: Parse arguments

From `$ARGUMENTS`:

1. Detect whether `--yes` or `-y` appears anywhere. If yes, set `AUTO=true`; otherwise `AUTO=false`. Remove the flag from the argument list.
2. Detect whether `--include-old` appears anywhere. If yes, set `INCLUDE_OLD=true`; otherwise `INCLUDE_OLD=false`. Remove the flag from the argument list.
3. For each remaining token, extract the trailing digits to obtain the PR number:
   - `2143` → `2143`
   - `#2143` → `2143`
   - `https://github.com/strapi/documentation/pull/2143` → `2143`
   - `https://github.com/strapi/documentation/pull/2143/files` → `2143`
   A simple regex `[0-9]+$` (or strip everything up to the last `/` then drop a leading `#`) is sufficient.
4. If any token does not yield a numeric PR ID, report it and skip that token.

`INCLUDE_OLD` only affects the case where no PR identifiers were given (auto-targeting all open PRs). When PR IDs are listed explicitly, the recency filter does not apply — the user is targeting those PRs deliberately.

## Step 1: Validate environment

```bash
command -v gh >/dev/null || { echo "gh CLI required"; exit 1; }
```

## Step 2: Load the canonical rules

Read `../_shared/pr-description-rules.md` and `../../references/git-rules.md` (the description section). Layer the strict strapi/documentation overrides on top:

1. Must start with "This PR ..."
2. No headings (no `##`, no `###`)
3. No "Test plan" section
4. No checklists
5. Flat text only
6. Issue references at the very end

## Step 3: Fetch and classify each PR

For each PR number, fetch metadata:

```bash
gh pr view <num> --repo strapi/documentation --json number,body,title,author
```

Bucket each PR:

- **compliant** → silently skip (do not display, do not edit)
- **non-compliant** → produce a proposed rewrite

Reasons for non-compliance: missing "This PR ..." opener, contains `##`/`###` heading, contains "Test plan" section, contains `- [ ]` checklist, contains boilerplate sections, empty body, body is just "Updated docs" type vagueness.

## Step 4: Apply rewrites

### If `AUTO=true`

Behavior depends on whether the user explicitly listed PR identifiers:

**Case A — PR identifiers were given explicitly** (e.g. `/inki:pr-description-fix --yes 3204 3202`)

For each non-compliant PR, write the proposed body to a tmpfile (to preserve line breaks reliably) and edit immediately without further prompting:

```bash
gh pr edit <num> --repo strapi/documentation --body-file <tmpfile>
```

Announce each change inline:

```
PR #<num>: edited (description rewritten)
```

**Case B — No PR identifiers given** (e.g. `/inki:pr-description-fix --yes`, which targets all open PRs)

A batch confirmation is required as a safety bracket. Do NOT edit yet. Display the full list of proposed edits first:

```
Review batch (--yes without PR IDs targets all open PRs):

| PR# | Author | Reason | Preview of new description |
|-----|--------|--------|----------------------------|
| ... | ...    | ...    | (first line of proposed body) |

Compliant (no changes needed): N PRs

Type `y` to apply all, `n` to cancel, or `s <PR#> <PR#> ...` to skip specific PRs and apply the rest.
```

Then branch on the user's single response:

- `y` → apply all listed edits with `gh pr edit ... --body-file <tmpfile>`, announcing each inline.
- `n` → cancel entirely, edit nothing, exit.
- `s <PR#> <PR#> ...` → remove those PRs from the batch, then apply the remaining edits.

This safety bracket prevents accidentally mass-editing many PRs (e.g. on a repo with hundreds of open PRs). If a non-interactive script ever needs to bypass it, the caller should enumerate the PR IDs explicitly (Case A) rather than relying on the "all open PRs" fallback.

### If `AUTO=false`

For each non-compliant PR, display the current body and the proposal in linear before/after form:

```
PR #<num> — author: @<login>
  Title: <current title (for context, not edited here)>

  --- Current description ---
  <current body, line by line>

  --- Proposed description ---
  <proposed body, line by line>

  Reason: <short explanation>
  [y]es / [n]o / [e]dit / [s]kip
```

If the user types `e`, open a temporary file with the proposal pre-filled, let the user edit it, then re-display before applying.

Branch on response:

- `y` → `gh pr edit <num> --repo strapi/documentation --body-file <tmpfile>`
- `n` or `s` → record as skipped.
- `e` → after edit, re-display the new proposal, ask `y`/`n` again.

## Step 5: Vercel preview link handling

If the original description had a `Direct preview link 👉 [here](https://...)` line as its last line, preserve that line at the end of the new description. Otherwise do not add one (this skill is for rewriting, not creation; that is `/inki:pr`'s job).

## Step 6: Final summary

Same table format as `/inki:pr-title-fix`:

```
| PR# | Action  | New body |
|-----|---------|----------|
| ... | edited  | (rewritten) |
| ... | skipped | (unchanged) |
```

Include PRs that were classified as compliant in a separate count below the table (e.g. `Compliant (no changes needed): 5 PRs`).

## Rules

- In interactive mode (`AUTO=false`), never edit a description without explicit confirmation.
- In auto mode (`AUTO=true`), still respect the compliant filter — never rewrite a description that already passes the rules.
- Never propose a description that itself fails the rules.
- Do not touch the PR title.
- Do not add new sections, links, or @mentions that weren't in the original.

## Examples

Interactive on a single PR:
```
/inki:pr-description-fix 3204
```

Interactive from a URL:
```
/inki:pr-description-fix https://github.com/strapi/documentation/pull/3204
```

Auto on multiple PRs:
```
/inki:pr-description-fix --yes 3204 3202 #3199
```

Auto on all recent open PRs (last 30 days, with batch review):
```
/inki:pr-description-fix --yes
```

Auto on all open PRs including stale ones (last 30 days filter bypassed):
```
/inki:pr-description-fix --yes --include-old
```
