---
title: No findPage() in Document Service API
description: In Strapi 5, the Entity Service API is deprecated, and for the findPage() method you should use the Document Service API's findMany() method instead.
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - document service
 - entity service
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# No `findPage()` in Document Service API

In Strapi 5, the [Document Service API](/dev-docs/api/document-service) replaces the Entity Service API. There is no `findPage()` method available in the Document Service API and users should use the `findMany()` method instead.
<Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

In Strapi v4 you could use the `findPage()` method from the Entity Service API, for instance as follows: 

```jsx
strapi.entityService.findPage('api::article.article', {
  start: 10,
  limit: 15,
});
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

In Strapi 5 the Entity Service API is deprecated and you should use the Document Service API instead. The [`findMany()` method](/dev-docs/api/document-service/sort-pagination#pagination) can be used as follows:

```jsx
strapi.documents("api::article.article").findMany({
  limit: 10,
  start: 0,
});
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual migration

<!-- TODO: update this part — will there be a codemod? -->
In your custom code, replace any occurences of the Entity Service API's `findPage()` method by the `findMany()` method from the Document Service API.
