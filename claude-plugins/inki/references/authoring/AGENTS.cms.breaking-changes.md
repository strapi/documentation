# AGENTS — Breaking Change pages

Scope
- Applies to all files under `docusaurus/docs/cms/migration/**/breaking-changes/*.md`.
- Currently all pages document the v4-to-v5 migration. The patterns below are written to be reusable for future migration versions.
- Follow repo-wide rules from root `AGENTS.md` and `12-rules-of-technical-writing.md`; this guide only encodes structure and conventions specific to breaking change pages.

Purpose
- Ensure every breaking change page follows a predictable, scannable structure so migrating developers can quickly assess impact, understand the difference, and find migration steps.

## Frontmatter

Required fields:

| Field | Rule | Example |
|-------|------|---------|
| `title` | Short description of the change. May include inline code. | `Entity Service deprecated` |
| `description` | One sentence summarizing what changed and which Strapi version is affected. | `In Strapi 5, the Entity Service API is deprecated in favor of the new Document Service API.` |
| `displayed_sidebar` | Always `cmsSidebar`. | `cmsSidebar` |
| `tags` | Always include `breaking changes` and `upgrade to Strapi 5`. Add 1–3 topic-specific tags. | `[breaking changes, Entity Service API, Document Service API, upgrade to Strapi 5]` |

Optional fields:

| Field | When to use | Example |
|-------|-------------|---------|
| `sidebar_label` | When `title` contains backticks or is too long for the sidebar. Keep it short and readable. | `strapi.fetch uses native fetch()` |
| `unlisted` | Set to `true` if the page should not appear in the sidebar (e.g., niche or low-impact changes). | `true` |

## Required imports

Every breaking change page must include these two imports immediately after the frontmatter block, before the H1:

```mdx
import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
```

- `<Intro />` renders a standard paragraph linking to the breaking changes database.
- `<MigrationIntro />` renders a standard introduction for the Migration section.

## Page structure

Breaking change pages follow a fixed skeleton. Every element below is required unless marked *(optional)*.

```
---
frontmatter
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# H1 title

Summary paragraph (1 sentence)

<Intro />

<BreakingChangeIdCard />           ← with appropriate props

## Breaking change description     ← H2, exact wording

<SideBySideContainer>
<SideBySideColumn>
**In Strapi v4**
…
</SideBySideColumn>
<SideBySideColumn>
**In Strapi 5**
…
</SideBySideColumn>
</SideBySideContainer>

## Migration                        ← H2, exact wording

<MigrationIntro />

### Notes                           ← (optional) H3
…

### Manual procedure                ← (optional) H3
…
```

### Detailed rules per element

**H1**
- Must match or closely rephrase the `title` frontmatter.
- May include backtick-wrapped code (e.g., `` # `strapi.fetch` uses the native `fetch()` API ``).

**Summary paragraph**
- One sentence between the H1 and `<Intro />`.
- Summarizes the change and its replacement or consequence.
- Do NOT repeat the `description` frontmatter verbatim; rephrase naturally.

**`<Intro />`**
- Place on its own line, immediately after the summary paragraph.
- Do NOT use `<Tldr>` on breaking change pages — `<Intro />` replaces it.

**`<BreakingChangeIdCard />`**
- Place on its own line, immediately after `<Intro />`.
- Props (all optional, all boolean or string):

| Prop | Type | Effect |
|------|------|--------|
| `plugins` | boolean | Sets "Affects plugins?" to Yes |
| `codemod` | boolean | Sets "Handled by codemod?" to Yes |
| `codemodPartly` | boolean | Sets "Handled by codemod?" to Partly |
| `codemodName` | string | Displays the codemod name (as code or link) |
| `codemodLink` | string | URL to the codemod source on GitHub |
| `info` | string | Additional info text displayed below the card |

- If no props are passed, the card defaults to "Affects plugins? No" and "Handled by codemod? No".
- Do not combine `codemod` and `codemodPartly` on the same card; use one or the other.

**`## Breaking change description`**
- Use this exact heading text.
- Must contain a `<SideBySideContainer>` with exactly two `<SideBySideColumn>` children.
- First column heading: `**In Strapi v4**`
- Second column heading: `**In Strapi 5**`
- Columns can contain prose, bullet lists, or code blocks. Keep both columns roughly balanced in length.
- For complex changes, multiple `<SideBySideContainer>` blocks are acceptable (see Entity Service deprecated page for an example).

**`## Migration`**
- Use this exact heading text.
- Place `<MigrationIntro />` on its own line immediately after the H2.
- If the migration is trivial and needs no subsections, write a single short paragraph after `<MigrationIntro />` (or instead of it).

**`### Notes`** *(optional)*
- Use when there are contextual details, links to related breaking changes, or caveats.
- Content is a bullet list or short paragraphs.
- Cross-link related breaking change pages with relative links (e.g., `(/cms/migration/v4-to-v5/breaking-changes/use-document-id)`).

**`### Manual procedure`** *(optional)*
- Use when the user must take action beyond what a codemod handles.
- Use numbered steps for sequential procedures, bullet lists for independent actions.
- May include `<SideBySideContainer>` blocks for before/after code comparisons.
- When a codemod handles part of the migration, explain what remains to be done manually.
- If no manual action is needed, omit this subsection entirely (the Notes subsection alone is sufficient).

**Heading name for the manual section**
- Use `### Manual procedure` as the standard heading.
- Acceptable alternatives: `### Manual migration`, `### Migration procedure`. Pick one and stay consistent within a single page.

## What NOT to include

- **No `<Tldr>`**: Breaking change pages use `<Intro />` instead.
- **No `<IdentityCard>`**: The `<BreakingChangeIdCard />` component serves a different purpose and replaces it.
- **No `<Guideflow>`**: Breaking change pages are reference-style, not guided workflows.
- **No Prerequisites section**: The audience is developers already running Strapi v4 who are migrating.

## File naming

- Use kebab-case: `entity-service-deprecated.md`, `graphql-api-updated.md`.
- Be descriptive but concise: name reflects the change, not the feature.
- Avoid generic names like `update.md` or `change.md`.

## Cross-linking

- Link to related breaking change pages when one change depends on or relates to another (use 👉 emoji prefix for visual scanability, matching existing convention).
- Link to the feature or API documentation that replaces the deprecated behavior.
- Link to external migration guides when relevant (e.g., Apollo v4 migration docs).
- Use relative links within `/cms/` for internal references.

## Template

Start from `agents/templates/breaking-change-template.md` to get the correct skeleton with all required imports, components, and sections.

## Quality checklist (before commit)

- Frontmatter includes `title`, `description`, `displayed_sidebar: cmsSidebar`, and `tags` (with `breaking changes` and `upgrade to Strapi 5`).
- `sidebar_label` is provided when `title` contains backticks or exceeds ~50 characters.
- Both snippet imports are present (`Intro` and `MigrationIntro`).
- `<Intro />` is placed after the summary paragraph, before `<BreakingChangeIdCard />`.
- `<BreakingChangeIdCard />` has correct props (`plugins` if it affects plugins, codemod props if applicable).
- `## Breaking change description` contains a `<SideBySideContainer>` with "In Strapi v4" / "In Strapi 5" columns.
- Both columns are roughly balanced and clearly describe the before/after.
- `## Migration` section is present; `<MigrationIntro />` is placed immediately after the H2.
- Notes and/or Manual procedure subsections are present when applicable.
- Related breaking changes are cross-linked.
- No `<Tldr>`, no `<IdentityCard>`, no Prerequisites section.
