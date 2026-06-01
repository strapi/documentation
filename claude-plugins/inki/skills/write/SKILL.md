---
name: write
description: "Top-level write orchestrator: outline a new page, get user approval, then draft from the outline."
argument-hint: "[--yes|-y] <topic brief or path to a brief file>"
user-invocable: true
---

# /inki:write — outline then draft

## Step 0: Parse arguments

From `$ARGUMENTS`, detect `--yes` or `-y` anywhere in the list. If present, set `AUTO=true` and remove the flag. What remains is the topic brief (text or path to a `.md` file).

## Workflow

### Interactive (`AUTO=false`, default)

1. Invoke `/inki:outline $ARGUMENTS`. Wait for user approval inside that sub-skill.
2. Once an outline file exists and the user accepted it, invoke `/inki:draft <outline-path>`.

If the user rejects the outline, stop. Do not draft.

### Auto (`AUTO=true`)

1. Invoke `/inki:outline --yes $ARGUMENTS`. The outline is generated and saved without an approval gate.
2. Immediately invoke `/inki:draft <outline-path>` on the resulting outline.

In auto mode, the user sees the outline and the draft only after both are produced. They can still discard the outputs if they don't fit — nothing is committed automatically. `--yes` here means "don't pause between outline and draft," not "trust the output blindly."

## Rules

- Even in auto mode, do not skip the outline step. The outline must exist as a file before drafting.
- Do not invent facts beyond what the brief and template support.
- Do not commit, push, or open a PR. Use `/inki:submit` for that.
