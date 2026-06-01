---
name: review
description: "Top-level review orchestrator: runs style-check, outline-check, outline-ux-analyzer, code-verify, coherence-check, and pitfalls-check on a file, directory, or PR."
argument-hint: "[--yes|-y] [--fix] <path | PR# | PR URL>"
user-invocable: true
---

# /inki:review — full documentation review

## Step 0: Parse arguments

From `$ARGUMENTS`, detect optional flags anywhere in the list:

- `--yes` or `-y` → `AUTO=true` (non-interactive: skip any confirmation gates inside sub-skills)
- `--fix` → `FIX=true` (apply auto-fixable findings from `style-check`)

Remove the flags. What remains is the target, which can be:

- **A local path**: file or directory under `docusaurus/docs/`, e.g. `docusaurus/docs/cms/intro.md`.
- **A PR identifier**: bare number (`3204`), hashed (`#3204`), or URL (`https://github.com/strapi/documentation/pull/3204`, with optional `/files` or `/changes` suffix).
- **Empty**: defaults to the changed `.md` files on the current branch (`git diff main...HEAD --name-only -- '*.md'`).

## Step 1: Resolve target to a set of files

Three branches depending on what the user passed:

### 1a — Local path

Use directly. If it's a directory, recursively collect `.md` and `.mdx` files under it.

### 1b — PR identifier

1. Extract the PR number from the identifier (use `[0-9]+$` after stripping URL tail like `/files`, `/changes`, and a leading `#`).
2. Fetch the PR's changed files:

   ```bash
   gh pr view <num> --repo strapi/documentation --json files,headRefName --jq '.files[].path'
   ```

3. Filter to `.md` and `.mdx` files only. If the PR changes no documentation file, report that and stop.
4. Create a temporary worktree with the PR checked out (so sub-skills see the PR's version of the files, not `main`):

   ```bash
   WORKTREE=$(./claude-plugins/inki/scripts/pr-worktree.sh create <num>)
   trap "./claude-plugins/inki/scripts/pr-worktree.sh destroy <num>" EXIT
   ```

   The helper handles fetching, creating the temporary branch (`inki-tmp-review-<num>`), and the worktree (`/tmp/inki-review-pr-<num>`). The `trap` ensures cleanup even on failure.

5. Prepend `$WORKTREE/` to each file path collected in step 3. These prefixed paths are what sub-skills will receive as `<target>`.

### 1c — Empty

Default to:

```bash
git diff main...HEAD --name-only -- '*.md'
```

Operates on the current working tree.

## Step 2: Run the 6 sub-skills in parallel where possible

For each target file (or set of files), invoke:

- `/inki:style-check <target>` (with `--fix` if `FIX=true`)
- `/inki:outline-check <target>`
- `/inki:outline-ux-analyzer <target>`
- `/inki:code-verify <target>`
- `/inki:coherence-check <target>`
- `/inki:pitfalls-check <target>`

If `AUTO=true`, pass `--yes` to any sub-skill that supports it (so the whole pipeline runs without prompts). Read-only sub-skills ignore the flag gracefully.

Collect each report.

## Step 3: Synthesize

Output a combined table:

```
Review of: <target description, e.g., "PR #3203 (1 doc file)" or "docusaurus/docs/cms/intro.md">

| Sub-skill | Issues found | Severity |
|-----------|--------------|----------|
| style-check | <N> | low/med/high |
| outline-check | ... | ... |
| outline-ux-analyzer | ... | ... |
| code-verify | ... | ... |
| coherence-check | ... | ... |
| pitfalls-check | ... | ... |
```

Then list issues by file, ordered by severity. For PR-scope reviews, prefix file paths with `(PR #<num>)` so it's clear the issues are in the PR's version.

## Step 4: Cleanup (PR scope only)

If a temporary worktree was created in step 1b, the `trap` set there handles cleanup automatically via `pr-worktree.sh destroy`. In a Claude-Code-driven execution (where bash trap may not propagate cleanly across tool calls), invoke `pr-worktree.sh destroy <num>` explicitly after step 3.

## Rules

- Each sub-skill stays atomic. Do not duplicate their logic here.
- If `--fix` is passed, only the auto-fixable findings from `style-check` are applied automatically. All others remain suggestions.
- `--fix` on a PR-scope review applies fixes inside the temporary worktree only. The PR itself is NOT modified by `/inki:review`. To push the fixes, the user must `gh pr checkout <num>` themselves and apply the suggestions manually (or use `/inki:commit` + `/inki:push` after a manual checkout).
- `--yes` only changes interaction behavior (no extra prompts). It does NOT change what gets auto-fixed — that stays controlled by `--fix`.
- Never push, commit, or modify the PR directly. The review is read-only by default.

## Examples

Review a single file on the current branch:
```
/inki:review docusaurus/docs/cms/intro.md
```

Review changed files on the current branch (no argument):
```
/inki:review
```

Review all `.md`/`.mdx` files modified by a PR:
```
/inki:review https://github.com/strapi/documentation/pull/3204
/inki:review 3204
/inki:review #3204
```

Non-interactive review with auto-fixes applied locally:
```
/inki:review --yes --fix docusaurus/docs/cms/features/strapi-mcp-server.md
```
