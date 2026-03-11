---
title: Server content-types
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
pagination_prev: cms/plugins-development/server-configuration
pagination_next: cms/plugins-development/server-routes
description: Declare and register content-types in a Strapi plugin and access them at runtime through the Document Service API.
tags:
  - plugin APIs
  - content-types
  - plugins development
  - backend customization
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-server.md'

# Server API: Content-types

<Tldr>
Export a `contentTypes` object from the server entry file to declare plugin content-types. Each key must match the content-type's `info.singularName`. The UID follows the `plugin::<plugin-name>.<singular-name>` convention and is used to query, sanitize, and reference the content-type at runtime.
</Tldr>

A plugin can declare its own content-types by exporting a `contentTypes` object from the [server entry file](/cms/plugins-development/server-api#entry-file). Strapi registers these content-types under the plugin namespace at startup and makes them available through the Document Service API and the content-type registry.

<Prerequisite />

## Declaration

The `contentTypes` export is an object where each key is the `singularName` of the content-type, matching the `info.singularName` field in its schema. The value is an object with a `schema` property pointing to the schema definition.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/content-types/index.js"
'use strict';

const article = require('./article');

module.exports = {
  // highlight-next-line
  article: { schema: article }, // key must match info.singularName in the schema
};
```

```js title="/src/plugins/my-plugin/server/src/content-types/article/schema.json"
{
  "kind": "collectionType",
  "collectionName": "my_plugin_articles",
  "info": {
    // highlight-next-line
    "singularName": "article",
    "pluralName": "articles",
    "displayName": "Article"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "body": {
      "type": "richtext"
    }
  }
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/src/plugins/my-plugin/server/src/content-types/index.ts"
import article from './article';

export default {
  // highlight-next-line
  article: { schema: article }, // key must match info.singularName in the schema
};
```

```json title="/src/plugins/my-plugin/server/src/content-types/article/schema.json"
{
  "kind": "collectionType",
  "collectionName": "my_plugin_articles",
  "info": {
    // highlight-next-line
    "singularName": "article",
    "pluralName": "articles",
    "displayName": "Article"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "body": {
      "type": "richtext"
    }
  }
}
```

</TabItem>
</Tabs>

## UIDs and naming conventions

Once registered, a plugin content-type is identified by a stable UID that follows this format:

```
plugin::<plugin-name>.<singular-name>
```

For example, a plugin named `my-plugin` with a content-type whose `singularName` is `article` has the UID `plugin::my-plugin.article`.

This UID is used consistently across all APIs:

| Use case | Example |
| --- | --- |
| Query via Document Service | `strapi.documents('plugin::my-plugin.article').findMany()` |
| Access schema via getter | `strapi.contentType('plugin::my-plugin.article')` |
| Reference in route handler | `handler: 'article.find'` (short form, resolved via plugin registry) |
| Pass to sanitization API | `strapi.contentAPI.sanitize.output(data, schema, { auth })` |

:::note
Controllers, services, policies, and middlewares use the same `plugin::<plugin-name>.<resource-name>` UID format for global getters, but are referenced by their short registry key (e.g., `'article'`) within plugin-level APIs such as route `handler` and `policies`. See [Getters & usage](/cms/plugins-development/server-getters-usage) for details.
:::

## Accessing content-types at runtime

### Querying with the Document Service API

Use the Document Service API to query plugin content-types from controllers, services, or lifecycle hooks:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
module.exports = ({ strapi }) => ({
  async findAll(params = {}) {
    // highlight-next-line
    return strapi.documents('plugin::my-plugin.article').findMany(params);
  },

  async create(data) {
    return strapi.documents('plugin::my-plugin.article').create({ data });
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async findAll(params: Record<string, unknown> = {}) {
    // highlight-next-line
    return strapi.documents('plugin::my-plugin.article').findMany(params);
  },

  async create(data: Record<string, unknown>) {
    return strapi.documents('plugin::my-plugin.article').create({ data });
  },
});
```

</TabItem>
</Tabs>

:::strapi Document Service API
For the full list of available methods and parameters, see the [Document Service API](/cms/api/document-service).
:::

### Accessing the schema

Use the content-type getter to retrieve the schema object, for example to pass it to the sanitization API:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
const schema = strapi.contentType('plugin::my-plugin.article');

const sanitizedOutput = await strapi.contentAPI.sanitize.output(
  data,
  schema,
  { auth: ctx.state.auth }
);
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
const schema = strapi.contentType('plugin::my-plugin.article');

const sanitizedOutput = await strapi.contentAPI.sanitize.output(
  data,
  schema,
  { auth: ctx.state.auth }
);
```

</TabItem>
</Tabs>

## Best practices

- **Match the export key to `info.singularName` exactly.** If the key and `singularName` don't match, Strapi may fail to register the content-type or generate an incorrect UID.

- **Use `collectionName` to avoid table name conflicts.** The `collectionName` field sets the database table name. Prefix it with the plugin name (e.g., `my_plugin_articles`) to avoid collisions with application content-types or other plugins.

- **Keep content-type schemas in their own files.** Define each schema in a dedicated `schema.json` file inside a subfolder named after the `singularName` (e.g., `content-types/article/schema.json`). This matches the structure generated by the Plugin SDK and keeps the index file readable.

- **Enable `draftAndPublish` only when needed.** Draft and Publish adds a publication workflow to the content-type. Enable it only if the plugin's use case requires it — it adds complexity to queries and content management.