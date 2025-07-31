---
title: Advanced queries for GraphQL
displayed_sidebar: cmsSidebar
tags:
  - GraphQL API
---

# Advanced queries for the GraphQL API

Strapi's [GraphQL API](/cms/api/graphql) resolves many queries automatically, but complex data access can require deeper relation fetching or chaining resolvers. The present short guide explains how to handle such advanced scenarios.

For additional information, please refer to the [GraphQL customization](/cms/plugins/graphql#extending-the-schema) documentation.

## Multi-level queries

Use nested selection sets to fetch relations several levels deep, as in the following example:

```graphql
{
  restaurants {
    documentId
    name
    categories {
      documentId
      name
      parent {
        documentId
        name
      }
    }
  }
}
```

The GraphQL plugin automatically resolves nested relations. If you need to apply custom logic at a specific level, create a custom resolver for that field.

## Resolver chains

Custom resolvers can call other resolvers to reuse existing logic. A common pattern is to resolve permissions or context data in a parent resolver and pass it down to child resolvers, as in the following example:

```js title="/src/api/restaurant/resolvers/restaurant.ts"
export default {
  Query: {
    restaurants: async (parent, args, ctx) => {
      const documents = await strapi.documents('api::restaurant.restaurant').findMany(args);
      return documents.map(doc => ctx.request.graphql.resolve('Restaurant', doc));
    },
  },
};
```

In this example the parent resolver fetches restaurants using the [Document Service API](/cms/api/document-service), then delegates to the generated `Restaurant` resolver provided by the plugin so default behavior such as field selection still applies.
