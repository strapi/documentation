---
name: pr
description: "Create a pull request on strapi/documentation following git-rules.md. Strict flat-text description, no headings, no test plan."
argument-hint: [optional issue reference, e.g. "Fixes #2143"]
user-invocable: true
---

# Documentation Pull Request (strapi/documentation only)

**Autonomy Tier: 2** -- drafts PR title and body, shows for approval before creating.

**Repo:** strapi/documentation only. Refuses to run elsewhere.

## Input

`$ARGUMENTS`: optional issue reference (e.g., `Fixes #2143`, `#2143`) or additional context.

## Step 0: Validate working directory

```bash
git rev-parse --show-toplevel 2>/dev/null
```

Confirm output is `/Users/piwi/code/documentation`. If not, refuse with:
> This skill only works in strapi/documentation. Use `/piwi-pr` for other repos.

## Step 1: Apply shared PR rules

Read and follow `../_shared/pr-rules.md` for: gathering context, analyzing changes, generating the title (delegates to `../_shared/pr-title-rules.md`), generating the description (delegates to `../_shared/pr-description-rules.md`), showing the plan, and creating the PR.

## Step 2: Strict description rules (extra, doc-specific)

The PR description MUST follow git-rules.md strictly:

1. **Must start with "This PR ..."**
2. Minimal: 1-3 sentences or a short bullet list
3. **No headings** (no `##`, no `###`)
4. **No "Test plan" section**
5. **No checklists** (no `- [ ]`)
6. **Flat text only**
7. Issue references go at the very end: `Fixes #2143`

These rules override the shared PR rules for description format.

## Step 3: Add Vercel preview link

Append a Vercel preview link as the last line of the PR body. Build it from the branch name:

1. Get the branch name and replace `/` with `-` to get the slug (e.g., `cms/mcp-server` → `cms-mcp-server`)
2. Identify the primary page path from the changed files (the most important new or modified `.md` file under `docusaurus/docs/`, stripped of the `docusaurus/docs/` prefix and `.md` extension)
3. Append this line to the body:

```
Direct preview link 👉 [here](https://documentation-git-<branch-slug>-strapijs.vercel.app/<page-path>)
```

For example: `https://documentation-git-cms-mcp-server-strapijs.vercel.app/cms/features/strapi-mcp-server`

## Step 4: Suggest push first if needed

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
