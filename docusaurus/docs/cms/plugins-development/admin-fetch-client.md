---
title: Admin fetch client
description: Make authenticated HTTP requests from the admin panel using useFetchClient and getFetchClient.
sidebar_label: Fetch client
pagination_prev: cms/plugins-development/admin-localization
pagination_next: cms/plugins-development/server-api
displayed_sidebar: cmsSidebar
tags:
- admin panel
- admin panel customization
- admin panel API
- plugins development
- fetch client
- HTTP requests
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-admin-panel.md'

# Admin Panel API: Fetch client

<Tldr>

Use `useFetchClient` inside React components and `getFetchClient` elsewhere to call Strapi APIs with the user's authentication token attached. Both expose `get`, `post`, `put`, and `del` methods with automatic token refresh on 401 responses.

</Tldr>

Strapi provides a built-in HTTP client for the admin panel that manages authentication automatically. Plugin developers should use it instead of raw `fetch` or `axios`.

Both `useFetchClient` and `getFetchClient` are exported from `@strapi/strapi/admin` and expose the same `get`, `post`, `put`, and `del` methods. Choose based on where the call is made from:

| Entry point | Use when |
|---|---|
| [`useFetchClient`](#inside-a-react-component) | Inside a React component (auto-cancels requests on unmount) |
| [`getFetchClient`](#outside-a-react-component) | Services, utility functions, event handlers, or any non-React code |

<Prerequisite />

## Fetching data {#fetching-data}

The most common operation is fetching data with `get`. Import the client, destructure the methods you need, and `await` the result:

### Inside a React component {#inside-a-react-component}

`useFetchClient` is a React hook that automatically provides an `AbortSignal` tied to the component lifecycle, so requests are cancelled when the component unmounts:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/components/MyComponent.js"
import { useFetchClient } from '@strapi/strapi/admin';

const MyComponent = () => {
  const { get } = useFetchClient();

  const fetchData = async () => {
    const { data } = await get('/my-plugin/my-endpoint');
    // data contains the parsed JSON response
  };
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/components/MyComponent.tsx"
import { useFetchClient } from '@strapi/strapi/admin';

const MyComponent = () => {
  const { get } = useFetchClient();

  const fetchData = async () => {
    const { data } = await get('/my-plugin/my-endpoint');
    // data contains the parsed JSON response
  };
};
```

</TabItem>
</Tabs>

### Outside a React component {#outside-a-react-component}

`getFetchClient` works in any JavaScript context. The typical pattern is to wrap calls inside exported helper functions that the rest of the plugin imports:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/utils/api.js"
import { getFetchClient } from '@strapi/strapi/admin';

const { get, del } = getFetchClient();

export const fetchItems = async () => {
  const { data } = await get('/my-plugin/items');
  return data;
};

export const deleteItem = async (id) => {
  await del(`/my-plugin/items/${id}`);
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/utils/api.ts"
import { getFetchClient } from '@strapi/strapi/admin';

const { get, del } = getFetchClient();

export const fetchItems = async () => {
  const { data } = await get('/my-plugin/items');
  return data;
};

export const deleteItem = async (id: string) => {
  await del(`/my-plugin/items/${id}`);
};
```

</TabItem>
</Tabs>

:::note
The `del` method is named this way because `delete` is a reserved word in JavaScript.
:::

## Sending data with `post` and `put` {#sending-data}

The `post` and `put` methods accept a payload as their second argument:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/utils/api.js"
import { getFetchClient } from '@strapi/strapi/admin';

const { post, put } = getFetchClient();

// Create a new item
export const createItem = async (payload) => {
  const { data } = await post('/my-plugin/items', payload);
  return data;
};

// Update an existing item
export const updateItem = async (id, payload) => {
  const { data } = await put(`/my-plugin/items/${id}`, payload);
  return data;
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/utils/api.ts"
import { getFetchClient } from '@strapi/strapi/admin';

const { post, put } = getFetchClient();

// Create a new item
export const createItem = async (payload: Record<string, unknown>) => {
  const { data } = await post('/my-plugin/items', payload);
  return data;
};

// Update an existing item
export const updateItem = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await put(`/my-plugin/items/${id}`, payload);
  return data;
};
```

</TabItem>
</Tabs>

:::tip
When sending `FormData` (for example, file uploads), the fetch client automatically removes the `Content-Type` header so the browser can set the correct multipart boundary.
:::

## Configuring requests {#options}

All methods accept an options object as their last argument:

| Option | Type | Description |
|---|---|---|
| `params` | `object` | Query string parameters. Serialized automatically. |
| `headers` | `Record<string, string>` | Additional request headers. Merged with defaults. |
| `signal` | `AbortSignal` | Used to cancel requests. `useFetchClient` provides one automatically. |
| `validateStatus` | `(status: number) => boolean \| null` | Custom function that determines which HTTP statuses should throw. |
| `responseType` | `'json' \| 'blob' \| 'text' \| 'arrayBuffer'` | Controls response parsing (see [Response types](#response-types)). Only effective on `get`. |

### Query parameters {#params}

Pass `params` to serialize query strings automatically:

```js title="my-plugin/admin/src/components/MyComponent.js"
const { data } = await get('/content-manager/collection-types/api::article.article', {
  params: {
    page: 1,
    pageSize: 10,
    sort: 'title:asc',
  },
});
```

### Response types {#response-types}

By default, responses are parsed as JSON. The `get` method accepts a `responseType` option to handle non-JSON responses such as file downloads, CSV exports, or binary data:

| `responseType` value | Response parsed as |
|---|---|
| `json` | JSON object (default) |
| `blob` | `Blob` |
| `text` | Plain text string |
| `arrayBuffer` | `ArrayBuffer` |

Non-JSON responses include `status` and `headers` in the return object:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/components/DownloadButton.js"
import { useFetchClient } from '@strapi/strapi/admin';

const DownloadButton = () => {
  const { get } = useFetchClient();

  const downloadFile = async (url) => {
    const { data: blob, status, headers } = await get(url, { responseType: 'blob' });
    // Process the blob, for example to trigger a file download
  };
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/components/DownloadButton.tsx"
import { useFetchClient } from '@strapi/strapi/admin';

const DownloadButton = () => {
  const { get } = useFetchClient();

  const downloadFile = async (url: string) => {
    const { data: blob, status, headers } = await get(url, { responseType: 'blob' });
    // Process the blob, for example to trigger a file download
  };
};
```

</TabItem>
</Tabs>

## Handling errors {#error-handling}

The fetch client throws a `FetchError` when a request fails. Use the `isFetchError` utility to check errors safely:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/components/MyComponent.js"
import { useFetchClient, isFetchError } from '@strapi/strapi/admin';

const MyComponent = () => {
  const { get } = useFetchClient();

  const fetchData = async () => {
    try {
      const { data } = await get('/my-plugin/my-endpoint');
      // handle success
    } catch (error) {
      if (isFetchError(error)) {
        // error.status contains the HTTP status code
        console.error('Request failed:', error.status, error.message);
      } else {
        throw error; // re-throw non-fetch errors
      }
    }
  };
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/components/MyComponent.tsx"
import { useFetchClient, isFetchError } from '@strapi/strapi/admin';

const MyComponent = () => {
  const { get } = useFetchClient();

  const fetchData = async () => {
    try {
      const { data } = await get('/my-plugin/my-endpoint');
      // handle success
    } catch (error) {
      if (isFetchError(error)) {
        // error.status contains the HTTP status code
        console.error('Request failed:', error.status, error.message);
      } else {
        throw error; // re-throw non-fetch errors
      }
    }
  };
};
```

</TabItem>
</Tabs>

:::note
When a request returns a 401 status, the fetch client automatically refreshes the authentication token and retries the request before throwing an error. This automatic retry does not apply to authentication endpoints themselves.
:::

👉 For server-side error handling (controllers, services, middlewares), see [Error handling](/cms/error-handling).
