---
name: style-check
description: "Run deterministic style checks on a documentation file or directory, then layer AI judgment on top using the migrated style-checker prompt."
argument-hint: "<file or directory path>"
user-invocable: true
---

# /inki:style-check — style lint for documentation files

## Step 1: Determine target

`$ARGUMENTS` is a relative path. If empty, use the diff between current branch and `main`:

```bash
git diff main...HEAD --name-only -- '*.md'
```

## Step 2: Run the deterministic style script

If a `scripts/style-lint.sh` exists in the repo, run it on the target. Otherwise rely solely on the AI judgment pass below.

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
[ -f "$REPO_ROOT/scripts/style-lint.sh" ] && \
  "$REPO_ROOT/scripts/style-lint.sh" <target>
```

## Step 3: Apply the migrated style-checker prompt

Read `../../references/prompts/style-checker.md` (relative to this SKILL.md location) and use it as the system prompt for an AI judgment pass over the target file's content.

## Step 4: Report

Output findings in this format:

```
File: <path>
Deterministic issues:
- <line>: <issue>
AI-judged issues:
- <issue>: <suggested fix>
```

If invoked with `--fix` in `$ARGUMENTS`, apply non-controversial fixes (typos, formatting) and leave the rest as suggestions.
