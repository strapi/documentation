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

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax option examples. This includes all relation types: one-to-many, many-to-one, many-to-many, and polymorphic relations (morphToOne, morphToMany).

### Populate 1 level for all relations

<Endpoint
  kind="js"
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

<Endpoint
  kind="js"
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

<Endpoint
  kind="js"
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

### Sort populated relations

Use the `sort` parameter inside a `populate` object to order related entries by an attribute. For many-to-many and other join-table relations, an explicit `sort` takes precedence over the default connect order.

<!-- source: strapi/strapi#26361 packages/core/database/src/query/helpers/populate/apply.ts -->

<Endpoint
  kind="js"
  path='strapi.documents("api::article.article").findMany()'
  title="Sort populated relations"
  description="Order related entries by an attribute using the sort parameter inside a populate object."
  id="populate-sort-relations"
  codeTabs={[
    {
      label: "JavaScript",
      code: `const documents = await strapi.documents("api::article.article").findMany({
  populate: {
    categories: {
      sort: 'name:asc',
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
    // ...
    "categories": [
      {
        "id": 1,
        "name": "Architecture"
        // ...
      },
      {
        "id": 3,
        "name": "Technology"
        // ...
      }
    ]
  }
  // ...
]`
    }
  ]}
/>

:::note
Omit `sort` from a `populate` object to preserve the default connect order (the order in which entries were associated).
:::

## Components & Dynamic Zones

Components are populated the same way as relations:

<Endpoint
  kind="js"
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

Dynamic zones are highly dynamic content structures by essence. Standard populate queries (like `populate: '*'` or `populate: ['testDZ']`) will only retrieve the default, non-relational scalar fields (e.g., strings, numbers) of components within a dynamic zone. They will **not** automatically fetch nested relations, media fields, or nested components.

To populate component-specific nested relations, media fields, or components within a dynamic zone, you must define per-component populate queries using the `on` property (fragment population syntax).

<Endpoint
  kind="js"
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

<Endpoint
  kind="js"
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

<Endpoint
  kind="js"
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

Same behavior applies with `unpublish()` and `discardDraft()`.

<Endpoint
  kind="js"
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

## Populating with `delete()`

To populate while deleting documents:

<Endpoint
  kind="js"
  path='strapi.documents("api::article.article").delete()'
  title="Populate with delete"
  description="Populate relations in the response when deleting a document."
  id="populate-with-delete"
  codeTabs={[
    {
      label: "JavaScript",
      code: `strapi.documents("api::article.article").delete({
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
  "documentId": "cjld2cjxh0000qzrmn831i7rn",
  "entries": [
    {
      "id": "cjld2cjxh0000qzrmn831i7rn",
      "title": "Test Article",
      "slug": "test-article",
      "body": "Test 1",
      "headerImage": {
        "id": 2,
        "name": "17520.jpg"
        // ...
      }
      // ...
    }
  ]
}`
    }
  ]}
/>
