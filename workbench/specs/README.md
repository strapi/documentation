# Design Lab specs

Approved designs, written before implementation and kept so a later session can
pick the work up without the conversation that produced it.

| spec | world | status |
|---|---|---|
| [2026-09-08 · FIRST LIGHT hand control](2026-09-08-firstlight-hand-control-design.md) | FIRST LIGHT | approved, not implemented |

## How to find this from a fresh session

These live on the branch `repo/design-lab-workbench`, not on `main` or `next`, and
usually in a separate worktree so the main checkout is never disturbed:

```bash
git worktree list | grep design-lab      # is it already checked out?
git show repo/design-lab-workbench:workbench/specs/README.md   # or just read it
```

`../ideas.md` is the single answer to "what is left to do". This directory is the
single answer to "what did we already decide, and why".

## What a spec here owes the reader

The reasoning, not just the conclusion. Every one of these should say what was
rejected and on what evidence, because the expensive mistakes in this project have
all been decisions re-made from scratch after the reason for the first one was lost.
