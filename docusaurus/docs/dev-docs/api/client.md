---
title: Strapi Client
description: The Strapi Client library simplifies interactions with your Strapi back end, providing a way to fetch, create, update, and delete content.  
displayed_sidebar: devDocsSidebar
tags:
- API
- Content API
- documentId
- Strapi Client
---

# Strapi Client

The Strapi Client library simplifies interactions with your Strapi back end, providing a way to fetch, create, update, and delete content. This guide walks you through setting up the Strapi Client, configuring authentication, and using its key features effectively.

## Getting Started
:::prerequisites
- A Strapi project has been created and is running. If you haven't set one up yet, follow the [Quick Start Guide](/dev-docs/quick-start) to create one.
- You know the URL of the Content API of your Strapi instance (e.g., `http://localhost:1337/api`).
:::

### Installation

To use the Strapi Client in your project, install it as a dependency using your preferred package manager:

  <Tabs groupId="yarn-npm">
  <TabItem value="yarn" label="Yarn">

  ```bash
  yarn add @strapi/client
  ```

  </TabItem>
  <TabItem value="npm" label="NPM">

  ```bash
  npm install @strapi/client
  ```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

  ```bash
    pnpm add @strapi/client
  ```

  </TabItem>
  </Tabs>

### Basic configuration

To start interacting with your Strapi back end, initialize the Strapi Client and set the base API URL:

```js
import { strapi } from '@strapi/client';

const client = strapi({ baseURL: 'http://localhost:1337/api' });
```

If you're using the Strapi Client in a browser environment, you can include it using a `<script>` tag:

```js title="./src/api/[apiName]/routes/[routerName].ts (e.g './src/api/restaurant/routes/restaurant.ts')"
<script src="https://cdn.jsdelivr.net/npm/@strapi/client"></script>

<script>
  const client = strapi.strapi({ baseURL: 'http://localhost:1337/api' });
</script>
```

### Authentication

The Strapi Client supports different authentication strategies to access protected resources in your Strapi back end.

If your Strapi instance uses API tokens, configure the Strapi Client as follows:

```js
const client = strapi({
  baseURL: 'http://localhost:1337/api',
  auth: 'your-api-token-here',
});
```

This allows your requests to include the necessary authentication credentials automatically.

## API Reference

The Strapi Client provides the following key properties and methods for interacting with your Strapi back end:

| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `baseURL`  | The base API URL of your Strapi back end.        |
| `fetch()`    | A utility method for making generic API requests similar to the native fetch API. |
| `collection()`  | Manages collection-type resources (e.g., blog posts, products). |
| `single()`  | Manages single-type resources (e.g., homepage settings, global configurations). |

### General purpose fetch

The Strapi Client provides access to the underlying JavaScript `fetch` function to make direct API requests. The request is always relative to the base URL provided during client initialization:

```js
const result = await client.fetch('articles', { method: 'GET' });
```

### Working with collection types

Collection types in Strapi are entities with multiple entries (e.g., a blog with many posts). The Strapi Client provides a `collection()` method to interact with these resources, with the following methods available:

| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `find(queryParams?)`  | Fetch multiple documents with optional filtering, sorting, or pagination.       |
| `findOne(documentID, queryParams?)`    | Retrieve a single document by its unique ID.        |
| `create(data, queryParams?)`  | Create a new document in the collection. |
| `update(documentID, data, queryParams?)`  | Update an existing document. |
| `delete(documentID, queryParams?)`  | Update an existing document. |

**Usage examples:**
```js
const articles = client.collection('articles');

// Fetch all english articles sorted by title
const allArticles = await articles.find({
  locale: 'en',
  sort: 'title',
});

// Fetch a single article
const singleArticle = await articles.findOne('article-document-id');

// Create a new article
const newArticle = await articles.create({ title: 'New Article', content: '...' });

// Update an existing article
const updatedArticle = await articles.update('article-document-id', { title: 'Updated Title' });

// Delete an article
await articles.delete('article-id');
```

### Working with single types

Single types in Strapi represent unique content entries that exist only once (e.g., the homepage settings or site-wide configurations). The Strapi Client provides a `single()` method to interact with these resources, with the following methods available:
| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `find(queryParams?)`  | Fetch the document.        |
| `update(documentID, data, queryParams?)`  | Update the document. |
| `delete(queryParams?) `  | Remove the document. |

**Usage examples:**
```js
const homepage = client.single('homepage');

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
More details about the Strapi Strapi Client might be found in the [package's README](https://github.com/strapi/client/blob/main/README.md).
:::
