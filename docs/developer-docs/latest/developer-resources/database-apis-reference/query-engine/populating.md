---
title: Populating for Query Engine API - Strapi Developer Docs
description: Use Strapi's Query Engine API to populate relations when querying your content.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.html
---

# Query Engine API: Populating

Relations and components have a unified API for populating them.

To populate all the root level relations, use `populate: true`:

```js
strapi.db.query('api::article.article').findMany({
  populate: true,
});
```

Select which data to populate by passing an array of attribute names:

```js
strapi.db.query('api::article.article').findMany({
  populate: ['componentA', 'relationA'],
});
```

An object can be passed for more advanced usage:

```js
strapi.db.query('api::article.article').findMany({
  populate: {
    componentB: true,
    dynamiczoneA: true,
    relation: someLogic || true,
  },
});
```

Complex populating can also be achieved by applying `where` filters and select or populate nested relations:

```js
strapi.db.query('api::article.article').findMany({
  populate: {
    relationA: {
      where: {
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

    dynamiczoneA: true,
  },
});
```

When dealing with polymorphic data structures (dynamic zones, polymorphic relations, etc...), it is possible to use populate fragments to have a better granularity on the populate strategy.

```js
strapi.db.query('api::article.article').findMany('api::article.article', {
  populate: {
    dynamicZone: {
      on: {
        'components.foo': {
          select: ['title'],
          where: { title: { $contains: 'strapi' } },
        },
        'components.bar': {
          select: ['name'],
        },
      },
    },

    morphAuthor: {
      on: {
        'plugin::users-permissions.user': {
          select: ['username'],
        },
        'api::author.author': {
          select: ['name'],
        },
      },
    },
  },
});
```
