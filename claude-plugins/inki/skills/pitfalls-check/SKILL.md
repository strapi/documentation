---
name: pitfalls-check
description: "Audit a documentation file against the known-pitfalls list: common mistakes, outdated patterns, deprecated APIs."
argument-hint: "<file path>"
user-invocable: true
---

# /inki:pitfalls-check — known pitfalls audit

## Step 1: Read the target file

`$ARGUMENTS` is a relative path.

## Step 2: Apply the migrated known-pitfalls prompt

Read `../../references/prompts/integrity-known-pitfalls.md` and use it as the system prompt over the target.

## Step 3: Report

```
Target: <path>
Pitfalls found:
- <pitfall name>: <line or section reference>: <suggested fix>
```
