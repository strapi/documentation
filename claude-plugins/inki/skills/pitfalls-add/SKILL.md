---
name: pitfalls-add
description: "Add a new entry to the known-pitfalls catalog that pitfalls-check audits against. Verifies the correct pattern against the Strapi source before adding, and confirms with the user. Use when you have found a documentation mistake worth catching automatically in future reviews."
argument-hint: "[--auto-approve] [--no-log] <description of the pitfall, or a pitfalls-check / code-verify finding to promote>"
user-invocable: true
---

# /inki:pitfalls-add: add an entry to the known-pitfalls catalog

The `pitfalls-checker` agent is read-only: it consults the catalog but never edits it. This skill is the writing counterpart: it adds a new, verified entry to `${CLAUDE_PLUGIN_ROOT}/references/prompts/integrity-known-pitfalls.md` so the mistake is caught automatically in every future review.

## Step 0: Parse arguments

If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not modify the catalog.

Otherwise, from `$ARGUMENTS`, detect `--auto-approve` (aliases `--auto`, `--yes`, `-y`) → `AUTO=true`. What remains describes the pitfall: either free text, or a finding copied from a `pitfalls-check` / `code-verify` report.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). This skill normally runs standalone (it creates its own run directory); if ever invoked as part of an orchestrator, write into that run's existing directory instead of creating a new one.

## Step 1: Derive the three required fields

Every catalog entry needs:

1. **Hallucinated pattern**: what the wrong content says (the version to catch).
2. **Correct pattern**: what the code actually does.
3. **Context**: why the mistake happens and when to watch for it.

Extract these from the input. If any is missing or unclear, ask the user (do not invent the correct pattern).

## Step 2: Verify the correct pattern against the source

Do NOT add an unverified pattern: a wrong catalog entry would generate false positives forever. Confirm the "correct pattern" against the actual `strapi/strapi` source (a local clone if available, otherwise a raw GitHub fetch), the same way `code-verify` does. If it cannot be verified, say so and stop; offer to add it as a clearly-marked `unverified` entry only if the user insists.

## Step 3: Choose the category

Read the catalog and pick the matching category table (e.g. "Strapi v5 identifiers", "Lifecycle and boot sequence"). If none fits, create a new category section following the existing format.

## Step 4: Show the proposed entry and confirm

Display the exact row to be added, under which category:

```
Category: <name>
| <hallucinated> | <correct> | <context> |
```

If `AUTO=false` (default), ask for confirmation before writing. If `AUTO=true`, skip the prompt (the source verification in Step 2 is the safety gate).

## Step 5: Add the entry

Add the row to the chosen table (or the new category section), preserving the file's existing Markdown formatting. Do not reorder or rewrite existing entries.

## Step 6: Report

Confirm what was added and where. If the catalog lives under a synced reference, remind the user that the canonical copy may need the same edit if a sync rule applies (the catalog is a plugin reference, edited in place here).

## Rules

- Never add an unverified "correct pattern". Verification against the source is mandatory (Step 2).
- Append only; never edit or remove existing catalog entries.
- This is the only inki skill allowed to write the pitfalls catalog. The `pitfalls-checker` agent stays strictly read-only.
