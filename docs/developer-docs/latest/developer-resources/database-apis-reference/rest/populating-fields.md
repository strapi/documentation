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
    //..
  }
}
```

:::
::::

:::note
By default all normal fields are selected, but you can specify a wildcard `*` instead of an array.
:::

## Population

Queries can accept a `populate` parameter to populate various field types:

- [Relations & Media Fields](#relation-media-fields)
- [Components & Dynamic Zones](#component-dynamic-zones)

It is also possible to [combine `population` and `fields`](#combining-population-with-other-operators) among various other operators to have much more control over the population.

:::caution
By default Strapi will not populate any type of fields
:::

:::caution
At this time there is no mechanism to return just an array of IDs. This is something that is currently under discussion.
:::

### Relation & Media fields

By default, relations are not populated when fetching entries.

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax:

`GET /api/:pluralApiId?populate=field1,field2`

::: request Example request: Get books and populate relations with the author's name and address
`GET /api/books?populate=author.name,author.address`
:::

For convenience, the `*` wildcard can be used to populate all first-level relations:

::: request Example request: Get all books and populate all their first-level relations
`GET /api/books?populate=*`
:::

::: request Example request: Get all books and populate with authors and all their relations
`GET /api/books?populate[author]=*`
:::

<br/>

Only first-level relations are populated with `populate=*`. Use the LHS bracket syntax (i.e. `[populate]=*`) to populate deeper:

::: request Example request: Get all relations nested inside a "navigation" component in the "global" single type
`GET /api/global?populate[navigation][populate]=*`
:::

:::tip
Adding `?populate=*` to the query URL will include dynamic zones in the results.
:::

### Component & Dynamic Zones

### Combining Population with other operators
