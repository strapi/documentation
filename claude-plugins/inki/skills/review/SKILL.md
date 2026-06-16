---
name: review
description: "Top-level review orchestrator: runs style-check, outline-check, outline-ux-analyzer, code-verify, coherence-check, and pitfalls-check on a file, directory, or PR."
argument-hint: "[--auto-approve] [--fix] [--no-log] <path | filename | PR# | PR URL | docs.strapi.io URL | pasted content>"
user-invocable: true
---

# /inki:review: full documentation review

## Step 0: Parse arguments

If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not run the review.

Otherwise, from `$ARGUMENTS`, detect optional flags anywhere in the list:

- `--auto-approve` (aliases `--auto`, `--yes`, `-y`) → `AUTO=true` (non-interactive: skip any confirmation gates inside sub-skills)
- `--fix` → `FIX=true` (apply auto-fixable findings from `style-check`)
- `--no-log`, `--log-dir <path>`, `--short-log` → logging flags, handled per `../../references/logging.md`.

Remove the flags. What remains is the **target**.

Unless `--no-log` is passed, write the consolidated report (Step 3) to the run log per `../../references/logging.md`, using the resolved `SCOPE` for the run slug. When `/inki:review` is invoked by `/inki:document`, it logs into that run's existing `review/` subdirectory (one file per fix-loop round) instead of creating its own run directory.

## Step 1: Resolve target to a set of files

Resolve the target by following `../../references/target-resolver.md`. It accepts any of: a local path or directory, a bare markdown filename, a GitHub PR (number, `#number`, or URL), a docs.strapi.io URL, pasted Markdown content, or nothing (changed files on the current branch).

The resolver returns:

- `FILES`: the list of local files the sub-skills operate on.
- `SCOPE`: a short label for the report header.
- `CLEANUP`: a command to run when the review finishes (worktree teardown or temp-file removal); may be empty.

If resolution fails (PR has no doc files, filename not found, URL maps to nothing), report why and stop.

## Step 2: Dispatch the 6 checks as parallel subagents

For each file in `FILES`, dispatch the six review checks as **parallel subagents** using the Agent tool. Issue all calls for a given file in a single batch so they run concurrently. Do NOT run them inline in this skill's context, and do NOT run them one after another. Each subagent reads its target plus its own rubric prompt and returns ONLY a concise findings report; the file contents it reads stay out of this skill's context.

Map each check to its bundled agent (`agentType`):

| Check | Agent (`inki:<name>`) | What it returns |
|-------|------------------------|-----------------|
| Style | `inki:style-checker` | deterministic + AI-judged style issues (pass `FIX` through) |
| Outline structure | `inki:outline-checker` | template/hierarchy issues |
| Pedagogical UX | `inki:ux-analyzer` | UX score + flow issues |
| Code verification | `inki:code-verifier` | per-block ok/suspicious/broken |
| Cross-page coherence | `inki:coherence-checker` | terminology/link/conflict issues |
| Known pitfalls | `inki:pitfalls-checker` | cataloged hallucination matches |

Pass each agent the absolute `TARGET` path. For the style check, pass `FIX=true` when `FIX` is set (the agent still does not edit files; it flags the auto-fixable subset for the caller to apply in Step 3b).

The agents are read-only by construction (their `tools` allowlists exclude write/commit/push), so `AUTO` does not change their behavior. `AUTO` only governs whether *this* skill prompts before applying `--fix` results.

Collect the six findings reports per file.

## Step 3: Synthesize

Output a combined table:

```
Review of: <SCOPE>

| Check | Agent | Issues found | Severity |
|-------|-------|--------------|----------|
| Style | inki:style-checker | <N> | low/med/high |
| Outline structure | inki:outline-checker | ... | ... |
| Pedagogical UX | inki:ux-analyzer | ... | ... |
| Code verification | inki:code-verifier | ... | ... |
| Cross-page coherence | inki:coherence-checker | ... | ... |
| Known pitfalls | inki:pitfalls-checker | ... | ... |
```

Then list issues by file, ordered by severity. For PR-scope reviews, prefix file paths with `(PR #<num>)` so it's clear the issues are in the PR's version. For a `docs.strapi.io` URL review, note that the review ran against the published `origin/main` version, and flag any local uncommitted changes that were excluded (per the resolver). For a pasted-content review, note that coherence and code-verification findings may be incomplete because the file sits outside the docs tree (see the resolver's note).

## Step 3b: Apply fixes (only if `FIX=true`)

The agents are read-only and never edit files; they only flag the auto-fixable subset. When `FIX=true`, this skill applies that subset itself:

- Apply only the items the `inki:style-checker` agent marked **auto-fixable** (typos, formatting). Leave everything else as suggestions.
- Honor the worktree/temp-file constraints in the Rules below (PR, URL, and pasted-content reviews write only to their temporary location, never to the live source).
- If `AUTO` is not set, show the diff and confirm before writing. If `AUTO=true`, apply without prompting.

## Step 4: Cleanup

Run the `CLEANUP` command returned by the resolver (worktree teardown or temp-file removal), even if the review failed. In a Claude-Code-driven execution, invoke it explicitly after Step 3 rather than relying on a bash `trap`. If `CLEANUP` is empty, there is nothing to do.

## Rules

- Each check stays atomic inside its agent (`inki:<name>`). Do not duplicate their rubric logic here; this skill only dispatches, synthesizes, and applies the style auto-fixes.
- If `--fix` is passed, only the auto-fixable findings flagged by `inki:style-checker` are applied automatically (in Step 3b). All others remain suggestions.
- `--fix` on a PR-scope review applies fixes inside the temporary worktree only (the one created by the resolver). The PR itself is NOT modified by `/inki:review`. To push the fixes, the user must `gh pr checkout <num>` themselves and apply the suggestions manually (or use `/inki:commit` + `/inki:push` after a manual checkout).
- `--fix` on a `docs.strapi.io` URL review applies fixes inside the temporary `origin/main` worktree only (created by the resolver); that worktree is detached and torn down at cleanup, so nothing is written back. Surface the corrected content in the report, and tell the user to apply it on a real branch.
- `--fix` on a pasted-content review applies fixes to the temp file only; there is no source file to write back to. Surface the corrected content in the report instead.
- `--auto-approve` only changes interaction behavior (no extra prompts). It does NOT change what gets auto-fixed; that stays controlled by `--fix`.
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
/inki:review --auto-approve --fix docusaurus/docs/cms/features/strapi-mcp-server.md
```
