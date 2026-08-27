---
name: pitfalls-add
description: "Add a new entry to the known-pitfalls catalog that pitfalls-check audits against. Verifies the correct pattern against the Strapi source before adding, and confirms with the user. Use when you have found a documentation mistake worth catching automatically in future reviews."
argument-hint: "[--non-interactive] [--no-log] <description of the pitfall, or a pitfalls-check / code-verify finding to promote>"
user-invocable: true
---

# /inki:pitfalls-add: add an entry to the known-pitfalls catalog

The `pitfalls-checker` agent is read-only: it consults the catalog but never edits it. This skill is the writing counterpart: it adds a new, verified entry to the known-pitfalls catalog so the mistake is caught automatically in every future review.

The catalog exists in two places. The **canonical copy** is versioned in the repo at `claude-plugins/inki/references/prompts/integrity-known-pitfalls.md`. The **plugin cache copy** (`${CLAUDE_PLUGIN_ROOT}/references/prompts/integrity-known-pitfalls.md`) is what the running plugin reads, and it is overwritten on every plugin update. Always write the canonical copy first, then mirror to the cache (Step 5): an entry written only to the cache is silently lost on the next update.

## Step 0: Parse arguments

If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not modify the catalog.

Otherwise, from `$ARGUMENTS`, detect `--non-interactive` (canonical), aliases `--auto-approve`, `--auto`, `--yes`, `-y`, `--no-questions-asked` (all equivalent) → `AUTO=true`. What remains describes the pitfall: either free text, or a finding copied from a `pitfalls-check` / `code-verify` report.

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

Read the **canonical** catalog and pick the matching category table (e.g. "Strapi v5 identifiers", "Lifecycle and boot sequence"). If none fits, create a new category section following the existing format.

## Step 4: Show the proposed entry and confirm

Display the exact row to be added, under which category:

```
Category: <name>
| <hallucinated> | <correct> | <context> |
```

If `AUTO=false` (default), ask for confirmation before writing. If `AUTO=true`, skip the prompt (the source verification in Step 2 is the safety gate).

## Step 5: Add the entry, canonical first

Write in this order. Never stop after the cache: that is how entries get lost.

1. **Canonical copy (required).** Add the row to the chosen table in `claude-plugins/inki/references/prompts/integrity-known-pitfalls.md`, preserving the file's existing Markdown formatting. Do not reorder or rewrite existing entries.

   Resolve an absolute path to it before writing:

   ```bash
   ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
   CANON="$ROOT/claude-plugins/inki/references/prompts/integrity-known-pitfalls.md"
   [ -n "$ROOT" ] && [ -f "$CANON" ] && echo "$CANON" || echo "NOT_FOUND"
   ```

   This works from anywhere inside the repo, including subdirectories such as `docusaurus/`. If it prints `NOT_FOUND` (the session is running outside `strapi/documentation`, or in another repo), do **not** fall back to writing only the cache: say the canonical copy is unreachable, print the row for the user to add themselves, and stop.

2. **Cache copy (mirror).** Copy the same row into `${CLAUDE_PLUGIN_ROOT}/references/prompts/integrity-known-pitfalls.md` so the entry takes effect immediately in the running session, without waiting for a plugin update.

3. **Verify they match.** The two files must be identical afterwards:

   ```bash
   diff "$CANON" "${CLAUDE_PLUGIN_ROOT}/references/prompts/integrity-known-pitfalls.md"
   ```

   If the diff shows entries present in the cache but missing from the canonical copy, those are earlier cache-only additions that were never persisted. Surface them to the user and offer to sync them into the canonical copy in the same pass, re-verifying each against the source per Step 2 before doing so.

## Step 6: Report

Confirm what was added, to which category, and in **both** locations. State explicitly that the canonical copy is versioned and needs committing, and that the cache copy is a working mirror that will be overwritten on the next plugin update.

The canonical copy is a tracked file in `strapi/documentation`, so remind the user to commit it (`/inki:commit`). Do not commit it as part of an unrelated documentation change unless the user asks.

## Rules

- Never add an unverified "correct pattern". Verification against the source is mandatory (Step 2).
- Append only; never edit or remove existing catalog entries.
- Always write the canonical copy in the repo before the plugin cache copy, and never write the cache alone. The cache is overwritten on plugin updates, so a cache-only entry is silently lost.
- This is the only inki skill allowed to write the pitfalls catalog. The `pitfalls-checker` agent stays strictly read-only.
