---
name: pitfalls-check
description: "Audit a documentation file against the known-pitfalls list: common mistakes, outdated patterns, deprecated APIs."
argument-hint: "<file path>"
user-invocable: true
---

# /inki:pitfalls-check — known pitfalls audit

## Step 1: Read the target file

`$ARGUMENTS` is a relative path.

## Step 2: Load the known-pitfalls catalog

Read `../../references/prompts/integrity-known-pitfalls.md`. This file is a reference catalog of documented hallucination patterns (organized by category, with tables mapping the wrong pattern to the correct one and a short context note). For each entry, check whether the target file matches the hallucinated pattern.

## Step 3: Report

```
Target: <path>
Pitfalls found:
- <pitfall name>: <line or section reference>: <suggested fix>
```
