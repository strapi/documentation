---
title: Strapi 5 has a new, flattened response format for API calls
description: In Strapi 5, the response format has been simplified and flattened, and attributes of requested content are no longer wrapped in an attributes object.
sidebar_label: New response format
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - Content API
 - REST API
 - GraphQL API
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'

<!-- # Strapi 5 has a new, flattened response format for API calls -->

In Strapi 5, the response format has been simplified and flattened. <Intro />

<YesPlugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The Content API returns all the attributes of requested content wrapped inside an `attributes` parameter:

```json
{
  "data": {
    // system fields
    "id": 14,
    "attributes": {
      // user fields
      "title": "Article A"
      "relation": {
        "data": {
          "id": "clkgylw7d000108lc4rw1bb6s"
          "name": "Category A"
        }
      }
    }
  }
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10
    }
  }
}
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The Content API returns attributes of requested content without wrapping them in an attributes object:

```json
{
  "data": {
    // system fields
    "documentId": "clkgylmcc000008lcdd868feh",
    "locale": "en",
    // user fields
    "title": "Article A"
    "relation": {
      // system fields
      "documentId": "clkgylw7d000108lc4rw1bb6s"
      // user fields
      "name": "Category A"
    }
  }
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10
    }
  }
}
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<!-- TODO: to be confirmed -->
A codemod will automatically handle the change.
