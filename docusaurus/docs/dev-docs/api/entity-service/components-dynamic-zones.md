---
title: Components and Dynamic Zones
description: Use Strapi's Entity Service to create and update components and dynamic zones.
displayed_sidebar: devDocsSidebar
---

# Components and dynamic zones

The [Entity Service](/dev-docs/api/entity-service) is the layer that handles [components](/dev-docs/backend-customization/models#components) and [dynamic zones](/dev-docs/backend-customization/models#dynamic-zones) logic. With the Entity Service API, components and dynamic zones can be [created](#creation) and [updated](#update) while creating or updating entries.

## Creation

A [component](/dev-docs/backend-customization/models#components) can be created while creating an entry with the Entity Service API:

```js
strapi.entityService.create('api::article.article', {
  data: {
    myComponent: {
      foo: 'bar',
    },
  },
});
```

A [dynamic zone](/dev-docs/backend-customization/models#dynamic-zones) (i.e. a list of components) can be created while creating an entry with the Entity Service API:

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

A [component](/dev-docs/backend-customization/models#components) can be updated while updating an entry with the Entity Service API. If a component `id` is specified, the component is updated, otherwise the old one is deleted and a new one is created:

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

A [dynamic zone](/dev-docs/backend-customization/models#dynamic-zones) (i.e. a list of components) can be updated while updating an entry with the Entity Service API. If a component `id` is specified, the component is updated, otherwise the old one is deleted and a new one is created:

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
