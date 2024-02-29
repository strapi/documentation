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

The REST API by default does not populate any type of fields, so it will not populate relations, media fields, components, or dynamic zones unless you pass a `populate` parameter to populate various field types:

- [relations & media fields](#relations--media-fields)
- [components & dynamic zones](#components--dynamic-zones)
- [creator fields](#populating-createdby-and-updatedby)

It is also possible to [combine population with multiple operators](#combining-population-with-other-operators) among various other operators to have much more control over the population.

:::caution
The `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated (see [User Guide](/user-docs/users-roles-permissions/configuring-end-users-roles#editing-a-role) for additional information on how to enable `find` permissions for content-types).
:::

:::note
It's currently not possible to return just an array of ids with a request. 
:::

### Relations & Media fields

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax option examples.

#### Populate 1 level for all relations

To populate one-level deep for all relations, use the `*` wildcard in combination with the `populate` parameter.

**Example with FoodAdvisor:**

<SideBySideContainer>
<SideBySideColumn>

Without the populate parameter, a `GET` request to `/api/articles` to the server included with the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application only returns the "first-level" attributes:

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles`

</Request>

<Response title="Example response">

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Here's why you have to try basque cuisine, according to a basque chef",
        "slug": "here-s-why-you-have-to-try-basque-cuisine-according-to-a-basque-chef",
        "createdAt": "2021-11-09T13:33:19.948Z",
        "updatedAt": "2023-06-02T10:57:19.584Z",
        "publishedAt": "2022-09-22T09:30:00.208Z",
        "locale": "en",
        "ckeditor_content": // truncated content
      }
    },
    {
      "id": 2,
      "attributes": {
        "title": "What are chinese hamburgers and why aren't you eating them?",
        "slug": "what-are-chinese-hamburgers-and-why-aren-t-you-eating-them",
        "createdAt": "2021-11-11T13:33:19.948Z",
        "updatedAt": "2023-06-01T14:32:50.984Z",
        "publishedAt": "2022-09-22T12:36:48.312Z",
        "locale": "en",
        "ckeditor_content": // truncated content
      }
    },
    {
      "id": 3,
      "attributes": {
        "title": "7 Places worth visiting for the food alone",
        "slug": "7-places-worth-visiting-for-the-food-alone",
        "createdAt": "2021-11-12T13:33:19.948Z",
        "updatedAt": "2023-06-02T11:30:00.075Z",
        "publishedAt": "2023-06-02T11:30:00.075Z",
        "locale": "en",
        "ckeditor_content": // truncated content
      }
    },
    {
      "id": 4,
      "attributes": {
        "title": "If you don't finish your plate in these countries, you might offend someone",
        "slug": "if-you-don-t-finish-your-plate-in-these-countries-you-might-offend-someone",
        "createdAt": "2021-11-15T13:33:19.948Z",
        "updatedAt": "2023-06-02T10:59:35.148Z",
        "publishedAt": "2022-09-22T12:35:53.899Z",
        "locale": "en",
        "ckeditor_content": // truncated content
      }
    }
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
}
```

</Response>
</ApiCall>

</SideBySideColumn>

<SideBySideColumn>

With the `populate=*` parameter, a `GET` request to `/api/articles` to the server included with the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application includes all first-level relations in the response.

Scroll down to see that the response size is much bigger, and note the following example only shows in full what is returned for the first article (`id: 1`) whereas the example response without the `populate` parameter showed the full response content for the 4 published articles:

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
      "attributes": {
        "title": "Here's why you have to try basque cuisine, according to a basque chef",
        "slug": "here-s-why-you-have-to-try-basque-cuisine-according-to-a-basque-chef",
        "createdAt": "2021-11-09T13:33:19.948Z",
        "updatedAt": "2023-06-02T10:57:19.584Z",
        "publishedAt": "2022-09-22T09:30:00.208Z",
        "locale": "en",
        "ckeditor_content": // truncated content
        "image": {
          "data": {
            "id": 12,
            "attributes": {
              "name": "Basque dish",
              "alternativeText": "Basque dish",
              "caption": "Basque dish",
              "width": 758,
              "height": 506,
              "formats": {
                "thumbnail": {
                  "name": "thumbnail_https://4d40-2a01-cb00-c8b-1800-7cbb-7da-ea9d-2011.ngrok.io/uploads/basque_cuisine_17fa4567e0.jpeg",
                  "hash": "thumbnail_basque_cuisine_17fa4567e0_f033424240",
                  "ext": ".jpeg",
                  "mime": "image/jpeg",
                  "width": 234,
                  "height": 156,
                  "size": 11.31,
                  "path": null,
                  "url": "/uploads/thumbnail_basque_cuisine_17fa4567e0_f033424240.jpeg"
                },
                "medium": {
                  "name": "medium_https://4d40-2a01-cb00-c8b-1800-7cbb-7da-ea9d-2011.ngrok.io/uploads/basque_cuisine_17fa4567e0.jpeg",
                  "hash": "medium_basque_cuisine_17fa4567e0_f033424240",
                  "ext": ".jpeg",
                  "mime": "image/jpeg",
                  "width": 750,
                  "height": 501,
                  "size": 82.09,
                  "path": null,
                  "url": "/uploads/medium_basque_cuisine_17fa4567e0_f033424240.jpeg"
                },
                "small": {
                  "name": "small_https://4d40-2a01-cb00-c8b-1800-7cbb-7da-ea9d-2011.ngrok.io/uploads/basque_cuisine_17fa4567e0.jpeg",
                  "hash": "small_basque_cuisine_17fa4567e0_f033424240",
                  "ext": ".jpeg",
                  "mime": "image/jpeg",
                  "width": 500,
                  "height": 334,
                  "size": 41.03,
                  "path": null,
                  "url": "/uploads/small_basque_cuisine_17fa4567e0_f033424240.jpeg"
                }
              },
              "hash": "basque_cuisine_17fa4567e0_f033424240",
              "ext": ".jpeg",
              "mime": "image/jpeg",
              "size": 58.209999999999994,
              "url": "/uploads/basque_cuisine_17fa4567e0_f033424240.jpeg",
              "previewUrl": null,
              "provider": "local",
              "provider_metadata": null,
              "createdAt": "2021-11-23T14:05:33.460Z",
              "updatedAt": "2021-11-23T14:05:46.084Z"
            }
          }
        },
        "blocks": [
          {
            "id": 2,
            "__component": "blocks.related-articles"
          },
          {
            "id": 2,
            "__component": "blocks.cta-command-line",
            "theme": "primary",
            "title": "Want to give a try to a Strapi starter?",
            "text": "❤️",
            "commandLine": "git clone https://github.com/strapi/nextjs-corporate-starter.git"
          }
        ],
        "seo": {
          "id": 1,
          "metaTitle": "Articles - FoodAdvisor",
          "metaDescription": "Discover our articles about food, restaurants, bars and more! - FoodAdvisor",
          "keywords": "food",
          "metaRobots": null,
          "structuredData": null,
          "metaViewport": null,
          "canonicalURL": null
        },
        "category": {
          "data": {
            "id": 4,
            "attributes": {
              "name": "European",
              "slug": "european",
              "createdAt": "2021-11-09T13:33:20.123Z",
              "updatedAt": "2021-11-09T13:33:20.123Z"
            }
          }
        },
        "localizations": {
          "data": [
            {
              "id": 10,
              "attributes": {
                "title": "Voici pourquoi il faut essayer la cuisine basque, selon un chef basque",
                "slug": "voici-pourquoi-il-faut-essayer-la-cuisine-basque-selon-un-chef-basque",
                "createdAt": "2021-11-18T13:33:19.948Z",
                "updatedAt": "2023-06-02T10:57:19.606Z",
                "publishedAt": "2022-09-22T13:00:00.069Z",
                "locale": "fr-FR",
                "ckeditor_content": // truncated content
              }
            }
          ]
        }
      }
    },
    {
      "id": 2,
      // truncated content
    },
    {
      "id": 3,
      // truncated content
    },
    {
      "id": 4,
      // truncated content
    }
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

#### Populate 1 level

To populate only specific relations one-level deep, use one of the following method:

- Use the populate parameter as an array and put the relation name inside.
- Use the populate parameter as an object (using [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets), i.e., with square brackets `[]`)) and put the relation name as a key with one of the following values: `true, false, t, f, 1, 0`.

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

#### Populate 2 levels

To populate specific relations, one or several levels deep, use the [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets) (i.e., with square brackets `[]`) for fields names in combination with the `populate` parameter.

<br/>

:::note
There is no limit on the number of levels that can be populated. However, the more nested populates there are, the more the request will take time to be performed.
:::

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

### Components & Dynamic Zones

The `populate` parameter is used to explicitly define which Dynamic zones, components, and nested components to populate.

#### Example: Deeply populate a 2-level component & media

To populate a 2-level component & its media, you need to explicitly ask for each element with the `populate` parameter, passing all elements in an array.

<br/>

:::tip
The easiest way to build complex queries with multiple-level population is to use our [interactive query builder](/dev-docs/api/rest/interactive-query-builder) tool.
:::

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

#### Example: Deeply populate a dynamic zone with 2 components

Dynamic zones are highly dynamic content structures by essence.
When populating dynamic zones, you can choose between a shared population strategy or a detailed population strategy.

In a shared population strategy, apply a unique behavior for all the dynamic zone's components.

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

With the detailed population strategy, define per-component populate queries using the `on` property.

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
