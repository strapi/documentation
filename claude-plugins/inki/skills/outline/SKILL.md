---
name: outline
description: "Generate an outline for a new documentation page from a topic brief and the appropriate template."
argument-hint: "[--non-interactive] [--no-log] <topic brief or path to a brief file>"
user-invocable: true
---

# /inki:outline: generate a page outline

## Step 0: Parse arguments

If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not run the skill.

Otherwise, from `$ARGUMENTS`, detect the autonomy flag anywhere in the list: `--non-interactive` (canonical), aliases `--auto-approve`, `--auto`, `--yes`, `-y`, `--no-questions-asked` (all equivalent). If present, set `AUTO=true` and remove the flag. What remains is the brief.

Logging: unless `--no-log` is passed, write this skill's report to the run log per `../../references/logging.md` (`--log-dir <path>` and `--short-log` are also accepted). When invoked as part of an orchestrator (e.g. `/inki:write`), write into that run's existing directory instead of creating a new one.

## Step 1: Read the brief

The remaining `$ARGUMENTS` is either inline text or a path to a `.md` file containing the brief.

## Step 2: Pick the template

Decide which template applies (feature, plugin, guide, API, configuration, breaking-change) based on the brief. Read the relevant template at `../../references/templates/<template>-template.md`.

## Step 3: Apply the migrated outliner prompts

Read `../../references/prompts/outliner.md` and `../../references/prompts/outline-generator.md`. Use them as system prompts to produce an outline.

## Step 4: Show the outline for approval

If `AUTO=true`, skip the approval gate and go straight to Step 5, saving to the default path.

Otherwise, display the outline. Wait for `y` (accept) / `n` (discard) / `e` (edit inline).

## Step 5: Save

On `y` (or in `AUTO=true` mode), save the outline as a `.md` file. In interactive mode, confirm the path with the user (typically under `docusaurus/docs/<area>/<slug>.outline.md`); in auto mode, use that default path without prompting.
