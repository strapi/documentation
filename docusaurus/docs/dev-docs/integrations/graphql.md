---
title: GraphQL
displayed_sidebar: cmsSidebar
description: Integrate Strapi with GraphQL.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with GraphQL

:::callout 🧹 Removing integration guides
The Strapi Documentation team focuses on improving the documentation for Strapi 5's core experience. We will release many changes in the next 6 months, so please keep an eye out 👀.

As a result, the present page is now in maintenance mode only, might not be fully up-to-date with Strapi 5, and will soon be removed from docs.strapi.io and moved to Strapi's [integrations page](https://strapi.io/integrations).

In the meantime, we encourage you to read the [GraphQL API](/dev-docs/api/graphql) section, which is already up-to-date with Strapi 5.
:::

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [GraphQL](https://graphql.org/) remains the same except that you will not fetch the same content.

## Install the GraphQL plugin

Install the GraphQL plugin in your Strapi project.

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi install graphql
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi install graphql
```

</TabItem>

</Tabs>

## Fetch your Restaurant collection type

Use the [GraphQL Playground](http://localhost:1337/graphql) to fetch your content.

<ApiCall noSideBySide>
<Request title="Example query">

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

</Request>

<Response title="Example response">

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

</Response>
</ApiCall>

### Examples

These examples do not include configuring your client with Apollo for your [GraphQL endpoint](http://localhost:1337/graphql). Please follow the associated documentation for [React](https://www.apollographql.com/docs/react/get-started/) or [Vue.js](https://apollo.vuejs.org/guide/installation.html#_1-apollo-client).

<Tabs groupId="react-vue">

<TabItem value="React" label="React">

Using [React](/dev-docs/integrations/react.md) and [Apollo](https://www.apollographql.com/)

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

</TabItem>

<TabItem value="Vue.js" label="Vue.js">

Using [Vue.js](/dev-docs/integrations/vue-js.md) and [Apollo](https://www.apollographql.com/)

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

</TabItem>

</Tabs>

## Fetch your Category collection type

<ApiCall noSideBySide> 
<Request title="Example request">

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

</Request>

<Response title="Example response">

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

</Response>
</ApiCall>

## Examples

<Tabs groupId="react-vue">

<TabItem value="React" label="React">

Using [React](/dev-docs/integrations/react.md) and [Apollo](https://www.apollographql.com/)

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

</TabItem>

<TabItem value="Vue.js" label="Vue.js">

Using [Vue.js](/dev-docs/integrations/vue-js.md) and [Apollo](https://www.apollographql.com/)

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

</TabItem>

</Tabs>
