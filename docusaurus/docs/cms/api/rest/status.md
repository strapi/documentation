---
title: Status
description: Use Strapi's REST API to read, create, and update the draft or published versions of your documents.
sidebarDepth: 3
sidebar_label:  Status
next: ./publication-filter.md
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- create
- Draft & Publish
- find
- interactive query builder
- REST API
- qs library
- status
- update
---

import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'

# REST API: `status`

<Tldr>

The REST API's `status` parameter returns either published versions (default) or drafts by passing `status=draft`.

It also applies to write requests: a `POST` or `PUT` request publishes immediately unless you pass `status=draft`.

</Tldr>


The [REST API](/cms/api/rest) offers the ability to work with the draft or the published version of documents through the `status` parameter:

- `published`: targets the published version of documents (default)
- `draft`: targets the draft version of documents

:::prerequisites
The [Draft & Publish](/cms/features/draft-and-publish) feature should be enabled.
:::

:::note
The REST API defaults to `published` for every request, including `POST` and `PUT` requests. This differs from the [Document Service API](/cms/api/document-service/status), which defaults to `draft`.
:::

To select documents by how their draft and published versions relate (never-published, modified, and others), see [REST API: `publicationFilter`](/cms/api/rest/publication-filter).

## Read draft or published versions {#read}

Add the `status` parameter to a `GET` request to choose which version is returned.

:::tip
In the response data, the `publishedAt` field is `null` for drafts.
:::

:::note
Since published versions are returned by default, passing no status parameter is equivalent to passing `status=published`.
:::

<br /><br />

<Endpoint
  id="get-draft-versions"
  method="GET"
  path="/api/restaurants?status=draft"
  title="Get draft versions of restaurants"
  description="Returns draft versions of documents by passing the status=draft query parameter.">

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl 'http://localhost:1337/api/restaurants?status=draft' \
  -H 'Authorization: Bearer <token>'
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const qs = require('qs');
const query = qs.stringify({
    status: 'draft',
}, {
    encodeValuesOnly: true, // prettify URL
});

await request(`/api/restaurants?${query}`);
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "data": [
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

</ResponseTab>
</Responses>

</Endpoint>

<QsForQueryBody />

## Create or update as a draft or as published {#create-update}

The `status` parameter also applies to `POST` and `PUT` requests, where it determines whether the document is left as a draft or published right away:

| Request | Result |
|---------|--------|
| [`POST /api/:pluralApiId?status=draft`](#create-draft) | Creates a draft document |
| [`POST /api/:pluralApiId`](#create-published) | Creates a document and publishes it immediately |
| [`PUT /api/:pluralApiId/:documentId?status=draft`](#update-draft) | Updates the draft without publishing the changes |
| [`PUT /api/:pluralApiId/:documentId`](#publish-later) | Updates the draft and publishes it |
| [`PUT /api/:pluralApiId/:documentId` with an empty `data` object](#publish-unchanged) | Publishes the draft as-is, without changing its content |

The same applies to single types, where the `status` parameter can be passed to `PUT /api/:singularApiId`.

:::note
With [Draft & Publish](/cms/features/draft-and-publish) enabled, the REST API defaults to `status=published`, so a `POST` or `PUT` request that does not include the `status` parameter publishes the document immediately. Pass `status=draft` explicitly to create or update content without publishing it.
:::

:::note
Published documents always keep a draft counterpart. Creating or updating a document with `status=published` writes the draft first, then publishes it, so both versions hold the same data.
:::

### Create a draft {#create-draft}

<Endpoint
  id="create-draft-endpoint"
  method="POST"
  path="/api/restaurants?status=draft"
  title="Create a draft document"
  description="Creates a new document and leaves it as a draft by passing the status=draft query parameter.">

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl -X POST \
  'http://localhost:1337/api/restaurants?status=draft' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "data": {
      "Name": "Biscotte Restaurant"
    }
  }'
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const response = await fetch(
  'http://localhost:1337/api/restaurants?status=draft',
  {
    method: 'POST',
    headers: {
      Authorization: 'Bearer <token>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        Name: 'Biscotte Restaurant',
      },
    }),
  }
);
const data = await response.json();
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={201} statusText="Created">

```json
{
  "data": {
    "id": 13,
    "documentId": "jae8klabhuucbkgfe2xxc5dj",
    "Name": "Biscotte Restaurant",
    "createdAt": "2024-03-06T22:19:54.646Z",
    "updatedAt": "2024-03-06T22:19:54.646Z",
    "publishedAt": null,
    "locale": "en"
  },
  "meta": {}
}
```

</ResponseTab>
</Responses>

</Endpoint>

The `publishedAt` field is `null`, which confirms the document was created as a draft.

### Create and publish immediately {#create-published}

Omitting the `status` parameter, or passing `status=published`, creates the document and publishes it in a single request:

<Endpoint
  id="create-published-endpoint"
  method="POST"
  path="/api/restaurants"
  title="Create and publish a document"
  description="Creates a new document and publishes it immediately, which is the default behavior of the REST API.">

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl -X POST \
  'http://localhost:1337/api/restaurants' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "data": {
      "Name": "Biscotte Restaurant"
    }
  }'
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const response = await fetch(
  'http://localhost:1337/api/restaurants',
  {
    method: 'POST',
    headers: {
      Authorization: 'Bearer <token>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        Name: 'Biscotte Restaurant',
      },
    }),
  }
);
const data = await response.json();
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={201} statusText="Created">

