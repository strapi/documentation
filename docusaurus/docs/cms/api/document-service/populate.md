---
title: Using Populate with the Document Service API
description: Use Strapi's Document Service API to populate or select some fields.
displayed_sidebar: cmsSidebar
sidebar_label: Populate
tags:
- Components
- Content API
- Document Service API
- dynamic zones
- populate
- Populating with create()
- Populating with publish()
- Populating with update()
---

import Endpoint from '@site/src/components/ApiReference/Endpoint';

# Document Service API: Populating fields

By default the [Document Service API](/cms/api/document-service) does not populate any relations, media fields, components, or dynamic zones. This page describes how to use the `populate` parameter to populate specific fields.

:::tip
You can also use the `select` parameter to return only specific fields with the query results (see the [`select` parameter](/cms/api/document-service/fields) documentation).
:::

:::caution
If the Users & Permissions plugin is installed, the `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated.
:::

<!-- TODO: add link to populate guides (even if REST API, the same logic still applies) -->

## Relations and media fields

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax option examples.

### Populate 1 level for all relations

To populate one-level deep for all relations, use the `*` wildcard in combination with the `populate` parameter:

<Endpoint
  method="GET"
  path='strapi.documents("api::article.article").findMany()'
  title="Populate 1 level for all relations"
  description="Populate one-level deep for all relations using the wildcard."
  id="populate-1-level-all"
  codeTabs={[
    {
      label: "JavaScript",
      code: `const documents = await strapi.documents("api::article.article").findMany({
  populate: "*",
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  [
    {
      "id": "cjld2cjxh0000qzrmn831i7rn",
      "title": "Test Article",
      "slug": "test-article",
      "body": "Test 1",
      // ...
      "headerImage": {
        "data": {
          "id": 1,
          "attributes": {
            "name": "17520.jpg",
            "alternativeText": "17520.jpg",
            "formats": {
              // ...
            }
            // ...
          }
        }
      },
      "author": {
        // ...
      },
      "categories": {
        // ...
      }
    }
    // ...
  ]
}`
    }
  ]}
/>

### Populate 1 level for specific relations

To populate specific relations one-level deep, pass the relation names in a `populate` array:

<Endpoint
  method="GET"
  path='strapi.documents("api::article.article").findMany()'
  title="Populate 1 level for specific relations"
  description="Populate specific relations one-level deep using an array."
  id="populate-1-level-specific"
  codeTabs={[
    {
      label: "JavaScript",
      code: `const documents = await strapi.documents("api::article.article").findMany({
  populate: ["headerImage"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `[
  {
    "id": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1",
    // ...
    "headerImage": {
      "id": 2,
      "name": "17520.jpg"
      // ...
    }
  }
  // ...
]`
    }
  ]}
/>

### Populate several levels deep for specific relations

To populate specific relations several levels deep, use the object format with `populate`:

<Endpoint
  method="GET"
  path='strapi.documents("api::article.article").findMany()'
  title="Populate several levels deep for specific relations"
  description="Populate specific relations several levels deep using nested populate."
  id="populate-several-levels-deep"
  codeTabs={[
    {
      label: "JavaScript",
      code: `const documents = await strapi.documents("api::article.article").findMany({
  populate: {
    categories: {
      populate: ["articles"],
    },
  },
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `[
  {
    "id": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1",
    // ...
    "categories": {
      "id": 1,
      "name": "Test Category",
      "slug": "test-category",
      "description": "Test 1"
      // ...
      "articles": [
        {
          "id": 1,
          "title": "Test Article",
          "slug": "test-article",
          "body": "Test 1",
          // ...
        }
        // ...
      ]
    }
  }
  // ...
]`
    }
  ]}
/>

## Components & Dynamic Zones

Components are populated the same way as relations:

<Endpoint
  method="GET"
  path='strapi.documents("api::article.article").findMany()'
  title="Populate components"
  description="Populate components using the same syntax as relations."
  id="populate-components"
  codeTabs={[
    {
      label: "JavaScript",
      code: `const documents = await strapi.documents("api::article.article").findMany({
  populate: ["testComp"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `[
  {
    "id": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1",
    // ...
    "testComp": {
      "id": 1,
      "name": "Test Component"
      // ...
    }
  }
  // ...
]`
    }
  ]}
/>

Dynamic zones are highly dynamic content structures by essence. To populate a dynamic zone, you must define per-component populate queries using the `on` property.

<Endpoint
  method="GET"
  path='strapi.documents("api::article.article").findMany()'
  title="Populate dynamic zones"
  description="Populate dynamic zones using per-component queries with the on property."
  id="populate-dynamic-zones"
  codeTabs={[
    {
      label: "JavaScript",
      code: `const documents = await strapi.documents("api::article.article").findMany({
  populate: {
    testDZ: {
      on: {
        "test.test-compo": {
          fields: ["testString"],
          populate: ["testNestedCompo"],
        },
      },
    },
  },
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `[
  {
    "id": "cjld2cjxh0000qzrmn831i7rn",
    "title": "Test Article",
    "slug": "test-article",
    "body": "Test 1",
    // ...
    "testDZ": [
      {
        "id": 3,
        "__component": "test.test-compo",
        "testString": "test1",
        "testNestedCompo": {
          "id": 3,
          "testNestedString": "testNested1"
        }
      }
    ]
  }
  // ...
]`
    }
  ]}
/>

## Populating with `create()`

To populate while creating documents:

<Endpoint
  method="POST"
  path='strapi.documents("api::article.article").create()'
  title="Populate with create"
  description="Populate relations in the response when creating a document."
  id="populate-with-create"
  codeTabs={[
    {
      label: "JavaScript",
      code: `strapi.documents("api::article.article").create({
  data: {
    title: "Test Article",
    slug: "test-article",
    body: "Test 1",
    headerImage: 2,
  },
  populate: ["headerImage"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  "id": "cjld2cjxh0000qzrmn831i7rn",
  "title": "Test Article",
  "slug": "test-article",
  "body": "Test 1",
  "headerImage": {
    "id": 2,
    "name": "17520.jpg"
    // ...
  }
}`
    }
  ]}
/>

## Populating with `update()`

To populate while updating documents:

<Endpoint
  method="PUT"
  path='strapi.documents("api::article.article").update()'
  title="Populate with update"
  description="Populate relations in the response when updating a document."
  id="populate-with-update"
  codeTabs={[
    {
      label: "JavaScript",
      code: `strapi.documents("api::article.article").update({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  data: {
    title: "Test Article Update",
  },
  populate: ["headerImage"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  "id": "cjld2cjxh0000qzrmn831i7rn",
  "title": "Test Article Update",
  "slug": "test-article",
  "body": "Test 1",
  "headerImage": {
    "id": 2,
    "name": "17520.jpg"
    // ...
  }
}`
    }
  ]}
/>

## Populating with `publish()`

To populate while publishing documents (same behavior with `unpublish()` and `discardDraft()`):

<Endpoint
  method="POST"
  path='strapi.documents("api::article.article").publish()'
  title="Populate with publish"
  description="Populate relations in the response when publishing a document."
  id="populate-with-publish"
  codeTabs={[
    {
      label: "JavaScript",
      code: `strapi.documents("api::article.article").publish({
  documentId: "cjld2cjxh0000qzrmn831i7rn",
  populate: ["headerImage"],
});`
    }
  ]}
  responses={[
    {
      status: 200,
      statusText: "OK",
      body: `{
  "id": "cjld2cjxh0000qzrmn831i7rn",
  "versions": [
    {
      "id": "cjld2cjxh0001qzrm1q1i7rn",
      "locale": "en",
      // ...
      "headerImage": {
        "id": 2,
        "name": "17520.jpg"
        // ...
      }
    }
  ]
}`
    }
  ]}
/>
