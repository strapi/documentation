---
title: Populate and Select
description: Use Strapi's REST API to populate or select certain fields.
sidebar_label: Populate & Select
toc_max_heading_level: 4
displayed_sidebar: cmsSidebar
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

# REST API: Population & Field Selection

<Tldr>

Use the `populate` parameter to include relations, media fields, components, and dynamic zones in REST API responses. Use the `fields` parameter to return only specific fields.

</Tldr>

The [REST API](/cms/api/rest) by default does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](#population) to populate specific fields. Use the [`fields` parameter](#field-selection) to return only specific fields with the query results.

:::tip
<QsIntroFull />
:::

## Field selection

Queries can accept a `fields` parameter to select only some fields. By default, the REST API only returns the following [types of fields](/cms/backend-customization/models#model-attributes):

- string types: `string`, `text`, `richtext`, `enumeration`, `email`, `password`, and `uid`,
- date types: `date`, `time`, `datetime`, and `timestamp`,
- number types: `integer`, `biginteger`, `float`, and `decimal`,
- generic types: `boolean`, `array`, and `JSON`.

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

The REST API by default does not populate any type of fields, so it will not populate relations, media fields, components, or dynamic zones unless you pass a `populate` parameter to populate various field types. Populated relations always return full objects; the REST API currently cannot return just an array of IDs.

:::prerequisites
The `find` permission must be enabled for the content-types that are being populated. If a role does not have access to a content-type, the content-type will not be populated (see [Users & Permissions](/cms/features/users-permissions#editing-a-role) for additional information on how to enable `find` permissions for content-types).
:::

You can use the `populate` parameter alone or [in combination with multiple operators](#combining-population-with-other-operators) for more control over the population.

:::caution 
`populate=deep` plugins are [not recommended in Strapi](https://support.strapi.io/articles/8544110758-why-populate-deep-plugins-are-not-recommended-in-strapi).
:::

The following table lists populate use cases with example syntax. Each row links to the Understanding populate guide for details:

| Use case  | Example parameter syntax | Detailed explanations to read |
|-----------| ---------------|-----------------------|
| Populate everything, 1 level deep, including media fields, relations, components, and dynamic zones | `populate=*`| [Populate all relations and fields, 1 level deep](/cms/api/rest/guides/understanding-populate#populate-all-relations-and-fields-1-level-deep) |
| Populate one relation,<br/>1 level deep | `populate=a-relation-name`| [Populate 1 level deep for specific relations](/cms/api/rest/guides/understanding-populate#populate-1-level-deep-for-specific-relations) |
| Populate several relations,<br/>1 level deep | `populate[0]=relation-name&populate[1]=another-relation-name&populate[2]=yet-another-relation-name`| [Populate 1 level deep for specific relations](/cms/api/rest/guides/understanding-populate#populate-1-level-deep-for-specific-relations) |
| Populate some relations, several levels deep | `populate[root-relation-name][populate][0]=nested-relation-name`| [Populate several levels deep for specific relations](/cms/api/rest/guides/understanding-populate#populate-several-levels-deep-for-specific-relations) |
| Populate a component | `populate[0]=component-name`| [Populate components](/cms/api/rest/guides/understanding-populate#populate-components) |
| Populate a component and one of its nested components | `populate[0]=component-name&populate[1]=component-name.nested-component-name`| [Populate components](/cms/api/rest/guides/understanding-populate#populate-components) |
| Populate a dynamic zone (only its first-level elements) | `populate[0]=dynamic-zone-name`| [Populate dynamic zones](/cms/api/rest/guides/understanding-populate#populate-dynamic-zones) |
| Populate a dynamic zone and its nested elements and relations, using a precisely defined, detailed population strategy | `populate[dynamic-zone-name][on][component-category.component-name][populate][relation-name][populate][0]=field-name`| [Populate dynamic zones](/cms/api/rest/guides/understanding-populate#populate-dynamic-zones) |

:::tip
To build complex queries with multiple-level population, use the [interactive query builder](/cms/api/rest/interactive-query-builder) tool. For more detailed explanations and examples, see the [REST API guides](/cms/api/rest/guides/intro).
:::

### Combining population with other operators

You can combine the `populate` operator with other operators such as [field selection](/cms/api/rest/populate-select#field-selection), [filters](/cms/api/rest/filters), and [sort](/cms/api/rest/sort-pagination) in the population queries.

:::note
The population and pagination operators cannot be combined.
:::

#### Populate with field selection

`fields` and `populate` can be combined.

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?fields[0]=title&fields[1]=slug&populate[headerImage][fields][0]=name&populate[headerImage][fields][1]=url`

<details>
<summary>JavaScript query (built with the qs library)</summary>

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
</Request>

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

<details>
<summary>JavaScript query (built with the qs library)</summary>

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
</Request>

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