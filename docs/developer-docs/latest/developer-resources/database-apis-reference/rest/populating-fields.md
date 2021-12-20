---
title: Population for REST API - Strapi Developer Docs
description: Use Strapi's REST API to populate or select certain fields.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html
---

# REST API: Population & Field Selection

The [REST API](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) by default does not populate any relations, media fields, components, or dynamic zones. It will return all fields for the model and while populating.

## Field selection

Queries can accept a `fields` parameter to select only some fields. By default Strapi will return all normal fields and field selection will not work on relational, media, component, or dynamic zone fields, to see how to properly populate these refer to the [population documentation](#population).

::::api-call
:::request Example request: Select only title & body fields

```js
const qs = require('qs');
const query = qs.stringify({
  fields: ['title', 'body'],
}, {
  encodeValuesOnly: true,
});

await request(`/api/users?${query}`);
// GET /api/users?fields[0]=title&fields[1]=body
```

:::

:::response Example response

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "test1",
        "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
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

:::tip
By default all normal fields are selected, but you can specify a wildcard `*` instead of an array.
:::

## Population

Queries can accept a `populate` parameter to populate various field types:

- [Relations & Media Fields](#relation-media-fields)
- [Components & Dynamic Zones](#component-dynamic-zones)

It is also possible to [combine population with multiple operators](#combining-population-with-other-operators) among various other operators to have much more control over the population.

:::caution
By default Strapi will not populate any type of fields.
:::

:::caution
It's currently not possible to return just an array of IDs. This is something that is currently under discussion.
:::

### Relation & Media fields

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax option examples.

:::caution
If the users-permissions plugin is installed, permissions must be enabled for the content-types that are being populated (role based). **If a role doesn't have access to a content-type it will not be populated.**
:::

::::api-call
:::request Example request: Populate 1 level for all relations

```js
const qs = require('qs');
const query = qs.stringify({
  populate: '*', 
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?populate=%2A
```

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
              },
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

::::api-call
:::request Example request: Populate 1 level `categories`

```js
const qs = require('qs');
const query = qs.stringify({
  populate: ['categories'], 
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?populate[0]=categories
```

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
                "name": "Food",
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

::::api-call
:::request Example request: Populate 2 levels `author` and `author.company`

```js
const qs = require('qs');
const query = qs.stringify({
  populate: {
    author: {
      populate: ['company'],
    }
  } 
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?populate[author][populate][0]=company
```

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
                    "name": "Strapi",
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

### Component & Dynamic Zones

Identical to relations, the `population` parameter is used to explicitly define which Dynamic zones, components, and nested components to populate. See the following examples:

::::api-call
:::request Example request: Deeply populate a 2 level component & media

```js
const qs = require('qs');
const query = qs.stringify({
  populate: [
    'seoData',
    'seoData.sharedImage',
    'seoData.sharedImage.media',
  ],
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?populate[0]=seoData&populate[1]=seoData.sharedImage&populate[2]=seoData.sharedImage.media
```

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

::::api-call
:::request Example request: Deeply populate a Dynamic Zone with 2 components

```js
const qs = require('qs');
const query = qs.stringify({
  populate: {
    testDZ: {
      populate: '*',
    },
  },
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?populate[testDZ][populate]=%2A
```

:::

:::response Example response

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

### Combining Population with other operators

By utilizing the `population` operator you can combine other operators such as [field selection](/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.md#field-selection) & [sort & pagination](/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.md) into your population queries. See the following complex population examples:

::::api-call
:::request Example request: Populate with Field Selection

```js
const qs = require('qs');
const query = qs.stringify({
  fields: ['title', 'slug'],
  populate: {
    headerImage: {
      fields: ['name', 'url'],
    },
  },
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?fields[0]=title&fields[1]=slug&populate[headerImage][fields][0]=name&populate[headerImage][fields][1]=url
```

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

::::api-call
:::request Example request: Populate with Filtering

```js
const qs = require('qs');
const query = qs.stringify({
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
}, {
  encodeValuesOnly: true,
});

await request(`/api/articles?${query}`);
// GET /api/articles?populate[categories][sort][0]=name%3Aasc&populate[categories][filters][name][$eq]=Cars
```

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
                "name": "Cars",
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
