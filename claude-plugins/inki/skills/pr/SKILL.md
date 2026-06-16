---
name: pr
description: "Create a pull request on strapi/documentation following git-rules.md. Strict flat-text description, no headings, no test plan."
argument-hint: "[optional issue reference, e.g. 'Fixes #2143']"
user-invocable: true
---

# Documentation Pull Request

**Scope:** designed for strapi/documentation (and its forks).

## Input

`$ARGUMENTS`: optional issue reference (e.g., `Fixes #2143`, `#2143`) or additional context.

## Step 1: Apply shared PR rules

Read and follow `../_shared/pr-rules.md` for: gathering context, analyzing changes, generating the title (delegates to `../_shared/pr-title-rules.md`), generating the description (delegates to `../_shared/pr-description-rules.md`), showing the plan, and creating the PR.

## Step 2: Add Vercel preview link

Append a Vercel preview link as the last line of the PR body. Build it from the branch name:

1. Get the branch name and replace `/` with `-` to get the slug (e.g., `cms/mcp-server` → `cms-mcp-server`)
2. Identify the primary page path from the changed files (the most important new or modified `.md` file under `docusaurus/docs/`, stripped of the `docusaurus/docs/` prefix and `.md` extension)
3. Append this line to the body:

```
Direct preview link 👉 [here](https://documentation-git-<branch-slug>-strapijs.vercel.app/<page-path>)
```

For example: `https://documentation-git-cms-mcp-server-strapijs.vercel.app/cms/features/strapi-mcp-server`

**When no page under `docusaurus/docs/` is changed** (for example a `repo/` PR touching only `claude-plugins/`, config, or tooling), there is no doc page to preview: **omit this line entirely** rather than building a link to a page that does not exist. Do not fall back to the preview root.

## Step 3: Suggest push first if needed

If no upstream exists, suggest running `/inki:push` first.

## Good description examples

```
This PR documents the new hasPublishedVersion parameter added in strapi/strapi#2847.
- Adds parameter to the findMany() parameters table
- Updates the filtering description
- Adds usage tip

Fixes #2143
```

```
This PR adds conditional retrieval rules to the Code Verifier and Coherence Checker agent prompts, and a new "separate facts from prose" behavioral note to the Drafter.
```
