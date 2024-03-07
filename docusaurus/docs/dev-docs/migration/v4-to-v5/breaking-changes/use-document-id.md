---
title: documentId should be used instead of id in API calls
description: Documents should be called by their documentId in Content API calls (REST API & GraphQL).
sidebar_label: documentId instead of id
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - content API
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'

# `documentId` should be used instead of `id` in Content API calls

In Strapi 5, the underlying API handling content is the [Document Service API](/dev-docs/api/document-service) and documents should be called by their `documentId` in Content API calls (REST API & GraphQL).

<Intro />

<YesPlugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Entries were identified by their `id`:

```json {4}
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
    // …
  }
}
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Documents are identified by their `documentId`:

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
    // …
  }
}
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

This breaking change impacts routes and relations.

### Migration procedure 

<!-- TODO: to be confirmed -->
A codemod will automatically handle the change.
