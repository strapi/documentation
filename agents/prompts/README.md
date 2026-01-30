# Prompts collection

The present `prompts` folder contains elaborate prompts that can be used for specific documentation tasks which, used as standalone or in combination, will help create and review documentation PRs.

These prompts should be LLM agnostic, though so far the best results are produced with Claude, and this is the LLM Piwi will use regularly with these prompts.

## Overview

There are 6 specialized prompts:

- **Router**: Analyzes input content (PR, Notion page, Jira ticket) and identifies which documentation section and template applies.

- **Outliner**: Wrapper prompt that handles all documentation structure tasks. Routes to one of two sub-prompts:
  - **Outline Checker**: Verifies existing structure against templates, checks required sections/components, validates heading hierarchy and parallel structure.
  - **Outline Generator**: Creates documentation outlines from source material (Notion, Jira, specs) following the appropriate template.

- **Drafter**: Generates documentation content following the structure from the Outliner and adhering to style guidelines.

- **Style Checker**: Reviews content for violations of the 12 Rules of Technical Writing and Strapi style conventions.

- **Integrity Checker**: Verifies technical accuracy including broken links, invalid file paths, code block formatting, and anchor consistency.

- **Orchestrator**: Coordinates the execution of prompts in the appropriate sequence based on the task (creation or review mode).

## Availability

| Prompt | Status |
|--------|--------|
| Router | 🔜 Coming soon |
| Outliner | ✅ Available |
| ↳ Outline Checker | ✅ Available |
| ↳ Outline Generator | 🔜 Coming soon |
| Drafter | 🔜 Coming soon |
| Style Checker | ✅ Available |
| Integrity Checker | 🔜 Coming soon |
| Orchestrator | 🔜 Coming soon |

## Workflows

**Review workflow** (existing content):
```
Router → Outline Checker → Style Checker → Integrity Checker
```

**Create workflow** (new content):
```
Router → Outline Generator → Drafter → Style Checker → Integrity Checker
```