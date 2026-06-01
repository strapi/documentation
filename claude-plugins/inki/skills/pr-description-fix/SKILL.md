---
name: pr-description-fix
description: "Rewrite the description of one or more open PRs on strapi/documentation to match git-rules.md. Strict one-by-one confirmation, or auto-edit with --yes."
argument-hint: "[--yes|-y] [PR# or URL] [PR# or URL] ... (no PR args = all open PRs)"
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

If no PR identifiers are given (with or without the flag), list all open PRs via `gh pr list --repo strapi/documentation --state open --limit 100 --json number,body,title,author` and treat that list as the target set.

## Step 0: Parse arguments

From `$ARGUMENTS`:

1. Detect whether `--yes` or `-y` appears anywhere. If yes, set `AUTO=true`; otherwise `AUTO=false`. Remove the flag from the argument list.
2. For each remaining token, extract the trailing digits to obtain the PR number:
   - `2143` → `2143`
   - `#2143` → `2143`
   - `https://github.com/strapi/documentation/pull/2143` → `2143`
   - `https://github.com/strapi/documentation/pull/2143/files` → `2143`
   A simple regex `[0-9]+$` (or strip everything up to the last `/` then drop a leading `#`) is sufficient.
3. If any token does not yield a numeric PR ID, report it and skip that token.

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

For each non-compliant PR, write the proposed body to a tmpfile (to preserve line breaks reliably) and edit immediately without prompting:

```bash
gh pr edit <num> --repo strapi/documentation --body-file <tmpfile>
```

Announce inline:

```
PR #<num>: edited (description rewritten)
```

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

Auto on all open PRs (e.g. for a chained skill call):
```
/inki:pr-description-fix --yes
```
