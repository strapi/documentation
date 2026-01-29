---
title: TITLE — Clear statement of the change
description: One sentence explaining what changed and who is affected.
sidebar_label: Short label (optional)
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - TOPIC_TAG
 - upgrade to Strapi 5
---

<!--
================================================================================
BREAKING CHANGE TEMPLATE
================================================================================
Use this template for individual breaking change pages in /cms/migration/vX-to-vY/breaking-changes/

QUICK REFERENCE - BreakingChangeIdCard props:
  plugins            → Add if this breaking change affects plugin developers
  codemod            → Add if FULLY handled by a codemod
  codemodPartly      → Add if PARTLY handled by a codemod
  codemodName="..."  → Codemod identifier (e.g., "entity-service-document-service")
  codemodLink="..."  → GitHub URL to the codemod source code
  info="..."         → Additional note (e.g., "handled by data migration script")

EXAMPLES:
  <BreakingChangeIdCard />                                    → No plugins, no codemod
  <BreakingChangeIdCard plugins />                            → Affects plugins, no codemod
  <BreakingChangeIdCard plugins codemod />                    → Affects plugins, fully automated
  <BreakingChangeIdCard plugins codemodPartly                 → Affects plugins, partly automated
    codemodName="my-codemod"
    codemodLink="https://github.com/strapi/strapi/blob/develop/..." />
================================================================================
-->

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# TITLE — Can expand on frontmatter title

Brief 1-2 sentence introduction explaining the change in context.

<Intro />

<BreakingChangeIdCard />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Description of v4 behavior.

```js
// v4 code example (if applicable)
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Description of v5 behavior.

```js
// v5 code example (if applicable)
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- Key information about the change.
- Link to related documentation: see [Feature name](/cms/path/to/doc).
- Link to related breaking change: see [related entry](/cms/migration/v4-to-v5/breaking-changes/slug).

### Manual procedure

Describe manual steps if needed. Use one of these formats:

**Simple prose:** No manual migration is required.

**Numbered steps:**
1. First action
2. Second action
3. Verify the change

**Before/After code:**

<SideBySideContainer>
<SideBySideColumn>

**In Strapi v4**

```js
// Old code
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

```js
// New code
```

</SideBySideColumn>
</SideBySideContainer>