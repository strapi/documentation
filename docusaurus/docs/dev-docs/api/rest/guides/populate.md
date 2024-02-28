---
title: Populate and Select
description: Use Strapi's REST API to populate or select certain fields.
sidebarDepth: 3
displayed_sidebar: restApiSidebar
toc_max_heading_level: 4
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'

# How to use `populate` with the REST API to include additional fields with your response

When querying content-types with Strapi's [REST API](/dev-docs/api/rest), by default, reponses do not include any relations, media fields, components, or dynamic zones.

Populating in the context of the Strapi REST API means including additional content with your response by returning more fields than the ones returned by default. You use the [`populate` parameter](#population) to achieve this.

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

When you want to populate content, 2 options are available:

- Populate everything, i.e. relations, media fields, components and dynamic zones. For relations, this will only work 1 level deep.
- Explicitly populate some fields and relations, 1 or several levels deep.

Throughout this guide, we will consider an advanced data structure such as the one found with the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application. The following diagrams show a simplified version of the available data in FoodAdvisor, and how different uses of `populate` can return different data:

![Diagram with populate use cases with FoodAdvisor data](/img/assets/rest-api/populate-foodadvisor-diagram1.png)

![Diagram with populate use cases with FoodAdvisor data](/img/assets/rest-api/populate-foodadvisor-diagram2.png)

All of the use cases illustrated in the diagrams are covered in this guide:

- populate [all fields and relations, 1 level deep](#populate-all-fields-and-relations-1-level-deep),
- populate [some fields and relations, 1 level deep](#populate-1-level-for-specific-relations),
- populate [some fields and relations, 2 level deep](#populate-2-levels).

:::info
Examples in this guide are built with real data queried from the server included with the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application. To test these yourself, setup FoodAdvisor, start the server in the `/api/` folder, and ensure that proper `find` permissions are given for the queried content-types before sending your queries.
:::

## Populate all fields and relations, 1 level deep

You can return all relations, media fields, components and dynamic zones with a single query. For relations, this will only work 1 level deep, to prevent performance issues and long response times.

To populate everything 1 level deep, add the `populate=*` parameter to your query.

Let's compare and explain what happens with and without this query parameter:

<SideBySideContainer>
<SideBySideColumn>

**Without `populate`**

Without the populate parameter, a `GET` request to `/api/articles` only returns the default attributes and does not return any media fields, relations, components or dynamic zones.

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

With the `populate=*` parameter, a `GET` request to `/api/articles` returns all media fields, first-level relations, components and dynamic zones in the response.

The following example is the full response for the first of all 4 `articles` content-types found in the FoodAdvisor database (the content of articles with ids 2, 3, and 4 is truncated for brevity).

Scroll down to see that the response size is much bigger than without populate. The response now includes additional fields such as:
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

## Populate specific relations and fields

You can also populate specific relations and fields, by explicitly defining what to populate. This requires that you know the name of fields and content-types to populate. Relations and fields populated this way can be 1 or several levels deep.

### Populate 1 level for specific relations

To populate only specific relations 1 level deep, use the populate parameter as an array and put the relation name inside.

Since the REST API uses the [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets) (i.e., with square brackets `[]`), the parameter syntax would look like the following:

`populate[0]=your-relation-name`

Let's compare and explain what happens with and without such a query parameter:

<SideBySideContainer>
<SideBySideColumn>

**Without `populate`**

Without the populate parameter, a `GET` request to `/api/articles` only returns the default attributes and does not return any media fields, relations, components or dynamic zones.

The following example is the full response for all 4 `articles` content-types found in the FoodAdvisor database.

Notice that the response does not include any relation:

<br/>

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

With the `populate[0]=category` added to the request, we explicitly ask to include some information about `category`, which is a relation field that links the `articles` and the `category` content-types.

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

### Populate several levels for specific relations

You can also populate specific relations several levels deep.

Since the REST API uses the [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets), (i.e., with square brackets `[]`), for instance if you want to populate a relation nested inside another relation, the parameter syntax would look like the following:

`populate[first-level-relation-to-populate][populate][0]=second-level-relation-to-populate`

:::tip
The syntax for advanced query parameters can be quite complex to build manually. We recommend you use our [interactive query builder](/dev-docs/api/rest/interactive-query-builder) tool to generate the URL. For instance, the `/api/articles?populate[category][populate][0]=restaurants` URL used in the following examples has been generated by converting the following object using our tool:

```json
{
  populate: {
    category: {
      populate: ['restaurants'],
    },
  },
}
```

:::

:::caution
There is no limit on the number of levels that can be populated. However, the more nested populates there are, the more the request will take time to be performed.
:::

The [FoodAdvisor](https://github.com/strapi/foodadvisor) example application includes various levels of relations between content-types. For instance:

- an `article` content-type includes a relation with the `category` content-type,
- but a `category` can also be assigned to any `restaurant` content-type.

With a single `GET` request to `/api/articles` and the appropriate populate parameters, you can return information about articles, restaurants, and categories simultaneously.

Let's compare and explain the responses returned with `populate[0]=category` (1 level deep) and `populate[category][populate][0]=restaurants` (2 levels deep):

<SideBySideContainer>
<SideBySideColumn>

**1 level deep**

When we only populate 1 level deep, asking for the categories associated to articles, we can get the following example response (highlighted lines show the `category` relations field):

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

**2 levels deep**

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

### Populate components

Components and dynamic zones are not included in responses by default. You need to explicitly ask for each dynamic zones, components, and nested fields.

Since the REST API uses the [LHS bracket notation](https://christiangiacomi.com/posts/rest-design-principles/#lhs-brackets), (i.e., with square brackets `[]`), you need to pass all elements in an array. Nested fields can also be passed, and the parameter syntax could look like the following:

`populate[0]=a-first-field&populate[1]=a-second-field&populate[2]=a-third-field&populate[3]=a-third-field.a-nested-field&populate[4]=a-third-field.a-nested-component.a-nested-field-within-the-component`

:::tip
The syntax for advanced query parameters can be quite complex to build manually. We recommend you use our [interactive query builder](/dev-docs/api/rest/interactive-query-builder) tool to generate the URL. For instance, the `/api/articles?populate[0]=seo&populate[1]=seo.metaSocial&populate[2]=seo.metaSocial.image` URL used in the following examples has been generated by converting the following object using our tool:

```json
{
  populate: [
    'seoData',
    'seoData.sharedImage',
    'seoData.sharedImage.media',
  ],
},
```

:::

The [FoodAdvisor](https://github.com/strapi/foodadvisor) example application includes various components and even components nested inside other components. For instance:

- an `article` content-type includes a `seo` component,
- the `seo` component includes a nested, repeatable `metaSocial` component,
- and the `metaSocial` component itself has several fields, including an `image` media field.

By default, none of these fields or components are included in the response of a `GET` request to `/api/articles`. But with the appropriate populate parameters, you can return all of them in a single request.

Let's compare and explain the responses returned with `populate[0]=seo` (1st level component) and `populate[0]=seo&populate[1]=seo.metaSocial` (2nd level component nested within the 1st level component):

<SideBySideContainer>
<SideBySideColumn>

**1st level component**

When we only populate the `seo` component, we go only 1 level deep, and we can get the following example response. Highlighted lines show the `seo` component. Notice there's no mention of the `metaSocial` component nested within the `seo` component:

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[0]=seo`

</Request>

<Response title="Example response">

```json {13-22}
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
        "seo": {
          "id": 1,
          "metaTitle": "Articles - FoodAdvisor",
          "metaDescription": "Discover our articles about food, restaurants, bars and more! - FoodAdvisor",
          "keywords": "food",
          "metaRobots": null,
          "structuredData": null,
          "metaViewport": null,
          "canonicalURL": null
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
    },
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

**1st level and 2nd level component**

When we populate 2 levels deep, asking both for the `seo` component and the `metaSocial` component nested inside `seo`, we can get the following example response.

Notice that we now have the `metaSocial`-related data included with the response (see highlighted lines):

<ApiCall noSideBySide>
<Request title="Example request">

`GET /api/articles?populate[0]=seo&populate[1]=seo.metaSocial`

</Request>

<Response title="Example response">

```json {13,22-29}
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
        "seo": {
          "id": 1,
          "metaTitle": "Articles - FoodAdvisor",
          "metaDescription": "Discover our articles about food, restaurants, bars and more! - FoodAdvisor",
          "keywords": "food",
          "metaRobots": null,
          "structuredData": null,
          "metaViewport": null,
          "canonicalURL": null,
          "metaSocial": [
            {
              "id": 1,
              "socialNetwork": "Facebook",
              "title": "Browse our best articles about food and restaurants ",
              "description": "Discover our articles about food, restaurants, bars and more!"
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
    },
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

### Populate dynamic zones

Dynamic zones are highly dynamic content structures by essence.
When populating dynamic zones, you can choose between:

- a [shared population strategy](#shared-population-strategy), applying a unique behavior for all the dynamic zone's components,
- or a [detailed population strategy](#detailed-population-strategy), where you explicitly define what to populate with the response.

#### Shared population strategy

With the shared population strategy, you apply the same population to all the components of a dynamic zones.

For instance, the [FoodAdvisor](https://github.com/strapi/foodadvisor) example application includes a `blocks` dynamic zone in the àrticle` content-type, and the dynamic zone includes 3 different components with different fields. Instead of explicitly defining all the field names to populate, you can choose to populate all fields of all components by passing `[populate=*]`.


:::tip
The syntax for advanced query parameters can be quite complex to build manually. We recommend you use our [interactive query builder](/dev-docs/api/rest/interactive-query-builder) tool to generate the URL. For instance, the `/api/articles?populate[blocks][populate]=*` URL used in the following example has been generated by converting the following object using our tool:

```json
{
  populate: {
    blocks: { // asking to populate the blocks dynamic zone
      populate: '*' // applying a shared population strategy, populating all first-level fields in all components
    }
  },
}
```

:::

<ApiCall noSideBySide>
<Request title="Example request for shared populate strategy">

`GET /api/articles?populate[blocks][populate]=*`

</Request>



<Response title="Example response for shared populate strategy">

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
        "ckeditor_content": "<p>Thanks to <a href=\"https://www.huffpost.com/entry/how-to-measure-the-restau_b_5475536\">Ferran Adrià</a>, tapas, and a fascination with all things pork -- from chorizo to chicharrones -- Spanish cuisine has been a star in the food world in recent years. But a less familiar part of Spanish cuisine is Basque -- considerably unique and different from the broader Spanish cuisine that has been exported across the globe. Basque cuisine is worth getting to know, however, and with an influx of Basque-inspired restaurants in food-forward cities like New York, it appears that this culinary tradition is gaining the foothold it deserves.</p><p>Basque country lies in the North of Spain near the Bay of Biscay and in South Western France. With fertile ground for grains and vineyards in an area called Álava, and good land for livestock breeding in Vizcaya and Guipúzcoa, Basque country has a rich culinary heritage. It's no wonder then that today the region boasts <a href=\"http://www.euskoguide.com/food-drink-basque-country/michelin-star-restaurants.html\">almost 40 Michelin-starred restaurants</a>.</p><p>I spoke to the executive chef and owner of the new Basque-inspired restaurant <a href=\"http://huertasnyc.com/t\">Huertas</a> in New York City to learn more about the unique cuisine. Ten years ago, after working in some of New York's most prominent restaurants, chef Jonah Miller took off for Northern Spain to learn more. In April of this year, he opened his first restaurant, dedicated to the food he studied and fell in love with.</p><p><strong>I asked Jonah to describe some quintessential Basque dishes, and the overarching themes were salt cod and peppers.</strong></p><p><i>Salt Cod (in many forms), including:</i><br>- Kokotxas al Pil-Pil - Fish cheeks and throats in a \"pil-pil\" sauce, which refers to the sound made when shaking a cazuela to activate the natural gelatin in the fish cheeks.<br>- Tortilla de Bacalao - A salt cod omelet.<br>- Porrusalda - Potato, leek, salt cod soup.<br>Piperrada - Sauteed peppers (they use lots of peppers), onions, garlic and tomato, often served with a fried egg.<br>Stuffed Piquillo Peppers.<br>Marmitako - Tuna with potato and pepper stew.</p><p><strong>I also asked what some quintessential Basque beverages might be.</strong></p><blockquote><p>Sidra (cider), which is much dryer and funkier than ciders we are familiar with, and Txakoli, slightly effervescent white wine. Both are low in alcohol and highly acidic -- perfect to drink with pintxos.</p></blockquote><p><strong>So what are pintxos?</strong></p><blockquote><p>\"Pintxos are small, composed bites that unlike tapas, aren't meant to be shared,\" explained Miller. Fans of tapas but not always down to share every bite, we like the sound of pintxos. Basque restaurants are best known for pintxos, and at his restaurant, Miller naturally serves a variety.&nbsp;</p></blockquote><p>Among his favorites are:<br><i>Gildas - White anchovy, olive, and pickled pepper skewer (named after the 1946 Rita Hayworth role).</i><br><i>Soft Boiled Quail Egg with Black Anchovy and Piquillo Peppers.</i><br><i>Fried Eggplant with Honey and Goat Cheese (local eggplant just started).</i><br><i>Wood-Fired Chorizo with Pickled Carrots.</i></p><p><img src=\"/uploads/55_3a3cb7ffba_cf157a700b.jpg\" alt=\"Pintxos\">)</p><p><strong>Other than Pintxos, what are more distinguishing features of Basque cuisine that you won't find anywhere else?</strong></p><blockquote><p>Lots of salt cod. As far back at the 15th century Basques were the best ship builders in Europe and dominated the whaling trade. When the whaling trade dried up, they began going further into the north Atlantic to fish for cod, which they salted aboard the ship as a means of preservation and then brought home. So even though cod is not present in the waters around Spain, it is the fish most commonly used in the Basque country (though almost always dried). They use more Foie Gras than other areas of Spain.</p></blockquote><p><strong>Miller serves a lot of egg dishes at Huertas, so I wondered too how important eggs were in Basque cuisine.</strong></p><blockquote><p>In the Basque country, they enjoy eggs at all times of day throughout Spain... Eggs are often the canvas for beautiful seafood, produce, or charcuterie, such as wild mushrooms, local asparagus, Jamon...</p></blockquote><p><strong>I asked what brought him to Northern Spain in the first place and what drew him to the cuisine.</strong></p><blockquote><p>Ten years ago when I was growing up working in kitchens, Spain was at the forefront of influencing modern cooking techniques. So that was largely what attracted me to studying abroad in Madrid (as well as honing my Spanish speaking, which is helpful in NYC kitchens), as well as not knowing much about Spanish cuisine and looking forward to learning something new. When in Spain, I came to appreciate not the modern cooking, but how great the old-school pintxo and tapas bars were, how fun they were to dine in, and felt that we didn't have much representation for that experience in New York. Being a native New Yorker, I think we should have the best of everything available here, and wanted to bring more great Spanish food to our city.</p></blockquote><blockquote><p>The food and culture of the north of Spain translate better than the south of Spain to New York. For one thing, being closer to the rest of Europe, the north is more cosmopolitan and a bit more diverse. Also, the climate in the north (and accordingly produce) is not far off from that of New York.</p></blockquote><p><strong>Now I'm hungry. I asked what a typical way to start and end a Basque meal is.</strong></p><blockquote><p>To start, Txakolina and simply cooked seafood. [To finish,] there are some delicious Basque vermouths, which are a bit sweet and are had after dinner or often in the afternoon (some of which we offer, as well as making our own). They do make caramels and toffees, as well as Turron, an almond nougat. All traditional ends to a meal. There are also many cakes and tarts that are traditional.</p></blockquote><p><strong>So now that I'm ready to dive headfirst into Basque cuisine, what would be an approachable dish to try making at home?</strong></p><blockquote><p>Pintxos!! Go to Despana (a Spanish specialty foods store), pick up one or two cheeses, one or two cured meats, anchovies, a tin of seafood; the greenmarket for some seasonal produce and local honey; get some good bread, toothpicks, and start trying out different combinations. Try this cheese with honey and shaved carrots, those anchovies with tomato on toast.<br>&nbsp;</p></blockquote>",
        "blocks": [
          {
            "id": 2,
            "__component": "blocks.related-articles",
            "header": {
              "id": 2,
              "theme": "primary",
              "label": "More, I want more!",
              "title": "Similar articles"
            },
            "articles": {
              "data": [
                {
                  "id": 2,
                  "attributes": {
                    "title": "What are chinese hamburgers and why aren't you eating them?",
                    "slug": "what-are-chinese-hamburgers-and-why-aren-t-you-eating-them",
                    "createdAt": "2021-11-11T13:33:19.948Z",
                    "updatedAt": "2023-06-01T14:32:50.984Z",
                    "publishedAt": "2022-09-22T12:36:48.312Z",
                    "locale": "en",
                    "ckeditor_content": "<p>The world's first hamburger doesn't come from where you think it comes from. It wasn't invented in the United States, and it didn't originate in Germany. No, the world's first hamburger comes from China.</p><h3>Wait, what?</h3><p>If you're scratching your head right now, you're not alone. But Chinese hamburgers are very real and they definitely predate the <a href=\"https://www.huffpost.com/entry/the-16-essential-regional_b_5682151\">hamburgers we call our own</a> in the U.S. Known as rou jia mo, which translates to \"meat burger\" or \"meat sandwich,\" they consist of chopped meat inside a pita-like bun, and they've been around since the Qin dynasty, from about 221 BC to 207 BC. Despite the differences between this Chinese street food and our American-style <a href=\"https://www.huffpost.com/entry/perfect-way-to-eat-burger_n_4704188\">burgers</a>, the rou jia mo \"<a href=\"http://www.marcussamuelsson.com/news/street-food-rou-jia-mo-from-china\">has been called the world's first hamburger</a>\".</p><p>The rou jia mo originated in the Shaanxi Province of China, and is now eaten all over the country. It's typically prepared and eaten on the street. The dough for the bun, or mo, consists of a simple mixture of wheat flour, water and maybe yeast. Of course recipes may vary, but this basic equation makes for a chewy and subtle pillow for the delicious filling. While the mo is <a href=\"https://www.starchefs.com/cook/savory/technique/rou-jia-mo-chinese-hamburger\">traditionally baked in a clay oven</a>, today it's often fried in a pan. They may look a little like <a href=\"https://www.huffpost.com/entry/bao-facts_n_5000963\">Chinese steamed buns or baos</a>, but the dough for those is, of course, steamed, not baked or fried.</p><figure class=\"image image-style-side\"><img src=\"/uploads/fe006ed91f619568081af52979b77af3_52cac17456.jpeg\" alt=\"fe006ed91f619568081af52979b77af3.jpeg\"></figure><p>The meat filling might consist of chopped pork, beef, lamb, or chicken that has been stewed with a variety of spices, like ginger, cloves, coriander, and star anise. You might also find herbs like cilantro or greens like lettuce garnishing the sandwich.</p><p>If you've never had a Chinese hamburger, now is as great a time as any to try one. <a href=\"http://www.chinasichuanfood.com/chinese-hamburger-pork-belly-buns/\">See here for a recipe for rou ji mo</a>, or watch the video below for step-by-step instructions for another great Chinese hamburger recipe.</p><p><br>&nbsp;</p>"
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
                    "ckeditor_content": "<blockquote><p>There is no love sincerer than the love of food&nbsp;</p></blockquote><p>said George Bernard Shaw, and let us also add that there's arguably no better way to explore a culture than to eat voraciously while traveling. Yes, there are many five-star restaurants worth booking an entire trip for, but it's equally important to savor classic treats from across the world.</p><h3>Paella in Valencia, Spain</h3><figure class=\"image image-style-side image_resized\" style=\"width:25%;\"><img src=\"/uploads/5b9eeba22100003000c61e59_9098d9fb0a_176b2163c1_4b0b601b3c.jpeg\" alt=\"Paella in Valencia\"></figure><p>It’s this classic rice-based dish that first pops to mind when thinking of Spanish gastronomy. For the best there is, head to the source: Valencia. And don’t forget to scrape the bottom of the pan for heavenly bites of crunchy rice, or socarrat: the most flavorful arroz ever to land on your palate.</p><p>&nbsp;</p><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>Nasi Lemak in Malaysia</h3><figure class=\"image image_resized\" style=\"width:50%;\"><img src=\"/uploads/5b9eeba22400005100542e38_cf4839f0ad_84f89b8451_742b9a1759.jpeg\" alt=\"Nasi Lemak\"></figure><p>Malaysia’s national dish, nasi lemak is a fragrant coconut-milk rice mixture, served with sambal sauce, fried crispy anchovies, toasted peanuts, and cucumber and cooked with screw pine (pandan) leaves. Available on almost every street corner, this much-loved classic hits all the notes.</p><h3>Pintxos in San Sebastián, Spain</h3><p><img class=\"image_resized\" style=\"width:25%;\" src=\"/uploads/5b9eeba32500003500370d46_7d51fc80cd_783924b96a_bdc848856f.jpeg\" alt=\"Pintxos in San Sebastián\"></p><p>Among the most highly ranked cities for Michelin-starred restaurants, San Sebastián boasts pintxos (the equivalent of small tapas) with über-creative takes on classics and beyond. Spain’s haute cuisine shines in this culinary paradise on the Basque coast.</p><h3>&nbsp;</h3><h3>Pastel de Nata in Lisbon</h3><figure class=\"image image-style-side image_resized\" style=\"width:25%;\"><img src=\"/uploads/5b9eeba53c00005b000abbf4_be4ab6d075_e909882796_3908e6e816.jpeg\" alt=\"Pastel de Nata\"></figure><p>The most iconic Portuguese pastry, the <a href=\"http://www.bbc.com/travel/story/20111107-a-bit-of-history-in-every-sweet-bite\">pastel de nata</a> is a sublime custard tart with hints of lemon, cinnamon, and vanilla. Buttery goodness in the middle, crunchy sweetness on top—what’s not to love?</p><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>Mole in Puebla, Mexico</h3><p><img class=\"image_resized\" style=\"width:25%;\" src=\"/uploads/5b9eeba62100003100c61e5b_d99dbc2910_75979ebd04_7afc2d1a5c.jpeg\" alt=\"Mole in Puebla\"></p><p>Mole, a specialty in the Mexican city of Puebla, is a labor of love. The spicy-sweet combination of this rich, chocolate-colored sauce takes arduous preparation and packs ingredients such as ancho chiles, spices like anise and coriander, sesame seeds, almonds, peanuts, stale bread, brown sugar, raisins, chocolate, and ripe plantains. The culminating dish is fit for the gods.</p><h3>Sichuan Hot Pot in China</h3><p><img class=\"image_resized\" style=\"width:50%;\" src=\"/uploads/5b9eeba82200005600da3822_01759bd55b_b46108e1aa_a310f83ff9.jpeg\" alt=\"Sichuan Hot Pot\"></p><p>This isn’t for the faint of heart. But if you’re an extreme spice lover, you’ll welcome the tears that come from the hot pot’s perfect nexus of pain and pleasure.</p><h3>Tagine in Morocco</h3><p><img class=\"image_resized\" style=\"width:50%;\" src=\"/uploads/5b9eeba93c000032000abbf6_12bb2e5346_9e0dac4fca_73bf6480cb.jpeg\" alt=\"Tagine in Morocco\"></p><p>This slow-cooked savory stew, typically made with sliced meat, poultry, or fish and lots of herbs and spices, is true Moroccan soul food. Cooked for hours in a clay cooking pot with a conical lid (known as a tagine), this irresistible dish is served with couscous or bread and can be found all over Morocco.</p>"
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
                    "ckeditor_content": "<p>Across the globe, there are many cultural differences that define each country. As a traveler, it’s important to educate yourself on what you should and shouldn’t do when visiting a new locale.</p><p>And since food is such a big part of travel, it’s important to learn the dining etiquette of each nation. It differs greatly from place to place. For example, in many areas of China it’s considered a compliment to [burp after a meal](https://www.buzzfeed.com/adamellis/surprising-food-etiquette-rules-from-around-the-world) ― a sign that you’ve eaten well ― while stateside, that same act will get you some serious side-eye.</p><p>One easy way you can commit a faux pas while eating abroad is with your plate ― should you wipe it clean or leave some food? It all depends on where you are.</p><p>Here are four nations where what you do with your plate matters. Study up before you make another big trip.</p><h3>India</h3><p>In India, you <a href=\"https://www.thrillist.com/eat/nation/international-food-customs-8-weird-food-etiquette-trends-from-around-the-world-thrillist-nation\">should finish everything</a> that is on your plate because it is <a href=\"http://www.culturewavesglobal.com/india-etiquette-\">considered a respect for the served food</a>, and food in India is considered sacred. In South India, where food can be served on a banana leaf, it is polite to fold your leaf over from the top ― not from the bottom, because <a href=\"http://www.cntraveler.com/stories/2007-10-17/etiquette-101-india\">that indicates you were not satisfied</a>.</p><h3>Japan</h3><p>The same is true about finishing your plate in Japan. The Japanese consider it <a href=\"http://www.japan-talk.com/jt/new/in-Japan-you-need-to-finish-your-plate\">rude to leave food on your plate</a>, whether at home or at a restaurant. It’s related to one of the fundamental concepts in Japanese culture, <a href=\"http://www.abc.net.au/radionational/programs/philosopherszone/avoiding-waste-with-the-japanese-concept-of-'mottainai'/6722720\">mottainai</a>, which is a feeling of regret at having wasted something.</p><h3>China</h3><p>In China, however, leaving behind an empty plate is a <a href=\"https://www.thrillist.com/eat/nation/international-food-customs-8-weird-food-etiquette-trends-from-around-the-world-thrillist-nation\">sign to the host that you’re still hungry</a>. If you don’t want to eat more food, consider leaving a little behind to let the host know <a href=\"http://www.healthytravelblog.com/2012/08/10/travel-etiquette-part-3-eating-without-embarrassing-yourself/\">you have had enough</a>.</p><p>&nbsp;</p><h3>Ethiopia</h3><p>Ethiopians don’t even bother with plates. Individual plates <a href=\"https://www.lonelyplanet.com/asia/travel-tips-and-articles/76513?lpaffil=lp-affiliates\">are considered wasteful</a>. Folks share meals off of <a href=\"http://www.foodbycountry.com/Algeria-to-France/Ethiopia.html\">one big communal plate</a> and generally eat with their hands using injera ― a type of flatbread ― to pick up the food. So, don’t even think about asking for your own plate.<br>&nbsp;</p>"
                  }
                }
              ]
            }
          },
          {
            "id": 2,
            "__component": "blocks.cta-command-line",
            "theme": "primary",
            "title": "Want to give a try to a Strapi starter?",
            "text": "❤️",
            "commandLine": "git clone https://github.com/strapi/nextjs-corporate-starter.git"
          }
        ]
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
        "ckeditor_content": "<p>The world's first hamburger doesn't come from where you think it comes from. It wasn't invented in the United States, and it didn't originate in Germany. No, the world's first hamburger comes from China.</p><h3>Wait, what?</h3><p>If you're scratching your head right now, you're not alone. But Chinese hamburgers are very real and they definitely predate the <a href=\"https://www.huffpost.com/entry/the-16-essential-regional_b_5682151\">hamburgers we call our own</a> in the U.S. Known as rou jia mo, which translates to \"meat burger\" or \"meat sandwich,\" they consist of chopped meat inside a pita-like bun, and they've been around since the Qin dynasty, from about 221 BC to 207 BC. Despite the differences between this Chinese street food and our American-style <a href=\"https://www.huffpost.com/entry/perfect-way-to-eat-burger_n_4704188\">burgers</a>, the rou jia mo \"<a href=\"http://www.marcussamuelsson.com/news/street-food-rou-jia-mo-from-china\">has been called the world's first hamburger</a>\".</p><p>The rou jia mo originated in the Shaanxi Province of China, and is now eaten all over the country. It's typically prepared and eaten on the street. The dough for the bun, or mo, consists of a simple mixture of wheat flour, water and maybe yeast. Of course recipes may vary, but this basic equation makes for a chewy and subtle pillow for the delicious filling. While the mo is <a href=\"https://www.starchefs.com/cook/savory/technique/rou-jia-mo-chinese-hamburger\">traditionally baked in a clay oven</a>, today it's often fried in a pan. They may look a little like <a href=\"https://www.huffpost.com/entry/bao-facts_n_5000963\">Chinese steamed buns or baos</a>, but the dough for those is, of course, steamed, not baked or fried.</p><figure class=\"image image-style-side\"><img src=\"/uploads/fe006ed91f619568081af52979b77af3_52cac17456.jpeg\" alt=\"fe006ed91f619568081af52979b77af3.jpeg\"></figure><p>The meat filling might consist of chopped pork, beef, lamb, or chicken that has been stewed with a variety of spices, like ginger, cloves, coriander, and star anise. You might also find herbs like cilantro or greens like lettuce garnishing the sandwich.</p><p>If you've never had a Chinese hamburger, now is as great a time as any to try one. <a href=\"http://www.chinasichuanfood.com/chinese-hamburger-pork-belly-buns/\">See here for a recipe for rou ji mo</a>, or watch the video below for step-by-step instructions for another great Chinese hamburger recipe.</p><p><br>&nbsp;</p>",
        "blocks": [
          {
            "id": 4,
            "__component": "blocks.related-articles",
            "header": null,
            "articles": {
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
                    "ckeditor_content": "<p>Thanks to <a href=\"https://www.huffpost.com/entry/how-to-measure-the-restau_b_5475536\">Ferran Adrià</a>, tapas, and a fascination with all things pork -- from chorizo to chicharrones -- Spanish cuisine has been a star in the food world in recent years. But a less familiar part of Spanish cuisine is Basque -- considerably unique and different from the broader Spanish cuisine that has been exported across the globe. Basque cuisine is worth getting to know, however, and with an influx of Basque-inspired restaurants in food-forward cities like New York, it appears that this culinary tradition is gaining the foothold it deserves.</p><p>Basque country lies in the North of Spain near the Bay of Biscay and in South Western France. With fertile ground for grains and vineyards in an area called Álava, and good land for livestock breeding in Vizcaya and Guipúzcoa, Basque country has a rich culinary heritage. It's no wonder then that today the region boasts <a href=\"http://www.euskoguide.com/food-drink-basque-country/michelin-star-restaurants.html\">almost 40 Michelin-starred restaurants</a>.</p><p>I spoke to the executive chef and owner of the new Basque-inspired restaurant <a href=\"http://huertasnyc.com/t\">Huertas</a> in New York City to learn more about the unique cuisine. Ten years ago, after working in some of New York's most prominent restaurants, chef Jonah Miller took off for Northern Spain to learn more. In April of this year, he opened his first restaurant, dedicated to the food he studied and fell in love with.</p><p><strong>I asked Jonah to describe some quintessential Basque dishes, and the overarching themes were salt cod and peppers.</strong></p><p><i>Salt Cod (in many forms), including:</i><br>- Kokotxas al Pil-Pil - Fish cheeks and throats in a \"pil-pil\" sauce, which refers to the sound made when shaking a cazuela to activate the natural gelatin in the fish cheeks.<br>- Tortilla de Bacalao - A salt cod omelet.<br>- Porrusalda - Potato, leek, salt cod soup.<br>Piperrada - Sauteed peppers (they use lots of peppers), onions, garlic and tomato, often served with a fried egg.<br>Stuffed Piquillo Peppers.<br>Marmitako - Tuna with potato and pepper stew.</p><p><strong>I also asked what some quintessential Basque beverages might be.</strong></p><blockquote><p>Sidra (cider), which is much dryer and funkier than ciders we are familiar with, and Txakoli, slightly effervescent white wine. Both are low in alcohol and highly acidic -- perfect to drink with pintxos.</p></blockquote><p><strong>So what are pintxos?</strong></p><blockquote><p>\"Pintxos are small, composed bites that unlike tapas, aren't meant to be shared,\" explained Miller. Fans of tapas but not always down to share every bite, we like the sound of pintxos. Basque restaurants are best known for pintxos, and at his restaurant, Miller naturally serves a variety.&nbsp;</p></blockquote><p>Among his favorites are:<br><i>Gildas - White anchovy, olive, and pickled pepper skewer (named after the 1946 Rita Hayworth role).</i><br><i>Soft Boiled Quail Egg with Black Anchovy and Piquillo Peppers.</i><br><i>Fried Eggplant with Honey and Goat Cheese (local eggplant just started).</i><br><i>Wood-Fired Chorizo with Pickled Carrots.</i></p><p><img src=\"/uploads/55_3a3cb7ffba_cf157a700b.jpg\" alt=\"Pintxos\">)</p><p><strong>Other than Pintxos, what are more distinguishing features of Basque cuisine that you won't find anywhere else?</strong></p><blockquote><p>Lots of salt cod. As far back at the 15th century Basques were the best ship builders in Europe and dominated the whaling trade. When the whaling trade dried up, they began going further into the north Atlantic to fish for cod, which they salted aboard the ship as a means of preservation and then brought home. So even though cod is not present in the waters around Spain, it is the fish most commonly used in the Basque country (though almost always dried). They use more Foie Gras than other areas of Spain.</p></blockquote><p><strong>Miller serves a lot of egg dishes at Huertas, so I wondered too how important eggs were in Basque cuisine.</strong></p><blockquote><p>In the Basque country, they enjoy eggs at all times of day throughout Spain... Eggs are often the canvas for beautiful seafood, produce, or charcuterie, such as wild mushrooms, local asparagus, Jamon...</p></blockquote><p><strong>I asked what brought him to Northern Spain in the first place and what drew him to the cuisine.</strong></p><blockquote><p>Ten years ago when I was growing up working in kitchens, Spain was at the forefront of influencing modern cooking techniques. So that was largely what attracted me to studying abroad in Madrid (as well as honing my Spanish speaking, which is helpful in NYC kitchens), as well as not knowing much about Spanish cuisine and looking forward to learning something new. When in Spain, I came to appreciate not the modern cooking, but how great the old-school pintxo and tapas bars were, how fun they were to dine in, and felt that we didn't have much representation for that experience in New York. Being a native New Yorker, I think we should have the best of everything available here, and wanted to bring more great Spanish food to our city.</p></blockquote><blockquote><p>The food and culture of the north of Spain translate better than the south of Spain to New York. For one thing, being closer to the rest of Europe, the north is more cosmopolitan and a bit more diverse. Also, the climate in the north (and accordingly produce) is not far off from that of New York.</p></blockquote><p><strong>Now I'm hungry. I asked what a typical way to start and end a Basque meal is.</strong></p><blockquote><p>To start, Txakolina and simply cooked seafood. [To finish,] there are some delicious Basque vermouths, which are a bit sweet and are had after dinner or often in the afternoon (some of which we offer, as well as making our own). They do make caramels and toffees, as well as Turron, an almond nougat. All traditional ends to a meal. There are also many cakes and tarts that are traditional.</p></blockquote><p><strong>So now that I'm ready to dive headfirst into Basque cuisine, what would be an approachable dish to try making at home?</strong></p><blockquote><p>Pintxos!! Go to Despana (a Spanish specialty foods store), pick up one or two cheeses, one or two cured meats, anchovies, a tin of seafood; the greenmarket for some seasonal produce and local honey; get some good bread, toothpicks, and start trying out different combinations. Try this cheese with honey and shaved carrots, those anchovies with tomato on toast.<br>&nbsp;</p></blockquote>"
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
                    "ckeditor_content": "<blockquote><p>There is no love sincerer than the love of food&nbsp;</p></blockquote><p>said George Bernard Shaw, and let us also add that there's arguably no better way to explore a culture than to eat voraciously while traveling. Yes, there are many five-star restaurants worth booking an entire trip for, but it's equally important to savor classic treats from across the world.</p><h3>Paella in Valencia, Spain</h3><figure class=\"image image-style-side image_resized\" style=\"width:25%;\"><img src=\"/uploads/5b9eeba22100003000c61e59_9098d9fb0a_176b2163c1_4b0b601b3c.jpeg\" alt=\"Paella in Valencia\"></figure><p>It’s this classic rice-based dish that first pops to mind when thinking of Spanish gastronomy. For the best there is, head to the source: Valencia. And don’t forget to scrape the bottom of the pan for heavenly bites of crunchy rice, or socarrat: the most flavorful arroz ever to land on your palate.</p><p>&nbsp;</p><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>Nasi Lemak in Malaysia</h3><figure class=\"image image_resized\" style=\"width:50%;\"><img src=\"/uploads/5b9eeba22400005100542e38_cf4839f0ad_84f89b8451_742b9a1759.jpeg\" alt=\"Nasi Lemak\"></figure><p>Malaysia’s national dish, nasi lemak is a fragrant coconut-milk rice mixture, served with sambal sauce, fried crispy anchovies, toasted peanuts, and cucumber and cooked with screw pine (pandan) leaves. Available on almost every street corner, this much-loved classic hits all the notes.</p><h3>Pintxos in San Sebastián, Spain</h3><p><img class=\"image_resized\" style=\"width:25%;\" src=\"/uploads/5b9eeba32500003500370d46_7d51fc80cd_783924b96a_bdc848856f.jpeg\" alt=\"Pintxos in San Sebastián\"></p><p>Among the most highly ranked cities for Michelin-starred restaurants, San Sebastián boasts pintxos (the equivalent of small tapas) with über-creative takes on classics and beyond. Spain’s haute cuisine shines in this culinary paradise on the Basque coast.</p><h3>&nbsp;</h3><h3>Pastel de Nata in Lisbon</h3><figure class=\"image image-style-side image_resized\" style=\"width:25%;\"><img src=\"/uploads/5b9eeba53c00005b000abbf4_be4ab6d075_e909882796_3908e6e816.jpeg\" alt=\"Pastel de Nata\"></figure><p>The most iconic Portuguese pastry, the <a href=\"http://www.bbc.com/travel/story/20111107-a-bit-of-history-in-every-sweet-bite\">pastel de nata</a> is a sublime custard tart with hints of lemon, cinnamon, and vanilla. Buttery goodness in the middle, crunchy sweetness on top—what’s not to love?</p><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>Mole in Puebla, Mexico</h3><p><img class=\"image_resized\" style=\"width:25%;\" src=\"/uploads/5b9eeba62100003100c61e5b_d99dbc2910_75979ebd04_7afc2d1a5c.jpeg\" alt=\"Mole in Puebla\"></p><p>Mole, a specialty in the Mexican city of Puebla, is a labor of love. The spicy-sweet combination of this rich, chocolate-colored sauce takes arduous preparation and packs ingredients such as ancho chiles, spices like anise and coriander, sesame seeds, almonds, peanuts, stale bread, brown sugar, raisins, chocolate, and ripe plantains. The culminating dish is fit for the gods.</p><h3>Sichuan Hot Pot in China</h3><p><img class=\"image_resized\" style=\"width:50%;\" src=\"/uploads/5b9eeba82200005600da3822_01759bd55b_b46108e1aa_a310f83ff9.jpeg\" alt=\"Sichuan Hot Pot\"></p><p>This isn’t for the faint of heart. But if you’re an extreme spice lover, you’ll welcome the tears that come from the hot pot’s perfect nexus of pain and pleasure.</p><h3>Tagine in Morocco</h3><p><img class=\"image_resized\" style=\"width:50%;\" src=\"/uploads/5b9eeba93c000032000abbf6_12bb2e5346_9e0dac4fca_73bf6480cb.jpeg\" alt=\"Tagine in Morocco\"></p><p>This slow-cooked savory stew, typically made with sliced meat, poultry, or fish and lots of herbs and spices, is true Moroccan soul food. Cooked for hours in a clay cooking pot with a conical lid (known as a tagine), this irresistible dish is served with couscous or bread and can be found all over Morocco.</p>"
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
                    "ckeditor_content": "<p>Across the globe, there are many cultural differences that define each country. As a traveler, it’s important to educate yourself on what you should and shouldn’t do when visiting a new locale.</p><p>And since food is such a big part of travel, it’s important to learn the dining etiquette of each nation. It differs greatly from place to place. For example, in many areas of China it’s considered a compliment to [burp after a meal](https://www.buzzfeed.com/adamellis/surprising-food-etiquette-rules-from-around-the-world) ― a sign that you’ve eaten well ― while stateside, that same act will get you some serious side-eye.</p><p>One easy way you can commit a faux pas while eating abroad is with your plate ― should you wipe it clean or leave some food? It all depends on where you are.</p><p>Here are four nations where what you do with your plate matters. Study up before you make another big trip.</p><h3>India</h3><p>In India, you <a href=\"https://www.thrillist.com/eat/nation/international-food-customs-8-weird-food-etiquette-trends-from-around-the-world-thrillist-nation\">should finish everything</a> that is on your plate because it is <a href=\"http://www.culturewavesglobal.com/india-etiquette-\">considered a respect for the served food</a>, and food in India is considered sacred. In South India, where food can be served on a banana leaf, it is polite to fold your leaf over from the top ― not from the bottom, because <a href=\"http://www.cntraveler.com/stories/2007-10-17/etiquette-101-india\">that indicates you were not satisfied</a>.</p><h3>Japan</h3><p>The same is true about finishing your plate in Japan. The Japanese consider it <a href=\"http://www.japan-talk.com/jt/new/in-Japan-you-need-to-finish-your-plate\">rude to leave food on your plate</a>, whether at home or at a restaurant. It’s related to one of the fundamental concepts in Japanese culture, <a href=\"http://www.abc.net.au/radionational/programs/philosopherszone/avoiding-waste-with-the-japanese-concept-of-'mottainai'/6722720\">mottainai</a>, which is a feeling of regret at having wasted something.</p><h3>China</h3><p>In China, however, leaving behind an empty plate is a <a href=\"https://www.thrillist.com/eat/nation/international-food-customs-8-weird-food-etiquette-trends-from-around-the-world-thrillist-nation\">sign to the host that you’re still hungry</a>. If you don’t want to eat more food, consider leaving a little behind to let the host know <a href=\"http://www.healthytravelblog.com/2012/08/10/travel-etiquette-part-3-eating-without-embarrassing-yourself/\">you have had enough</a>.</p><p>&nbsp;</p><h3>Ethiopia</h3><p>Ethiopians don’t even bother with plates. Individual plates <a href=\"https://www.lonelyplanet.com/asia/travel-tips-and-articles/76513?lpaffil=lp-affiliates\">are considered wasteful</a>. Folks share meals off of <a href=\"http://www.foodbycountry.com/Algeria-to-France/Ethiopia.html\">one big communal plate</a> and generally eat with their hands using injera ― a type of flatbread ― to pick up the food. So, don’t even think about asking for your own plate.<br>&nbsp;</p>"
                  }
                }
              ]
            }
          }
        ]
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
        "ckeditor_content": "<blockquote><p>There is no love sincerer than the love of food&nbsp;</p></blockquote><p>said George Bernard Shaw, and let us also add that there's arguably no better way to explore a culture than to eat voraciously while traveling. Yes, there are many five-star restaurants worth booking an entire trip for, but it's equally important to savor classic treats from across the world.</p><h3>Paella in Valencia, Spain</h3><figure class=\"image image-style-side image_resized\" style=\"width:25%;\"><img src=\"/uploads/5b9eeba22100003000c61e59_9098d9fb0a_176b2163c1_4b0b601b3c.jpeg\" alt=\"Paella in Valencia\"></figure><p>It’s this classic rice-based dish that first pops to mind when thinking of Spanish gastronomy. For the best there is, head to the source: Valencia. And don’t forget to scrape the bottom of the pan for heavenly bites of crunchy rice, or socarrat: the most flavorful arroz ever to land on your palate.</p><p>&nbsp;</p><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>Nasi Lemak in Malaysia</h3><figure class=\"image image_resized\" style=\"width:50%;\"><img src=\"/uploads/5b9eeba22400005100542e38_cf4839f0ad_84f89b8451_742b9a1759.jpeg\" alt=\"Nasi Lemak\"></figure><p>Malaysia’s national dish, nasi lemak is a fragrant coconut-milk rice mixture, served with sambal sauce, fried crispy anchovies, toasted peanuts, and cucumber and cooked with screw pine (pandan) leaves. Available on almost every street corner, this much-loved classic hits all the notes.</p><h3>Pintxos in San Sebastián, Spain</h3><p><img class=\"image_resized\" style=\"width:25%;\" src=\"/uploads/5b9eeba32500003500370d46_7d51fc80cd_783924b96a_bdc848856f.jpeg\" alt=\"Pintxos in San Sebastián\"></p><p>Among the most highly ranked cities for Michelin-starred restaurants, San Sebastián boasts pintxos (the equivalent of small tapas) with über-creative takes on classics and beyond. Spain’s haute cuisine shines in this culinary paradise on the Basque coast.</p><h3>&nbsp;</h3><h3>Pastel de Nata in Lisbon</h3><figure class=\"image image-style-side image_resized\" style=\"width:25%;\"><img src=\"/uploads/5b9eeba53c00005b000abbf4_be4ab6d075_e909882796_3908e6e816.jpeg\" alt=\"Pastel de Nata\"></figure><p>The most iconic Portuguese pastry, the <a href=\"http://www.bbc.com/travel/story/20111107-a-bit-of-history-in-every-sweet-bite\">pastel de nata</a> is a sublime custard tart with hints of lemon, cinnamon, and vanilla. Buttery goodness in the middle, crunchy sweetness on top—what’s not to love?</p><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>&nbsp;</h3><h3>Mole in Puebla, Mexico</h3><p><img class=\"image_resized\" style=\"width:25%;\" src=\"/uploads/5b9eeba62100003100c61e5b_d99dbc2910_75979ebd04_7afc2d1a5c.jpeg\" alt=\"Mole in Puebla\"></p><p>Mole, a specialty in the Mexican city of Puebla, is a labor of love. The spicy-sweet combination of this rich, chocolate-colored sauce takes arduous preparation and packs ingredients such as ancho chiles, spices like anise and coriander, sesame seeds, almonds, peanuts, stale bread, brown sugar, raisins, chocolate, and ripe plantains. The culminating dish is fit for the gods.</p><h3>Sichuan Hot Pot in China</h3><p><img class=\"image_resized\" style=\"width:50%;\" src=\"/uploads/5b9eeba82200005600da3822_01759bd55b_b46108e1aa_a310f83ff9.jpeg\" alt=\"Sichuan Hot Pot\"></p><p>This isn’t for the faint of heart. But if you’re an extreme spice lover, you’ll welcome the tears that come from the hot pot’s perfect nexus of pain and pleasure.</p><h3>Tagine in Morocco</h3><p><img class=\"image_resized\" style=\"width:50%;\" src=\"/uploads/5b9eeba93c000032000abbf6_12bb2e5346_9e0dac4fca_73bf6480cb.jpeg\" alt=\"Tagine in Morocco\"></p><p>This slow-cooked savory stew, typically made with sliced meat, poultry, or fish and lots of herbs and spices, is true Moroccan soul food. Cooked for hours in a clay cooking pot with a conical lid (known as a tagine), this irresistible dish is served with couscous or bread and can be found all over Morocco.</p>",
        "blocks": [
          {
            "id": 1,
            "__component": "blocks.related-articles",
            "header": {
              "id": 1,
              "theme": "primary",
              "label": "More, I want more!",
              "title": "Similar articles"
            },
            "articles": {
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
                    "ckeditor_content": "<p>Thanks to <a href=\"https://www.huffpost.com/entry/how-to-measure-the-restau_b_5475536\">Ferran Adrià</a>, tapas, and a fascination with all things pork -- from chorizo to chicharrones -- Spanish cuisine has been a star in the food world in recent years. But a less familiar part of Spanish cuisine is Basque -- considerably unique and different from the broader Spanish cuisine that has been exported across the globe. Basque cuisine is worth getting to know, however, and with an influx of Basque-inspired restaurants in food-forward cities like New York, it appears that this culinary tradition is gaining the foothold it deserves.</p><p>Basque country lies in the North of Spain near the Bay of Biscay and in South Western France. With fertile ground for grains and vineyards in an area called Álava, and good land for livestock breeding in Vizcaya and Guipúzcoa, Basque country has a rich culinary heritage. It's no wonder then that today the region boasts <a href=\"http://www.euskoguide.com/food-drink-basque-country/michelin-star-restaurants.html\">almost 40 Michelin-starred restaurants</a>.</p><p>I spoke to the executive chef and owner of the new Basque-inspired restaurant <a href=\"http://huertasnyc.com/t\">Huertas</a> in New York City to learn more about the unique cuisine. Ten years ago, after working in some of New York's most prominent restaurants, chef Jonah Miller took off for Northern Spain to learn more. In April of this year, he opened his first restaurant, dedicated to the food he studied and fell in love with.</p><p><strong>I asked Jonah to describe some quintessential Basque dishes, and the overarching themes were salt cod and peppers.</strong></p><p><i>Salt Cod (in many forms), including:</i><br>- Kokotxas al Pil-Pil - Fish cheeks and throats in a \"pil-pil\" sauce, which refers to the sound made when shaking a cazuela to activate the natural gelatin in the fish cheeks.<br>- Tortilla de Bacalao - A salt cod omelet.<br>- Porrusalda - Potato, leek, salt cod soup.<br>Piperrada - Sauteed peppers (they use lots of peppers), onions, garlic and tomato, often served with a fried egg.<br>Stuffed Piquillo Peppers.<br>Marmitako - Tuna with potato and pepper stew.</p><p><strong>I also asked what some quintessential Basque beverages might be.</strong></p><blockquote><p>Sidra (cider), which is much dryer and funkier than ciders we are familiar with, and Txakoli, slightly effervescent white wine. Both are low in alcohol and highly acidic -- perfect to drink with pintxos.</p></blockquote><p><strong>So what are pintxos?</strong></p><blockquote><p>\"Pintxos are small, composed bites that unlike tapas, aren't meant to be shared,\" explained Miller. Fans of tapas but not always down to share every bite, we like the sound of pintxos. Basque restaurants are best known for pintxos, and at his restaurant, Miller naturally serves a variety.&nbsp;</p></blockquote><p>Among his favorites are:<br><i>Gildas - White anchovy, olive, and pickled pepper skewer (named after the 1946 Rita Hayworth role).</i><br><i>Soft Boiled Quail Egg with Black Anchovy and Piquillo Peppers.</i><br><i>Fried Eggplant with Honey and Goat Cheese (local eggplant just started).</i><br><i>Wood-Fired Chorizo with Pickled Carrots.</i></p><p><img src=\"/uploads/55_3a3cb7ffba_cf157a700b.jpg\" alt=\"Pintxos\">)</p><p><strong>Other than Pintxos, what are more distinguishing features of Basque cuisine that you won't find anywhere else?</strong></p><blockquote><p>Lots of salt cod. As far back at the 15th century Basques were the best ship builders in Europe and dominated the whaling trade. When the whaling trade dried up, they began going further into the north Atlantic to fish for cod, which they salted aboard the ship as a means of preservation and then brought home. So even though cod is not present in the waters around Spain, it is the fish most commonly used in the Basque country (though almost always dried). They use more Foie Gras than other areas of Spain.</p></blockquote><p><strong>Miller serves a lot of egg dishes at Huertas, so I wondered too how important eggs were in Basque cuisine.</strong></p><blockquote><p>In the Basque country, they enjoy eggs at all times of day throughout Spain... Eggs are often the canvas for beautiful seafood, produce, or charcuterie, such as wild mushrooms, local asparagus, Jamon...</p></blockquote><p><strong>I asked what brought him to Northern Spain in the first place and what drew him to the cuisine.</strong></p><blockquote><p>Ten years ago when I was growing up working in kitchens, Spain was at the forefront of influencing modern cooking techniques. So that was largely what attracted me to studying abroad in Madrid (as well as honing my Spanish speaking, which is helpful in NYC kitchens), as well as not knowing much about Spanish cuisine and looking forward to learning something new. When in Spain, I came to appreciate not the modern cooking, but how great the old-school pintxo and tapas bars were, how fun they were to dine in, and felt that we didn't have much representation for that experience in New York. Being a native New Yorker, I think we should have the best of everything available here, and wanted to bring more great Spanish food to our city.</p></blockquote><blockquote><p>The food and culture of the north of Spain translate better than the south of Spain to New York. For one thing, being closer to the rest of Europe, the north is more cosmopolitan and a bit more diverse. Also, the climate in the north (and accordingly produce) is not far off from that of New York.</p></blockquote><p><strong>Now I'm hungry. I asked what a typical way to start and end a Basque meal is.</strong></p><blockquote><p>To start, Txakolina and simply cooked seafood. [To finish,] there are some delicious Basque vermouths, which are a bit sweet and are had after dinner or often in the afternoon (some of which we offer, as well as making our own). They do make caramels and toffees, as well as Turron, an almond nougat. All traditional ends to a meal. There are also many cakes and tarts that are traditional.</p></blockquote><p><strong>So now that I'm ready to dive headfirst into Basque cuisine, what would be an approachable dish to try making at home?</strong></p><blockquote><p>Pintxos!! Go to Despana (a Spanish specialty foods store), pick up one or two cheeses, one or two cured meats, anchovies, a tin of seafood; the greenmarket for some seasonal produce and local honey; get some good bread, toothpicks, and start trying out different combinations. Try this cheese with honey and shaved carrots, those anchovies with tomato on toast.<br>&nbsp;</p></blockquote>"
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
                    "ckeditor_content": "<p>The world's first hamburger doesn't come from where you think it comes from. It wasn't invented in the United States, and it didn't originate in Germany. No, the world's first hamburger comes from China.</p><h3>Wait, what?</h3><p>If you're scratching your head right now, you're not alone. But Chinese hamburgers are very real and they definitely predate the <a href=\"https://www.huffpost.com/entry/the-16-essential-regional_b_5682151\">hamburgers we call our own</a> in the U.S. Known as rou jia mo, which translates to \"meat burger\" or \"meat sandwich,\" they consist of chopped meat inside a pita-like bun, and they've been around since the Qin dynasty, from about 221 BC to 207 BC. Despite the differences between this Chinese street food and our American-style <a href=\"https://www.huffpost.com/entry/perfect-way-to-eat-burger_n_4704188\">burgers</a>, the rou jia mo \"<a href=\"http://www.marcussamuelsson.com/news/street-food-rou-jia-mo-from-china\">has been called the world's first hamburger</a>\".</p><p>The rou jia mo originated in the Shaanxi Province of China, and is now eaten all over the country. It's typically prepared and eaten on the street. The dough for the bun, or mo, consists of a simple mixture of wheat flour, water and maybe yeast. Of course recipes may vary, but this basic equation makes for a chewy and subtle pillow for the delicious filling. While the mo is <a href=\"https://www.starchefs.com/cook/savory/technique/rou-jia-mo-chinese-hamburger\">traditionally baked in a clay oven</a>, today it's often fried in a pan. They may look a little like <a href=\"https://www.huffpost.com/entry/bao-facts_n_5000963\">Chinese steamed buns or baos</a>, but the dough for those is, of course, steamed, not baked or fried.</p><figure class=\"image image-style-side\"><img src=\"/uploads/fe006ed91f619568081af52979b77af3_52cac17456.jpeg\" alt=\"fe006ed91f619568081af52979b77af3.jpeg\"></figure><p>The meat filling might consist of chopped pork, beef, lamb, or chicken that has been stewed with a variety of spices, like ginger, cloves, coriander, and star anise. You might also find herbs like cilantro or greens like lettuce garnishing the sandwich.</p><p>If you've never had a Chinese hamburger, now is as great a time as any to try one. <a href=\"http://www.chinasichuanfood.com/chinese-hamburger-pork-belly-buns/\">See here for a recipe for rou ji mo</a>, or watch the video below for step-by-step instructions for another great Chinese hamburger recipe.</p><p><br>&nbsp;</p>"
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
                    "ckeditor_content": "<p>Across the globe, there are many cultural differences that define each country. As a traveler, it’s important to educate yourself on what you should and shouldn’t do when visiting a new locale.</p><p>And since food is such a big part of travel, it’s important to learn the dining etiquette of each nation. It differs greatly from place to place. For example, in many areas of China it’s considered a compliment to [burp after a meal](https://www.buzzfeed.com/adamellis/surprising-food-etiquette-rules-from-around-the-world) ― a sign that you’ve eaten well ― while stateside, that same act will get you some serious side-eye.</p><p>One easy way you can commit a faux pas while eating abroad is with your plate ― should you wipe it clean or leave some food? It all depends on where you are.</p><p>Here are four nations where what you do with your plate matters. Study up before you make another big trip.</p><h3>India</h3><p>In India, you <a href=\"https://www.thrillist.com/eat/nation/international-food-customs-8-weird-food-etiquette-trends-from-around-the-world-thrillist-nation\">should finish everything</a> that is on your plate because it is <a href=\"http://www.culturewavesglobal.com/india-etiquette-\">considered a respect for the served food</a>, and food in India is considered sacred. In South India, where food can be served on a banana leaf, it is polite to fold your leaf over from the top ― not from the bottom, because <a href=\"http://www.cntraveler.com/stories/2007-10-17/etiquette-101-india\">that indicates you were not satisfied</a>.</p><h3>Japan</h3><p>The same is true about finishing your plate in Japan. The Japanese consider it <a href=\"http://www.japan-talk.com/jt/new/in-Japan-you-need-to-finish-your-plate\">rude to leave food on your plate</a>, whether at home or at a restaurant. It’s related to one of the fundamental concepts in Japanese culture, <a href=\"http://www.abc.net.au/radionational/programs/philosopherszone/avoiding-waste-with-the-japanese-concept-of-'mottainai'/6722720\">mottainai</a>, which is a feeling of regret at having wasted something.</p><h3>China</h3><p>In China, however, leaving behind an empty plate is a <a href=\"https://www.thrillist.com/eat/nation/international-food-customs-8-weird-food-etiquette-trends-from-around-the-world-thrillist-nation\">sign to the host that you’re still hungry</a>. If you don’t want to eat more food, consider leaving a little behind to let the host know <a href=\"http://www.healthytravelblog.com/2012/08/10/travel-etiquette-part-3-eating-without-embarrassing-yourself/\">you have had enough</a>.</p><p>&nbsp;</p><h3>Ethiopia</h3><p>Ethiopians don’t even bother with plates. Individual plates <a href=\"https://www.lonelyplanet.com/asia/travel-tips-and-articles/76513?lpaffil=lp-affiliates\">are considered wasteful</a>. Folks share meals off of <a href=\"http://www.foodbycountry.com/Algeria-to-France/Ethiopia.html\">one big communal plate</a> and generally eat with their hands using injera ― a type of flatbread ― to pick up the food. So, don’t even think about asking for your own plate.<br>&nbsp;</p>"
                  }
                }
              ]
            }
          },
          {
            "id": 1,
            "__component": "blocks.faq",
            "title": "Frequently asked questions",
            "theme": "muted"
          },
          {
            "id": 1,
            "__component": "blocks.cta-command-line",
            "theme": "secondary",
            "title": "Want to give it a try with a brand new project?",
            "text": "Up & running in seconds 🚀",
            "commandLine": "npx create-strapi-app my-project --quickstart"
          }
        ]
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
        "ckeditor_content": "<p>Across the globe, there are many cultural differences that define each country. As a traveler, it’s important to educate yourself on what you should and shouldn’t do when visiting a new locale.</p><p>And since food is such a big part of travel, it’s important to learn the dining etiquette of each nation. It differs greatly from place to place. For example, in many areas of China it’s considered a compliment to [burp after a meal](https://www.buzzfeed.com/adamellis/surprising-food-etiquette-rules-from-around-the-world) ― a sign that you’ve eaten well ― while stateside, that same act will get you some serious side-eye.</p><p>One easy way you can commit a faux pas while eating abroad is with your plate ― should you wipe it clean or leave some food? It all depends on where you are.</p><p>Here are four nations where what you do with your plate matters. Study up before you make another big trip.</p><h3>India</h3><p>In India, you <a href=\"https://www.thrillist.com/eat/nation/international-food-customs-8-weird-food-etiquette-trends-from-around-the-world-thrillist-nation\">should finish everything</a> that is on your plate because it is <a href=\"http://www.culturewavesglobal.com/india-etiquette-\">considered a respect for the served food</a>, and food in India is considered sacred. In South India, where food can be served on a banana leaf, it is polite to fold your leaf over from the top ― not from the bottom, because <a href=\"http://www.cntraveler.com/stories/2007-10-17/etiquette-101-india\">that indicates you were not satisfied</a>.</p><h3>Japan</h3><p>The same is true about finishing your plate in Japan. The Japanese consider it <a href=\"http://www.japan-talk.com/jt/new/in-Japan-you-need-to-finish-your-plate\">rude to leave food on your plate</a>, whether at home or at a restaurant. It’s related to one of the fundamental concepts in Japanese culture, <a href=\"http://www.abc.net.au/radionational/programs/philosopherszone/avoiding-waste-with-the-japanese-concept-of-'mottainai'/6722720\">mottainai</a>, which is a feeling of regret at having wasted something.</p><h3>China</h3><p>In China, however, leaving behind an empty plate is a <a href=\"https://www.thrillist.com/eat/nation/international-food-customs-8-weird-food-etiquette-trends-from-around-the-world-thrillist-nation\">sign to the host that you’re still hungry</a>. If you don’t want to eat more food, consider leaving a little behind to let the host know <a href=\"http://www.healthytravelblog.com/2012/08/10/travel-etiquette-part-3-eating-without-embarrassing-yourself/\">you have had enough</a>.</p><p>&nbsp;</p><h3>Ethiopia</h3><p>Ethiopians don’t even bother with plates. Individual plates <a href=\"https://www.lonelyplanet.com/asia/travel-tips-and-articles/76513?lpaffil=lp-affiliates\">are considered wasteful</a>. Folks share meals off of <a href=\"http://www.foodbycountry.com/Algeria-to-France/Ethiopia.html\">one big communal plate</a> and generally eat with their hands using injera ― a type of flatbread ― to pick up the food. So, don’t even think about asking for your own plate.<br>&nbsp;</p>",
        "blocks": [
          {
            "id": 3,
            "__component": "blocks.cta-command-line",
            "theme": "secondary",
            "title": "Get started with a brand new project!",
            "text": "Up & running in seconds 🚀",
            "commandLine": "npx create-strapi-app my-project --quickstart"
          }
        ]
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

#### Detailed population strategy

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
