---
title: documentId should be used instead of id in API calls
description: Documents should be called by their documentId in Content API calls (REST API & GraphQL).
sidebar_label: documentId instead of id
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - content API
 - Document Service API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# `documentId` should be used instead of `id` in Content API calls

In Strapi 5, the underlying API handling content is the [Document Service API](/cms/api/document-service) and documents should be called by their `documentId` in Content API calls (REST API & GraphQL).

<Intro />

<BreakingChangeIdCard
  plugins
  codemodPartly
  codemodName="entity-service-document-service"
  codemodLink="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/entity-service-document-service.code.ts"
/>

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

### Notes

- This breaking change impacts routes and relations.
- To ease the transition from v4 to Strapi 5, API calls to entries might still include an `id` field in their response, especially with the [Document Service API](/cms/api/document-service). But it's recommended that you start making an habit of using `documentId` instead of `id` as it will ease handling the transition to future Strapi versions.

### Migration procedure 

A codemod will partly handle the change, but might probably add `__TODO__` items to your code since it's impossible for the codemod to automatically guess the new `documentId` of your content.

For additional information, please refer to the related [breaking change entry](/cms/migration/v4-to-v5/breaking-changes/entity-service-deprecated), the [step-by-step guide](/cms/migration/v4-to-v5/step-by-step) to upgrade to Strapi 5, and the dedicated migration guide for the [Entity Service API to Document Service API transition](/cms/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service) if this applies to your custom code.
