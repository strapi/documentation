# Prompts collection

The present `prompts` folder contains elaborate prompts that can be used for specific documentation tasks which, used as standalone or in combination, will help create and review documentation PRs.

These prompts should be LLM agnostic, though so far the best results are produced with Claude, and this is the LLM Piwi will use regularly with these prompts.

There will be 6 prompts:

- **Router**: Analyzes input content (PR, Notion page, Jira ticket) and identifies which documentation section and template applies.
- **Outliner**: Evaluates document structure against the appropriate AGENTS.md template and proposes reorganization if needed.
- **Drafter**: Generates documentation content following the structure from the Outliner and adhering to style guidelines.
- **Style Checker**: Reviews content for violations of the 12 Rules of Technical Writing and Strapi style conventions.
- **Integrity checker**: Verifies technical accuracy including broken links, invalid file paths, code block formatting, and anchor consistency.
- **Orchestrator**: Coordinates the execution of agents in the appropriate sequence based on the task (generation or review mode).

For now, only Style Checker is available.