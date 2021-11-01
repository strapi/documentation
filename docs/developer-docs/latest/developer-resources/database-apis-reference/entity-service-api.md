---
title: Entity Service API - Strapi Developer Documentation
description: …
---

<!-- TODO: update SEO -->

# Entity Service API

Strapi provides an Entity Service API, built on top of the [Query Engine API](/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.md). The Entity Service is the layer that handles Strapi's complex data structures like [components](/developer-docs/latest/development/backend-customization/models.md#components-2) and [dynamic zones](/developer-docs/latest/development/backend-customization/models.md#dynamic-zones), and uses the Query Engine API under the hood to execute database queries.

## Basic usage

The Entity Service is available through `strapi.entityService`:

```js
const entry = await strapi.entityService.findOne('api::article.article', 1, {
  populate: { someRelation: true },
});
```

## Available operations

The Entity Service allows:

- [CRUD operations on entities](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/crud.md) (e.g. `findOne`, `findMany`, `create`, `update`, `delete`) with the ability to [filter](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.md), [order and paginate results](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.md), and [populate relations, components and dynamic zones](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.md)
- the [creation and update of components and dynamic zones](/developer-docs/latest/developer-resources/database-apis-reference/entity-service/components-dynamic-zones.md)
