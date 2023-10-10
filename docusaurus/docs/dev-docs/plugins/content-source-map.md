---
title: Content Source Map plugin
description: Use the Content Source Map plugin with Vercel Visual Editing to enhance the content edition experience.
sidebar_label: Content Source Map
displayed_sidebar: devDocsSidebar
---

import CSMPrereq from '/docs/snippets/content-source-map-requirements.md'

# Content Source Map plugin <EnterpriseBadge />

<CSMPrereq />

The Content Source Map plugin adds content source maps support to a Strapi project.

Content source maps are invisible values that include a link back to the field that generated the content.  When combined with [Vercel's Visual Editing](https://vercel.com/docs/workflow-collaboration/visual-editing) feature, content source maps allow navigating directly from the front-end website of a Strapi-based project to the source of a field in Strapi's admin panel, making editing content more intuitive.

## Installation

To add the Content Source Map plugin to your Strapi project, run the following command in the terminal:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add @strapi/plugin-content-source-map
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install @strapi/plugin-content-source-map
```

</TabItem>

</Tabs>

## Configuration

Once installed, the Content Source Map plugin should be enabled and configured in your project by adding relevant parameters to the [plugins configuration file](/dev-docs/configurations/plugins):

| Name           | Description                                                           | Default     |
|----------------|-----------------------------------------------------------------------|-------------|
| `contentTypes` | Array of content type uids to enable content source map for.          | `[]`        |
| `origin`       | Origin defined in the source map and used to display the edit button. | `strapi.io` |
| `baseHref`     | Base URL of your Strapi admin panel.                                  | Generated based on the [`server.url` configuration value](/dev-docs/configurations/server) |

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```jsx title="./config/plugins.js"

module.exports = () => ({
  'content-source-map': {
    enabled: true,
    config: {
      contentTypes: ['api::article.article', 'api::restaurant.restaurant'],
      origin: 'strapi.io',
      baseHref: 'https://my.strapi-admin.com',
    },
  },
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```jsx title="./config/plugins.ts"

export default () => ({
  'content-source-map': {
    enabled: true,
    config: {
      contentTypes: ['api::article.article', 'api::restaurant.restaurant'],
      origin: 'strapi.io',
      baseHref: 'https://my.strapi-admin.com',
    },
  },
});
```

</TabItem>

</Tabs>

## Usage

The Content Source Map plugin adds content source map support to the following API endpoints:

- `GET /api/:contentType` to list a content type entries
- `GET /api/:contentType/:id` to retrieve a content type entry by id

To include source map data in the response, you will have to add the `encodeSourceMaps=true` query parameter to your [REST API](/dev-docs/api/rest) calls. Vercel will automatically detect Content Source Maps on the deployed website.

:::caution
This will have performance impacts so you should use this only in draft mode or when doing previews.
:::

:::tip
To see the Content Source Map plugin and Vercel Live Editing in action, refer to the [User Guide](/user-docs/content-manager/writing-content#editing-fields-from-a-front-end-website-).
:::
