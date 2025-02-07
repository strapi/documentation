---
title: JavaScript SDK
displayed_sidebar: devDocsSidebar
tags:
- API
- Content API
- documentId
- JavaScript SDK
---

# JavaScript SDK

The Strapi JavaScript SDK simplifies interactions with your Strapi back end, providing a way to fetch, create, update, and delete content. This guide walks you through setting up the JavaScript SDK, configuring authentication, and using its key features effectively.

## Getting Started
:::prerequisites
- A Strapi project has been created and is running. If you haven't set one up yet, follow the [Quick Start Guide](/dev-docs/quick-start) to create one.
- You know the URL of the Content API of your Strapi instance (e.g., `http://localhost:1337/api`).
:::

### Installation

To use the JavaScript SDK in your project, install it as a dependency using your preferred package manager:

  <Tabs groupId="yarn-npm">
  <TabItem value="yarn" label="Yarn">

  ```bash
  yarn add @strapi/sdk-js
  ```

  </TabItem>
  <TabItem value="npm" label="NPM">

  ```bash
  npm install @strapi/sdk-js
  ```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

  ```bash
    pnpm add @strapi/sdk-js
  ```

  </TabItem>
  </Tabs>

### Basic configuration

To start interacting with your Strapi back end, initialize the JavaScript SDK and set the base API URL:

```js
import { strapi } from '@strapi/sdk-js';

const sdk = strapi({ baseURL: 'http://localhost:1337/api' });
```

If you're using the JavaScript SDK in a browser environment, you can include it using a `<script>` tag:

```js title="./src/api/[apiName]/routes/[routerName].ts (e.g './src/api/restaurant/routes/restaurant.ts')"
<script src="https://cdn.jsdelivr.net/npm/@strapi/sdk-js"></script>

<script>
  const sdk = strapi.strapi({ baseURL: 'http://localhost:1337/api' });
</script>
```

### Authentication

The JavaScript SDK supports different authentication strategies to access protected resources in your Strapi back end.

If your Strapi instance uses API tokens, configure the JavaScript SDK as follows:

```js
const sdk = strapi({
  baseURL: 'http://localhost:1337/api',
  auth: 'your-api-token-here',
});
```

This allows your requests to include the necessary authentication credentials automatically.

## API Reference

The JavaScript SDK provides the following key properties and methods for interacting with your Strapi back end:

| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `baseURL`  | The base API URL of your Strapi back end.        |
| `fetch()`    | A utility method for making generic API requests similar to the native fetch API. |
| `collection()`  | Manages collection-type resources (e.g., blog posts, products). |
| `single()`  | Manages single-type resources (e.g., homepage settings, global configurations). |

### General purpose fetch

The JavaScript SDK provides access to the underlying JavaScript `fetch` function to make direct API requests. The request is always relative to the base URL provided during SDK initialization:

```js
const result = await strapiSdk.fetch('articles', { method: 'GET' });
```

### Working with collection types

Collection types in Strapi are entities with multiple entries (e.g., a blog with many posts). The JavaScript SDK provides a `collection()` method to interact with these resources, with the following methods available:

| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `find(queryParams?)`  | Fetch multiple documents with optional filtering, sorting, or pagination.       |
| `findOne(documentID, queryParams?)`    | Retrieve a single document by its unique ID.        |
| `create(data, queryParams?)`  | Create a new document in the collection. |
| `update(documentID, data, queryParams?)`  | Update an existing document. |
| `delete(documentID, queryParams?)`  | Update an existing document. |

**Usage examples:**
```js
const articles = sdk.collection('articles');

// Fetch all English articles sorted by title
const allArticles = await articles.find({ locale: 'en', sort: 'title' });

// Fetch a single article by ID
const singleArticle = await articles.findOne('article-document-id');

// Create a new article
const newArticle = await articles.create({ title: 'New Article', content: '...' });

// Update an existing article
const updatedArticle = await articles.update('article-document-id', { title: 'Updated Title' });

// Delete an article
await articles.delete('article-id');
```

### Working with single types

Single types in Strapi represent unique content entries that exist only once (e.g., the homepage settings or site-wide configurations). The JavaScript SDK provides a `single()` method to interact with these resources, with the following methods available:
| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `find(queryParams?)`  | Fetch the document.        |
| `update(documentID, data, queryParams?)`  | Update the document. |
| `delete(queryParams?) `  | Remove the document. |

**Usage examples:**
```js
const homepage = sdk.single('homepage');

// Fetch the default homepage content
const defaultHomepage = await homepage.find();

// Fetch the Spanish version of the homepage
const spanishHomepage = await homepage.find({ locale: 'es' });

// Update the homepage draft content
const updatedHomepage = await homepage.update(
  { title: 'Updated Homepage Title' },
  { status: 'draft' }
);

// Delete the homepage content
await homepage.delete();
```

:::strapi Additional information
More details about the Strapi JavaScript SDK might be found in the [package's README](https://github.com/strapi/sdk-js/blob/main/README.md).
:::