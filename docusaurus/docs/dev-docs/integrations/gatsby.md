---
title: Gatsby
displayed_sidebar: cmsSidebar
description: Integrate Strapi with Gatsby.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with Gatsby

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/dev-docs/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start Guide, the way you request a Strapi API with [Gatsby](https://www.gatsbyjs.org/) remains the same except that you do not fetch the same content.

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

<ApiCall noSideBySide>

<Request title="Example GET request">

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

</Request>

<Response title="Example response">

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

</Response>
</ApiCall>

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

<ApiCall noSideBySide>
<Request title="Example GET request">

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

</Request>

<Response title="Example response">

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

</Response>
</ApiCall>

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
