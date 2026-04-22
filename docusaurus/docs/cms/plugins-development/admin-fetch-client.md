---
title: Admin fetch client
description: Make authenticated HTTP requests from the admin panel using useFetchClient and getFetchClient.
sidebar_label: Fetch client
pagination_prev: cms/plugins-development/admin-panel-api
pagination_next: cms/plugins-development/admin-navigation-settings
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

The `useFetchClient` hook and `getFetchClient` utility from `@strapi/strapi/admin` let plugins make authenticated HTTP requests from the admin panel. All requests automatically include the user's authentication token and support automatic token refresh.

</Tldr>

Strapi provides a built-in HTTP client for the admin panel that handles authentication automatically. Plugin developers should use this client instead of raw `fetch` or `axios` to ensure requests are properly authenticated and intercepted.

<Prerequisite />

## useFetchClient

The `useFetchClient` hook is designed for use inside React components. It returns an object with `get`, `post`, `put`, and `del` methods:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/components/MyComponent.js"
import { useFetchClient } from '@strapi/strapi/admin';

const MyComponent = () => {
  const { get, post, put, del } = useFetchClient();

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
  const { get, post, put, del } = useFetchClient();

  const fetchData = async () => {
    const { data } = await get('/my-plugin/my-endpoint');
    // data contains the parsed JSON response
  };
};
```

</TabItem>
</Tabs>

## getFetchClient

For non-React contexts (services, utility functions, event handlers outside of component trees), use `getFetchClient` instead:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/utils/api.js"
import { getFetchClient } from '@strapi/strapi/admin';

const { get, post } = getFetchClient();

export const fetchItems = async () => {
  const { data } = await get('/my-plugin/items');
  return data;
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/utils/api.ts"
import { getFetchClient } from '@strapi/strapi/admin';

const { get, post } = getFetchClient();

export const fetchItems = async () => {
  const { data } = await get('/my-plugin/items');
  return data;
};
```

</TabItem>
</Tabs>

## Sending data with post and put {#sending-data}

The `post` and `put` methods accept a data parameter as their second argument:

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
When sending `FormData` (e.g., file uploads), the fetch client automatically removes the `Content-Type` header so the browser can set the correct multipart boundary.
:::

## Request options {#options}

All methods accept an options object with the following properties:

| Option | Type | Description |
|--------|------|-------------|
| `params` | `object` | Query string parameters, serialized automatically |
| `headers` | `Record<string, string>` | Additional request headers (merged with defaults) |
| `signal` | `AbortSignal` | For cancelling requests (automatically provided by `useFetchClient`) |
| `validateStatus` | `(status: number) => boolean \| null` | Custom function to determine which HTTP statuses should throw |
| `responseType` | `'json' \| 'blob' \| 'text' \| 'arrayBuffer'` | Controls response parsing (see [Response types](#response-types)). Only effective on `get`. |

### Using query parameters {#params}

Pass `params` to automatically serialize query strings:

```js
const { data } = await get('/content-manager/collection-types/api::article.article', {
  params: {
    page: 1,
    pageSize: 10,
    sort: 'title:asc',
  },
});
```

## Response types {#response-types}

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
    // Process the blob, e.g. trigger a file download
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
    // Process the blob, e.g. trigger a file download
  };
};
```

</TabItem>
</Tabs>

## Error handling {#error-handling}

The fetch client throws a `FetchError` when a request fails. Use the `isFetchError` utility to safely check errors:

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
When a request returns a 401 status (except on authentication endpoints), the fetch client automatically attempts to refresh the authentication token and retry the request before throwing an error.
:::

👉 For server-side error handling (controllers, services, middlewares), see [Error handling](/cms/error-handling).
