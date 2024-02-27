---
title: Populate and Select
description: Use Strapi's REST API to populate or select certain fields.
sidebarDepth: 3
displayed_sidebar: restApiSidebar
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'

# How to use `populate` with the REST API to include additional fields with your response

When querying content-types with Strapi's [REST API](/dev-docs/api/rest), by default, reponses do not include any relations, media fields, components, or dynamic zones.

👉 _Populating_ in the context of the Strapi REST API means including additional content with your response by returning more fields than the ones returned by default. You use the [`populate` parameter](#population) to achieve this.

:::caution
The `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated (see [User Guide](/user-docs/users-roles-permissions/configuring-end-users-roles#editing-a-role) for additional information on how to enable `find` permissions for content-types).
:::

<!-- :::tip
<QsIntroFull />
::: -->

<!-- The REST API by default does not populate any type of fields, so it will not populate relations, media fields, components, or dynamic zones unless you pass a `populate` parameter to populate various field types:

- [relations & media fields](#relations--media-fields)
- [components & dynamic zones](#components--dynamic-zones)
- [creator fields](#populating-createdby-and-updatedby)

It is also possible to [combine population with multiple operators](#combining-population-with-other-operators) among various other operators to have much more control over the population. -->

## Populate relations & media fields

Queries without the `populate` parameter will not return any relations or media fields.

When you want to populate content, several options are available:

- populate 1 level deep for all existing relations, used to retrieve media fields for instance,
- populate 1 level deep for some relations,
- populate several levels deep for some relations (explicit populate)

### Populate 1 level for all relations

To populate media fields, you can for instance populate 1 level deep for all relations. This is done by adding the `populate=*` parameter to your query.

**Example with FoodAdvisor:**

<SideBySideContainer>
<SideBySideColumn>

**Without `populate`**

Without the populate parameter, a `GET` request to `/api/articles` to the server included with the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application only returns the "first-level" attributes.

The following example is the full response for all 4 `articles` content-types found in the FoodAdvisor database.

Notice how the response only includes the `title`, `slug`, `createdAt`, `updatedAt`, `publishedAt`, and `locale` fields, and the field content of the article as handled by the CKEditor plugin (`ckeditor_content`, truncated for brevity):

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

**With `populate=*`**

With the `populate=*` parameter, a `GET` request to `/api/articles` to the server included with the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application includes all first-level relations in the response.

The following example is the full response for the first of all 4 `articles` content-types found in the FoodAdvisor database (the content of articles with ids 2, 3, and 4 is truncated for brevity).

Scroll down to see that the response size is much bigger. The response now includes additional fields such as:
* the `image` field (which stores all information about the article cover, including all its different formats), 
* the `blocks` and `seo` fields which are additional content related to specific Strapi features or plugins,
* the `category` relation and its fields,
* and even some information about the articles translated in other languages as shown by the `localizations` object.

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

<!-- <details>
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

</details> -->

</SideBySideColumn>
</SideBySideContainer>

### Populate 1 level for specific relations

To populate only specific relations one-level deep, use the populate parameter as an array and put the relation name inside.

Since the REST API uses the [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets), i.e., with square brackets `[]`)), this would look like the following:

`populate[0]=your-relation-name`

**Example with FoodAdvisor:**

<SideBySideContainer>
<SideBySideColumn>

**Without `populate`**

Without the populate parameter, a `GET` request to `/api/articles` to the server included with the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application only returns the "first-level" attributes.

The following example is the full response for all 4 `articles` content-types found in the FoodAdvisor database.

Notice how the response only includes the `title`, `slug`, `createdAt`, `updatedAt`, `publishedAt`, and `locale` fields, and the field content of the article as handled by the CKEditor plugin (`ckeditor_content`, truncated for brevity):

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
        "ckeditor_content": "…", // truncated content
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
        "ckeditor_content": "…", // truncated content
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
        "ckeditor_content": "…", // truncated content
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
        "ckeditor_content": "…", // truncated content
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

**With `populate[0]=category`**

With the `populate[0]=category` added to the `GET` request to `/api/articles` to the server, we are explicitly asking to include some information about the `category` content-type, which is a relation field that links the `articles` and the `category` content-types.

The following example is the full response for all 4 `articles` content-types found in the FoodAdvisor database.

Notice that the response now includes additional lines with the `category` field for each article (see highlighted lines):

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[0]=category`

</Request>

<Response title="Example response">

```json {13-23,36-46,59-69,82-92}
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
        "ckeditor_content": "…", // truncated content
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
        }
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
        "ckeditor_content": "…", // truncated content
        "category": {
          "data": {
            "id": 13,
            "attributes": {
              "name": "Chinese",
              "slug": "chinese",
              "createdAt": "2021-11-09T13:33:20.123Z",
              "updatedAt": "2021-11-09T13:33:20.123Z"
            }
          }
        }
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
        "ckeditor_content": "…", // truncated content
        "category": {
          "data": {
            "id": 3,
            "attributes": {
              "name": "International",
              "slug": "international",
              "createdAt": "2021-11-09T13:33:20.123Z",
              "updatedAt": "2021-11-09T13:33:20.123Z"
            }
          }
        }
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
        "ckeditor_content": "…", // truncated content
        "category": {
          "data": {
            "id": 3,
            "attributes": {
              "name": "International",
              "slug": "international",
              "createdAt": "2021-11-09T13:33:20.123Z",
              "updatedAt": "2021-11-09T13:33:20.123Z"
            }
          }
        }
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
```

</Response>
</ApiCall>

<!-- <details>
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

</details> -->
</SideBySideColumn>
</SideBySideContainer>

### Populate 2 levels

It is also possible to populate specific relations several levels deep.

Since the REST API uses the [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets), (i.e., with square brackets `[]`)), for instance if you want to populate a relation nested inside another relation, this would look like the following:

