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
- fields
- update()
- unpublishing content
---

import IdsInResponse from '/docs/snippets/id-in-responses.md'

# Document Service API: Selecting fields

<Tldr>

Use the `fields` parameter in Document Service API queries to select specific fields to return with your results, reducing data payload across `findOne()`, `findMany()`, `create()`, `update()`, `delete()`, `publish()`, and other document operations.

</Tldr>


By default the [Document Service API](/cms/api/document-service) returns all the fields of a document but does not populate any fields. This page describes how to use the `fields` parameter to return only specific fields with the query results.

:::tip
You can also use the `populate` parameter to populate relations, media fields, components, or dynamic zones (see the [`populate` parameter](/cms/api/document-service/populate) documentation).
:::

<IdsInResponse />

## Select fields with `findOne()` queries {#findone}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").findOne()'
  title="Select fields with findOne()"
  description="Select specific fields to return when finding a document by documentId."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const document = await strapi.documents("api::restaurant.restaurant").findOne({
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  fields: ["name", "description"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant",
  description: "Welcome to Biscotte restaurant! …"
}`
    }
  ]}
/>

## Select fields with `findFirst()` queries {#findfirst}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").findFirst()'
  title="Select fields with findFirst()"
  description="Select specific fields to return when finding the first matching document."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const document = await strapi.documents("api::restaurant.restaurant").findFirst({
  fields: ["name", "description"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  documentId: "a1b2c3d4e5f6g7h8i9j0klm",
  name: "Biscotte Restaurant",
  description: "Welcome to Biscotte restaurant! …"
}`
    }
  ]}
/>

## Select fields with `findMany()` queries {#findmany}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").findMany()'
  title="Select fields with findMany()"
  description="Select specific fields to return when finding multiple documents."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const documents = await strapi.documents("api::restaurant.restaurant").findMany({
  fields: ["name", "description"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `[
  {
    documentId: "a1b2c3d4e5f6g7h8i9j0klm",
    name: "Biscotte Restaurant",
    description: "Welcome to Biscotte restaurant! …"
  }
  // ...
]`
    }
  ]}
/>

## Select fields with `create()` queries {#create}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").create()'
  title="Select fields with create()"
  description="Select specific fields to return when creating a new document."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const document = await strapi.documents("api::restaurant.restaurant").create({
  data: {
    name: "Restaurant B",
    description: "Description for the restaurant",
  },
  fields: ["name", "description"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  id: 4,
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  name: 'Restaurant B',
  description: 'Description for the restaurant'
}`
    }
  ]}
/>

## Select fields with `update()` queries {#update}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").update()'
  title="Select fields with update()"
  description="Select specific fields to return when updating a document."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const document = await strapi.documents("api::restaurant.restaurant").update({
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  data: {
    name: "Restaurant C",
  },
  fields: ["name"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  name: 'Restaurant C'
}`
    }
  ]}
/>

## Select fields with `delete()` queries {#delete}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").delete()'
  title="Select fields with delete()"
  description="Select specific fields to return when deleting a document."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const document = await strapi.documents("api::restaurant.restaurant").delete({
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  fields: ["name"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  // All of the deleted document's versions are returned
  entries: [
    {
      id: 4,
      documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
      name: 'Restaurant C',
      // …
    }
  ]
}`
    }
  ]}
/>

## Select fields with `publish()` queries {#publish}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").publish()'
  title="Select fields with publish()"
  description="Select specific fields to return when publishing a document."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const document = await strapi.documents("api::restaurant.restaurant").publish({
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  fields: ["name"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  // All of the published locale entries are returned
  entries: [
    {
      documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
      name: 'Restaurant B'
    }
  ]
}`
    }
  ]}
/>

## Select fields with `unpublish()` queries {#unpublish}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").unpublish()'
  title="Select fields with unpublish()"
  description="Select specific fields to return when unpublishing a document."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const document = await strapi.documents("api::restaurant.restaurant").unpublish({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  fields: ["name"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
  // All of the published locale entries are returned
  entries: [
    {
      documentId: 'fmtr6d7ktzpgrijqaqgr6vxs',
      name: 'Restaurant B'
    }
  ]
}`
    }
  ]}
/>

## Select fields with `discardDraft()` queries {#discarddraft}

<Endpoint
  kind="js"
  path='strapi.documents("api::restaurant.restaurant").discardDraft()'
  title="Select fields with discardDraft()"
  description="Select specific fields to return when discarding a draft document."
  codeTabs={[
    {
      label: "JavaScript",
      code: `const document = await strapi.documents("api::restaurant.restaurant").discardDraft({
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  fields: ["name"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  documentId: "fmtr6d7ktzpgrijqaqgr6vxs",
  // All of the discarded draft entries are returned
  entries: [
    {
      "name": "Restaurant B"
    }
  ]
}`
    }
  ]}
  isLast
/>
