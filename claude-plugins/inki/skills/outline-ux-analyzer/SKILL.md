---
name: outline-ux-analyzer
description: "Analyze the pedagogical UX of a documentation outline: progression from beginner to advanced, signposting, and reading flow."
argument-hint: "[--no-log] <file path>"
user-invocable: true
---

# /inki:outline-ux-analyzer: pedagogical UX audit

## Step 1: Read the target

`$ARGUMENTS` is a relative path to a documentation page.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:review`), write into that run's existing directory instead of creating a new one.

## Step 2: Apply the migrated outline-ux-analyzer prompt

Read `../../references/prompts/outline-ux-analyzer.md` and use it as the system prompt over the target.

## Step 3: Report

```
Target: <path>
UX score: <1-5>
Findings:
- <section/heading>: <UX issue>: <suggestion>
```
