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

The plugin ships a deterministic linter at `claude-plugins/inki/scripts/style-lint.sh`. It checks Markdown/MDX files against regex-based rules from the 12 Rules of Technical Writing (em dashes, casual language, simplification suggestions, bold prefixes that should be admonitions, etc.). Exit codes: `0` clean, `1` errors found, `2` warnings only.

Resolve the script path from the skill's location and run it on the target:

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../../scripts" && pwd)"
"$SCRIPT_DIR/style-lint.sh" <target>
```

If invoked from a Claude Code session, the equivalent is to read `../../scripts/style-lint.sh` relative to this SKILL.md and execute it on the target.

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
