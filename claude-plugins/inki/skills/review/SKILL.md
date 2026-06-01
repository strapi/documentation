---
name: review
description: "Top-level review orchestrator: runs style-check, outline-check, outline-ux-analyzer, code-verify, coherence-check, and pitfalls-check on the target."
argument-hint: "[--yes|-y] [--fix] <file or directory path>"
user-invocable: true
---

# /inki:review — full documentation review

## Step 0: Parse arguments

From `$ARGUMENTS`, detect optional flags anywhere in the list:

- `--yes` or `-y` → `AUTO=true` (non-interactive: skip any confirmation gates inside sub-skills)
- `--fix` → `FIX=true` (apply auto-fixable findings from `style-check`)

Remove the flags from the argument list. What remains is the target path (or empty).

## Step 1: Resolve target

The remaining argument is either a path (file or directory under `docusaurus/docs/`) or empty. If empty, default to:

```bash
git diff main...HEAD --name-only -- '*.md'
```

## Step 2: Run the 6 sub-skills in parallel where possible

Invoke:
- `/inki:style-check <target>` (with `--fix` if `FIX=true`)
- `/inki:outline-check <target>`
- `/inki:outline-ux-analyzer <target>`
- `/inki:code-verify <target>`
- `/inki:coherence-check <target>`
- `/inki:pitfalls-check <target>`

If `AUTO=true`, pass `--yes` to any sub-skill that supports it (so the whole pipeline runs without prompts). Sub-skills that are read-only (most review sub-skills) ignore the flag gracefully.

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
- `--yes` only changes interaction behavior (no extra prompts). It does NOT change what gets auto-fixed — that stays controlled by `--fix`.
