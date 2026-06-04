---
name: commit
description: "Stage and commit documentation changes in strapi/documentation. Enforces git-rules.md, protected paths, and branch prefix detection."
argument-hint: [optional commit message]
user-invocable: true
---

# Documentation Commit

**Scope:** designed for strapi/documentation (and its forks).

## Input

`$ARGUMENTS`: optional commit message. If not provided, one is generated from the diff.

## Step 1: Apply shared commit rules

Read and follow `../_shared/commit-rules.md` for: gathering context, validating/generating the commit message, and executing the commit.

## Step 2: Protect infrastructure files

Before staging, check if any changed files are protected:

- `.github/workflows/*` -- deployment infrastructure
- `docusaurus/docusaurus.config.js` -- core site config
- `docusaurus/sidebars.js` -- navigation structure

If protected files are present, require **double confirmation** before including them:

1. List each protected file with a warning
2. **First confirmation:** "Include these protected files?"
3. **Second confirmation:** Show the diff of each and ask: "Confirm you have reviewed these changes?"

If declined, commit only the non-protected files.

## Step 3: Auto-push

After a successful commit, push automatically if on a working branch:

```bash
BRANCH=$(git branch --show-current)
```

- If `$BRANCH` is `main` or `next`: do NOT push. Warn the user.
- Otherwise: `git push -u origin $BRANCH`
