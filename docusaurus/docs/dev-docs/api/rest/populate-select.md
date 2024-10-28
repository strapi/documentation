---
title: Populate and Select
description: Use Strapi's REST API to populate or select certain fields.
sidebarDepth: 3
displayed_sidebar: restApiSidebar
tags:
- API
- Content API
- Combining operators
- find
- populate
- REST API
- select
- qs library
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'
import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# REST API: Population & Field Selection

The [REST API](/dev-docs/api/rest) by default does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](#population) to populate specific fields and the [`select` parameter](#field-selection) to return only specific fields with the query results.

:::tip
<QsIntroFull />
:::

:::callout 🏗 Work-in-progress
Strapi v4 docs very recently included a more extensive description of how to use the `populate` parameter, including an [extensive API reference](https://docs.strapi.io/dev-docs/api/rest/populate-select#population) and [additional guides](https://docs.strapi.io/dev-docs/api/rest/guides/intro). These v4 pages are currently being ported and adapted to Strapi 5 docs so that examples reflect the new data response format.

In the meantime, you can trust the content of the present page as accurate as it already reflects the new Strapi 5, flattened response format (see [breaking change entry](/dev-docs/migration/v4-to-v5/breaking-changes/new-response-format) and [REST API introduction](/dev-docs/api/rest#requests) for details); the present page is just not as complete as its v4 equivalent yet.
:::

## Field selection

Queries can accept a `fields` parameter to select only some fields. By default, only the following [types of fields](/dev-docs/backend-customization/models#model-attributes) are returned:

- string types: string, text, richtext, enumeration, email, password, and uid,
- date types: date, time, datetime, and timestamp,
- number types: integer, biginteger, float, and decimal,
- generic types: boolean, array, and JSON.

| Use case              | Example parameter syntax              |
|-----------------------|---------------------------------------|
| Select a single field | `fields=name`                         |
| Select multiple fields| `fields[0]=name&fields[1]=description`|

:::note
Field selection does not work on relational, media, component, or dynamic zone fields. To populate these fields, use the [`populate` parameter](#population).
:::

<ApiCall noSideBySide>
<Request title="Example request: Return only name and description fields">

`GET /api/restaurants?fields[0]=name&fields[1]=description`

<details>
<summary><QsForQueryTitle/></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    fields: ['name', 'description'],
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/users?${query}`);
```

</details>
</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 4,
      "Name": "Pizzeria Arrivederci",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Specialized in pizza, we invite you to rediscover our classics, such as 4 Formaggi or Calzone, and our original creations such as Do Luigi or Nduja."
            }
          ]
        }
      ],
      "documentId": "lr5wju2og49bf820kj9kz8c3"
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

## Population

The REST API by default does not populate any type of fields, so it will not populate relations, media fields, components, or dynamic zones unless you pass a `populate` parameter to populate various field types.

The `populate` parameter can be used alone or [in combination with with multiple operators](#combining-population-with-other-operators) to have much more control over the population.

:::caution
The `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated (see [User Guide](/user-docs/users-roles-permissions/configuring-end-users-roles#editing-a-role) for additional information on how to enable `find` permissions for content-types).
:::

:::note
It's currently not possible to return just an array of ids with a request.
:::

:::strapi Populating guides

The [REST API guides](/dev-docs/api/rest/guides/intro) section includes more detailed information about various possible use cases for the populate parameter:

- The [Understanding populate](/dev-docs/api/rest/guides/understanding-populate) guide explains in details how populate works, with diagrams, comparisons, and real-world examples.
- The [How to populate creator fields](/dev-docs/api/rest/guides/populate-creator-fields) guide provides step-by-step instructions on how to add `createdBy` and `updatedBy` fields to your queries responses.

:::

The following table sums up possible populate use cases and their associated parameter syntaxes, and links to sections of the Understanding populate guide which includes more detailed explanations:

| Use case  | Example parameter syntax | Detailed explanations to read |
|-----------| ---------------|-----------------------|
| Populate everything, 1 level deep, including media fields, relations, components, and dynamic zones | `populate=*`| [Populate all relations and fields, 1 level deep](/dev-docs/api/rest/guides/understanding-populate#populate-all-relations-and-fields-1-level-deep) |
| Populate one relation,<br/>1 level deep | `populate=a-relation-name`| [Populate 1 level deep for specific relations](/dev-docs/api/rest/guides/understanding-populate#populate-1-level-deep-for-specific-relations) |
| Populate several relations,<br/>1 level deep | `populate[0]=relation-name&populate[1]=another-relation-name&populate[2]=yet-another-relation-name`| [Populate 1 level deep for specific relations](/dev-docs/api/rest/guides/understanding-populate#populate-1-level-deep-for-specific-relations) |
| Populate some relations, several levels deep | `populate[root-relation-name][populate][0]=nested-relation-name`| [Populate several levels deep for specific relations](/dev-docs/api/rest/guides/understanding-populate#populate-several-levels-deep-for-specific-relations) |
| Populate a component | `populate[0]=component-name`| [Populate components](/dev-docs/api/rest/guides/understanding-populate#populate-components) |
| Populate a component and one of its nested components | `populate[0]=component-name&populate[1]=component-name.nested-component-name`| [Populate components](/dev-docs/api/rest/guides/understanding-populate#populate-components) |
| Populate a dynamic zone (only its first-level elements) | `populate[0]=dynamic-zone-name`| [Populate dynamic zones](/dev-docs/api/rest/guides/understanding-populate#populate-dynamic-zones) |
| Populate a dynamic zone and its nested elements and relations, using a precisely defined, detailed population strategy | `populate[dynamic-zone-name][on][component-category.component-name][populate][relation-name][populate][0]=field-name`| [Populate dynamic zones](/dev-docs/api/rest/guides/understanding-populate#populate-dynamic-zones) |

:::tip
The easiest way to build complex queries with multiple-level population is to use our [interactive query builder](/dev-docs/api/rest/interactive-query-builder) tool.
:::

### Combining Population with other operators

By utilizing the `populate` operator it is possible to combine other operators such as [field selection](/dev-docs/api/rest/populate-select#field-selection), [filters](/dev-docs/api/rest/filters-locale-publication), and [sort](/dev-docs/api/rest/sort-pagination) in the population queries.

:::caution
The population and pagination operators cannot be combined.
:::

#### Populate with field selection

`fields` and `populate` can be combined.

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?fields[0]=title&fields[1]=slug&populate[headerImage][fields][0]=name&populate[headerImage][fields][1]=url`

</Request>

<details>
<summary><QsForQueryTitle/></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    fields: ['title', 'slug'],
    populate: {
      headerImage: {
        fields: ['name', 'url'],
      },
    },
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "h90lgohlzfpjf3bvan72mzll",
      "title": "Test Article",
      "slug": "test-article",
      "headerImage": {
        "id": 1,
        "documentId": "cf07g1dbusqr8mzmlbqvlegx",
        "name": "17520.jpg",
        "url": "/uploads/17520_73c601c014.jpg"
      }
    }
  ],
  "meta": {
    // ...
  }
}
```

</Response>
</ApiCall>


#### Populate with filtering

`filters` and `populate` can be combined.

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[categories][sort][0]=name%3Aasc&populate[categories][filters][name][$eq]=Cars`

</Request>

<details>
<summary><QsForQueryTitle/></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    populate: {
      categories: {
        sort: ['name:asc'],
        filters: {
          name: {
            $eq: 'Cars',
          },
        },
      },
    },
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/articles?${query}`);
```

</details>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "a1b2c3d4e5d6f7g8h9i0jkl",
      "title": "Test Article",
      // ...
      "categories": {
        "data": [
          {
            "id": 2,
            "documentId": "jKd8djla9ndalk98hflj3",
            "name": "Cars"
            // ...
          }
        ]
        }
      }
    }
  ],
  "meta": {
    // ...
  }
}
```

</Response>
</ApiCall>
