---
title: Entity Service API
description: The Entity Service is the layer that handles Strapi's complex data structures like components and dynamic zones, and uses the Query Engine API under the hood to execute database queries.
displayed_sidebar: cmsSidebar
unlisted: true
---

import EntityQueryKnex from '/docs/snippets/entity-query-knex.md'
import BackendIntroCrosslink from '/docs/snippets/backend-custom-intro-crosslink.md'
import ESdeprecated from '/docs/snippets/entity-service-deprecated.md'

# Entity Service API

<ESdeprecated />

:::prerequisites
Before diving deeper into the Entity Service API documentation, it is recommended that you read the following introductions:
- the [backend customization introduction](/dev-docs/backend-customization),
- and the [Content APIs introduction](/dev-docs/api/content-api).
:::

The Strapi backend provides an Entity Service API, built on top of the [Query Engine API](/dev-docs/api/query-engine/). The Entity Service is the layer that handles Strapi's complex data structures like [components](/dev-docs/backend-customization/models#components-json) and [dynamic zones](/dev-docs/backend-customization/models#dynamic-zones), and uses the Query Engine API under the hood to execute database queries.

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

The Entity Service API allows the following operations on entities:

<CustomDocCardsWrapper>
<CustomDocCard emoji="" title="CRUD operations" description="Create, read, update, and delete entities with the Entity Service API." link="/dev-docs/api/entity-service/crud" />
<CustomDocCard emoji="" title="Filters" description="Get exactly what you need by filtering entities with your Entity Service API queries." link="/dev-docs/api/entity-service/filter" />
<CustomDocCard emoji="" title="Populate" description="Get additional data with your Entity Service API queries by populating relations." link="/dev-docs/api/entity-service/populate" />
<CustomDocCard emoji="" title="Order & Pagination" description="Sort and paginate the results of your Entity Service API queries." link="/dev-docs/api/entity-service/order-pagination" />
<CustomDocCard emoji="" title="Components/Dynamic Zones" description="Create and update components and dynamic zones with your Entity Service API queries." link="/dev-docs/api/entity-service/components-dynamic-zones" />
</CustomDocCardsWrapper>
