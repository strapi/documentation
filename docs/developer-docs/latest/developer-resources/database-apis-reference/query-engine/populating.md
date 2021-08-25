---
title: Populating for Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API: Populating

Relations and components have a unified API for populating them.

To populate all the root level relations, use `populate: true`:

```js
db.query('article').findMany({
  populate: true,
});
```

Select which data to populate by passing an array of attribute names:

```js
db.query('article').findMany({
  populate: ['componentA', 'relationA'],
});
```

An object can be passed for more advanced usage:

```js
db.query('article').findMany({
  populate: {
    componentB: true,
    dynamiczoneA: true,
    relation: someLogic || true,
  },
});
```

Complex populating can also be achieved by applying `where` filters and select or populate nested relations:

```js
db.query('article').findMany({
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

    // NOTE: We can't do the same on dynamic zones as their polymorphic nature prevents it for now.
    // We will explore some concepts like GraphQL fragments to allow this later on
    dynamiczoneA: true,
  },
});
```

<!-- TODO: check with devs and uncomment this when ready/implemented -->
<!-- ## Populating Components and Dynamic Zones

Components won't be populated by default in the DB layer. We will allow populating them like relations to have more features. This will allow more efficent DB queries for usecase that don't need the components.

We will however keep the auto populate in the business logic layer for the components so the Admin panel have the right data. We should think about it for the REST API (should it be optional or not).

This will also allow filtering on them & ordering them like a simple relation.

```js
db.query('article').findMany({
  populate: {
    componentB: true,
    dynamiczoneA: true,
  },
});

db.query('article').findMany({
  populate: {
    repeatableComponent: {
      select: [],
      limit: 2,
      offset: 10,
      orderBy: { field: 'asc' },
      populate: {},
    },
    // We can't do the same on dynamic zones as their polymorphic nature prevents it.
    dynamiczoneA: true,
  },
});
``` -->
