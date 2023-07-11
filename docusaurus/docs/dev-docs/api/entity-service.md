---
title: Entity Service API
description: The Entity Service is the layer that handles Strapi's complex data structures like components and dynamic zones, and uses the Query Engine API under the hood to execute database queries.
displayed_sidebar: devDocsSidebar
---
import EntityQueryKnex from '/docs/snippets/entity-query-knex.md'

# Entity Service API

Strapi provides an Entity Service API, built on top of the [Query Engine API](/dev-docs/api/query-engine/). The Entity Service is the layer that handles Strapi's complex data structures like [components](/dev-docs/backend-customization/models#components) and [dynamic zones](/dev-docs/backend-customization/models#dynamic-zones), and uses the Query Engine API under the hood to execute database queries.

:::strapi Entity Service API vs. Query Engine API
<EntityQueryKnex components={props.components} />
:::

:::info Disambiguation: Services vs. Entity Service
While [services](/dev-docs/backend-customization/services) can use the Entity Service API, services and the Entity Service API are not directly related. You can find more information about the core elements of the Strapi back end in the [back-end customization](/dev-docs/backend-customization) documentation.
:::

## Basic usage

The Entity Service is available through `strapi.entityService`:

```js
const entry = await strapi.entityService.findOne('api::article.article', 1, {
  populate: { someRelation: true },
});
```

## Available operations

The Entity Service API allows:

- [CRUD operations on entities](/dev-docs/api/entity-service/crud) (e.g. [`findOne`](/dev-docs/api/entity-service/crud#findone), [`findMany`](/dev-docs/api/entity-service/crud#findmany), [`create`](/dev-docs/api/entity-service/crud#create), [`update`](/dev-docs/api/entity-service/crud#update), [`delete`](/dev-docs/api/entity-service/crud#delete)) with the ability to [filter](/dev-docs/api/entity-service/filter), [order and paginate results](/dev-docs/api/entity-service/order-pagination), and [populate relations, components and dynamic zones](/dev-docs/api/entity-service/populate)
- the [creation and update of components and dynamic zones](/dev-docs/api/entity-service/components-dynamic-zones)
