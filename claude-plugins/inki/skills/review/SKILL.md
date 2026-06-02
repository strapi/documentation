---
name: review
description: "Top-level review orchestrator: runs style-check, outline-check, outline-ux-analyzer, code-verify, coherence-check, and pitfalls-check on a file, directory, or PR."
argument-hint: "[--yes|-y] [--fix] <path | filename | PR# | PR URL | docs.strapi.io URL | pasted content>"
user-invocable: true
---

# /inki:review — full documentation review

## Step 0: Parse arguments

From `$ARGUMENTS`, detect optional flags anywhere in the list:

- `--yes` or `-y` → `AUTO=true` (non-interactive: skip any confirmation gates inside sub-skills)
- `--fix` → `FIX=true` (apply auto-fixable findings from `style-check`)

Remove the flags. What remains is the **target**.

## Step 1: Resolve target to a set of files

Resolve the target by following `../../references/target-resolver.md`. It accepts any of: a local path or directory, a bare markdown filename, a GitHub PR (number, `#number`, or URL), a docs.strapi.io URL, pasted Markdown content, or nothing (changed files on the current branch).

The resolver returns:

- `FILES` — the list of local files the sub-skills operate on.
- `SCOPE` — a short label for the report header.
- `CLEANUP` — a command to run when the review finishes (worktree teardown or temp-file removal); may be empty.

If resolution fails (PR has no doc files, filename not found, URL maps to nothing), report why and stop.

## Step 2: Run the 6 sub-skills in parallel where possible

For each file in `FILES`, invoke:

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
Review of: <SCOPE>

| Sub-skill | Issues found | Severity |
|-----------|--------------|----------|
| style-check | <N> | low/med/high |
| outline-check | ... | ... |
| outline-ux-analyzer | ... | ... |
| code-verify | ... | ... |
| coherence-check | ... | ... |
| pitfalls-check | ... | ... |
```

Then list issues by file, ordered by severity. For PR-scope reviews, prefix file paths with `(PR #<num>)` so it's clear the issues are in the PR's version. For a `docs.strapi.io` URL review, note that the review ran against the published `origin/main` version (and flag any local uncommitted changes that were excluded, per the resolver). For a pasted-content or URL review, also note that coherence and code-verification findings may be incomplete because the file sits outside the docs tree (see the resolver's note).

## Step 4: Cleanup

Run the `CLEANUP` command returned by the resolver (worktree teardown or temp-file removal), even if the review failed. In a Claude-Code-driven execution, invoke it explicitly after Step 3 rather than relying on a bash `trap`. If `CLEANUP` is empty, there is nothing to do.

## Rules

- Each sub-skill stays atomic. Do not duplicate their logic here.
- If `--fix` is passed, only the auto-fixable findings from `style-check` are applied automatically. All others remain suggestions.
- `--fix` on a PR-scope review applies fixes inside the temporary worktree only (the one created by the resolver). The PR itself is NOT modified by `/inki:review`. To push the fixes, the user must `gh pr checkout <num>` themselves and apply the suggestions manually (or use `/inki:commit` + `/inki:push` after a manual checkout).
- `--fix` on a pasted-content or URL review applies fixes to the temp file only; there is no writable source file (the URL version is read from `origin/main`). Surface the corrected content in the report instead.
- `--yes` only changes interaction behavior (no extra prompts). It does NOT change what gets auto-fixed — that stays controlled by `--fix`.
- Never push, commit, or modify the PR directly. The review is read-only by default.

## Examples

Review a single file by path:
```
/inki:review docusaurus/docs/cms/intro.md
```

Review by bare filename (resolved under `docusaurus/docs/`):
```
/inki:review strapi-mcp-server.md
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

Review a published page by its docs.strapi.io URL:
```
/inki:review https://docs.strapi.io/cms/features/strapi-mcp-server
```

Review pasted Markdown content (paste the page body as the argument):
```
/inki:review ---
title: My page
---

# My page
...
```

Non-interactive review with auto-fixes applied locally:
```
/inki:review --yes --fix docusaurus/docs/cms/features/strapi-mcp-server.md
```
