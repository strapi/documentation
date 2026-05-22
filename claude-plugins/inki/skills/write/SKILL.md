---
name: write
description: "Top-level write orchestrator: outline a new page, get user approval, then draft from the outline."
argument-hint: "<topic brief or path to a brief file>"
user-invocable: true
---

# /inki:write — outline then draft

## Workflow

1. Invoke `/inki:outline $ARGUMENTS`. Wait for user approval (handled inside the sub-skill).
2. Once an outline file exists, invoke `/inki:draft <outline-path>`.

## Rules

- If the user rejects the outline, stop. Do not draft anything.
- Do not skip the outline step even if the brief looks straightforward.
