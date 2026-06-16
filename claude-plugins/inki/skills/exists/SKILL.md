---
name: exists
description: "Check whether a documentation topic is already covered on strapi/documentation: searches llms.txt, doc files, sidebars, and open GitHub PRs."
argument-hint: "[--no-log] <topic or keyword>"
user-invocable: true
---

# /inki:exists — find existing coverage on a topic

## Input

`$ARGUMENTS`: a topic or keyword (e.g. `MCP server`, `hasPublishedVersion`, `openapi.json route`).

If no argument is provided and the conversation has context (e.g. a PR was just discussed), extract the relevant keywords from context.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:research`), write into that run's existing directory instead of creating a new one.

## Step 1: Search the page index

Read `docusaurus/static/llms.txt` at the repo root and find lines mentioning the topic (case-insensitive).

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
grep -i "<topic>" "$REPO_ROOT/docusaurus/static/llms.txt" | head -20
```

## Step 2: Search doc files

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
grep -rli "<topic>" "$REPO_ROOT/docusaurus/docs/cms" "$REPO_ROOT/docusaurus/docs/cloud" 2>/dev/null | head -20
```

For each match, optionally check when it was last touched:

```bash
git log -1 --format="%ai" -- "<path>"
```

## Step 3: Search sidebars

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
grep -in "<topic>" "$REPO_ROOT/docusaurus/sidebars.js" | head -20
```

## Step 4: Search GitHub PRs

```bash
gh pr list --repo strapi/documentation --state all --search "<topic>" --limit 20 --json number,title,state,url
```

Bucket the PRs as: open (might be in progress), merged (might already cover the topic), closed-not-merged (abandoned attempts).

## Step 5: Synthesize

Report in this format:

```
Coverage check: "<query>"

Pages on docs.strapi.io that mention it:
- <path 1> (last updated YYYY-MM-DD, coverage: full | partial | mention)
- <path 2>

Sidebars referencing it:
- <entry>

PRs:
- Open:    #<num> "<title>" — <url>
- Merged:  #<num> "<title>" — <url>
- Closed:  #<num> "<title>" — <url>

Verdict: COVERED | PARTIAL | IN PROGRESS | NOT DOCUMENTED

Suggested next step: <e.g. "Run /inki:route with the related strapi/strapi PR" | "Run /inki:outline to start a new page" | none>
```

## Rules

- Never modify files.
- If none of the 4 sources match, report NOT DOCUMENTED clearly and suggest the next step.
- When several pages match, surface at most 5, ordered by relevance.
