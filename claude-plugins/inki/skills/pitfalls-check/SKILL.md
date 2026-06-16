---
name: pitfalls-check
description: "Audit a documentation file against the known-pitfalls list: common mistakes, outdated patterns, deprecated APIs."
argument-hint: "[--no-log] <file path>"
user-invocable: true
---

# /inki:pitfalls-check: known pitfalls audit

## Step 1: Read the target file

`$ARGUMENTS` is a relative path.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:review`), write into that run's existing directory instead of creating a new one.

## Step 2: Load the known-pitfalls catalog

Read `../../references/prompts/integrity-known-pitfalls.md`. This file is a reference catalog of documented hallucination patterns (organized by category, with tables mapping the wrong pattern to the correct one and a short context note). For each entry, check whether the target file matches the hallucinated pattern.

## Step 3: Report

```
Target: <path>
Pitfalls found:
- <pitfall name>: <line or section reference>: <suggested fix>
```
