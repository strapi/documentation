---
name: submit
description: "Top-level orchestrator: branch (if needed), commit, push, then open a PR. Each step asks for confirmation before continuing, unless --non-interactive is passed."
argument-hint: "[--non-interactive] [--no-log] [issue reference or topic hint, e.g. 'Fixes #2143']"
user-invocable: true
---

# /inki:submit: branch + commit + push + PR

## Step 0: Parse arguments

If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not run the workflow.

Otherwise, from `$ARGUMENTS`, detect the autonomy flag anywhere in the list: `--non-interactive` (canonical), aliases `--auto-approve`, `--auto`, `--yes`, `-y`, `--no-questions-asked` (all equivalent). If present, set `AUTO=true` and remove the flag. What remains is the optional issue reference passed through to `/inki:pr`.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:document`), write into that run's existing directory instead of creating a new one.

## Workflow

Each step below is performed by **invoking the named sub-skill**, never by running the equivalent `git` / `gh` commands directly. The sub-skills carry behavior that is not visible from `git-rules.md` alone (for example, `/inki:pr` appends the Vercel preview link as the last line of the PR body). Re-implementing a step by hand silently drops that behavior. This is a hard rule, see the Rules section.

1. **Branch**: if currently on `main`, invoke `/inki:branch` to create a properly prefixed branch.
2. **Commit**: invoke `/inki:commit` to stage and write a commit message.
3. **Push**: invoke `/inki:push` (with explicit confirmation).
4. **PR**: invoke `/inki:pr` to draft and open the PR.

### Interactive (`AUTO=false`, default)

The user confirms at each gate. If any sub-step fails or the user cancels, stop immediately.

### Auto (`AUTO=true`)

Pass `--non-interactive` to each sub-skill that supports it. The chain runs without prompts. If any sub-skill genuinely needs a decision that isn't trivially auto-derivable (e.g., branch prefix is ambiguous and no hint was provided), it will still ask. `--non-interactive` skips confirmations, not informed decisions.

The safety bracket from `pr-fix` does NOT apply here, because `/inki:submit` operates only on the current branch (single PR scope by construction).

## Rules

- **Always invoke the sub-skills; never substitute raw `git` / `gh` commands for them.** Each of branch, commit, push, and PR is delegated to `/inki:branch`, `/inki:commit`, `/inki:push`, `/inki:pr` respectively. Running `git commit`, `git push`, or `gh pr create` by hand instead is a defect, even when it appears to produce the same result: it bypasses checks and additions the sub-skills own (branch-prefix validation, commit-message rules, the `/inki:pr` Vercel preview link, draft-PR defaults). `--non-interactive` removes confirmation prompts; it does NOT authorize bypassing the sub-skills. The only direct git/gh allowed here is read-only inspection (`git status`, `git rev-parse`, `gh pr view`) to decide what to pass to a sub-skill.
- If any sub-step fails, stop. Do not skip a step.
- Pass through the issue reference (if any) to `/inki:pr`.
- In `AUTO=true` mode, surface a summary at the end showing branch name, commit SHA, and PR URL.
