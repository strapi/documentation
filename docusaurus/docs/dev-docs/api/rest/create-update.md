---
title: Create and Delete
description: Use Strapi's REST API to create and delete entries
sidebarDepth: 3
displayed_sidebar: restApiSidebar
tags:
- API
- Content API
- Update
- Delete
- Dynamic Zones
- Components
- Blocks
- REST API
- qs library
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'

# REST API: Create & Update

How to create enteries trough the [REST API](/dev-docs/api/rest)

:::tip
<QsIntroFull />
:::

## Create


### Create a Component {#create-components}

Creates a document and returns its value.

By default, a document is created with a published status. To create a document as a draft, pass the [`status`](/dev-docs/api/rest/filters-locale-publication#status) query parameter with the value `draft` (e.g., `?status=draft`).

If the Internationalization (i18n) feature is enabled on the content-type, it's possible to use POST requests to the REST API to [create localized documents](/dev-docs/i18n#creating-a-new-localized-entry).

:::note
While creating a document, you can define its relations and their order (see [Managing relations through the REST API](/dev-docs/api/rest/relations.md) for more details).
:::

<ApiCall>

<Request title="Example request">

`POST http://localhost:1337/api/restaurants`

```json
{ 
  "data": {
    "Name": "Restaurant D",
    "Description": [ // uses the "Rich text (blocks)" field type
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "A very short description goes here."
          }
        ]
      }
    ]
  }
}
```

</Request>

<Response title="Example response">

```json
{
  "data": {
    "documentId": "bw64dnu97i56nq85106yt4du",
    "Name": "Restaurant D",
    "Description": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "A very short description goes here."
          }
        ]
      }
    ],
    "createdAt": "2024-03-05T16:44:47.689Z",
    "updatedAt": "2024-03-05T16:44:47.689Z",
    "publishedAt": "2024-03-05T16:44:47.687Z",
    "locale": "en"
  },
  "meta": {}
}
```

</Response>

</ApiCall>

### Dynamic zones

### Blocks

## Update

### Components

### Create a Dynamic Zone {#create-dynamic-zone}

<ApiCall>

<Request title="Example request">

`PUT http://localhost:1337/api/restaurants/hgv1vny5cebq2l3czil1rpb3?populate[myDynamicZone]=*`

```json
{ 
  "data": {
    "Name": "Restaurant D",
    "myDynamicZone": [ // uses the "Dynamic zone" field type (This dynamic zone is named "myDynamicZone")
      {
        "__component": "compo.foo",
        "foo": "this is foo",
      },
      {
        "__component": "compo.bar",
        "bar": "this is bar",
      },
    ],
  }
}
```

</Request>
<details>
<summary><QsForQueryTitle /></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify({
  populate: {
    myDynamicZone: "*"
  },
}, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/restaurants/hgv1vny5cebq2l3czil1rpb3?${query}`);
```

</details>
<Response title="Example response">

```json
{
  "data": {
    "documentId": "hgv1vny5cebq2l3czil1rpb3",
    "Name": "Restaurant D",
    "myDynamicZone": [
      {
        "__component": "compo.foo",
        "id": "1",
        "foo": "this is foo",
      },
      {
        "__component": "compo.bar",
        "id": "1",
        "bar": "this is bar",
      },
    ],
    "createdAt": "2024-03-05T16:44:47.689Z",
    "updatedAt": "2024-03-05T16:44:47.689Z",
    "publishedAt": "2024-03-05T16:44:47.687Z",
    "locale": "en"
  },
  "meta": {}
}
```

</Response>

</ApiCall>

### Blocks