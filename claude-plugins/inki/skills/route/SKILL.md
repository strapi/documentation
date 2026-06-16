---
name: route
description: "Given a strapi/strapi PR, identify which documentation pages and sections must be updated to cover the change."
argument-hint: "[--no-log] <strapi/strapi PR number or URL>"
user-invocable: true
---

# /inki:route: route a code PR to its docs targets

## Step 0: Parse the input

`$ARGUMENTS` can be one of:

- A bare PR number: `26847`
- A hashed PR number: `#26847`
- A full URL: `https://github.com/strapi/strapi/pull/26847`
- A URL with a sub-path: `https://github.com/strapi/strapi/pull/26847/files`

Extract the trailing digits to obtain the PR number. A simple regex `[0-9]+$` (after stripping a trailing `/files`, `/commits`, etc. if present) is sufficient. If no numeric PR ID can be extracted, report the error and stop.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:research`), write into that run's existing directory instead of creating a new one.

## Step 1: Fetch the strapi/strapi PR

Fetch with `gh pr view <num> --repo strapi/strapi --json title,body,files,labels`.

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
