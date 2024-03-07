---
title: Populate and Select
description: Use Strapi's REST API to populate or select certain fields.
sidebarDepth: 3
displayed_sidebar: restApiSidebar
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
<Request title="Example request: Return only name and description fields">

`GET /api/restaurants?fields[0]=name&fields[1]=description`

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

</SideBySideColumn>
</SideBySideContainer>

## Population

Queries can accept a `populate` parameter to populate various field types:

- [relations & media fields](#relations--media-fields)
- [components & dynamic zones](#components--dynamic-zones)
- [creator fields](#populating-createdby-and-updatedby)

It is also possible to [combine population with multiple operators](#combining-population-with-other-operators) among various other operators to have much more control over the population.

:::note

- By default Strapi will not populate any type of fields.
- It's currently not possible to return just an array of IDs. This is something that is currently under discussion.

:::

### Relations & Media fields

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax option examples.

:::caution
If the Users & Permissions plugin is installed, the `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated.
:::

<SideBySideContainer>
<SideBySideColumn>

#### Populate 1 level for all relations

To populate one-level deep for all relations, use the `*` wildcard in combination with the `populate` parameter.

</SideBySideColumn>
<SideBySideColumn>

<br />
<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate=*`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "lr5wju2og49bf820kj9kz8c3",
      "Title": "Test Article",
      "Body": [
        // …
      ],
      "createdAt": "2024-03-06T14:33:10.606Z",
      "updatedAt": "2024-03-06T14:33:25.006Z",
      "publishedAt": "2024-03-06T14:33:25.018Z",
      "locale": "en",
      // ...
      "headerImage": { // media field, not populated by default
        "id": 1,
        "documentId": "n25l8xdwhepu5exhrx5amwoh",
        "name": "17520.jpg",
        "alternativeText": "17520.jpg",
        "formats": {
          // ...
        }
        // ...
      }
      "author": { // relation, not populated by default
        // ...
      },
      "categories": { // relation, not populated by default
        // ...
      }
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

</Response>
</ApiCall>

<details>
<summary><QsForQueryTitle/></summary>

<QsForQueryBody />

```js
const qs = require('qs');
const query = qs.stringify(
  {
    populate: '*',
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/articles?${query}`);
```

</details>

</SideBySideColumn>
</SideBySideContainer>

<SideBySideContainer>
<SideBySideColumn>

#### Populate 1 level

To populate only specific relations one-level deep, use one of the following method:

- Use the populate parameter as an array and put the relation name inside.
- Use the populate parameter as an object (using [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets), i.e., with square brackets `[]`)) and put the relation name as a key with one of the following values: `true, false, t, f, 1, 0`.

</SideBySideColumn>
<SideBySideColumn>

<br/>
<ApiCall noSideBySide>
<Request title="Example request: populate categories">

`GET /api/articles?populate[0]=categories`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "h90lgohlzfpjf3bvan72mzll",
      "title": "Test Article",
      // ...
      "categories": {
        "id": 1,
        "documentId": "n25l8xdwhepu5exhrx5amwoh",
        "name": "Food"
        // ...
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
// Array method
const qs = require('qs');
const query = qs.stringify(
  {
    populate: ['categories'],
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);
await request(`/api/articles?${query}`);
```

```js
// Object method
const qs = require('qs');
const query = qs.stringify(
  {
    populate: {
      categories: true
    }
  },
  {
    encodeValuesOnly: true // prettify URL
  }
);

await request(`/api/articles?${query}`);
```

</details>

</SideBySideColumn>
</SideBySideContainer>

<SideBySideContainer>
<SideBySideColumn>

#### Populate 2 levels

To populate specific relations, one or several levels deep, use the [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets) (i.e., with square brackets `[]`) for fields names in combination with the `populate` parameter.

<br/>

:::note
There is no limit on the number of levels that can be populated. However, the more nested populates there are, the more the request will take time to be performed.
:::

</SideBySideColumn>
<SideBySideColumn>

<br/>
<ApiCall noSideBySide>
<Request title="Example request: populate author and author.company">

`GET /api/articles?populate[author][populate][0]=company`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "h90lgohlzfpjf3bvan72mzll",
      "title": "Test Article",
      // ...
      "author": {
        "id": 1,
        "documentId": "z89hlka8dh7lfa9ahlkdazu",
        "name": "Kai Doe",
        // ...
        "company": {
          "id": 1,
          "documentId": "h780jfiahcn76Fghcbalka3",
          "name": "Strapi"
          // ...
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
      author: {
        populate: ['company'],
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

</SideBySideColumn>
</SideBySideContainer>

### Components & Dynamic Zones

The `populate` parameter is used to explicitly define which Dynamic zones, components, and nested components to populate.

<SideBySideContainer>
<SideBySideColumn>

#### Example: Deeply populate a 2-level component & media

To populate a 2-level component & its media, you need to explicitly ask for each element with the `populate` parameter, passing all elements in an array.

<br/>

:::tip
The easiest way to build complex queries with multiple-level population is to use our [interactive query builder](/dev-docs/api/rest/interactive-query-builder) tool.
:::

</SideBySideColumn>

<SideBySideColumn>

<br />
<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[0]=seoData&populate[1]=seoData.sharedImage&populate[2]=seoData.sharedImage.media`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "h90lgohlzfpjf3bvan72mzll",
      "title": "Test Article",
      // …
      "seoData": {
        "id": 1,
        "documentId": "xc8yf6klanc8hldancale74o",
        "metaTitle": "Test Article",
        // …
        "sharedImage": {
          "id": 1,
          "documentId": "hcalkhz7cg6gdbgai8ch12jn",
          "alt": "starSky",
          "media": {
            "data": [
              {
                "id": 1,
                "documentId": "jmljadz8caljk9blk1cnlauq",
                "name": "17520.jpg",
                "formats": {
                  // …
                },
                 // …
              }
            ]
          }
        }
      }
    }
    // …
  ],
  "meta": {
    // …
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
    populate: [
      'seoData',
      'seoData.sharedImage',
      'seoData.sharedImage.media',
    ],
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/articles?${query}`);
```

</details>

</SideBySideColumn>
</SideBySideContainer>

<SideBySideContainer>
<SideBySideColumn>

#### Example: Deeply populate a dynamic zone with 2 components

Dynamic zones are highly dynamic content structures by essence.
When populating dynamic zones, you can choose between a shared population strategy or a detailed population strategy.

In a shared population strategy, apply a unique behavior for all the dynamic zone's components.

</SideBySideColumn>
<SideBySideColumn>

<br/>
<ApiCall noSideBySide>
<Request title="Example request for shared populate strategy">

`GET /api/articles?populate[testDZ][populate]=*`

</Request>

<Response title="Example response for shared populate strategy">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "h90lgohlzfpjf3bvan72mzll"
        "testString": "test1",
        // ...
        "testDZ": [
          {
            "id": 3,
            "documentId": "7afjn7werkkcz7hl2rn24x6q",
            "__component": "test.test-compo",
            "testString": "test1",
            "testNestedCompo": {
              "id": 3,
              "documentId": "hm2djv4ftwshlxdow91al75f",
              "testNestedString": "testNested1"
                        },
            "otherField": "test"
          },
          {
            "id": 1,
            "documentId": "4b79w1xuyp6w7k2x5dafpohz",
            "__component": "test.test-compo2",
            "testInt": 1,
            "otherField": "test"
          }
        ]
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
      testDZ: {
        populate: '*',
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
</SideBySideColumn>
</SideBySideContainer>

<SideBySideContainer>
<SideBySideColumn>

With the detailed population strategy, define per-component populate queries using the `on` property.

</SideBySideColumn>

<SideBySideColumn>

<ApiCall noSideBySide>

<Request title="Example request for detailed populate strategy">

`GET /api/articles?populate[testDz][on][test.test-compo][fields][0]=testString&populate[testDz][on][test.test-compo][populate]=*&populate[testDz][on][test.test-compo2][fields][0]=testInt`

</Request>

<Response title="Example response for detailed populate strategy">

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "h90lgohlzfpjf3bvan72mzll",
      "testString": "test1",
      // ...
      "testDZ": [
        {
          "id": 3,
          "documentId": "wfk4xarf2va8mwgbd329weeb",
          "__component": "test.test-compo",
          "testString": "test1",
          "testNestedCompo": {
            "testNestedString": "testNested1"
          }
        },
        {
          "id": 1,
          "documentId": "ftel41x02w2yl6pylqvltx1k",
          "__component": "test.test-compo2",
          "testInt": 1
        }
      ]
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
      testDz: {
        on: {
          'test.test-compo': {
            fields: ['testString'],
            populate: '*',
          },
          'test.test-compo2': {
            fields: ['testInt'],
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

</SideBySideColumn>
</SideBySideContainer>

### Populating createdBy and updatedBy

The creator fields `createdBy` and `updatedBy` are removed from the REST API response by default. The `createdBy` and `updatedBy` fields can be returned in the REST API by activating the `populateCreatorFields` parameter at the content-type level.

To add `createdBy` and `updatedBy` to the API response:

1. Open the content-type `schema.json` file.
2. Add `"populateCreatorFields": true` to the `options` object:

  ```json
  "options": {
      "draftAndPublish": true,
      "populateCreatorFields": true
    },
  ```

3. Save the `schema.json`.
4. Open the controller `[collection-name].js` file inside the corresponding API request.
5. Add the following piece of code, and make sure you replace the `[collection-name].js` with proper collection name:

  ```js
  'use strict';
  /**
   *  [collection-name] controller
   */
  const { createCoreController } = require('@strapi/strapi').factories;
  module.exports = createCoreController('api::[collection-name].[collection-name]', ({ strapi }) => ({
    async find(ctx) {
      // Calling the default core action
      const { data, meta } = await super.find(ctx);
      const query = strapi.db.query('api::[collection-name].[collection-name]');
      await Promise.all(
        data.map(async (item, index) => {
          const foundItem = await query.findOne({
            where: {
              id: item.id,
            },
            populate: ['createdBy', 'updatedBy'],
          });

          data[index].attributes.createdBy = {
            id: foundItem.createdBy.id,
            firstname: foundItem.createdBy.firstname,
            lastname: foundItem.createdBy.lastname,
          };
          data[index].attributes.updatedBy = {
            id: foundItem.updatedBy.id,
            firstname: foundItem.updatedBy.firstname,
            lastname: foundItem.updatedBy.lastname,
          };
        })
      );
      return { data, meta };
    },
  }));
  ```

REST API requests using the `populate` parameter that include the `createdBy` or `updatedBy` fields will now populate these fields.

:::note

The `populateCreatorFields` property is not available to the GraphQL API.
:::

### Combining Population with other operators

By utilizing the `populate` operator it is possible to combine other operators such as [field selection](/dev-docs/api/rest/populate-select#field-selection), [filters](/dev-docs/api/rest/filters-locale-publication), and [sort](/dev-docs/api/rest/sort-pagination) in the population queries.

:::caution
The population and pagination operators cannot be combined.
:::

<SideBySideContainer>
<SideBySideColumn>

#### Populate with field selection

`fields` and `populate` can be combined.

</SideBySideColumn>
<SideBySideColumn>

<br />

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

</SideBySideColumn>
</SideBySideContainer>

<SideBySideContainer>
<SideBySideColumn>

#### Populate with filtering

`filters` and `populate` can be combined.

</SideBySideColumn>

<SideBySideColumn>
<br />

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
      "documentId": "h90lgohlzfpjf3bvan72mzll",
      "title": "Test Article",
      // ...
      "categories": {
        "data": [
          {
            "id": 2,
            "documentId": "kjkhff4e269a50b4vi16stst",
            "name": "Cars"
            // ...
          }
        ]
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

</SideBySideColumn>
</SideBySideContainer>
