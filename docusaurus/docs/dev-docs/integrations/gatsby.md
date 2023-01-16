---
title: Get started with Gatsby - Strapi Developer Docs
description: Build powerful applications using Strapi, the leading open-source headless CMS and Gatsby.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/content-api/integrations/gatsby.html
---

# Getting Started with Gatsby

!!!include(developer-docs/latest/developer-resources/content-api/snippets/integration-guide-not-updated.md)!!!

This integration guide is following the [Quick Start Guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have fully completed its "Hands-on" path, and therefore can consume the API by browsing this [url](http://localhost:1337/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Gatsby](https://www.gatsbyjs.org/) remains the same except that you will not fetch the same content.

## Create a Gatsby app

Create a basic Gatsby application using the [Gatsby CLI](https://www.gatsbyjs.org/docs/gatsby-cli/).

```bash
gatsby new gatsby-app
```

## Configure Gatsby

Gatsby is a [Static Site Generator](https://www.staticgen.com/) and will fetch your content from Strapi at build time. You need to configure Gatsby to communicate with your Strapi application.

```bash
yarn add gatsby-source-strapi
```

- Add the `gatsby-source-strapi` to the plugins section in the `gatsby-config.js` file:

```js
{
  resolve: "gatsby-source-strapi",
  options: {
    apiURL: "http://localhost:1337",
    collectionTypes: [
      "restaurant",
      "category",
    ],
    queryLimit: 1000,
  },
},
```

## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

:::: api-call
:::request Example GET request

```graphql
query {
  allStrapiRestaurant {
    edges {
      node {
        data {
          id
          attributes {
            name
            description
          }
        }
      }
    }
  }
}
```

:::

:::response Example response

```json
{
  "data": {
    "allStrapiRestaurant": {
      "edges": [
        {
          "node": {
            "data":[
              {
                "id": 1,
                {
                  "attributes": {
                    "name": "Biscotte Restaurant",
                    "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

:::
::::

### Example

`./src/pages/index.js`

```js
import React from 'react';

import { StaticQuery, graphql } from 'gatsby';

const query = graphql`
  query {
    allStrapiRestaurant {
      edges {
        node {
          data {
            id
            attributes {
              name
              description
            }
          }
        }
      }
    }
  }
`;

const IndexPage = () => (
  <StaticQuery
    query={query}
    render={data => (
      <ul>
        {data.allStrapiRestaurant.edges[0].node.data.map(restaurant => (
          <li key={restaurant.id}>{restaurant.attributes.name}</li>
        ))}
      </ul>
    )}
  />
);

export default IndexPage;
```

Execute a `GET` request on the `category` collection type in order to fetch a specific category with all the associated restaurants.

Be sure that you activated the `findOne` permission for the `category` collection type.

:::: api-call
::: request Example GET request

```graphql
query {
  strapiCategory(data: { elemMatch: { id: { eq: 1 } } }) {
    data {
      id
      attributes {
        name
        restaurants {
          name
          description
        }
      }
    }
  }
}
```

:::

::: response Example response

```json
{
  "data": {
    "strapiCategory": {
      "data": [
        {
          "id": 1,
          "attributes": {
            "name": "French Food",
            "restaurants": [
              {
                "name": "Biscotte Restaurant",
                "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers."
              }
            ]
          }
        }
      ]
    }
  },
  "extensions": {}
}
```

:::
::::

### Example

`./src/pages/index.js`

```js
import React from 'react';

import { StaticQuery, graphql } from 'gatsby';

const query = graphql`
  query {
    strapiCategory(data: { elemMatch: { id: { eq: 1 } } }) {
      data {
        id
        attributes {
          name
          restaurants {
            id
            name
            description
          }
        }
      }
    }
  }
`;

const IndexPage = () => (
  <StaticQuery
    query={query}
    render={data => (
      <div>
        <h1>{data.strapiCategory.data[0].attributes.name}</h1>
        <ul>
          {data.strapiCategory.data[0].attributes.restaurants.map(restaurant => (
            <li key={restaurant.id}>{restaurant.name}</li>
          ))}
        </ul>
      </div>
    )}
  />
);

export default IndexPage;
```

We can generate pages for each category.

- Tell Gatsby to generate a page for each category by updating the `gatsby-node.js` file with the following:

```js
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(
    `
      {
        categories: allStrapiCategory {
          edges {
            node {
              name
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog articles pages.
  const categories = result.data.categories.edges;

  const CategoryTemplate = require.resolve('./src/templates/category.js');

  categories.forEach((category, index) => {
    createPage({
      path: `/category/${category.node.name}`,
      component: CategoryTemplate,
      context: {
        name: category.node.name,
      },
    });
  });
};
```

- Create a `./src/templates/category.js` file that will display the content of each one of your category:

```js
import React from 'react';
import { graphql } from 'gatsby';

export const query = graphql`
  query Category($name: String!) {
    category: strapiCategory(name: { eq: $name }) {
      name
      restaurants {
        id
        name
      }
    }
  }
`;

const Category = ({ data }) => {
  const restaurants = data.category.restaurants;
  const category = data.category.name;

  return (
    <div>
      <h1>{category}</h1>
      <ul>
        {restaurants.map(restaurant => {
          return <li key={restaurant.id}>{restaurant.name}</li>;
        })}
      </ul>
    </div>
  );
};

export default Category;
```

You can find your restaurant categories by browsing `http://localhost:8000/category/<name-of-category>`.

Feel free to do the same for your restaurants!

## Starters

- [Gatsby blog starter](https://github.com/strapi/strapi-starter-gatsby-blog)
- [Gatsby corporate starter](https://github.com/strapi/strapi-starter-gatsby-corporate)
- [Gatsby catalog starter](https://github.com/strapi/strapi-starter-gatsby-catalog)

## Conclusion

Here is how to request your collection types in Strapi using Gatsby.
Learn more about [GraphQL](/developer-docs/latest/plugins/graphql.md).
