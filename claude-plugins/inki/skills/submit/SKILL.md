---
name: submit
description: "Top-level orchestrator: branch (if needed), commit, push, then open a PR. Each step asks for confirmation before continuing, unless --auto-approve is passed."
argument-hint: "[--auto-approve] [--no-log] [issue reference or topic hint, e.g. 'Fixes #2143']"
user-invocable: true
---

# /inki:submit: branch + commit + push + PR

## Step 0: Parse arguments

If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not run the workflow.

Otherwise, from `$ARGUMENTS`, detect the auto-approve flag anywhere in the list: `--auto-approve` (canonical), or its aliases `--auto`, `--yes`, `-y` (all equivalent). If present, set `AUTO=true` and remove the flag. What remains is the optional issue reference passed through to `/inki:pr`.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:document`), write into that run's existing directory instead of creating a new one.

## Workflow

1. **Branch**: if currently on `main`, invoke `/inki:branch` to create a properly prefixed branch.
2. **Commit**: invoke `/inki:commit` to stage and write a commit message.
3. **Push**: invoke `/inki:push` (with explicit confirmation).
4. **PR**: invoke `/inki:pr` to draft and open the PR.

### Interactive (`AUTO=false`, default)

The user confirms at each gate. If any sub-step fails or the user cancels, stop immediately.

### Auto (`AUTO=true`)

Pass `--auto-approve` to each sub-skill that supports it. The chain runs without prompts. If any sub-skill genuinely needs a decision that isn't trivially auto-derivable (e.g., branch prefix is ambiguous and no hint was provided), it will still ask. `--auto-approve` skips confirmations, not informed decisions.

The safety bracket from `pr-fix` does NOT apply here, because `/inki:submit` operates only on the current branch (single PR scope by construction).

## Rules

- If any sub-step fails, stop. Do not skip a step.
- Pass through the issue reference (if any) to `/inki:pr`.
- In `AUTO=true` mode, surface a summary at the end showing branch name, commit SHA, and PR URL.
