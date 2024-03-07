---
title: Draft & Publish always enabled in v5
description: Draft & Publish is always enabled in Strapi v5 and this is reflected in the Content API models.
sidebar_label: Draft & Publish always enabled
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - Content API
 - Draft & Publish
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Draft & Publish is always enabled in Strapi v5

In Strapi 5, the Draft & Publish feature is always enabled. <Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Content types had a `draftAndPublish` option in their schema. The database schema and admin panel interface changed depending on that option.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

<!-- TODO: update sentence "also will be changing" → define what changed once we know -->
All content-types now have Draft & publish enabled in the database and in the admin panel interface. The admin panel interface also will be changing.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

<!-- TODO: add codemod link -->
<!-- TODO: add link to strapi upgrade CLI tool documentation -->
- Strapi provides a [codemods](#) to automatically update all the content-type schemas that are detected by the [`strapi upgrade` tool](#).
- Plugin developers and users with custom content-types should update content-types.
- A safety net is provided to avoid breaking changes that would force manual intervention and to avoid breaking the whole Strapi plugins ecosystem:

  - A default `publishedAt` value is set.
  - The `draftAndPublish: true` option can still be present in v5 content-types schemas, but will be ignored.

### Manual procedure

:::note
This procedure is only required if the codemods failed to remove the line automatically.
:::

To manually update Strapi v4 code to Strapi v5, update the `schema.json` files of your content-types to remove the `draftAndPublish: true` option line:

```json title="/src/api/my-api-name/content-types/my-content-type-name/schema.json"

{
  "options": {
    "draftAndPublish": true // delete the entire line
   }
}
```
    