---
title: Strapi Client
description: The Strapi Client library simplifies interactions with your Strapi back end, providing a way to fetch, create, update, and delete content.  
toc_max_heading_level: 4
displayed_sidebar: cmsSidebar
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
- A Strapi project has been created and is running. If you haven't set one up yet, follow the [Quick Start Guide](/cms/quick-start) to create one.
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

<Tabs groupId="js-ts"> 
<TabItem value="js" label="JavaScript">

With Javascript, require the `strapi` function and create a client instance:

```js
import { strapi } from '@strapi/client';

const client = strapi({ baseURL: 'http://localhost:1337/api' });
```

</TabItem>

<TabItem value="ts" label="TypeScript">

With Typescript, import the `strapi` function and create a client instance with your Strapi API base URL:

```typescript
import { strapi } from '@strapi/client';

const client = strapi({ baseURL: 'http://localhost:1337/api' });
```
</TabItem>

<TabItem value="browser" label="Browser (UMD)">
If you're using the Strapi Client in a browser environment, you can include it using a `<script>` tag. 

```js title="./src/api/[apiName]/routes/[routerName].ts (e.g './src/api/restaurant/routes/restaurant.ts')"
<script src="https://cdn.jsdelivr.net/npm/@strapi/client"></script>

<script>
  const client = strapi.strapi({ baseURL: 'http://localhost:1337/api' });
</script>
```

</TabItem>
</Tabs>

The `baseURL` must include the protocol (`http` or `https`). An invalid URL will throw an error `StrapiInitializationError`.

### Authentication

The Strapi Client currently only supports API tokens as an authentication method, to access protected resources in your Strapi back end.

If your Strapi instance uses API tokens, configure the Strapi Client as follows:

```js
const client = strapi({
  baseURL: 'http://localhost:1337/api',
  auth: 'your-api-token-here',
});
```

This allows your requests to include the necessary authentication credentials automatically.
If the token is invalid or missing, the client will throw an error during initialization `StrapiValidationError`.

## API Reference

The Strapi Client provides the following key properties and methods for interacting with your Strapi back end:

| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `baseURL`  | The base API URL of your Strapi back end.        |
| `fetch()`    | A utility method for making generic API requests similar to the native fetch API. |
| `collection()`  | Manages collection-type resources (e.g., blog posts, products). |
| `single()`  | Manages single-type resources (e.g., homepage settings, global configurations). |
| `files()`  | Enables upload, retrieve and management of files directly to/from the Strapi Media Library. |

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
<Tabs groupId="js-ts"> 
<TabItem value="js" label="JavaScript">

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

</TabItem>
</Tabs>

### Working with single types

Single types in Strapi represent unique content entries that exist only once (e.g., the homepage settings or site-wide configurations). The Strapi Client provides a `single()` method to interact with these resources, with the following methods available:
| Parameter | Description                                                                                  |
| ----------| -------------------------------------------------------------------------------------------- |
| `find(queryParams?)`  | Fetch the document.        |
| `update(documentID, data, queryParams?)`  | Update the document. |
| `delete(queryParams?)`  | Remove the document. |

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

### Working with files

The Strapi Client provides access to the [Media Library](/cms/features/media-library) via the `files` property. This allows you to retrieve and manage file metadata without directly interacting with the REST API.

The following methods are available for working with files. Click on the method name in the  table to jump to the corresponding section with more details and examples:

