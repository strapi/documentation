---
title: Filtering with Entity Service API - Strapi Developer Documentation
description: …
---

<!-- TODO: update SEO -->

# Entity Service API: Components and dynamic zones

The [Entity Service](/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.md) is the layer that handles [components](/developer-docs/latest/development/backend-customization/models.html#components-2) and [dynamic zones](/developer-docs/latest/development/backend-customization/models.html#dynamic-zones) logic. With the Entity Service API, components and dynamic zones can be [created](#creation) and [updated](#update) while creating or updating entries.

## Creation

A [component](/developer-docs/latest/development/backend-customization/models.html#components-2) can be created while creating an entry with the Entity Service API:

```js
strapi.entityService.create('api::article.article', {
  data: {
    myComponent: {
      foo: 'bar',
    },
  },
});
```

A [dynamic zone](/developer-docs/latest/development/backend-customization/models.html#dynamic-zones) (i.e. a list of components) can be created while creating an entry with the Entity Service API:

```js
strapi.entityService.create('api::article.article', {
  data: {
    myDynamicZone: [
      {
        __component: 'compo.type',
        foo: 'bar',
      },
      {
        __component: 'compo.type2',
        foo: 'bar',
      },
    ],
  },
});
```

## Update

A [component](/developer-docs/latest/development/backend-customization/models.html#components-2) can be updated while updating an entry with the Entity Service API. If a component `id` is specified, the component is updated, otherwise the old one is deleted and a new one is created:

```js
strapi.entityService.update('api::article.article', 1, {
  data: {
    myComponent: {
      id: 1, // will update component with id: 1 (if not specified, would have deleted it and created a new one)
      foo: 'bar',
    },
  },
});
```

A [dynamic zone](/developer-docs/latest/development/backend-customization/models.html#dynamic-zones) (i.e. a list of components) can be updated while updating an entry with the Entity Service API. If a component `id` is specified, the component is updated, otherwise the old one is deleted and a new one is created:

```js
strapi.entityService.update('api::article.article', 1, {
  data: {
    myDynamicZone: [
      {
        // will update
        id: 2,
        __component: 'compo.type',
        foo: 'bar',
      },
      {
        // will add a new & delete old ones
        __component: 'compo.type2',
        foo: 'bar2',
      },
    ],
  },
});
```
