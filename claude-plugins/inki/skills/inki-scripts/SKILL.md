---
name: inki-scripts
description: "Shell helpers shared by the inki-* skills: the deterministic style linter, temporary worktrees for main and for a PR, the root-refs sync, and the skills links. Load when another inki-* skill cites it, or when you need to lint a docs page or check the skills links."
user-invocable: false
---

# Inki scripts

This skill holds no workflow. It hosts the scripts that several `inki-*` skills and CI share. Run them from the repository root, through their repo path `claude-plugins/inki/skills/inki-scripts/scripts/<script>`.

- `scripts/style-lint.sh <file|dir>…`: deterministic style checks from the 12 Rules of Technical Writing. Prints `<severity>:<line>:<rule>:<message>`; exits `0` when clean, `1` on errors, `2` on warnings only. Used by `inki-style-check` and the `inki-style-checker` agent.
- `scripts/main-worktree.sh create|destroy`: create or remove a detached `origin/main` worktree. Used by `inki-review` to resolve docs.strapi.io URLs.
- `scripts/pr-worktree.sh create|destroy <number>`: create or remove a worktree checked out on a PR. Used by `inki-review` for PR-scope reviews.
- `scripts/sync-root-refs.sh`: copy the canonical root `git-rules.md` and `12-rules-of-technical-writing.md` into `inki-references`. Run by CI.
- `scripts/link-skills.sh [--check]`: create the links that expose every Inki skill and agent in `.claude/`, `.agents/`, and `.cursor/`. With `--check`, only report missing or stale links and exit `1` if any. Run it after adding, renaming, or removing a skill or an agent.
