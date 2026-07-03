---
name: review
description: "Top-level review orchestrator: runs style-check, outline-check, outline-ux-analyzer, code-verify, coherence-check, and pitfalls-check on a file, directory, or PR."
argument-hint: "[--non-interactive] [--fix] [--fix-rounds <N>] [--no-log] <path | filename | PR# | PR URL | docs.strapi.io URL | pasted content>"
user-invocable: true
---

# /inki:review: full documentation review

## Step 0: Parse arguments

If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not run the review.

Otherwise, from `$ARGUMENTS`, detect optional flags anywhere in the list:

- `--non-interactive` (canonical), aliases `--auto-approve`, `--auto`, `--yes`, `-y`, `--no-questions-asked` (all equivalent) → `AUTO=true` (skip any confirmation gates inside sub-skills; no questions asked)
- `--fix` → `FIX=true` (apply every actionable finding the reviewers can make, not only style — see Step 3b)
- `--max-review-fix-rounds <N>` (canonical), alias `--fix-rounds <N>` (both equivalent) → set `MAX_FIX_ROUNDS=<N>`. Caps how many review→fix→re-review iterations Step 3b runs. Defaults to `1` if not given (a single pass, the historical behavior). Only meaningful with `--fix`; ignored otherwise.
- `--no-log`, `--log-dir <path>`, `--short-log` → logging flags, handled per `../../references/logging.md`.

Remove the flags. What remains is the **target**.

Unless `--no-log` is passed, write the consolidated report (Step 3) to the run log per `../../references/logging.md`, using the resolved `SCOPE` for the run slug. When `/inki:review` is invoked by `/inki:document`, it logs into that run's existing `review/` subdirectory (one file per fix-loop round) instead of creating its own run directory.

## Step 1: Resolve target to a set of files

Resolve the target by following `../../references/target-resolver.md`. It accepts any of: a local path or directory, a bare markdown filename, a GitHub PR (number, `#number`, or URL), a docs.strapi.io URL, pasted Markdown content, or nothing (changed files on the current branch).

The resolver returns:

- `FILES`: the list of local files the sub-skills operate on.
- `SCOPE`: a short label for the report header.
- `UPSTREAM_PRS`: any `strapi/strapi` / `strapi/cloud` code PRs the docs PR's description references (each `{repo, number}`); empty for non-PR targets or a PR that references none. The docs under review document *those* code changes, so they are the right source of truth even when unmerged.
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

Pass each agent the absolute `TARGET` path. For the style check, pass `FIX=true` when `FIX` is set (the agent still does not edit files; it flags the auto-fixable subset). The other five agents always return their findings with enough detail (file, location, the precise correction) for the caller to judge in Step 3b whether each one has a single unambiguous fix.

When `UPSTREAM_PRS` is non-empty, additionally pass it to the **code-verifier** and the **coherence-checker** in their prompts (e.g. "UPSTREAM_PRS: strapi/strapi#26737"). The code-verifier verifies against that PR's head as its primary source of truth instead of `develop`/a local clone; the coherence-checker uses it to tell a real contradiction apart from an expected gap with a not-yet-updated sibling page. This is what prevents the false "this config key/value does not exist" and "this contradicts page X" findings that occur when a docs PR documents an unmerged code change. The other four agents do not need it.

The agents are read-only by construction (their `tools` allowlists exclude write/commit/push), so neither `AUTO` nor `FIX` changes their behavior. They never edit files. All edits happen in Step 3b, applied by *this* skill. `AUTO` only governs whether this skill prompts before applying those edits.

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

The agents are read-only and never edit files. When `FIX=true`, this skill applies the fixes itself, across **all six checks**, not only style. The unit of work is one **round**: apply every actionable fix found, then re-review so a fix that introduced a new issue is caught. This repeats up to `MAX_FIX_ROUNDS` times (default 1).

**What counts as actionable.** A finding is applied automatically only when it has a single, unambiguous correction:

- **Style:** the subset the `inki:style-checker` agent marked **auto-fixable** (typos, formatting, em dashes, filler words).
- **Code, coherence, pitfalls, outline, UX:** findings with one clear correction (a wrong import path, a broken link, a deprecated API call with a known replacement, a missing parallel heading).

Findings that are genuine judgment calls (more than one reasonable fix, or a structural rewrite with trade-offs) are **left as suggestions, never force-applied**. When in doubt, leave it as a suggestion.

**The fix loop:**

