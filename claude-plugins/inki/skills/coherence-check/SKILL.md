---
name: coherence-check
description: "Check a documentation file for cross-page coherence: terminology, links, and consistency with related pages."
argument-hint: "[--no-log] <file path>"
user-invocable: true
---

# /inki:coherence-check — cross-page coherence

## Step 1: Read the target file and identify related pages

For the target file, find related pages by:
- Walking links from the target file
- Searching `docusaurus/static/llms.txt` for entries on the same topic

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:review`), write into that run's existing directory instead of creating a new one.

## Step 2: Apply the migrated coherence-checker prompt

Read `../../references/prompts/integrity-coherence-checker.md` and use it as the system prompt. Compare the target against each related page.

## Step 3: Report

```
Target: <path>
Related pages compared: <list>
Coherence issues:
- <description>: <where it conflicts>
```
