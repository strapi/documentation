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

The `useFetchClient` hook and `getFetchClient` utility from `@strapi/strapi/admin` let plugins make authenticated HTTP requests from the admin panel. All requests automatically include the user's authentication token.

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

## Response types {#response-types}

By default, responses are parsed as JSON. The `get` method accepts a `responseType` option to handle non-JSON responses such as file downloads, CSV exports, or binary data:

| `responseType` value | Response parsed as |
|---|---|
| `json` | JSON object (default) |
| `blob` | `Blob` |
| `text` | Plain text string |
| `arrayBuffer` | `ArrayBuffer` |

The following example fetches a resource and returns it as a `Blob`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/components/DownloadButton.js"
import { useFetchClient } from '@strapi/strapi/admin';

const DownloadButton = () => {
  const { get } = useFetchClient();

  const downloadFile = async (url) => {
    const { data: blob, headers } = await get(url, { responseType: 'blob' });
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
    const { data: blob, headers } = await get(url, { responseType: 'blob' });
    // Process the blob, e.g. trigger a file download
  };
};
```

</TabItem>
</Tabs>
