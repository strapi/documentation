---
name: submit
description: "Top-level orchestrator: branch (if needed), commit, push, then open a PR. Each step asks for confirmation before continuing."
argument-hint: "[optional: issue reference or topic hint, e.g. 'Fixes #2143']"
user-invocable: true
---

# /inki:submit — branch + commit + push + PR

## Workflow

1. **Branch**: if currently on `main`, invoke `/inki:branch` to create a properly prefixed branch.
2. **Commit**: invoke `/inki:commit` to stage and write a commit message.
3. **Push**: invoke `/inki:push` (with explicit confirmation).
4. **PR**: invoke `/inki:pr` to draft and open the PR.

the user confirms at each gate.

## Rules

- If any sub-step fails or the user cancels, stop immediately. Do not skip a step.
- Pass through `$ARGUMENTS` (if any) as an issue reference hint to `/inki:pr`.
