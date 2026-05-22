---
name: review
description: "Top-level review orchestrator: runs style-check, outline-check, outline-ux-analyzer, code-verify, coherence-check, and pitfalls-check on the target."
argument-hint: "<file or directory path> [--fix]"
user-invocable: true
---

# /inki:review — full documentation review

**Autonomy Tier: 1 (default) or 2 (with --fix).**

## Step 1: Resolve target

`$ARGUMENTS`: either a path (file or directory under `docusaurus/docs/`) or empty (default to `git diff main...HEAD --name-only -- '*.md'`).

## Step 2: Run the 6 sub-skills in parallel where possible

Invoke:
- `/inki:style-check <target>` (with `--fix` if requested)
- `/inki:outline-check <target>`
- `/inki:outline-ux-analyzer <target>`
- `/inki:code-verify <target>`
- `/inki:coherence-check <target>`
- `/inki:pitfalls-check <target>`

Collect each report.

## Step 3: Synthesize

Output a combined table:

```
| Sub-skill | Issues found | Severity |
|-----------|--------------|----------|
| style-check | <N> | low/med/high |
| outline-check | ... | ... |
| ... | ... | ... |
```

Then list issues by file, ordered by severity.

## Rules

- Each sub-skill stays atomic. Do not duplicate their logic here.
- If `--fix` is passed, only the auto-fixable findings from `style-check` are applied automatically. All others remain suggestions.
