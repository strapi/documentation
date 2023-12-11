---
title: Using Populate with the Document Service API
description: Use Strapi's Document Service API to populate or select some fields.
displayed_sidebar: devDocsSidebar
---

# Document Service API: Populating fields

By default the [Document Service API](/dev-docs/api/document-service) does not populate any relations, media fields, components, or dynamic zones. This page describes how to use the populate parameter to [`populate`](#populate) specific fields.

:::tip
You can also use the `select` parameter to return only specific fields with the query results (see the [`select` parameter](/dev-docs/api/document-service/select) documentation).
:::

:::caution
If the Users & Permissions plugin is installed, the `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated.
:::

## Relations and media fields

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax option examples.

### Populate 1 level for all relations

To populate one-level deep for all relations, use the `*` wildcard in combination with the `populate` parameter:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const entries = await strapi.documents("api::article.article").findMany({
  populate: "*",
});
```

</Request>

<Response title="Example response">

```json
{
  [
    {
      "id": 1,
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
}
```

</Response>
</ApiCall>

### Populate 1 level

To populate specific relations one-level deep…

<ApiCall noSideBySide>
<Request title="Example request">

```js
const entries = await strapi.documents("api::article.article").findMany({
  populate: ["headerImage"],
});
```

</Request>

<Response title="Example response">

```json
[
  {
    "id": 1,
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
]
```

</Response>
</ApiCall>

### Populate 2 levels

To populate specific relations, 2 levels deep…

<ApiCall noSideBySide>
<Request title="Example request">

```js
const entries = await strapi.documents("api::article.article").findMany({
  populate: {
    categories: {
      populate: ["articles"],
    },
  },
});
```

</Request>

<Response title="Example response">

```json
[
  {
    "id": 1,
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
]
```

</Response>
</ApiCall>

## Components & Dynamic Zones

Components are populated the same way as relations:

<ApiCall noSideBySide>
<Request title="Example request">

```js
const entries = await strapi.documents("api::article.article").findMany({
  populate: ["testComp"],
});
```

</Request>

<Response title="Example response">

```json
[
  {
    "id": 1,
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
]
```

</Response>
</ApiCall>

Dynamic zones are highly dynamic content structures by essence. When populating dynamic zones, you can choose between a shared population strategy or a detailed population strategy.

In a shared population strategy, apply a unique behavior for all the dynamic zone's components.

<ApiCall noSideBySide>
<Request title="Example request">

```js
const entries = await strapi.documents("api::article.article").findMany({
  populate: {
    testDZ: "*",
  },
});
```

</Request>

<Response title="Example response">

```json
[
  {
    "id": 1,
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
        },
        "otherField": "test"
      },
      {
        "id": 1,
        "__component": "test.test-compo2",
        "testInt": 1,
        "otherField": "test"
      }
    ]
  }
  // ...
]
```

</Response>
</ApiCall>

With the detailed population strategy, define per-component populate queries using the on property.

<ApiCall noSideBySide>
<Request title="Example request">

```js
const entries = await strapi.documents("api::article.article").findMany({
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
});
```

</Request>

<Response title="Example response">

```json
[
  {
    "id": 1,
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
]
```

</Response>
</ApiCall>

To populate the `createdBy` and `updatedBy` fields, …

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

## Populating with `create()`

To populate while creating documents

<ApiCall noSideBySide>
<Request title="Example request">

```js
strapi.documents("api::article.article").create({
  data: {
    title: "Test Article",
    slug: "test-article",
    body: "Test 1",
    headerImage: 2,
  },
  populate: ["headerImage"],
});
```

</Request>

<Response title="Example response">

```json
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
}
```

</Response>
</ApiCall>

## Populating with `update()`

To populate while updating documents…

<ApiCall noSideBySide>
<Request title="Example request">

```js
strapi.documents("api::article.article").update("cjld2cjxh0000qzrmn831i7rn", {
  data: {
    title: "Test Article Update",
  },
  populate: ["headerImage"],
});
```

</Request>

<Response title="Example response">

```json
{
  "id": "cjld2cjxh0000qzrmn831i7rn",
  "title": "Test Article Update",
  "slug": "test-article",
  "body": "Test 1",
  "headerImage": {
    "id": 2,
    "name": "17520.jpg"
    // ...
  }
}
```

</Response>
</ApiCall>

## Populating with `publish()`

To populate while publishing documents (same behavior with `unpublish()` and `discardDraft()`)…

<ApiCall noSideBySide>
<Request title="Example request">

```js
strapi.documents("api::article.article").publish("cjld2cjxh0000qzrmn831i7rn", {
  populate: ["headerImage"],
});
```

</Request>

<Response title="Example response">

```json
{
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
}
```

</Response>
</ApiCall>
