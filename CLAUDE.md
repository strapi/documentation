# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the official Strapi documentation repository, built with Docusaurus 3. The main documentation website is hosted at [docs.strapi.io](https://docs.strapi.io). This repository contains only documentation content - the actual Strapi codebase is in the separate [strapi/strapi](https://github.com/strapi/strapi) repository.

## Development Commands

All development should be done in the `/docusaurus` subdirectory:

```bash
cd docusaurus
```

### Core Commands

- `yarn && yarn dev` - Install dependencies and start development server (port 8080)
- `yarn build` - Build the documentation (required before submitting PRs)
- `yarn serve` - Serve the built documentation locally
- `yarn clear` - Clear Docusaurus cache

### Content Generation
- `yarn generate-llms` - Generate LLM-specific content files
- `yarn llms:generate-and-validate` - Generate and validate LLM code examples
- `yarn validate:llms-code` - Validate existing LLM code examples

### Release and Scripts
- `yarn release-notes` - Generate release notes
- `yarn redirections-analysis` - Analyze URL redirections

### Prerequisites
- Node.js >= 18.15.0 <= 22.x.x
- Yarn >= 1.22.x
- Always run `yarn build` before submitting pull requests to ensure no broken links

## Repository Structure

```
/
├── docusaurus/                 # Main Docusaurus application
│   ├── docs/                  # Documentation content
│   │   ├── cms/               # Strapi CMS documentation
│   │   └── cloud/             # Strapi Cloud documentation
│   ├── src/                   # React components and custom pages
│   ├── static/                # Static assets
│   ├── scripts/               # Build and utility scripts
│   ├── sidebars.js           # Sidebar configuration
│   └── docusaurus.config.js  # Main configuration
├── agents/                    # Documentation review and generation agents
│   ├── prompts/              # AI agent specifications
│   ├── templates/            # Content templates
│   └── authoring/            # Authoring guides
└── .cursor/rules/            # Cursor IDE rules for documentation agents
```

## Documentation Architecture

The documentation is split into two main sections:
- **CMS Docs** (`/docs/cms/`) - Core Strapi CMS features and APIs
- **Cloud Docs** (`/docs/cloud/`) - Strapi Cloud hosting platform

### Content Organization
- Use branch prefix `cms/` for CMS-related changes
- Use branch prefix `cloud/` for Cloud-related changes
- Use branch prefix `repo/` for repository-wide changes

## Writing Guidelines

### Style and Quality
- Follow the [12 Rules of Technical Writing](12-rules-of-technical-writing.md)
- Use the [Style Guide](STYLE_GUIDE.pdf) for formatting conventions
- Disable linters/auto-formatters before saving to prevent rendering issues

### Content Structure
- Use MDX format (Markdown + React components)
- Include proper frontmatter with `title`, `description`, `displayed_sidebar`, `tags`
- Use sentence case for headings
- Include `<Tldr>` components for page summaries
- Use numbered lists for procedures, bullet points for features/options

## Documentation Agent System

This repository includes a comprehensive AI-powered documentation workflow system. **Start with `AGENTS.md`** - it's the main entry point and directory for the entire system.

### System Architecture

- **`AGENTS.md`** - Main directory and entry point, explains the complete system
- **`agents/prompts/`** - Core agent specifications for review and content creation workflows
- **`agents/templates/`** - Content templates for different documentation types
- **`agents/authoring/`** - Area-specific authoring guides (CMS, Cloud, APIs, etc.)
- **`.cursor/rules/`** - Cursor IDE implementations (platform-specific wrappers)

### Available Agents (in `agents/prompts/`)

- **Orchestrator** - Coordinates Review and Create workflows
- **Router** - Identifies document type, determines placement, loads templates
- **Outliner** - Handles all documentation structure tasks with three specialized sub-prompts:
  - **Outline Checker** - Ensures template compliance, frontmatter, heading hierarchy
  - **Outline UX Analyzer** - Checks reader experience, section order, cognitive load
  - **Outline Generator** - Creates outlines from source material (Notion, Jira, specs)
- **Style Checker** - Enforces the 12 Rules of Technical Writing and Strapi conventions
- **Drafter** - Drafts documentation based on inputs from Router and Outliner
- **Integrity Checker** - Coordinates technical verification with two specialized sub-checks:
  - **Code Verifier** - Verifies code examples and technical claims against the Strapi codebase
  - **Coherence Checker** - Verifies cross-page consistency, links, and terminology

### Workflows

**Review Mode**: `Router → Outliner (Checker) → Style Checker → Integrity Checker`
**Create Mode**: `Router → Outliner (Generator) → Drafter → Style Checker → Integrity Checker`

## Key Configuration Files

- `docusaurus.config.js` - Main Docusaurus configuration
- `sidebars.js` - Navigation structure definition
- `package.json` - Dependencies and build scripts
- `.cursor/rules/` - AI agent specifications for Cursor IDE
- `agents/prompts/` - Standalone AI agent specifications

## Content Validation

### LLMs Integration
The repository includes special handling for LLM (Large Language Model) integrations:
- Auto-generated files: `llms.txt`, `llms-code.txt`
- Validation scripts ensure code examples are accurate
- Content is optimized for AI consumption while maintaining human readability

### Build Process
The build process includes:
1. LLM content generation
2. Code example validation
3. Link checking
4. Static site generation

### Code Examples
- All code examples produced by AI agents MUST be validated against the actual Strapi codebase
- Use the integrity checker to verify technical accuracy
- Include both JavaScript and TypeScript variants when applicable

## Branch and PR Conventions

- Target the `main` branch for most pull requests
- Use descriptive branch names with appropriate prefixes
- Add `flag: merge pending release` label for release-dependent content
- Build locally with `yarn build` before submitting PRs
- Use draft PRs for incremental work

## Important Notes

- **No Strapi codebase in this repo** - Code verification requires access to the separate [strapi/strapi](https://github.com/strapi/strapi) repository
- **Docusaurus-specific** - Uses Docusaurus 3 with custom plugins and components
- **AI-enhanced workflow** - Extensive agent system for content review and generation
- **Multi-product docs** - Covers both CMS and Cloud products with different audiences