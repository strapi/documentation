---
name: route
description: "Given a strapi/strapi PR, identify which documentation pages and sections must be updated to cover the change."
argument-hint: "<strapi/strapi PR number or URL>"
user-invocable: true
---

# /inki:route — route a code PR to its docs targets

## Step 1: Fetch the strapi/strapi PR

`$ARGUMENTS` is a PR number or URL on `strapi/strapi`. Fetch with `gh pr view <num> --repo strapi/strapi --json title,body,files,labels`.

## Step 2: Apply the migrated router prompt

Read `../../references/prompts/router.md`. Use it as the system prompt over the PR data.

## Step 3: Report

```
strapi/strapi PR #<num>: <title>

Recommended docs targets:
- File: <doc path>
  Section: <heading>
  Action: <add | update | rework>
  Template: <feature | plugin | guide | api | configuration | breaking-change>

Suggested branch name: <prefix>/<slug>
```
