---
title: Entity Service API - Populating - Strapi Developer Docs
description: Use Strapi's Entity Service API to populate relations in your queries.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.html
---

# Entity Service API: Populating

The [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) does not populate relations, components or dynamic zones by default.

## Basic populating

To populate all the root level relations, use `populate: '*'`:
```js
const entries = await strapi.entityService.findMany('api::article.article', {
  populate: '*',
});
```

Populate various component or relation fields by passing an array of attribute names:

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  populate: ['componentA', 'relationA'],
});
```

## Advanced populating

An object can be passed for more advanced populating:

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  populate: {
    relationA: true,
    repeatableComponent: {
      fields: ['fieldA'],
      filters: {},
      sort: 'fieldA:asc',
      populate: {
        relationB: true,
      },
    },
  },
});
```

Complex populating can be achieved by using the [`filters` parameter](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.md) and select or populate nested relations or components:

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  populate: {
    relationA: {
      filters: {
        name: {
          $contains: 'Strapi',
        },
      },
    },

    repeatableComponent: {
      fields: ['someAttributeName'],
      sort: ['someAttributeName'],
      populate: {
        componentRelationA: true,
      },
    },
  },
});
```