`populate[first-level-relation-to-populate][populate][0]=second-level-relation-to-populate`

:::note
There is no limit on the number of levels that can be populated. However, the more nested populates there are, the more the request will take time to be performed.
:::

**Example with FoodAdvisor:**

The [FoodAdvisor](https://github.com/strapi/foodadvisor) example application includes various levels of relations between content-types. For instance, an `article` content-type includes a relation with the `category` content-type, but a `category` can also be assigned to any `restaurant` content-type.

It is therefore possible, with a single `GET` request to `/api/articles`, to include information about the `category` an article belongs to, but also about the various restaurants belonging to the same `category`. As an example, let's compare the responses returned with `populate[0]=category` (1-level deep) and `populate[category][populate][0]=restaurants` (2-level deep):

<SideBySideContainer>
<SideBySideColumn>

When we only populate one level deep, asking for the categories associated to articles, we can get the following example response (highlighted lines show the `category` relations field):

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[0]=category`

</Request>

<Response title="Example response">

```json {13-23,36-46,59-69,82-92}
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
        "ckeditor_content": "…", // truncated content
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
        }
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
        "ckeditor_content": "…", // truncated content
        "category": {
          "data": {
            "id": 13,
            "attributes": {
              "name": "Chinese",
              "slug": "chinese",
              "createdAt": "2021-11-09T13:33:20.123Z",
              "updatedAt": "2021-11-09T13:33:20.123Z"
            }
          }
        }
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
        "ckeditor_content": "…", // truncated content
        "category": {
          "data": {
            "id": 3,
            "attributes": {
              "name": "International",
              "slug": "international",
              "createdAt": "2021-11-09T13:33:20.123Z",
              "updatedAt": "2021-11-09T13:33:20.123Z"
            }
          }
        }
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
        "ckeditor_content": "…", // truncated content
        "category": {
          "data": {
            "id": 3,
            "attributes": {
              "name": "International",
              "slug": "international",
              "createdAt": "2021-11-09T13:33:20.123Z",
              "updatedAt": "2021-11-09T13:33:20.123Z"
            }
          }
        }
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
```

</Response>
</ApiCall>

</SideBySideColumn>

<SideBySideColumn>

When we populate 2 levels deep, asking for the categories associated to articles, but also for restaurants associated to these categories, we can get the following example response.

Notice that we now have the `restaurants` relation field included with the response inside the `category` relation (see highlighted lines):

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[category][populate][0]=restaurants`

</Request>

<Response title="Example response">

```json {13-56}
{{
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
        "ckeditor_content": "…", // truncated content
        "category": {
          "data": {
            "id": 4,
            "attributes": {
              "name": "European",
              "slug": "european",
              "createdAt": "2021-11-09T13:33:20.123Z",
              "updatedAt": "2021-11-09T13:33:20.123Z",
              "restaurants": {
                "data": [
                  {
                    "id": 1,
                    "attributes": {
                      "name": "Mint Lounge",
                      "slug": "mint-lounge",
                      "price": "p3",
                      "createdAt": "2021-11-09T14:07:47.125Z",
                      "updatedAt": "2021-11-23T16:41:30.504Z",
                      "publishedAt": "2021-11-23T16:41:30.501Z",
                      "locale": "en"
                    }
                  },
                  {
                    "id": 9,
                    // truncated content
                  },
                  {
                    "id": 10,
                    // truncated content
                  },
                  {
                    "id": 12,
                    // truncated content
                  },
                  {
                    "id": 21,
                    // truncated content
                  },
                  {
                    "id": 26,
                    // truncated content
                  }
                ]
              }
            }
          }
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

</SideBySideColumn>
</SideBySideContainer>

<!-- <details>
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

</details> -->

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
