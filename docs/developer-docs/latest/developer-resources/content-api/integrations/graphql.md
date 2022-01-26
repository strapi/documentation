---
title: Get started with GraphQL - Strapi Developer Docs
description: Use the GraphQL plugin in your Strapi project to fetch and mutate your content.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/content-api/integrations/graphql.html
---

# Getting Started with GraphQL

!!!include(developer-docs/latest/developer-resources/content-api/snippets/integration-guide-not-updated.md)!!!

This integration guide is following the [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have fully completed its "Hands-on" path, and therefore can consume the API by browsing this [url](http://localhost:1337/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [GraphQL](https://graphql.org/) remains the same except that you will not fetch the same content.

## Install the GraphQL plugin

Install the GraphQL plugin in your Strapi project.

<code-group>

<code-block title="NPM">
```sh
npm run strapi install graphql
```
</code-block>

<code-block title="YARN">
```sh
yarn strapi install graphql
```
</code-block>


<code-block title="STRAPI CLI">
```sh
strapi install graphql
```
</code-block>

</code-group>

## Fetch your Restaurant collection type

Play with the [GraphQL Playground](http://localhost:1337/graphql) to fetch your content.

::::api-call
:::request Example query
```graphql
query Restaurants {
  restaurants {
    id
    name
    description
    categories {
      name
    }
  }
}
```
:::

:::response Example response
```json
{
  "data": {
    "restaurants": [
      {
        "id": "1",
        "name": "Biscotte Restaurant",
        "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
        "categories": [
          {
            "name": "French Food"
          }
        ]
      }
    ]
  }
}
```
:::
::::

### Examples

These examples do not guide you to configure your client with Apollo for your [GraphQL endpoint](http://localhost:1337/graphql). Please follow the associated documentation for each client: ([React](https://www.apollographql.com/docs/react/get-started/) and [Vue.js](https://apollo.vuejs.org/guide/installation.html#_1-apollo-client) here)

:::: tabs card

::: tab React

Using [React](/developer-docs/latest/developer-resources/content-api/integrations/react.md) and [Apollo](https://www.apollographql.com/)

```js
import { gql, useQuery } from '@apollo/client';

function Restaurants() {
  const { loading, error, data } = useQuery(gql`
    query Restaurants {
      restaurants {
        id
        name
        description
        categories {
          name
        }
      }
    }
  `);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <ul>
      {data.restaurants.map(restaurant => (
        <li key={restaurant.id}>{restaurant.name}</li>
      ))}
    </ul>
  );
}
```

:::

::: tab Vue.js

Using [Vue.js](/developer-docs/latest/developer-resources/content-api/integrations/vue-js.md) and [Apollo](https://www.apollographql.com/)

```js
<template>
  <div>
    <ul>
      <li v-for="restaurant in restaurants" :key="restaurant.id">
        {{ restaurant.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  data() {
    return {
      restaurants: []
    };
  },
  apollo: {
    restaurants: gql`
      query Restaurants {
        restaurants {
          id
          name
          description
          categories {
            name
          }
        }
      }`
  }
};
</script>
```

:::

::::

## Fetch your Category collection type

:::: api-call
::: request Example request

```graphql
query Category {
  category(id: 1) {
    id
    name
    restaurants {
      id
      name
      description
    }
  }
}
```
:::

:::response Example response

```json
{
  "data": {
    "category": {
      "id": "1",
      "name": "French Food",
      "restaurants": [
        {
          "id": "1",
          "name": "Biscotte Restaurant",
          "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
        }
      ]
    }
  }
}
```
:::
::::

## Examples

:::: tabs card

::: tab React

Using [React](/developer-docs/latest/developer-resources/content-api/integrations/react.md) and [Apollo](https://www.apollographql.com/)

```js
import { gql, useQuery } from '@apollo/client';

function Category({ id }) {
  const { loading, error, data } = useQuery(
    gql`
      query Category($id: ID!) {
        category(id: $id) {
          id
          name
          restaurants {
            id
            name
            description
          }
        }
      }
    `,
    { variables: { id } }
  );

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <div>
      <h1>{data.category.name}</h1>
      <ul>
        {data.category.restaurants.map(restaurant => (
          <li key={restaurant.id}>{restaurant.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

:::

::: tab Vue.js

Using [Vue.js](/developer-docs/latest/developer-resources/content-api/integrations/vue-js.md) and [Apollo](https://www.apollographql.com/)

```js
<template>
  <div>
    <h1>{{ category.name }}
    <ul>
      <li v-for="restaurant in category.restaurants" :key="restaurant.id">
        {{ restaurant.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  data() {
    return {
      category: {},
      routeParam: this.$route.params.id
    };
  },
  apollo: {
    category: {
      query: gql`
      query Category($id: ID!) {
        category(id: $id) {
          id
          name
          restaurants {
            id
            name
            description
          }
        }
      }
      `,
      variables() {
        return {
          id: this.routeParam
        };
      }
    }
  }
};
</script>
```

:::

::::

## Conclusion

This is how you request your collection types in Strapi using GraphQL.

Feel free to explore more about [GraphQL](/developer-docs/latest/plugins/graphql.md).
