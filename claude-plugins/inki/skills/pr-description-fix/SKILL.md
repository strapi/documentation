---
name: pr-description-fix
description: "Rewrite the description of one or more open PRs on strapi/documentation to match git-rules.md. Strict one-by-one confirmation."
argument-hint: "[PR#] [PR#] ... (no args = all open PRs on strapi/documentation)"
user-invocable: true
---

# Rewrite PR descriptions on strapi/documentation

**Repo:** strapi/documentation only. Refuses elsewhere.

## Input

`$ARGUMENTS`: zero or more PR numbers separated by spaces.

- If empty: list all open PRs on `strapi/documentation` via `gh pr list --repo strapi/documentation --state open --limit 100 --json number,body,title,author`.
- If one or more numbers: fetch each with `gh pr view <num> --repo strapi/documentation --json number,body,title,author`.

## Step 0: Validate environment

```bash
command -v gh >/dev/null || { echo "gh CLI required"; exit 1; }
```

## Step 1: Load the canonical rules

Read `../_shared/pr-description-rules.md` and `/Users/piwi/code/documentation/git-rules.md` (the description section). Layer the strict strapi/documentation overrides on top:

1. Must start with "This PR ..."
2. No headings (no `##`, no `###`)
3. No "Test plan" section
4. No checklists
5. Flat text only
6. Issue references at the very end

## Step 2: Classify each PR

For each PR, evaluate the current body. Bucket as:

- **compliant** → silently skip
- **non-compliant** → propose a rewrite

Reasons for non-compliance: missing "This PR ..." opener, contains `##`/`###` heading, contains "Test plan" section, contains `- [ ]` checklist, contains boilerplate sections, empty body, body is just "Updated docs" type vagueness.

## Step 3: Propose rewrites one by one

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

- `y` → run `gh pr edit <num> --repo strapi/documentation --body-file <tmpfile>` (write the proposed body to a tmpfile first to preserve line breaks reliably).
- `n` or `s` → record as skipped.
- `e` → after edit, re-display the new proposal, ask `y`/`n` again.

## Step 4: Vercel preview link handling

If the original description had a `Direct preview link 👉 [here](https://...)` line as its last line, preserve that line at the end of the new description. Otherwise do not add one (this skill is for rewriting, not creation; that is `/inki:pr`'s job).

## Step 5: Final summary

Same table format as `/inki:pr-title-fix`.

## Rules

- Never edit a description without explicit confirmation.
- Never propose a description that itself fails the rules.
- Do not touch the PR title.
- Do not add new sections, links, or @mentions that weren't in the original.
