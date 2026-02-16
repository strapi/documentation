---
title: Status
description: Use Strapi's REST API to work with draft or published versions of your documents.
sidebarDepth: 3
sidebar_label:  Status
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- find
- hasPublishedVersion
- interactive query builder
- REST API
- qs library
- status
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'

# REST API: `status` and `hasPublishedVersion`

The [REST API](/cms/api/rest) offers the ability to filter results based on their status (draft or published) and by whether they have a published version.

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature should be enabled.
:::

## `status`

Queries can accept a `status` parameter to fetch documents based on their status:

- `published`: returns only the published version of documents (default)
- `draft`: returns only the draft version of documents

:::tip
In the response data, the `publishedAt` field is `null` for drafts.
:::

:::note
Since published versions are returned by default, passing no status parameter is equivalent to passing `status=published`.
:::

<br /><br />

<ApiCall>
<Request title="Get draft versions of restaurants">

`GET /api/articles?status=draft`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />
```js
const qs = require('qs');
const query = qs.stringify({
  status: 'draft',
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">
```json {21}
{
  "data": [
    // …
    {
      "id": 5,
      "documentId": "znrlzntu9ei5onjvwfaalu2v",
      "Name": "Biscotte Restaurant",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "This is the draft version."
            }
          ]
        }
      ],
      "createdAt": "2024-03-06T13:43:30.172Z",
      "updatedAt": "2024-03-06T21:38:46.353Z",
      "publishedAt": null,
      "locale": "en"
    },
    // …
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 4
    }
  }
}
```

</Response>
</ApiCall>

## `hasPublishedVersion` {#haspublishedversion}

Queries can accept a `hasPublishedVersion` parameter to filter documents based on whether they have a published version. This parameter accepts a boolean value (`true` or `false`).

Combine `hasPublishedVersion` with `status=draft` to distinguish documents that have never been published from drafts of already-published documents:

| Parameter value | Description |
|-----------------|-------------|
| `true` | Returns only documents that have at least 1 published version. |
| `false` | Returns only documents that have never been published. |

<br /><br />

<ApiCall>
<Request title="Get documents that have never been published">

`GET /api/articles?status=draft&hasPublishedVersion=false`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />
```js
const qs = require('qs');
const query = qs.stringify({
  status: 'draft',
  hasPublishedVersion: false,
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">
```json {9}
{
  "data": [
    {
      "id": 3,
      "documentId": "a1b2c3d4e5f6g7h8i9j0klm",
      "Name": "New Draft Article",
      "createdAt": "2024-03-06T13:43:30.172Z",
      "updatedAt": "2024-03-06T21:38:46.353Z",
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

<br />

<ApiCall>
<Request title="Get drafts of already-published documents">

`GET /api/articles?status=draft&hasPublishedVersion=true`

</Request>

<details>
<summary>JavaScript query (built with the qs library):</summary>

<QsForQueryBody />
```js
const qs = require('qs');
const query = qs.stringify({
  status: 'draft',
  hasPublishedVersion: true,
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">

```json {9}
{
  "data": [
    {
      "id": 5,
      "documentId": "znrlzntu9ei5onjvwfaalu2v",
      "Name": "Biscotte Restaurant",
      "createdAt": "2024-03-06T13:43:30.172Z",
      "updatedAt": "2024-03-06T21:38:46.353Z",
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

The response returns the draft version of the document. The `publishedAt` field is `null` because the returned version is the draft, even though a published version of the same document exists.

:::note Notes
* Passing an invalid value for `hasPublishedVersion` (anything other than `true`, `false`, `'true'`, or `'false'`) returns a `400 Bad Request` error.
* Passing `status=published` with `hasPublishedVersion=false` returns an empty result set, since published documents by definition have a published version.
:::