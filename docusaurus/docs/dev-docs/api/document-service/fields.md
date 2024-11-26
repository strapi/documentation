---
title: Using fields with the Document Service API
description: Use Strapi's Document Service API to select the fields to return with your queries.
sidebar_label: Fields
displayed_sidebar: cmsSidebar
tags:
- API
- Content API
- create()
- deleting content
- Document Service API
- discardDraft()
- findOne()
- findMany()
- findFirst()
- publish()
- fields
- update()
- unpublishing content
---
 
import IdsInResponse from '/docs/snippets/id-in-responses.md'

# Document Service API: Selecting fields

By default the [Document Service API](/dev-docs/api/document-service) returns all the fields of a document but does not populate any fields. This page describes how to use the `fields` parameter to return only specific fields with the query results.

:::time.p
You can also use the `populate` parameter to populate relations, media fields, components, or dynamic zones (see the [`populate` parameter](/dev-docs/api/document-service/populate) documentation).
:::

<IdsInResponse />

## Select fields with `findOne()` queries {#findone}

To select fields to return while [finding a specific document](/dev-docs/api/document-service#findone) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  fields: ["name", "description"],
});
```

</Request>

<Response title="Example response">

```js
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant",
  description: "Welcome to Biscotte restaurant! …"
}
```

</Response>
</ApiCall>

## Select fields with `findFirst()` queries {#findfirst}

To select fields to return while [finding the first document](/dev-docs/api/document-service#findfirst) matching the parameters with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").findFirst({
  fields: ["name", "description"],
});
```

</Request>

<Response title="Example response">

```js
{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant",
  description: "Welcome to Biscotte restaurant! …"
}
```

</Response>
</ApiCall>

## Select fields with `findMany()` queries {#findmany}

To select fields to return while [finding documents](/dev-docs/api/document-service#findmany) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const documents = await strapi.documents("api::restaurant.restaurant").findMany({
  fields: ["name", "description"],
});
```

</Request>

<Response title="Example response">

```js
[
  {
    documentId: "a1b2c3d4e5f6g7h8i9j0klm",
    name: "Biscotte Restaurant",
    description: "Welcome to Biscotte restaurant! …"
  }
  // ...
]
```

</Response>
</ApiCall>

## Select fields with `create()` queries {#create}

To select fields to return while [creating documents](/dev-docs/api/document-service#create) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").create({
  data: {
    name: "Restaurant B",
    description: "Description for the restaurant",
  },
  fields: ["name", "description"],
});
```

</Request>

<Response title="Example response">

```js
{
  id: 4,
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  name: 'Restaurant B',
  description: 'Description for the restaurant'
}
```

</Response>
</ApiCall>

## Select fields with `update()` queries {#update}

To select fields to return while [updating documents](/dev-docs/api/document-service#update) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").update({
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  data: {
    name: "Restaurant C",
  },
  fields: ["name"],
});
```

</Request>

<Response title="Example response">

```js
{ 
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  name: 'Restaurant C'
}
```

</Response>
</ApiCall>

## Select fields with `delete()` queries {#delete}

To select fields to return while [deleting documents](/dev-docs/api/document-service#delete) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").delete({
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  fields: ["name"],
});
```

</Request>

<Response title="Example response">

```js
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  // All of the deleted document's versions are returned
  entries: [
    {
      id: 4,
      documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
      name: 'Restaurant C',
      // …
    }
  ]
}
```

</Response>
</ApiCall>

## Select fields with `publish()` queries {#publish}

To select fields to return while [publishing documents](/dev-docs/api/document-service#publish) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").publish({
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  fields: ["name"],
});
```

</Request>

<Response title="Example response">

```js
{
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  // All of the published locale entries are returned
  entries: [
    {
      documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
      name: 'Restaurant B'
    }
  ]
}
```

</Response>
</ApiCall>

## Select fields with `unpublish()` queries {#unpublish}

To select fields to return while [unpublishing documents](/dev-docs/api/document-service#unpublish) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").unpublish({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  fields: ["name"],
});
```

</Request>

<Response title="Example response">

```js
{
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  // All of the published locale entries are returned
  entries: [
    {
      documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
      name: 'Restaurant B'
    }
  ]
}
```

</Response>
</ApiCall>

## Select fields with `discardDraft()` queries {#discarddraft}

To select fields to return while [discarding draft versions of documents](/dev-docs/api/document-service#discarddraft) with the Document Service API:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const document = await strapi.documents("api::restaurant.restaurant").discardDraft({
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  fields: ["name"],
});
```

</Request>

<Response title="Example response">

```json
{
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  // All of the discarded draft entries are returned
  entries: [
    {
      "name": "Restaurant B"
    }
  ]
}
```

</Response>
</ApiCall>
