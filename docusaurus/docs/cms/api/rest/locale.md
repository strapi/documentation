---
title: Locale
description: Browse the REST API reference for the locale parameter to take advantage of the Internationalization feature through REST.
toc_max_heading_level: 5
tags:
- REST API
- Internationalization
- API
- locale
- Content API
- find
- interactive query builder
- qs library
---

import QsIntroFull from '/docs/snippets/qs-intro-full.md'
import QsForQueryBody from '/docs/snippets/qs-for-query-body.md'
import QsForQueryTitle from '/docs/snippets/qs-for-query-title.md'

# REST API: `locale`

The [Internationalization (i18n) feature](/cms/features/internationalization) adds new abilities to the [REST API](/cms/api/rest).

:::prerequisites
To work with API content for a locale, please ensure the locale has been already [added to Strapi in the admin panel](/cms/features/internationalization#settings).
:::

The `locale` [API parameter](/cms/api/rest/parameters) can be used to work with documents only for a specified locale. `locale` takes a locale code as a value (see [full list of available locales](https://github.com/strapi/strapi/blob/main/packages/plugins/i18n/server/src/constants/iso-locales.json)).

:::tip
If the `locale` parameter is not defined, it will be set to the default locale. `en` is the default locale when a new Strapi project is created, but another locale can be [set as the default locale](/cms/features/internationalization#settings) in the admin panel.

For instance, by default, a GET request to `/api/restaurants` will return the same response as a request to `/api/restaurants?locale=en`.
:::

The following table lists the new possible use cases added by i18n to the REST API and gives syntax examples (you can click on requests to jump to the corresponding section with more details):

<Tabs groupId="collection-single">

<TabItem value="collection" label="For collection types">

| Use case | Syntax example<br/>and link for more information |
|---------|-------|
| Get all documents in a specific locale | [`GET /api/restaurants?locale=fr`](#rest-get-all) |
| Get a specific locale version for a document | [`GET /api/restaurants/abcdefghijklmno456?locale=fr`](#get-one-collection-type) |
| Create a new document for the default locale | [`POST /api/restaurants`](#rest-create-default-locale)<br/>+ pass attributes in the request body |
| Create a new document for a specific locale | [`POST /api/restaurants`](#rest-create-specific-locale)<br/>+ pass attributes **and locale** in the request body |
| Create a new, or update an existing, locale version for an existing document | [`PUT /api/restaurants/abcdefghijklmno456?locale=fr`](#rest-put-collection-type)<br/>+ pass attributes in the request body |
| Delete a specific locale version of a document | [`DELETE /api/restaurants/abcdefghijklmno456?locale=fr`](#rest-delete-collection-type) |

</TabItem>

<TabItem value="single" label="For single types">

| Use case                                     | Syntax example<br/>and link for more information |
|----------------------------------------------|--------------------------------------------------|
| Get a specific locale version for a document | [`GET /api/homepage?locale=fr`](#get-one-single-type)  |
| Create a new, or update an existing, locale version for an existing document | [`PUT /api/homepage?locale=fr`](#rest-put-single-type)<br/>+ pass attributes in the request body |
| Delete a specific locale version of a document | [`DELETE /api/homepage?locale=fr`](#rest-delete-single-type) |

</TabItem>
</Tabs>

### `GET` Get all documents in a specific locale {#rest-get-all}

<ApiCall>

<Request> 

`GET http://localhost:1337/api/restaurants?locale=fr`

</Request>

<Response> 

```json
{
  "data": [
    {
      "id": 5,
      "documentId": "h90lgohlzfpjf3bvan72mzll",
      "Title": "Meilleures pizzas",
      "Body": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "On déguste les meilleures pizzas de la ville à la Pizzeria Arrivederci."
            }
          ]
        }
      ],
      "createdAt": "2024-03-06T22:08:59.643Z",
      "updatedAt": "2024-03-06T22:10:21.127Z",
      "publishedAt": "2024-03-06T22:10:21.130Z",
      "locale": "fr"
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

### `GET` Get a document in a specific locale {#rest-get}

To get a specific document in a given locale, add the `locale` parameter to the query:

| Use case             | Syntax format and link for more information                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| In a collection type | [`GET /api/content-type-plural-name/document-id?locale=locale-code`](#get-one-collection-type) |
| In a single type     | [`GET /api/content-type-singular-name?locale=locale-code`](#get-one-single-type)               |

#### Collection types {#get-one-collection-type}

To get a specific document in a collection type in a given locale, add the `locale` parameter to the query, after the `documentId`:

<ApiCall>

<Request>

`GET /api/restaurants/lr5wju2og49bf820kj9kz8c3?locale=fr`

</Request>

<Response>

```json
{
  "data": [
    {
      "id": 22,
      "documentId": "lr5wju2og49bf820kj9kz8c3",
      "Name": "Biscotte Restaurant",
      "Description": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Bienvenue au restaurant Biscotte! Le Restaurant Biscotte propose une cuisine à base de produits frais et de qualité, souvent locaux, biologiques lorsque cela est possible, et toujours produits par des producteurs passionnés."
            }
          ]
        }
      ],
      // …
      "locale": "fr"
    },
    // …
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 3
    }
  }
}
```

</Response>

</ApiCall>

#### Single types {#get-one-single-type}

To get a specific single type document in a given locale, add the `locale` parameter to the query, after the single type name:

<ApiCall>

<Request>

`GET /api/homepage?locale=fr`

</Request>

<Response>

```json
{
  "data": {
    "id": 10,
    "documentId": "ukbpbnu8kbutpn98rsanyi50",
    "Title": "Page d'accueil",
    "Body": null,
    "createdAt": "2024-03-07T13:28:26.349Z",
    "updatedAt": "2024-03-07T13:28:26.349Z",
    "publishedAt": "2024-03-07T13:28:26.353Z",
    "locale": "fr"
  },
  "meta": {}
}
```

</Response>

</ApiCall>

### `POST` Create a new localized document for a collection type {#rest-create}

To create a localized document from scratch, send a POST request to the Content API. Depending on whether you want to create it for the default locale or for another locale, you might need to pass the `locale` parameter in the request's body

| Use case                      | Syntax format and link for more information                                               |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Create for the default locale | [`POST /api/content-type-plural-name`](#rest-create-default-locale) |
| Create for a specific locale  | [`POST /api/content-type-plural-name`](#rest-create-specific-locale)<br/>+ pass locale in request body               |

#### For the default locale {#rest-create-default-locale}

If no locale has been passed in the request body, the document is created using the default locale for the application:

<ApiCall>
<Request> 

`POST http://localhost:1337/api/restaurants`

```json
{
  "data": {
    "Name": "Oplato",
  }
}
```

</Request>

<Response>

```json
{
  "data": {
    "id": 13,
    "documentId": "jae8klabhuucbkgfe2xxc5dj",
    "Name": "Oplato",
    "Description": null,
    "createdAt": "2024-03-06T22:19:54.646Z",
    "updatedAt": "2024-03-06T22:19:54.646Z",
    "publishedAt": "2024-03-06T22:19:54.649Z",
    "locale": "en"
  },
  "meta": {}
}
```

</Response>
</ApiCall>

#### For a specific locale {#rest-create-specific-locale}

To create a localized entry for a locale different from the default one, add the `locale` attribute to the body of the POST request:

<ApiCall>
<Request>

`POST http://localhost:1337/api/restaurants`

```json {4}
{
  "data": {
    "Name": "She's Cake",
    "locale": "fr"
  }
}
```

</Request>

<Response>

```json
{
  "data": {
    "id": 15,
    "documentId": "ldcmn698iams5nuaehj69j5o",
    "Name": "She's Cake",
    "Description": null,
    "createdAt": "2024-03-06T22:21:18.373Z",
    "updatedAt": "2024-03-06T22:21:18.373Z",
    "publishedAt": "2024-03-06T22:21:18.378Z",
    "locale": "en"
  },
  "meta": {}
}
```

</Response>
</ApiCall>

### `PUT` Create a new, or update an existing, locale version for an existing document {#rest-update}

With `PUT` requests sent to an existing document, you can:

- create another locale version of the document,
- or update an existing locale version of the document.

Send the `PUT` request to the appropriate URL, adding the `locale=your-locale-code` parameter to the query URL and passing attributes in a `data` object in the request's body:

| Use case             | Syntax format and link for more information                                               |
| -------------------- | --------------------------------------------------------------------------------------- |
| In a collection type | [`PUT /api/content-type-plural-name/document-id?locale=locale-code`](#rest-put-collection-type) |
| In a single type     | [`PUT /api/content-type-singular-name?locale=locale-code`](#rest-put-single-type)               |

:::caution
When creating a localization for existing localized entries, the body of the request can only accept localized fields.
:::

:::tip
The Content-Type should have the [`createLocalization` permission](/cms/features/users-permissions/configuring-administrator-roles#collection-and-single-types) enabled, otherwise the request will return a `403: Forbidden` status.
:::

:::note
It is not possible to change the locale of an existing localized entry. When updating a localized entry, if you set a `locale` attribute in the request body it will be ignored.
:::

#### In a collection type {#rest-put-collection-type}

To create a new locale for an existing document in a collection type, add the `locale` parameter to the query, after the `documentId`, and pass data to the request's body:

<ApiCall noSideBySide>

<Request title="Example request: Creating a French locale for an existing restaurant">

`PUT http://localhost:1337/api/restaurants/lr5wju2og49bf820kj9kz8c3?locale=fr`

```json
{
  data: {
    "Name": "She's Cake in French",
  }
}
```

</Request>

<Response>

```json
{
  "data": {
    "id": 19,
    "documentId": "lr5wju2og49bf820kj9kz8c3",
    "Name": "She's Cake in French",
    "Description": null,
    "createdAt": "2024-03-07T12:13:09.551Z",
    "updatedAt": "2024-03-07T12:13:09.551Z",
    "publishedAt": "2024-03-07T12:13:09.554Z",
    "locale": "fr"
  },
  "meta": {}
}
```

</Response>

</ApiCall>

#### In a single type {#rest-put-single-type}

To create a new locale for an existing single type document, add the `locale` parameter to the query, after the single type name, and pass data to the request's body:

<ApiCall>

<Request title="Example: Create a FR locale for an existing Homepage single type">

`PUT http://localhost:1337/api/homepage?locale=fr`

```json
{
  "data": {
    "Title": "Page d'accueil"
  }
}
```

</Request>

<Response>

```json
{
  "data": {
    "id": 10,
    "documentId": "ukbpbnu8kbutpn98rsanyi50",
    "Title": "Page d'accueil",
    "Body": null,
    "createdAt": "2024-03-07T13:28:26.349Z",
    "updatedAt": "2024-03-07T13:28:26.349Z",
    "publishedAt": "2024-03-07T13:28:26.353Z",
    "locale": "fr"
  },
  "meta": {}
}
```

</Response>

</ApiCall>

<br/>

### `DELETE` Delete a locale version of a document {#rest-delete}

To delete a locale version of a document, send a `DELETE` request with the appropriate `locale` parameter.

`DELETE` requests only send a 204 HTTP status code on success and do not return any data in the response body.

#### In a collection type {#rest-delete-collection-type}

To delete only a specific locale version of a document in a collection type, add the `locale` parameter to the query after the `documentId`:

<Request>

`DELETE /api/restaurants/abcdefghijklmno456?locale=fr`

</Request>

#### In a single type {#rest-delete-single-type}

To delete only a specific locale version of a single type document, add the `locale` parameter to the query after the single type name:

<Request>

`DELETE /api/homepage?locale=fr`

</Request>
