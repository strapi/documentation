---
name: pr-title-fix
description: "Rewrite the title of one or more open PRs on strapi/documentation to match git-rules.md. Strict one-by-one confirmation."
argument-hint: "[PR#] [PR#] ... (no args = all open PRs on strapi/documentation)"
user-invocable: true
---

# Rewrite PR titles on strapi/documentation

**Repo:** strapi/documentation only. Refuses elsewhere.

## Input

`$ARGUMENTS`: zero or more PR numbers separated by spaces (e.g. `2143 2159 2160`).

- If empty: list all open PRs on `strapi/documentation` via `gh pr list --repo strapi/documentation --state open --limit 100 --json number,title,author`.
- If one or more numbers: target those PRs (fetch each with `gh pr view <num> --repo strapi/documentation --json number,title,author`).

## Step 0: Validate environment

```bash
command -v gh >/dev/null || { echo "gh CLI required"; exit 1; }
```

## Step 1: Load the canonical rules

Read `../_shared/pr-title-rules.md` and `git-rules.md` at the repo root (section "Pull Request Titles"). Use both as the single source of truth for what counts as compliant.

## Step 2: Classify each PR

For each PR, evaluate the current title against the rules. Bucket as:

- **compliant** → silently skip (do not display)
- **non-compliant** → propose a rewrite

Reasons for non-compliance include: `feat:/chore:/fix:` prefix, lowercase first word, vague wording (1-2 generic words like "Update docs"), missing verb or specific noun, ticket ID at start, emoji at start, length over 80 characters.

## Step 3: Propose rewrites one by one

For each non-compliant PR, display:

```
PR #<num> — author: @<login>
  Current: <current title>
  Proposed: <proposed title>
  Reason: <short explanation>
  [y]es / [n]o / [e]dit <new title> / [s]kip
```

Wait for input. Branch on response:

- `y` → run `gh pr edit <num> --repo strapi/documentation --title "<proposed>"`, then move to next PR.
- `n` or `s` → record as skipped, move to next PR.
- `e <new title>` → run `gh pr edit <num> --repo strapi/documentation --title "<new title>"`, move to next PR.

## Step 4: Final summary

After all PRs are processed, print a table:

```
| PR# | Action  | New title |
|-----|---------|-----------|
| ... | edited  | ...       |
| ... | skipped | (unchanged)|
```

## Rules

- Never edit a title without explicit confirmation.
- Never propose a title that itself fails the rules.
- If the rewrite would change meaning (not just form), prefer to surface that in the Reason line so the user can intervene.
- Do not touch the PR description.
