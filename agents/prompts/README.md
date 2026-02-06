# Prompts collection

This folder contains specialized prompts for reviewing and creating Strapi documentation. Each prompt targets a specific quality dimension (structure, style, UX, links) and can be used standalone or combined into a full workflow.

These prompts are LLM‑agnostic, though the best results so far have been with Claude.

## Catalog

| Prompt | File | Status | Purpose |
|--------|------|--------|---------|
| **Orchestrator** | `orchestrator.md` | 🔜 Coming soon | Coordinates prompts in sequence for Review and Create workflows |
| **Router** | `router.md` | ✅ Available | Identifies doc type, loads the right template and authoring guide |
| **Outliner** | `outliner.md` | 🏗 (partly) Available | Wrapper that routes to Outline Generator, Outline Checker, or UX Analyzer |
| ↳ Outline Checker | `outline-checker.md` | ✅ Available | Template compliance, frontmatter, heading hierarchy, required components |
| ↳ Outline UX Analyzer | `outline-ux-analyzer.md` | ✅ Available | Reader experience, section order, navigability, cognitive load |
| ↳ Outline Generator | — | 🔜 Coming soon | Creates outlines from source material (Notion, Jira, specs) |
| **Style Checker** | `style-checker.md` | ✅ Available | 12 Rules of Technical Writing, Strapi style conventions |
| **Drafter** | — | 🔜 Coming soon | Generates content from an outline and source material |
| **Integrity Checker** | — | 🔜 Coming soon | Broken links, invalid paths, code block formatting, anchor consistency |

## Workflows

**Review mode** (existing content):
```
Router → Outline Checker → Style Checker → Integrity Checker
```

**Create mode** (new content):
```
Router → Outline Generator → Drafter → Style Checker → Integrity Checker
```

Prompts marked "Coming soon" can be skipped; run the available ones in order.

## Usage

These prompts can be used in several ways:

- **Claude Projects** — import the `.md` files as project knowledge. The project‑level system prompt (the custom instructions field) can reference them to route user requests to the right prompt.
- **Claude.ai / ChatGPT** — copy the prompt content into the conversation or attach the file.
- **API integrations** — use as system prompts or tool definitions.

Each prompt file is self‑contained: it includes its role, inputs, detection rules, output format, and behavioral notes. No external dependencies beyond the authoring guides and templates in sibling folders.

## References

- Root agent guide: `AGENTS.md`
- Authoring area guides: `agents/authoring/AGENTS.*.md`
- Templates catalog: `agents/templates/README.md`
