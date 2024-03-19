---
title: REST API reference
description: Interact with your Content-Types using the REST API endpoints Strapi generates for you.
displayed_sidebar: restApiSidebar

---

# REST API

The REST API allows accessing the [content-types](/dev-docs/backend-customization/models) through API endpoints. Strapi automatically creates [API endpoints](#endpoints) when a content-type is created. [API parameters](/dev-docs/api/rest/parameters) can be used when querying API endpoints to refine the results.

:::caution
All content types are private by default and need to be either made public or queries need to be authenticated with the proper permissions. See the [Quick Start Guide](/dev-docs/quick-start#step-3-set-roles--permissions), the user guide for the [Users & Permissions plugin](/user-docs/users-roles-permissions/configuring-end-users-roles), and [API tokens configuration documentation](/dev-docs/configurations/api-tokens) for more details.
:::

:::note
By default, the REST API responses only include top-level fields and does not populate any relations, media fields, components, or dynamic zones. Use the [`populate` parameter](/dev-docs/api/rest/populate-select) to populate specific fields. Ensure that the find permission is given to the field(s) for the relation(s) you populate.
:::

:::strapi Upload plugin API
The Upload plugin (which handles media found in the [Media Library](/user-docs/media-library)) has a specific API described in the [Upload plugin documentation](/dev-docs/plugins/upload).
:::

## Endpoints

For each Content-Type, the following endpoints are automatically generated:

<Tabs groupId="collection-single">

<TabItem value="collection-type" label="Collection type">

| Method   | URL                             | Description                           |
| -------- | ------------------------------- | ------------------------------------- |
| `GET`    | `/api/:pluralApiId`             | [Get a list of entries](#get-entries) |
| `POST`   | `/api/:pluralApiId`             | [Create an entry](#create-an-entry)   |
| `GET`    | `/api/:pluralApiId/:documentId` | [Get an entry](#get-an-entry)         |
| `PUT`    | `/api/:pluralApiId/:documentId` | [Update an entry](#update-an-entry)   |
| `DELETE` | `/api/:pluralApiId/:documentId` | [Delete an entry](#delete-an-entry)   |

</TabItem>

<TabItem value="single-type" label="Single type">

| Method   | URL                   | Description                                |
| -------- | --------------------- | ------------------------------------------ |
| `GET`    | `/api/:singularApiId` | [Get an entry](#get-an-entry)              |
| `PUT`    | `/api/:singularApiId` | [Update/Create an entry](#update-an-entry) |
| `DELETE` | `/api/:singularApiId` | [Delete an entry](#delete-an-entry)        |

</TabItem>

</Tabs>

<details>

<summary>Examples:</summary>

<Tabs groupId="collection-single">

<TabItem value="collection-type" label="Collection type">

`Restaurant` **Content type**

| Method | URL                      | Description               |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/restaurants`       | Get a list of restaurants |
| POST   | `/api/restaurants`       | Create a restaurant       |
| GET    | `/api/restaurants/:id`   | Get a specific restaurant |
| DELETE | `/api/restaurants/:id`   | Delete a restaurant       |
| PUT    | `/api/restaurants/:id`   | Update a restaurant       |

</TabItem>

<TabItem value="single-type" label="Single type">

`Homepage` **Content type**

| Method | URL             | Description                        |
| ------ | --------------- | ---------------------------------- |
| GET    | `/api/homepage` | Get the homepage content           |
| PUT    | `/api/homepage` | Update/create the homepage content |
| DELETE | `/api/homepage` | Delete the homepage content        |

</TabItem>
</Tabs>
</details>

:::note
[Components](/dev-docs/backend-customization/models#components) don't have API endpoints.
:::

:::tip
API endpoints are prefixed with `/api` by default. This can be changed by setting a different value for the `rest.prefix` configuration parameter (see [API calls configuration](/dev-docs/configurations/api)).
:::

## Requests

Requests return a response as an object which usually includes the following keys:

- `data`: the response data itself, which could be:
  - a single entry, as an object with the following keys:
    - `id` (number)
    - `attributes` (object)
    - `meta` (object)
  - a list of entries, as an array of objects
  - a custom response

- `meta` (object): information about pagination, publication state, available locales, etc.

- `error` (object, _optional_): information about any [error](/dev-docs/error-handling) thrown by the request

:::note
Some plugins (including Users & Permissions and Upload) may not follow this response format.
:::

<SideBySideContainer>

<SideBySideColumn>

### Get entries

Returns entries matching the query filters (see [API parameters](/dev-docs/api/rest/parameters) documentation).

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request>

`GET http://localhost:1337/api/restaurants`

</Request>

<Response>

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Restaurant A",
        "description": "Restaurant A's description"
      },
      "meta": {
        "availableLocales": []
      }
    },
    {
      "id": 2,
      "attributes": {
        "title": "Restaurant B",
        "description": "Restaurant B's description"
      },
      "meta": {
        "availableLocales": []
      }
    },
  ],
  "meta": {}
}

```

</Response>

</ApiCall>

</SideBySideColumn>

</SideBySideContainer>

<SideBySideContainer>

<SideBySideColumn>

### Get an entry

Returns an entry by `id`.

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request title="Example request">

`GET http://localhost:1337/api/restaurants/1`

</Request>

<Response title="Example response">

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Restaurant A",
      "description": "Restaurant A's description"
    },
    "meta": {
      "availableLocales": []
    }
  },
  "meta": {}
}

```

</Response>

</ApiCall>

</SideBySideColumn>

</SideBySideContainer>

<SideBySideContainer>

<SideBySideColumn>

### Create an entry

Creates an entry and returns its value.

If the [Internationalization (i18n) plugin](/dev-docs/plugins/i18n.md) is installed, it's possible to use POST requests to the REST API to [create localized entries](/dev-docs/plugins/i18n.md#creating-a-new-localized-entry).

:::note
While creating an entry, you can define its relations and their order (see [Managing relations through the REST API](/dev-docs/api/rest/relations.md) for more details).
:::

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request title="Example request">

`POST http://localhost:1337/api/restaurants`

```json
{
  "data": {
    "title": "Hello",
    "relation_field_a": 2,
    "relation_field_b": [2, 4],
    "link": {
      "id": 1,
      "type": "abc"
    }
  }
}
```

</Request>

<Response title="Example response">

```json
{
  "data": {
    "id": 1,
    "attributes": { … },
    "meta": {}
  },
  "meta": {}
}
```

</Response>

</ApiCall>

</SideBySideColumn>
</SideBySideContainer>


<SideBySideContainer>

<SideBySideColumn>

### Update an entry

Partially updates an entry by `id` and returns its value.

Fields that aren't sent in the query are not changed in the database. Send a `null` value to clear fields.

:::note NOTES
* Even with the [Internationalization (i18n) plugin](/dev-docs/plugins/i18n) installed, it's currently not possible to [update the locale of an entry](/dev-docs/plugins/i18n#updating-an-entry).
* While updating an entry, you can define its relations and their order (see [Managing relations through the REST API](/dev-docs/api/rest/relations.md) for more details).
:::

</SideBySideColumn>

<SideBySideColumn>

<ApiCall>

<Request title="Example request">

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  "data": {
    "title": "Hello",
    "relation_field_a": 2,
    "relation_field_b": [2, 4],
  }
}
```

</Request>

<Response title="Example response">

```json
{
  "data": {
    "id": 1,
    "attributes": {},
    "meta": {}
  },
  "meta": {}
}
```

</Response>

</ApiCall>

</SideBySideColumn>
</SideBySideContainer >

<SideBySideContainer>

<SideBySideColumn>

### Delete an entry

Deletes an entry by `id` and returns its value.
</SideBySideColumn>

<SideBySideColumn>
<ApiCall>

<Request title="Example request">

`DELETE http://localhost:1337/api/restaurants/1`

</Request>

<Response title="Example response">

```json
{
  "data": {
    "id": 1,
    "attributes": {},
    "meta": {}
  },
  "meta": {}
}
```

</Response>

</ApiCall>

</SideBySideColumn>
</SideBySideContainer>
