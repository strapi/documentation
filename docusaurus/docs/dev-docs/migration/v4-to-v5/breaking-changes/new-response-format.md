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
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Strapi 5 has a new, flattened response format for REST API calls

In Strapi 5, the REST API response format has been simplified and flattened. You can set the `Strapi-Response-Format: v4` header to use the old v4 format while you convert your code to fully take into account the new Strapi 5 response format.

<Intro />

<YesPlugins />
<NoCodemods />

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
          "id": "14"
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

The Content API returns attributes of requested content without wrapping them in an attributes object, and a `documentId` is used instead of an `id`:

```json {4}
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

### Notes

To use the Strapi v4 response format, set the following header: `Strapi-Response-Format: v4`. 

### Manual procedure

Ensure your API calls take into account the new response format, or set the optional header to keep on using the Strapi v4 response format (see [notes](#notes)).
