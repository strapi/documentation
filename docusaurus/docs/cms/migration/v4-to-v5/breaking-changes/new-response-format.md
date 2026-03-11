---
title: Strapi 5 has a new, flattened response format for API calls
description: In Strapi 5, the response format has been simplified and flattened, and attributes of requested content are no longer wrapped in an attributes object.
sidebar_label: New response format
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - Content API
 - REST API
 - GraphQL API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Strapi 5 has a new, flattened response format for REST API calls

In Strapi 5, the REST API response format has been simplified and flattened. You can set the `Strapi-Response-Format: v4` header to use the old v4 format while you convert your code to fully take into account the new Strapi 5 response format.

<Intro />
<BreakingChangeIdCard plugins />

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

<br/>

### Notes

The `Strapi-Response-Format: v4` header temporarily restores the Strapi v4 wrapping (`data.attributes.*`). You can keep the header in place while you update each consumer, then remove it once every client can read the flattened format. The header affects REST calls, including population on relations, but does not roll back the introduction of [`documentId`](/cms/migration/v4-to-v5/breaking-changes/use-document-id).

To use the compatibility header while migrating:

1. Capture a few baseline responses before you switch the header on. These samples help you compare payloads once `attributes` comes back and ensure that relations, components, and nested populations all respond as expected.
2. Add the `Strapi-Response-Format: v4` header to every REST request made by legacy clients. Remove it only after you have updated and tested each endpoint.
3. Keep in mind that `documentId` continues to be the only identifier returned by the REST API when the header is absent. With the header enabled, REST responses include both `id` (for backward compatibility) and `documentId` (the canonical identifier). Plan to migrate any downstream systems that still depend on numeric `id`.

<details>
<summary>Examples</summary>
```bash title="curl"
curl \
  -H 'Authorization: Bearer <token>' \
  -H 'Strapi-Response-Format: v4' \
  'https://api.example.com/api/articles?populate=category'
```

```js title="fetch"
await fetch('https://api.example.com/api/articles', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Strapi-Response-Format': 'v4',
  },
});
```

```js title="Axios"
const client = axios.create({
  baseURL: 'https://api.example.com/api',
  headers: {
    Authorization: `Bearer ${token}`,
    'Strapi-Response-Format': 'v4',
  },
});

const articles = await client.get('/articles', { params: { populate: '*'} });
```
</details>

:::tip
If you need to keep a mix of formats running, enable the header for any routes that still rely on `attributes`, then gradually remove it per endpoint or per consumer once you finish testing.
:::

### Manual procedure

Ensure your API calls take into account the new response format, or set the optional header to keep on using the Strapi v4 response format (see [notes](#notes)).
