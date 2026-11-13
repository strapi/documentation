---
name: inki-style-check
description: "Run deterministic style checks on a documentation file or directory, then layer AI judgment on top using the migrated style-checker prompt."
argument-hint: "[--fix] [--no-log] <file or directory path>"
user-invocable: true
---

# /inki-style-check: style lint for documentation files

## Step 1: Determine target

`$ARGUMENTS` is a relative path. If empty, use the diff between current branch and `main`:

```bash
git diff main...HEAD --name-only -- '*.md'
```

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../inki-references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki-review`), write into that run's existing directory instead of creating a new one.

## Step 2: Run the deterministic style script

Inki ships a deterministic linter at `../inki-scripts/style-lint.sh`, relative to this SKILL.md. It checks Markdown/MDX files against regex-based rules from the 12 Rules of Technical Writing (em dashes, casual language, simplification suggestions, bold prefixes that should be admonitions, etc.). Exit codes: `0` clean, `1` errors found, `2` warnings only.

Run it on the target, resolving the script path from the directory of this SKILL.md:

```bash
<this skill directory>/../inki-scripts/style-lint.sh <target>
```

## Step 3: Apply the migrated style-checker prompt

Read `../inki-references/prompts/style-checker.md` (relative to this SKILL.md location) and use it as the system prompt for an AI judgment pass over the target file's content.

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
