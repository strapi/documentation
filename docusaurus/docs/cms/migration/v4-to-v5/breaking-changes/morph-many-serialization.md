---
title: Empty morphMany relations return [] instead of null when populated
description: In Strapi 5, populating an empty morphMany relation or multiple media field returns an empty array instead of null.
sidebar_label: Empty morphMany returns []
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - Content API
 - media
 - morphMany
 - populate
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Empty morphMany relations return [] instead of null when populated

<Tldr>

In Strapi 5, populating an empty `morphMany` relation -- including `type: 'media', multiple: true` fields such as a gallery -- returns `[]` instead of `null`. Update client code that checks `field === null` to treat `[]` as the empty state.

</Tldr>

In Strapi 5, empty `morphMany` relations and `type: 'media', multiple: true` fields (such as a gallery) now serialize as an empty array when populated, consistent with `oneToMany` and `manyToMany` relations. Previously, these fields returned `null` when no related entries existed.

<Intro />

<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Populating an empty `morphMany` relation or a multiple media field returned `null`:

```json
{
  "gallery": null
}
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Populating an empty `morphMany` relation or a multiple media field returns an empty array:

```json
{
  "gallery": []
}
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- This change applies to all `morphMany` relation types, including `type: 'media', multiple: true` fields (for example, gallery fields).
- The change is unconditional and is not controlled by the `api.documents.strictRelations` setting.
- See [Document Service API: Populating fields](/cms/api/document-service/populate) and [REST API: Population & Field Selection](/cms/api/rest/populate-select#population) for related information on populating relations.

### Manual procedure

Check client code, webhooks, and integrations that consume populated `morphMany` or multiple media fields.

1. Search your codebase for code that branches on `field === null` or treats `null` as "no value" for populated `morphMany` or multiple media fields.
2. Replace `null` checks with array checks, for example using `!field?.length`.

<SideBySideContainer>
<SideBySideColumn>

**Before**

```js
if (entry.gallery === null) {
  // handle empty gallery
}
```

</SideBySideColumn>

<SideBySideColumn>

**After**

```js
if (!entry.gallery?.length) {
  // handle empty gallery
}
```

</SideBySideColumn>
</SideBySideContainer>
