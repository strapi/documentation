---
name: pr-title-fix
description: "Rewrite the title of one or more open PRs on strapi/documentation to match git-rules.md. Strict one-by-one confirmation, or auto-edit with --yes."
argument-hint: "[--yes|-y] [--include-old] [PR# or URL] [PR# or URL] ... (no PR args = all recent open PRs)"
user-invocable: true
---

# Rewrite PR titles on strapi/documentation

**Scope:** designed for strapi/documentation (and its forks).

## Input

`$ARGUMENTS` accepts:

- Zero or more PR identifiers, each as either a bare number (e.g. `2143`), a hashed number (e.g. `#2143`), or a full URL (e.g. `https://github.com/strapi/documentation/pull/2143`).
- An optional flag, anywhere in the argument list, to skip interactive confirmation:
  - `--yes` (preferred form)
  - `-y` (short alias)
- An optional flag to include old PRs in the auto-targeted set:
  - `--include-old` (only meaningful when no PR identifiers are given)

If no PR identifiers are given:
- By default, list **recent open PRs** (updated within the last 30 days) via `gh pr list --repo strapi/documentation --state open --search "updated:>=$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d '30 days ago' +%Y-%m-%d)" --limit 100 --json number,title,author,updatedAt`.
- If `--include-old` is set, list all open PRs (no recency filter): `gh pr list --repo strapi/documentation --state open --limit 100 --json number,title,author,updatedAt`.

The 30-day cutoff avoids accidentally bumping stale PRs (especially community contributions) with a title change notification.

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

Read `../_shared/pr-title-rules.md` and `../../references/git-rules.md` (section "Pull Request Titles"). Use both as the single source of truth for what counts as compliant.

## Step 3: Fetch and classify each PR

For each PR number, fetch metadata:

```bash
gh pr view <num> --repo strapi/documentation --json number,title,author
```

Bucket each PR:

- **compliant** → silently skip (do not display, do not edit)
- **non-compliant** → produce a proposed rewrite

Reasons for non-compliance include: `feat:/chore:/fix:/docs:` (or any `word(scope):`) prefix, lowercase first word, vague wording (1-2 generic words like "Update docs"), missing verb or specific noun, ticket ID at start, emoji at start, length over 80 characters.

## Step 4: Apply rewrites

For each non-compliant PR:

### If `AUTO=true`

Behavior depends on whether the user explicitly listed PR identifiers:

**Case A — PR identifiers were given explicitly** (e.g. `/inki:pr-title-fix --yes 3204 3202`)

Edit immediately without further prompting:

```bash
gh pr edit <num> --repo strapi/documentation --title "<proposed>"
```

Announce each change inline:

```
PR #<num>: edited — "<proposed>"
```

**Case B — No PR identifiers given** (e.g. `/inki:pr-title-fix --yes`, which targets all open PRs)

A batch confirmation is required as a safety bracket. Do NOT edit yet. Display the full list of proposed edits first:

```
Review batch (--yes without PR IDs targets all open PRs):

| PR# | Author | Current | Proposed | Reason |
|-----|--------|---------|----------|--------|
| ... | ...    | ...     | ...      | ...    |

Compliant (no changes needed): N PRs

Type `y` to apply all, `n` to cancel, or `s <PR#> <PR#> ...` to skip specific PRs and apply the rest.
```

Then branch on the user's single response:

- `y` → apply all listed edits with `gh pr edit ... --title "<proposed>"`, announcing each inline.
- `n` → cancel entirely, edit nothing, exit.
- `s <PR#> <PR#> ...` → remove those PRs from the batch, then apply the remaining edits.

This safety bracket prevents accidentally mass-editing many PRs (e.g. on a repo with hundreds of open PRs). If a non-interactive script ever needs to bypass it, the caller should enumerate the PR IDs explicitly (Case A) rather than relying on the "all open PRs" fallback.

### If `AUTO=false`

Display the proposal and wait for input:

```
PR #<num> — author: @<login>
  Current: <current title>
  Proposed: <proposed title>
  Reason: <short explanation>
  [y]es / [n]o / [e]dit <new title> / [s]kip
```

Branch on the user's response:

- `y` → `gh pr edit <num> --repo strapi/documentation --title "<proposed>"`, then move to next PR.
- `n` or `s` → record as skipped, move to next PR.
- `e <new title>` → `gh pr edit <num> --repo strapi/documentation --title "<new title>"`, move to next PR.

## Step 5: Final summary

After all PRs are processed (in both modes), print:

```
| PR# | Action  | New title |
|-----|---------|-----------|
| ... | edited  | ...       |
| ... | skipped | (unchanged) |
```

Include PRs that were classified as compliant in a separate count below the table (e.g. `Compliant (no changes needed): 5 PRs`) so callers can see the full picture.

## Rules

- In interactive mode (`AUTO=false`), never edit a title without explicit confirmation.
- In auto mode (`AUTO=true`), still respect the compliant filter — never rewrite a title that already passes the rules.
- Never propose a title that itself fails the rules.
- If the rewrite would change meaning (not just form), surface that in the Reason line so the user can intervene. In auto mode, this is informational only — the edit still proceeds.
- Do not touch the PR description.

## Examples

Interactive on a single PR:
```
/inki:pr-title-fix 3204
```

Interactive from a URL:
```
/inki:pr-title-fix https://github.com/strapi/documentation/pull/3204
```

Auto on multiple PRs:
```
/inki:pr-title-fix --yes 3204 3202 #3199
```

Auto on all recent open PRs (last 30 days, with batch review):
```
/inki:pr-title-fix --yes
```

Auto on all open PRs including stale ones (last 30 days filter bypassed):
```
/inki:pr-title-fix --yes --include-old
```
