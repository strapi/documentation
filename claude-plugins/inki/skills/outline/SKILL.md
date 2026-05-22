---
name: outline
description: "Generate an outline for a new documentation page from a topic brief and the appropriate template."
argument-hint: "<topic brief or path to a brief file>"
user-invocable: true
---

# /inki:outline — generate a page outline

## Step 1: Read the brief

`$ARGUMENTS` is either inline text or a path to a `.md` file containing the brief.

## Step 2: Pick the template

Decide which template applies (feature, plugin, guide, API, configuration, breaking-change) based on the brief. Read the relevant template at `../../references/templates/<template>-template.md`.

## Step 3: Apply the migrated outliner prompts

Read `../../references/prompts/outliner.md` and `../../references/prompts/outline-generator.md`. Use them as system prompts to produce an outline.

## Step 4: Show the outline for approval

Display the outline. Wait for `y` (accept) / `n` (discard) / `e` (edit inline).

## Step 5: Save

On `y`, save the outline as a `.md` file at a path the user confirms (typically under `docusaurus/docs/<area>/<slug>.outline.md`).
