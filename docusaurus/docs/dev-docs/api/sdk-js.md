---
title: JavaScript SDK
displayed_sidebar: devDocsSidebar
tags:
- API
- Content API
- documentId
- filters
- Sdk
- JavaScript SDK
---

# JavaScript SDK

The Strapi JavaScript SDK simplifies interactions with your Strapi backend, providing an intuitive way to fetch, create, update, and delete content. This guide walks you through setting up the SDK, configuring authentication, and using its key features effectively.

## Getting Started
:::prerequisites
Before using the Strapi JavaScript SDK, ensure you have the following:
- a Strapi backend up and running. If you haven't set one up yet, follow the quick start guide to get started.
- the API URL of your Strapi instance (typically follows the format: `http://localhost:1337/api`).
- a recent version of Node.js installed on your system.
:::


### Installation

To use the SDK in your project, install it as a dependency using your preferred package manager:

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

### Basic Configuration

To start interacting with your Strapi backend, initialize the SDK and set the base API URL:

```js
import { strapi } from '@strapi/sdk-js';

const sdk = strapi({ baseURL: 'http://localhost:1337/api' });
```

If you're using the SDK in a browser environment, you can include it using a `<script>` tag:

```js title="./src/api/[apiName]/routes/[routerName].ts (e.g './src/api/restaurant/routes/restaurant.ts')"
<script src="https://cdn.jsdelivr.net/npm/@strapi/sdk-js"></script>

<script>
  const sdk = strapi.strapi({ baseURL: 'http://localhost:1337/api' });
</script>
```

### Authentication

The SDK supports different authentication strategies to access protected resources in your Strapi backend.

API Token Authentication

If your Strapi instance uses API tokens, configure the SDK as follows:

```js
const sdk = strapi({
  baseURL: 'http://localhost:1337/api',
  auth: 'your-api-token-here',
});
```

This allows your requests to include the necessary authentication credentials automatically.

## API Reference

The Strapi SDK instance provides several key properties and methods for interacting with your Strapi backend:

Core Properties
| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `baseURL`  | The base API URL of your Strapi backend.        |
| `fetch()`    | A utility method for making generic API requests similar to the native fetch API. |
| `collection()`  | Manages collection-type resources (e.g., blog posts, products). |
| `single()`  | Manages single-type resources (e.g., homepage settings, global configurations). |

### General purpose fetch
The SDK provides access to the underlying JavaScript fetch function for making direct API requests. The request is always relative to the base URL provided during SDK initialization.

```js
const result = await strapiSdk.fetch('articles', { method: 'GET' });
```



### Working with Collection-Types

Collection-type resources in Strapi are entities with multiple entries (e.g., a blog with many posts). The SDK provides a `.collection()` method to interact with these resources.

**Available methods:**
| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `find(queryParams?)`  | Fetch multiple documents with optional filtering, sorting, or pagination        |
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

### Working with Single-Types

Single-type resources in Strapi represent unique content entries that exist only once (e.g., the homepage settings or site-wide configurations). The SDK provides a .single() method to interact with these resources.

**Available methods:**
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
