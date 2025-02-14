---
title: Sorting by id is no longer possible to sort by chronological order
description: In Strapi 5, sorting by id is no longer possible to sort by chronological order, and you should use createdAt instead.
sidebar_label: Sort chronologically with createdAt
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - content API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import YesCodemods from '/docs/snippets/breaking-change-handled-by-codemod.md'

# Sorting by `id` is no longer possible to sort by chronological order in Strapi 5

In Strapi 5, sorting by `id` to sort by chronological order is no longer possible since [documents](/cms/api/document) use an uuid.

<Intro />
<YesPlugins />
<YesCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

In Strapi v4, using the Entity Service API, you could do the following to sort entries by chronological order:

```js
strapi.entityService.findMany('api::article.article', {
  sort: 'id',
});
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

In Strapi 5, use the [Document Service API](/cms/api/document-service) to sort documents by chronological order, use the `createdAt` field:

```js
strapi.documentService.findMany('api::article.article', {
  sort: 'createdAt',
});
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

No manual procedure should be required as this will be handled by a codemod.
