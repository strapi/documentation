---
title: Entity Service API - Populating - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Entity Service API: Populating

The [Entity Service API](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) does not populate relations, components or dynamic zones by default.

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

An object can be passed for more advanced usage:

```js
strapi.entityService('api::article.article').findMany({
  populate: {
    componentB: true,
    dynamiczoneA: true,
    repeatableComponent: {
      fields: [],
      filters: {},
      sort: 'field:asc',
      populate: {},
    },
  },
});
```

Complex populating can also be achieved by using the [`filters` parameter](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.md) and select or populate nested relations or components:

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
      select: ['someAttributeName'],
      orderBy: ['someAttributeName'],
      populate: {
        componentRelationA: true,
      },
    },
  },
});
```
