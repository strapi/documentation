---
name: route
description: "Given a strapi/strapi or strapi/cloud PR, identify which documentation pages and sections must be updated to cover the change."
argument-hint: "[--no-log] <strapi/strapi or strapi/cloud PR: number or URL>"
user-invocable: true
---

# /inki:route: route a code PR to its docs targets

Covers the two repos documented on docs.strapi.io: `strapi/strapi` (the CMS, routes to `docs/cms/`) and `strapi/cloud` (Strapi Cloud, routes to `docs/cloud/`).

## Step 0: Parse the input

`$ARGUMENTS` can be one of:

- A bare PR number: `26847` (repo defaults to `strapi/strapi`; if ambiguous, ask)
- A hashed PR number: `#26847`
- A full URL: `https://github.com/strapi/strapi/pull/26847` or `https://github.com/strapi/cloud/pull/123`
- A URL with a sub-path: `.../pull/26847/files`

Determine `REPO` (`strapi/strapi` or `strapi/cloud`) from the URL or an explicit `owner/repo` token; default to `strapi/strapi` for a bare number. Extract the trailing digits to obtain the PR number (regex `[0-9]+$` after stripping a trailing `/files`, `/commits`, etc.). If no numeric PR ID can be extracted, report the error and stop. If `REPO` is neither `strapi/strapi` nor `strapi/cloud`, report that the repo is not documented on docs.strapi.io and stop.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:research`), write into that run's existing directory instead of creating a new one.

## Step 1: Fetch the PR

Fetch with `gh pr view <num> --repo <REPO> --json title,body,files,labels`.

## Step 2: Apply the migrated router prompt

Read `../../references/prompts/router.md`. Use it as the system prompt over the PR data. Target `docs/cms/` for a `strapi/strapi` PR and `docs/cloud/` for a `strapi/cloud` PR.

## Step 3: Report

```
<REPO> PR #<num>: <title>

Recommended docs targets:
- File: <doc path>
  Section: <heading>
  Action: <add | update | rework>
  Template: <feature | plugin | guide | api | configuration | breaking-change>

Suggested branch name: <prefix>/<slug>
```
