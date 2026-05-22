---
name: submit
description: "Top-level orchestrator: branch (if needed), commit, push, then open a PR. Each step asks for confirmation before continuing."
argument-hint: "[optional: issue reference or topic hint, e.g. 'Fixes #2143']"
user-invocable: true
---

# /inki:submit — branch + commit + push + PR

**Autonomy Tier: 2.** Each sub-step shows its plan and asks for confirmation.

## Workflow

1. **Branch**: if currently on `main`, invoke `/inki:branch` to create a properly prefixed branch.
2. **Commit**: invoke `/inki:commit` to stage and write a commit message.
3. **Push**: invoke `/inki:push` (with explicit confirmation).
4. **PR**: invoke `/inki:pr` to draft and open the PR.

Pierre confirms at each gate.

## Rules

- If any sub-step fails or Pierre cancels, stop immediately. Do not skip a step.
- Pass through `$ARGUMENTS` (if any) as an issue reference hint to `/inki:pr`.
