---
title: Population for REST API - Strapi Developer Docs
description: Use Strapi's REST API to populate or select certain fields.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html
---

# REST API: Population & Field Selection

The [REST API](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) by default does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](#population) to populate specific fields and the [`select` parameter](#field-selection) to return only specific fields with the query results.

:::: tip

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-intro-full.md)!!!

::::

## Field selection

Queries can accept a `fields` parameter to select only some fields. By default, only the following [types of fields](/developer-docs/latest/development/backend-customization/models.md#model-attributes) are returned:

- string types: string, text, richtext, enumeration, email, password, and uid,
- date types: date, time, datetime, and timestamp,
- number types: integer, biginteger, float, and decimal,
- generic types: boolean, array, and JSON.

Field selection does not work on relational, media, component, or dynamic zone fields. To populate these fields, use the [`populate` parameter](#population).

::::api-call
:::request Example request: Return only title and body fields

`GET /api/users?fields[0]=title&fields[1]=body`

:::

:::response Example response

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

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

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

:::

:::tip
By default, fields are selected except relations, media, dynamic zones, and components, but you can specify a wildcard `*` instead of an array.
:::

## Population

Queries can accept a `populate` parameter to populate various field types:

- [relations & media fields](#relation-media-fields)
- [components & dynamic zones](#component-dynamic-zones)
- [creator fields](#populating-createdby-and-updatedby)

It is also possible to [combine population with multiple operators](#combining-population-with-other-operators) among various other operators to have much more control over the population.

::: note

- By default Strapi will not populate any type of fields.
- It's currently not possible to return just an array of IDs. This is something that is currently under discussion.

:::

### Relation & Media fields

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax option examples.

:::caution
If the Users & Permissions plugin is installed, the `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated.
:::

#### Populate 1 level for all relations

To populate one-level deep for all relations, use the `*` wildcard in combination with the `populate` parameter:

::::api-call
:::request Example request

`GET /api/articles?populate=*`

:::

:::response Example response

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
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
    }
  ],
  "meta": {
    // ...
  }
}
```

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

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

:::

#### Populate 1 level

To populate only specific relations one-level deep, use one of the following method:

- Use the populate parameter as an array and put the relation name inside.
- Use the populate parameter as an object (using LHS bracket notation) and put the relation name as a key with one of the following values: `true, false, t, f, 1, 0`.

::::api-call
:::request Example request: populate categories

`GET /api/articles?populate[0]=categories`

:::

:::response Example response

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
              "id": 1,
              "attributes": {
                "name": "Food"
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

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

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
const query = qs.stringify({
  populate: {
    categories: true,
  }, {
  encodeValuesOnly: true, // prettify URL
});

await request(`/api/articles?${query}`);
```

:::

#### Populate 2 levels

To populate specific relations, one or several levels deep, use the LHS bracket notation for fields names in combination with the `populate` parameter.

::::api-call
:::request Example request: populate author and author.company

`GET /api/articles?populate[author][populate][0]=company`

:::

:::response Example response

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Test Article",
        // ...
        "author": {
          "data": {
            "id": 1,
            "attributes": {
              "name": "Kai Doe",
              // ...
              "company": {
                "data": {
                  "id": 1,
                  "attributes": {
                    "name": "Strapi"
                    // ...
                  }
                }
              }
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

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

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

:::

:::note
There is no limit on the number of levels that can be populated. However, the more nested populates there are, the more the request will take time to be performed.
:::

### Component & Dynamic Zones

The `populate` parameter is used to explicitly define which Dynamic zones, components, and nested components to populate.

#### Deeply populate a 2-level component & media

::::api-call
:::request Example request

`GET /api/articles?populate[0]=seoData&populate[1]=seoData.sharedImage&populate[2]=seoData.sharedImage.media`

:::

:::response Example response

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Test Article",
        // ...
        "seoData": {
          "id": 1,
          "metaTitle": "Test Article",
          // ...
          "sharedImage": {
            "id": 1,
            "alt": "starSky",
            "media": {
              "data": [
                {
                  "id": 1,
                  "attributes": {
                    "name": "17520.jpg",
                    "formats": {
                      // ...
                    },
                    // ...
                  }
                }
              ]
            }
          }
        }
      }
    }
  ],
  "meta": {
    // ...
}
```

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

```js
const qs = require('qs');
const query = qs.stringify(
  {
    populate: ['seoData', 'seoData.sharedImage', 'seoData.sharedImage.media'],
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

await request(`/api/articles?${query}`);
```

:::

#### Deeply populate a dynamic zone with 2 components

Dynamic-zones are highly dynamic content structures by essence.

When populating dynamic zones, you can choose between:
- a shared population strategy, applying a unique behavior for all the dynamic zone's components 
- or a detailed population strategy, defining per-component populate queries using the `on` property.

::::api-call
:::request Example request for shared populate strategy

`GET /api/articles?populate[testDZ][populate]=%2A`

:::

:::response Example response for shared populate strategy

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "testString": "test1",
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
    }
  ],
  "meta": {
    // ...
  }
}
```

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

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

:::

::::api-call
:::request Example request for detailed populate strategy

`GET /api/articles?populate[testDz][on][test.test-compo][fields][0]=testString&populate[testDz][on][test.test-compo][populate]=%2A&populate[testDz][on][test.test-compo2][fields][0]=testInt`

:::

:::response Example response for detailed populate strategy

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "testString": "test1",
        // ...
        "testDZ": [
          {
            "id": 3,
            "__component": "test.test-compo",
            "testString": "test1",
            "testNestedCompo": {
              "testNestedString": "testNested1"
            }
          },
          {
            "id": 1,
            "__component": "test.test-compo2",
            "testInt": 1
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

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

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

:::

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

REST API requests using the `populate` parameter that include the `createdBy` or `updatedBy` fields will populate these fields.

:::note

The `populateCreatorFields` property is not available to the GraphQL API.
:::

### Combining Population with other operators

By utilizing the `population` operator it is possible to combine other operators such as [field selection](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#field-selection), [filters](/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.md), and [sort](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md) in the population queries.

:::caution
The population and pagination operators cannot be combined.
:::

See the following complex population examples:

#### Populate with field selection

::::api-call
:::request Example request

`GET /api/articles?fields[0]=title&fields[1]=slug&populate[headerImage][fields][0]=name&populate[headerImage][fields][1]=url`

:::

:::response Example response

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

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

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

:::

#### Populate with filtering

::::api-call
:::request Example request

`GET /api/articles?populate[categories][sort][0]=name%3Aasc&populate[categories][filters][name][$eq]=Cars`

:::

:::response Example response

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

:::
::::

::: details !!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-title.md)!!!

!!!include(developer-docs/latest/developer-resources/database-apis-reference/rest/snippets/qs-for-query-body.md)!!!

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

:::
