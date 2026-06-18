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

Append a Vercel preview link as the last line of the PR body, in the form:

```
Direct preview link 👉 [here](<host><page-path>)
```

For example: `https://documentation-git-cms-mcp-server-strapijs.vercel.app/cms/features/strapi-mcp-server`

The link has two parts: the **deployment host** and the **page path**. Build the page path first, then the host.

### Page path

Identify the primary page path from the changed files: the most important new or modified `.md`/`.mdx` file under `docusaurus/docs/`, stripped of the `docusaurus/docs/` prefix and the `.md`/`.mdx` extension (e.g. `docusaurus/docs/cms/features/users-permissions.md` → `/cms/features/users-permissions`). Prefer a newly added page over a modified one.

**When no page under `docusaurus/docs/` is changed** (for example a `repo/` PR touching only `claude-plugins/`, config, or tooling), there is no doc page to preview: **omit the preview line entirely** rather than building a link to a page that does not exist. Do not fall back to the preview root. Skip the rest of this step.

### Deployment host

Vercel deploys this branch to `https://documentation-git-<slug>-strapijs.vercel.app`, where `<slug>` is the branch name with `/` replaced by `-` (e.g. `cms/mcp-server` → `cms-mcp-server`). **But Vercel truncates long branch slugs** to fit the ~63-char DNS label and appends a short hash, so the slug-built host is only reliable for short branches. The full host (`documentation-git-` + slug + `-strapijs`) must fit in 63 chars, which leaves **35 characters for the slug**.

Note that at PR-creation time the Vercel bot comment does not exist yet (Vercel reacts to the PR after it is opened, ~1-2 min later), so the real host with its hash cannot be read up front. Handle the two cases:

**A. Short branch (slug ≤ 35 characters):** the slug-built host is reliable. Use it directly:

```
https://documentation-git-<slug>-strapijs.vercel.app/<page-path>
```

Optionally verify with `curl -s -o /dev/null -w '%{http_code}' -L --max-time 25 "<url>"` (expect `200`).

**B. Long branch (slug > 35 characters):** the slug-built host will be truncated and will not resolve. The real host is only known once Vercel posts its comment. After creating the PR (Step 3), poll for the Vercel bot comment, then edit the description:

1. Poll up to 3 times, ~30s apart (≈90s total), for the Vercel comment host:
   ```bash
   gh pr view <num> --repo strapi/documentation --json comments \
     -q '.comments[] | select(.author.login | test("vercel"; "i")) | .body' \
     | grep -oE 'https://documentation-git-[a-z0-9-]+\.vercel\.app' | sort -u | head -1
   ```
2. If a host is found, assemble `<host>/<page-path>`, verify it returns `200` with `curl`, and edit the PR description (`gh pr edit <num> --repo strapi/documentation --body ...`) to use the correct link.
3. If no host appears within the poll window, leave the slug-built link in place but append, on its own line right after the preview link, an explicit warning so it gets fixed later:
   ```
   ⚠️ The branch slug for this preview URL is <N> characters long (over the 35-character limit), so the URL above is likely truncated and incorrect. It must be fixed with `/inki:pr-fix` once Vercel has finished building the preview.
   ```
   where `<N>` is the actual slug length.

Order note: the PR is created in Step 1 (via the shared PR rules). Build the preview link as part of the body you propose there, but case A's optional `curl` verification and case B's polling + description edit necessarily run **after** the PR exists.

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
