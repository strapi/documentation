---
title: defaultIndex removed
description: In Strapi 5, it's not recommended to update repeatable components with the Document Service API
sidebar_label: defaultIndex removed
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - middlewares
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

#  Updating repeatable components with the Document Service API is not recommended

In Strapi 5, it's not recommended to update repeatable components with the API, due to some limitations of the new Document Service API.

 <Intro />

<BreakingChangeIdCard
  plugins
/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

You could update a repeatable component with its `id`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Strapi 5 uses `documentId` due to the introduction of the [Document Service API](/cms/api/document-service), and you can't update a repeatable component by its `documentId` due to the way the [Draft & Publish](/cms/features/draft-and-publish) feature works with the new API.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<br/>

### Notes

In Strapi 5, draft components and published components have different ids, and you could fetch data like follows:

```js
// Request
GET /articles // -> returns published article

// Response
{
   documentId …
   component: [
     { id: 2, name: 'component-1'  },
     { id: 4, name: 'component-2'  },
   ]
}
```

You can then try to do the following:

```js
PUT /articles/{documentId} // <== Update draft article
{
   documentId …
   component: [
     { id: 2, name: 'component-1-updated'  }, // <== Update component 1
   ]
}
```

However, this would fail because the component id of the draft article is different from the published one. Therefore, it's not recommended to try to update repeatable components with the Document Service API.
