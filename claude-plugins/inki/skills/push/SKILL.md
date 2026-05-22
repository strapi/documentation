---
name: push
description: "Push the current branch in strapi/documentation to origin. Validates branch name against git-rules.md conventions."
argument-hint: (no arguments)
user-invocable: true
---

# Documentation Push

**Scope:** designed for strapi/documentation (and its forks).

## Step 1: Apply shared push rules

Read and follow `../_shared/push-rules.md` for: gathering state, safety checks, upstream status, showing the plan, and executing the push.

## Step 2: Branch name validation (extra, doc-specific)

Check the branch name follows git-rules.md conventions:
- Must start with `/cms/`, `/cloud/`, or `/repo/`
- No other prefixes (`/doc/`, `/docs/`, `/feat/`, `/fix/`, etc.)

If non-compliant, warn the user but do not block (renaming an existing branch is disruptive). Suggest the correct prefix for future reference.

## Step 3: Suggest branch creation if on main

If on `main`, analyze recent changes to detect the area (cms/cloud/repo), then suggest:

> Suggested: `git checkout -b /<prefix>/<description>`
