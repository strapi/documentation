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
- interactive query builder
- REST API
- qs library
- status
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'

# REST API: `status`

The [REST API](/cms/api/rest) offers the ability to filter results based on their status, draft or published.

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature should be enabled.
:::

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
