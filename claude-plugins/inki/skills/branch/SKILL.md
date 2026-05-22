---
name: branch
description: "Create a new branch in strapi/documentation with auto-detected prefix (cms/, cloud/, repo/) based on the files that will be touched."
argument-hint: [description of the work]
user-invocable: true
---

# Documentation Branch (strapi/documentation only)

**Repo:** strapi/documentation only. Refuses to run elsewhere.

## Input

`$ARGUMENTS`: description of the work (e.g., "add MCP server page", "fix deployment steps for cloud").

If no arguments provided, ask what the branch is for.

## Step 0: Validate working directory

```bash
git rev-parse --show-toplevel 2>/dev/null
```

Confirm the working tree is a checkout of `strapi/documentation` (the remote URL ends with `strapi/documentation` or `strapi/documentation.git`). If not, refuse with:
> This skill only works in strapi/documentation.

## Step 1: Detect prefix

Ask which area the work will touch, or infer from the description:

- Work only under `docs/cms/` and/or `static/` --> `cms/`
- Work only under `docs/cloud/` and/or `static/` --> `cloud/`
- Work touching both areas, or repo-level files --> `repo/`

If ambiguous, default to `repo/` and mention it.

## Step 2: Generate branch name

From the description, generate a slug: lowercase, hyphens, no special characters, concise.

Format: `<prefix>/<slug>` (e.g., `cms/add-mcp-server-page`, `cloud/fix-deployment-steps`).

## Step 3: Create the branch

```bash
git checkout -b <branch-name>
```

Confirm with the branch name.