| Method | Description |
|--------|-------------|
| [`find(params?)`](#find) | Retrieves a list of file metadata based on optional query parameters |
| [`findOne(fileId)`](#findone) | Retrieves the metadata for a single file by its ID |
| [`update(fileId, fileInfo)`](#update) | Updates metadata for an existing file |
| [`upload(type, options)`](#upload) | Uploads a file, specifying:<ul><li>`type` which can be `file`, `fileContentBuffer`, or `fileBlob`</li><li>and an additional `options` object</li></ul> |
| [`delete(fileId)`](#delete) | Deletes a file by its ID |

#### `find`

The `strapi.client.files.find()` method retrieves a list of file metadata based on optional query parameters.

The method can be used as follows:

```js
// Initialize the client
const client = strapi({
  baseURL: 'http://localhost:1337/api',
  auth: 'your-api-token',
});

// Find all file metadata
const allFiles = await client.files.find();
console.log(allFiles);

// Find file metadata with filtering and sorting
const imageFiles = await client.files.find({
  filters: {
    mime: { $contains: 'image' }, // Only get image files
    name: { $contains: 'avatar' }, // Only get files with 'avatar' in the name
  },
  sort: ['name:asc'], // Sort by name in ascending order
});
```

#### `findOne` {#findone}

The `strapi.client.files.findOne()` method retrieves the metadata for a single file by its id.

The method can be used as follows:

```js
// Initialize the client
const client = strapi({
  baseURL: 'http://localhost:1337/api',
  auth: 'your-api-token',
});

// Find file metadata by ID
const file = await client.files.findOne(1);
console.log(file.name);
console.log(file.url); 
console.log(file.mime); // The file MIME type
```

#### `update`

The `strapi.client.files.findOne()` method updates metadata for an existing filei, accepting 2 parameters, the `fileId`, and an object containing options such as the name, alternative text, and caption for the media.

The methods can be used as follows:

```js
// Initialize the client
const client = strapi({
  baseURL: 'http://localhost:1337/api',
  auth: 'your-api-token',
});

// Update file metadata
const updatedFile = await client.files.update(1, {
  name: 'New file name',
  alternativeText: 'Descriptive alt text for accessibility',
  caption: 'A caption for the file',
});
```

#### `upload` <NewBadge /> {#upload}

The Strapi Client provides media file upload functionality through the `FilesManager`, accessible through the  `strapi.client.files.upload()` method. The method allows you to upload media files (such as images, videos, or documents) to your Strapi backend.

The method supports uploading files as `Blob` (in browsers or Node.js) or as `Buffer` (in Node.js only). The method also supports attaching metadata to the uploaded file, such as `alternativeText` and `caption`.

##### Method Signature

```js
async upload(file: Blob, options?: BlobUploadOptions): Promise<MediaUploadResponse>
async upload(file: Buffer, options: BufferUploadOptions): Promise<MediaUploadResponse>
```

- For `Blob` uploads, `options` is optional and may include `fileInfo` for metadata.
- For `Buffer` uploads, `options` must include `filename` and `mimetype`, and may include `fileInfo`.

The response is an array of file objects, each containing details such as `id`, `name`, `url`, `size`, and `mime` [source](https://github.com/strapi/client/blob/60a0117e361346073bed1959d354c7facfb963b3/src/files/types.ts).

<Tabs>
<TabItem value="browser" label="Upload a file with the browser">

You can upload a file use through the browser as follows:

```js
const client = strapi({ baseURL: 'http://localhost:1337/api' });

const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

try {
  const result = await client.files.upload(file, {
    fileInfo: {
      alternativeText: 'A user uploaded image',
      caption: 'Uploaded via browser',
    },
  });
  console.log('Upload successful:', result);
} catch (error) {
  console.error('Upload failed:', error);
}
```

</TabItem>

<TabItem value="node" label="Upload a file with Node.js">

With Node.js, you can either upload a blob or a buffer, as in the following examples:

<Tabs>
<TabItem value="node-blob" label="Uploading a Blob">

```js
import { readFile } from 'fs/promises';

const client = strapi({ baseURL: 'http://localhost:1337/api' });

const filePath = './image.png';
const mimeType = 'image/png';
const fileContentBuffer = await readFile(filePath);
const fileBlob = new Blob([fileContentBuffer], { type: mimeType });

try {
  const result = await client.files.upload(fileBlob, {
    fileInfo: {
      name: 'Image uploaded as Blob',
      alternativeText: 'Uploaded from Node.js Blob',
      caption: 'Example upload',
    },
  });
  console.log('Blob upload successful:', result);
} catch (error) {
  console.error('Blob upload failed:', error);
}
```

</TabItem>

<TabItem value="node-buffer" label="Uploading a Buffer">

```js
import { readFile } from 'fs/promises';

const client = strapi({ baseURL: 'http://localhost:1337/api' });

const filePath = './image.png';
const fileContentBuffer = await readFile(filePath);

try {
  const result = await client.files.upload(fileContentBuffer, {
    filename: 'image.png',
    mimetype: 'image/png',
    fileInfo: {
      name: 'Image uploaded as Buffer',
      alternativeText: 'Uploaded from Node.js Buffer',
      caption: 'Example upload',
    },
  });
  console.log('Buffer upload successful:', result);
} catch (error) {
  console.error('Buffer upload failed:', error);
}
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>

##### Response Structure

The `strapi.client.files.upload()` method returns an array of file objects, each with fields such as:

```json
{
  "id": 1,
  "name": "image.png",
  "alternativeText": "Uploaded from Node.js Buffer",
  "caption": "Example upload",
  "mime": "image/png",
  "url": "/uploads/image.png",
  "size": 12345,
  "createdAt": "2025-07-23T12:34:56.789Z",
  "updatedAt": "2025-07-23T12:34:56.789Z"
}
```

#### `delete`

The `strapi.client.files.delete()` method deletes a file by its ID.

The method can be used as follows:

```js
// Initialize the client
const client = strapi({
  baseURL: 'http://localhost:1337/api',
  auth: 'your-api-token',
});

// Delete a file by ID
const deletedFile = await client.files.delete(1);
console.log('File deleted successfully');
console.log('Deleted file ID:', deletedFile.id);
console.log('Deleted file name:', deletedFile.name);
```

<br/>

## Handling Common Errors

The following errors might occur when sending queries through the Strapi Client:

| Error | Description |
|-------|-------------|
| Permission Errors | If the authenticated user does not have permission to upload or manage files, a `FileForbiddenError` is thrown. |
| HTTP Errors|If the server is unreachable, authentication fails, or there are network issues, an `HTTPError` is thrown. |
| Missing Parameters|When uploading a `Buffer`, both `filename` and `mimetype` must be provided in the options object. If either is missing, an error is thrown. |


:::strapi Additional information
More details about the Strapi Client may be found in the <ExternalLink to="https://github.com/strapi/client/blob/main/README.md" text="package's README"/>.
:::
