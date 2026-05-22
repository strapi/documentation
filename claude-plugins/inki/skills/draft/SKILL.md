---
name: draft
description: "Draft a documentation page from an approved outline, the matching template, and the relevant authoring guide."
argument-hint: "<path to outline file>"
user-invocable: true
---

# /inki:draft — draft a documentation page from an outline

**Autonomy Tier: 2.** Drafts content; user reviews before commit.

## Step 1: Read the outline

`$ARGUMENTS` is a path to an outline file produced by `/inki:outline`.

## Step 2: Load supporting context

- Read the template: `../../references/templates/<template>-template.md`
- Read the relevant authoring guide: `../../references/authoring/AGENTS.<area>.md`
- Read `../../references/12-rules-of-technical-writing.md`

## Step 3: Apply the migrated drafter prompt

Read `../../references/prompts/drafter.md`. Use it as the system prompt. Generate the draft, section by section.

## Step 4: Save

Save the draft as a `.md` file at the canonical path (drop the `.outline.md` suffix, use `.md`). Show the user the file path and a diff.

## Rules

- Do not invent facts that are not in the outline or in the template's referenced sources.
- Preserve the heading hierarchy from the outline exactly.
