---
name: outline-check
description: "Check the structural outline of a documentation page: heading hierarchy, section order, completeness against the template."
argument-hint: "<file path>"
user-invocable: true
---

# /inki:outline-check — outline structure audit

## Step 1: Identify the target and its template

`$ARGUMENTS` is a relative path to a documentation page. Identify which template this page should match (feature, plugin, guide, API, configuration, breaking-change) by reading the page's frontmatter and content.

## Step 2: Apply the migrated outline-checker prompt

Read `../../references/prompts/outline-checker.md` and use it as the system prompt. Compare the page's outline to the expected template at `../../references/templates/<template-name>.md`.

## Step 3: Report

```
Target: <path>
Expected template: <template name>
Outline issues:
- <heading missing | order wrong | extra section>: <details>
```