```
round = 1
loop:
  apply every actionable fix from this round's findings
  if no fix was applied this round   → break (clean, nothing to do)
  if round >= MAX_FIX_ROUNDS         → break (cap reached)
  re-run Step 2 (the six checks) on the edited file
  re-read the findings
  if no actionable findings remain   → break (clean)
  round = round + 1
```

With the default `MAX_FIX_ROUNDS=1`, this is a single pass: apply once, no re-review. Pass `--max-review-fix-rounds <N>` (alias `--fix-rounds <N>`) to allow re-review rounds. If the cap is reached with actionable findings still open, do NOT loop further: carry them into the report as remaining findings.

**Confirmation (the human-content guard).** Unlike `/inki:document`'s internal loop (which edits a draft it just generated), a bare `/inki:review` often runs on pre-existing, human-authored content. So:

- If `AUTO` is not set, show the full diff of the round's fixes and confirm before writing. The user can accept all, reject all, or stop the loop. Re-review rounds each get their own confirmation.
- If `AUTO=true` (`--non-interactive`), apply without prompting.

**Write constraints.** Honor the worktree/temp-file constraints in the Rules below: PR, URL, and pasted-content reviews write only to their temporary location, never to the live source.

Record `ROUNDS_RUN` and the final open-findings count, and reflect them in the Step 3 report.

## Step 4: Cleanup

Run the `CLEANUP` command returned by the resolver (worktree teardown or temp-file removal), even if the review failed. In a Claude-Code-driven execution, invoke it explicitly after Step 3 rather than relying on a bash `trap`. If `CLEANUP` is empty, there is nothing to do.

## Rules

- Each check stays atomic inside its agent (`inki:<name>`). This skill only dispatches the checks, synthesizes their reports, and applies the fixes the agents flagged; it never re-implements a check's rubric inline and never decides a finding by itself. Always run a check by **dispatching its agent** (Step 2), never by performing the check yourself in this context. An orchestrator that quietly does a sub-step's work by hand drops behavior that sub-step owns and is a defect, even if the output looks equivalent.
- If `--fix` is passed, every **actionable** finding across all six checks is applied (in Step 3b): a finding with one unambiguous correction. Findings that are judgment calls remain suggestions and are never force-applied.
- The fix loop runs at most `MAX_FIX_ROUNDS` times (default 1, `--max-review-fix-rounds <N>` / `--fix-rounds <N>` to raise). It never loops unbounded; remaining actionable findings are reported, not forced.
- `--fix` on a PR-scope review applies fixes inside the temporary worktree only (the one created by the resolver). The PR itself is NOT modified by `/inki:review`. To push the fixes, the user must `gh pr checkout <num>` themselves and apply the suggestions manually (or use `/inki:commit` + `/inki:push` after a manual checkout).
- `--fix` on a `docs.strapi.io` URL review applies fixes inside the temporary `origin/main` worktree only (created by the resolver); that worktree is detached and torn down at cleanup, so nothing is written back. Surface the corrected content in the report, and tell the user to apply it on a real branch.
- `--fix` on a pasted-content review applies fixes to the temp file only; there is no source file to write back to. Surface the corrected content in the report instead.
- `--non-interactive` only changes interaction behavior (no per-round confirmation). It does NOT change *what* gets fixed; that stays controlled by `--fix` and `--max-review-fix-rounds`. So `--non-interactive --fix` means "ask no questions AND apply the actionable findings"; `--non-interactive` alone reviews silently but changes nothing. Without `--non-interactive`, `--fix` still applies fixes but shows the diff and confirms each round first (the human-content guard, see Step 3b).
- Never push, commit, or modify the PR directly. `/inki:review` edits only the local working file (or the resolver's temporary worktree/temp file). It never stages, commits, or pushes; the user submits the result themselves (e.g. via `/inki:submit`).

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

When the PR's description references a code PR (e.g. `strapi/strapi#26737`), the review auto-detects it and verifies the docs against that code PR's head, not against `develop`. This is correct even when the code PR is unmerged — the docs are documenting *that* change:
```
/inki:review 3302
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

Review and apply all actionable fixes once, confirming the diff first (single pass):
```
/inki:review --fix docusaurus/docs/cms/features/strapi-mcp-server.md
```

Non-interactive review with all actionable fixes applied locally, no prompts (single pass):
```
/inki:review --non-interactive --fix docusaurus/docs/cms/features/strapi-mcp-server.md
```

Apply fixes and re-review up to 3 rounds, so a fix that introduces a new issue gets caught:
```
/inki:review --non-interactive --fix --fix-rounds 3 docusaurus/docs/cms/features/strapi-mcp-server.md
```
