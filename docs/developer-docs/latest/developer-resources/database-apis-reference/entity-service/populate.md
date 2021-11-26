---
title: Entity Service API - Populating - Strapi Developer Docs
description: Use Strapi's Entity Service API to populate relations in your queries.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.html
---

# Entity Service API: Populating

The [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) does not populate relations, components or dynamic zones by default.

## Basic populating

To populate all the root level relations, use `populate: true`:

```js
strapi.entityService('api::article.article').findMany({
  populate: true,
});
```

Select which data to populate by passing an array of attribute names:

```js
strapi.entityService('api::article.article').findMany({
  populate: ['componentA', 'relationA'],
});
```

## Advanced populating

An object can be passed for more advanced populating:

```js
strapi.entityService('api::article.article').findMany({
  populate: {
    componentB: true,
    dynamiczoneA: true,
    repeatableComponent: {
      fields: ['fieldA'],
      filters: {},
      sort: 'fieldA:asc',
      populate: false,
    },
  },
});
```

Complex populating can be achieved by using the [`filters` parameter](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.md) and select or populate nested relations or components:

```js
strapi.entityService('api::article.article').findMany({
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
      orderBy: ['someAttributeName'],
      populate: {
        componentRelationA: true,
      },
    },
  },
});
```
