---
title: Populate and Select
description: Use Strapi's REST API to populate or select certain fields.
sidebarDepth: 3
displayed_sidebar: restApiSidebar
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'

# REST API: Population & Field Selection

The [REST API](/dev-docs/api/rest) by default does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](#population) to populate specific fields and the [`select` parameter](#field-selection) to return only specific fields with the query results. Ensure that the find permission is given to the field(s) for the relation(s) you populate.

:::tip
<QsIntroFull />
:::

<SideBySideContainer>
<SideBySideColumn>

## Field selection

Queries can accept a `fields` parameter to select only some fields. By default, only the following [types of fields](/dev-docs/backend-customization/models#model-attributes) are returned:

- string types: string, text, richtext, enumeration, email, password, and uid,
- date types: date, time, datetime, and timestamp,
- number types: integer, biginteger, float, and decimal,
- generic types: boolean, array, and JSON.

Field selection does not work on relational, media, component, or dynamic zone fields. To populate these fields, use the [`populate` parameter](#population).

:::tip
By default, fields are selected except relations, media, dynamic zones, and components, but you can specify a wildcard `*` instead of an array.
:::

</SideBySideColumn>
<SideBySideColumn>

<br />
<br />
<ApiCall noSideBySide>
<Request title="Example request: Return only title and body fields">

`GET /api/users?fields[0]=title&fields[1]=body`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "test1",
        "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
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

<details>
<summary><QsForQueryTitle/></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    fields: ['title', 'body'],
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/users?${query}`);
```

</details>

</SideBySideColumn>
</SideBySideContainer>

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

The Strapi Blog also includes a tutorial on [how to populate and filter data with your queries](https://strapi.io/blog/demystifying-strapi-s-populate-and-filtering).
:::

The following table sums up possible populate use cases and their associated parameter syntaxes, and links to sections of the Understanding populate guide which includes more detailed explanations:

| Use case  | Example parameter syntax | Detailed explanations to read |
|-----------| ---------------|-----------------------|
| Populate everything, 1 level deep, including media fields, relations, components, and dynamic zones | `populate=*`| [Populate all relations and fields, 1 level deep](/dev-docs/api/rest/guides/understanding-populate#populate-all-relations-and-fields-1-level-deep) |
| Populate one relation,<br/>1 level deep | `populate[0]=a-relation-name`| [Populate 1 level deep for specific relations](/dev-docs/api/rest/guides/understanding-populate#populate-1-level-deep-for-specific-relations) |
| Populate several relations,<br/>1 level deep | `populate[0]=relation-name&populate[1]=another-relation-name&populate[2]=yet-another-relation-name`| [Populate 1 level deep for specific relations](/dev-docs/api/rest/guides/understanding-populate#populate-1-level-deep-for-specific-relations) |
| Populate some relations, several levels deep | `populate[first-level-relation-to-populate][populate][0]=second-level-relation-to-populate`| [Populate several levels deep for specific relations](/dev-docs/api/rest/guides/understanding-populate#populate-several-levels-deep-for-specific-relations) |
| Populate a component | `populate[0]=component-name`| [Populate components](/dev-docs/api/rest/guides/understanding-populate#populate-components) |
| Populate a component and one of its nested components | `populate[0]=component-name&populate[1]=component-name.nested-component-name`| [Populate components](/dev-docs/api/rest/guides/understanding-populate#populate-components) |
| Populate a dynamic zone (only its first-level elements) | `populate[0]=dynamic-zone-name`| [Populate dynamic zones](/dev-docs/api/rest/guides/understanding-populate#populate-dynamic-zones) |
| Populate a dynamic zone and its nested elements and relations, using a unique, shared population strategy | `populate[dynamic-zone-name][populate]=*`| [Populate dynamic zones](/dev-docs/api/rest/guides/understanding-populate#shared-population-strategy) |
| Populate a dynamic zone and its nested elements and relations, using a precisely defined, detailed population strategy | `populate[dynamic-zone-name][on][dynamic-zone-name.component-name][populate][relation-name][populate][0]=field-name`| [Populate dynamic zones](/dev-docs/api/rest/guides/understanding-populate#detailed-population-strategy) |

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

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Test Article",
        "slug": "test-article",
        "headerImage": {
          "data": {
            "id": 1,
            "attributes": {
              "name": "17520.jpg",
              "url": "/uploads/17520_73c601c014.jpg"
            }
          }
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

#### Populate with filtering

`filters` and `populate` can be combined.

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[categories][sort][0]=name%3Aasc&populate[categories][filters][name][$eq]=Cars`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Test Article",
        // ...
        "categories": {
          "data": [
            {
              "id": 2,
              "attributes": {
                "name": "Cars"
                // ...
              }
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
