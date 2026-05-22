# Prompts collection

This folder contains specialized prompts for reviewing and creating Strapi documentation. Each prompt targets a specific quality dimension (structure, style, UX, links) and can be used standalone or combined into a full workflow.

These prompts are LLM‑agnostic, though the best results so far have been with Claude.

## Catalog

| Prompt | File | Status | Purpose |
|--------|------|--------|---------|
| **Orchestrator** | `orchestrator.md` | ✅ Available | Coordinates prompts in sequence for Review and Create workflows |
| **Router** | `router.md` | ✅ Available | Identifies doc type, loads the right template and authoring guide |
| **Outliner** | `outliner.md` | ✅ Available | Wrapper that routes to Outline Generator, Outline Checker, or UX Analyzer |
| ↳ Outline Checker | `outline-checker.md` | ✅ Available | Template compliance, frontmatter, heading hierarchy, required components |
| ↳ Outline UX Analyzer | `outline-ux-analyzer.md` | ✅ Available | Reader experience, section order, navigability, cognitive load |
| ↳ Outline Generator | `outline-generator.md` | ✅ Available | Creates outlines from source material (Notion, Jira, specs) |
| **Style Checker** | `style-checker.md` | ✅ Available | 12 Rules of Technical Writing, Strapi style conventions |
| **Drafter** | `drafter.md` | ✅ Available | Generates content from an outline and source material (3 modes: Compose, Patch, Micro-edit) |
| **Integrity Checker** | `integrity-checker.md` | ✅ Available | Coordinates Code Verifier and Coherence Checker, consolidates findings |
| ↳ Code Verifier | `integrity-code-verifier.md` | ✅ Available | Verifies code examples and technical claims against the Strapi codebase |
| ↳ Coherence Checker | `integrity-coherence-checker.md` | ✅ Available | Cross-page consistency, terminology, cross-references |
| ↳ Known Pitfalls | `integrity-known-pitfalls.md` | ✅ Available | Regression test list for known hallucination patterns |

## Shared Resources

The `shared/` folder contains guides and utilities used by multiple prompts:

| Resource | File | Purpose |
|----------|------|---------|
| **GitHub MCP Usage** | `shared/github-mcp-usage.md` | How to fetch PR content using GitHub MCP tools |

## Workflows

**Review mode** (existing content):
```
Router → Outline Checker → Style Checker → Integrity Checker
```

**Create mode** (new content):
```
Router → Outline Generator → Drafter → Style Checker → Integrity Checker
```

## Usage

These prompts can be used in several ways:

- **Claude Projects** — import the `.md` files as project knowledge. Use `claude-project-instructions.md` as the custom instructions (system prompt).
- **Claude Code** — the prompt files live in `agents/prompts/`. Claude Code reads them directly from disk. `AGENTS.md` at the repo root serves as an alternative entry point.
- **Cursor / Windsurf / IDE agents** — add prompt files to workspace context (e.g., `.cursor/rules/`, `@file` references, or equivalent). The agent must be able to read the full prompt spec before executing.
- **ChatGPT / other LLMs** — upload prompt files to the conversation or copy the relevant prompt's content when needed.
- **API integrations** — use as system prompts or tool definitions. For machine-only consumers, the Router can return only the YAML block.

Each prompt file is self‑contained: it includes its role, inputs, detection rules, output format, and behavioral notes. No external dependencies beyond the authoring guides and templates in sibling folders.

### Critical: Execution Protocol

Regardless of platform, the agent must **read the full prompt file before executing**. The Quick Reference table in `claude-project-instructions.md` maps user intents to prompt files. The agent must not produce an informal analysis in place of the structured output defined in the prompt spec. See the "Execution Protocol" section of `claude-project-instructions.md` for details.

## References

- Entry point (system prompt): `claude-project-instructions.md`
- Root agent guide: `AGENTS.md`
- Authoring area guides: `agents/authoring/AGENTS.*.md`
- Templates catalog: `agents/templates/README.md`