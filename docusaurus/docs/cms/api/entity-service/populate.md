---
title: Populating with the Entity Service API
description: Use Strapi's Entity Service API to populate relations in your queries.
displayed_sidebar: cmsSidebar
unlisted: true
---

import ESdeprecated from '/docs/snippets/entity-service-deprecated.md'

# Populating with the Entity Service API

<ESdeprecated />

The [Entity Service API](/cms/api/entity-service) does not populate relations, components or dynamic zones by default, which means an Entity Service API query that does not use the `populate` parameter will not return information about relations, components, or dynamic zones.

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

Complex populating can be achieved by using the [`filters` parameter](/cms/api/entity-service/filter) and select or populate nested relations or components:

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

## Populate fragments

When dealing with polymorphic content structures (dynamic zones, polymorphic relations, etc...), it is possible to use populate fragments to have a better granularity on the populate strategy.

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  populate: {
    dynamicZone: {
      on: {
        'components.foo': {
          fields: ['title'],
          filters: { title: { $contains: 'strapi' } },
        },
        'components.bar': {
          fields: ['name'],
        },
      },
    },

    morphAuthor: {
      on: {
        'plugin::users-permissions.user': {
          fields: ['username'],
        },
        'api::author.author': {
          fields: ['name'],
        },
      },
    },
  },
});
```