```json
{
  "data": {
    "id": 13,
    "documentId": "jae8klabhuucbkgfe2xxc5dj",
    "Name": "Biscotte Restaurant",
    "createdAt": "2024-03-06T22:19:54.646Z",
    "updatedAt": "2024-03-06T22:19:54.646Z",
    "publishedAt": "2024-03-06T22:19:54.649Z",
    "locale": "en"
  },
  "meta": {}
}
```

</ResponseTab>
</Responses>

</Endpoint>

Here `publishedAt` holds a timestamp instead of `null`, which confirms the document was published.

### Update a draft without publishing it {#update-draft}

Pass `status=draft` to a `PUT` request to modify the draft version and leave the published version untouched:

<Endpoint
  id="update-draft-endpoint"
  method="PUT"
  path="/api/restaurants/:documentId?status=draft"
  title="Update a draft entry"
  description="Updates the draft version of a document without publishing the changes.">

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl -X PUT \
  'http://localhost:1337/api/restaurants/jae8klabhuucbkgfe2xxc5dj?status=draft' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "data": {
      "Name": "Biscotte Restaurant (closed)"
    }
  }'
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const response = await fetch(
  'http://localhost:1337/api/restaurants/jae8klabhuucbkgfe2xxc5dj?status=draft',
  {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer <token>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        Name: 'Biscotte Restaurant (closed)',
      },
    }),
  }
);
const data = await response.json();
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "data": {
    "id": 13,
    "documentId": "jae8klabhuucbkgfe2xxc5dj",
    "Name": "Biscotte Restaurant (closed)",
    "createdAt": "2024-03-06T22:19:54.646Z",
    "updatedAt": "2024-03-06T22:24:12.145Z",
    "publishedAt": null,
    "locale": "en"
  },
  "meta": {}
}
```

</ResponseTab>
</Responses>

</Endpoint>

### Publish an existing draft {#publish-later}

To publish a draft created earlier, send a `PUT` request without the `status` parameter, or with `status=published`:

<Endpoint
  id="publish-later-endpoint"
  method="PUT"
  path="/api/restaurants/:documentId"
  title="Publish an existing draft"
  description="Publishes the draft version of a document, which is the default behavior of PUT requests.">

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl -X PUT \
  'http://localhost:1337/api/restaurants/jae8klabhuucbkgfe2xxc5dj' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "data": {
      "Name": "Biscotte Restaurant (closed)"
    }
  }'
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const response = await fetch(
  'http://localhost:1337/api/restaurants/jae8klabhuucbkgfe2xxc5dj',
  {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer <token>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        Name: 'Biscotte Restaurant (closed)',
      },
    }),
  }
);
const data = await response.json();
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "data": {
    "id": 13,
    "documentId": "jae8klabhuucbkgfe2xxc5dj",
    "Name": "Biscotte Restaurant (closed)",
    "createdAt": "2024-03-06T22:19:54.646Z",
    "updatedAt": "2024-03-06T22:26:38.902Z",
    "publishedAt": "2024-03-06T22:26:38.905Z",
    "locale": "en"
  },
  "meta": {}
}
```

</ResponseTab>
</Responses>

</Endpoint>

A `PUT` request requires a `data` object in the body, so the request above updates and publishes in a single operation.

### Publish a draft without changing its content {#publish-unchanged}

To publish a draft as-is, send a `PUT` request with an empty `data` object:

<Endpoint
  id="publish-unchanged-endpoint"
  method="PUT"
  path="/api/restaurants/:documentId"
  title="Publish a draft without changing its content"
  description="Publishes the draft version of a document as-is by sending an empty data object.">

<Tabs>
<TabItem value="curl" label="cURL">

```bash
curl -X PUT \
  'http://localhost:1337/api/restaurants/jae8klabhuucbkgfe2xxc5dj' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "data": {}
  }'
```

</TabItem>
<TabItem value="js" label="JavaScript">

```js
const response = await fetch(
  'http://localhost:1337/api/restaurants/jae8klabhuucbkgfe2xxc5dj',
  {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer <token>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {},
    }),
  }
);
const data = await response.json();
```

</TabItem>
</Tabs>

<Responses>
<ResponseTab status={200} statusText="OK">

```json
{
  "data": {
    "id": 13,
    "documentId": "jae8klabhuucbkgfe2xxc5dj",
    "Name": "Biscotte Restaurant (closed)",
    "createdAt": "2024-03-06T22:19:54.646Z",
    "updatedAt": "2024-03-06T22:26:38.902Z",
    "publishedAt": "2024-03-06T22:31:14.207Z",
    "locale": "en"
  },
  "meta": {}
}
```

</ResponseTab>
</Responses>

</Endpoint>

:::note
Omitting the `data` key entirely returns a `400` error, so send `"data": {}` rather than an empty body.
:::
