---
title: Publication filter
description: Use the publicationFilter parameter with Strapi's REST API to query derived Draft & Publish cohorts such as never-published or modified documents.
sidebarDepth: 3
sidebar_label: Publication filter
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- find
- interactive query builder
- publicationFilter
- qs library
- REST API
- status
---

import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'

# REST API: `publicationFilter`

The [REST API](/cms/api/rest) accepts an optional `publicationFilter` query parameter when [Draft & Publish](/cms/features/draft-and-publish) is enabled. It selects derived publication cohorts while [`status`](/cms/api/rest/status) selects draft or published rows.

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature must be enabled on the content-type.
:::

## Default `status` {#default-status}

When `status` is omitted, the REST API defaults to `status=published` **before** applying `publicationFilter`.

| Query | Effective behavior |
| ----- | ------------------ |
| `?publicationFilter=never-published` | Empty (cohort is draft-only; default status is `published`) |
| `?status=draft&publicationFilter=never-published` | Never-published draft rows |
| `?publicationFilter=modified` | Published rows in the modified cohort |
| `?status=draft&publicationFilter=modified` | Draft rows in the modified cohort |
| `?publicationFilter=published-without-draft` | Orphan published rows (default `status=published` is correct) |

The Document Service API defaults to `status=draft` instead. See [Document Service API: default `status`](/cms/api/document-service/publication-filter#default-status).

Cohort definitions, the full `status` × `publicationFilter` matrix, Content Manager mapping, and validation rules are documented on [Document Service API: `publicationFilter`](/cms/api/document-service/publication-filter).

The REST API accepts the same kebab-case values: `never-published`, `has-published-version`, `modified`, `unmodified`, `never-published-document`, `has-published-version-document`, `published-without-draft`, `published-with-draft`.

Invalid values return HTTP `400`.

## Get never-published draft documents {#never-published}

`GET /api/restaurants?status=draft&publicationFilter=never-published`

<ApiCall>

<Request title="Get draft restaurants that have never been published for their locale">

`GET /api/restaurants?status=draft&publicationFilter=never-published`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    status: 'draft',
    publicationFilter: 'never-published',
  },
  {
    encodeValuesOnly: true,
  }
);

await request(`/api/restaurants?${query}`);
```

</details>

<Response title="Example response">

```json {6}
{
  "data": [
    {
      "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
      "name": "New Restaurant",
      "publishedAt": null,
      "locale": "en"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

</Response>

</ApiCall>

## Get modified documents (default published slice) {#modified}

With no `status` parameter, REST returns **published** rows in the modified cohort:

`GET /api/restaurants?publicationFilter=modified`

To get **draft** rows instead, add `status=draft`:

`GET /api/restaurants?status=draft&publicationFilter=modified`

<ApiCall>

<Request title="Get published restaurants in the modified cohort (default status)">

`GET /api/restaurants?publicationFilter=modified`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    publicationFilter: 'modified',
  },
  {
    encodeValuesOnly: true,
  }
);

await request(`/api/restaurants?${query}`);
```

</details>

</ApiCall>

## Get published rows without a draft peer {#published-without-draft}

`GET /api/restaurants?status=published&publicationFilter=published-without-draft`

Because REST defaults to `status=published`, `?publicationFilter=published-without-draft` alone is equivalent.

<ApiCall>

<Request title="Get published restaurants with no draft row for the same locale">

`GET /api/restaurants?publicationFilter=published-without-draft`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    publicationFilter: 'published-without-draft',
  },
  {
    encodeValuesOnly: true,
  }
);

await request(`/api/restaurants?${query}`);
```

</details>

</ApiCall>

## Combine with other parameters {#combine}

`publicationFilter` can be combined with [`filters`](/cms/api/rest/filters), [`locale`](/cms/api/rest/locale), [`populate`](/cms/api/rest/populate-select), and other [REST parameters](/cms/api/rest/parameters). All conditions are applied together.

## Deprecated `hasPublishedVersion` parameter {#has-published-version-deprecated}

The boolean `hasPublishedVersion` query parameter is deprecated. Accepted values: `true`, `false`, `'true'`, or `'false'`. Strapi maps it to document-scoped `publicationFilter` values:

| `hasPublishedVersion` | Maps to |
| --------------------- | ------- |
| `false` / `'false'` | `never-published-document` |
| `true` / `'true'` | `has-published-version-document` |

Example: `GET /api/restaurants?status=draft&hasPublishedVersion=false`

If both `publicationFilter` and `hasPublishedVersion` are sent, `publicationFilter` wins.

Prefer `publicationFilter` for new integrations.
