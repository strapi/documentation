---
title: Developing plugins
description: Generation introduction about Strapi plugins development
displayed_sidebar: devDocsSidebar
pagination_prev: dev-docs/plugins
pagination_next: dev-docs/plugins/development/create-a-plugin
---

# Developing Strapi plugins

:::info
This section is about developing Strapi plugins to use them as local plugins or to submit them to the Marketplace. Not what you're looking for? Read the [plugins introduction](/dev-docs/plugins) and find your use case and recommended section to read from there.
:::

Strapi allows the development of plugins that work exactly like the built-in plugins or 3rd-party plugins available from the [Marketplace](https://market.strapi.io). Once created, your plugin can be:

- used as a local plugin, working only with a specific Strapi project,
- or [submitted to the Marketplace](https://market.strapi.io/submit-plugin) to be shared with the community.

👉 To start developing a Strapi plugin:

1. [Create a plugin](/dev-docs/plugins/development/create-a-plugin) using the CLI-based generator.
2. Learn more about the [structure of a plugin](/dev-docs/plugins/development/plugin-structure).
3. Get an overview of the [plugin APIs](#plugin-apis) to add features to your plugin.
4. Read some [guides](#guides) based on your use case(s).

## Plugin APIs

Strapi provides the following programmatic APIs for plugins to hook into some of Strapi's features:

<CustomDocCardsWrapper>
<CustomDocCard emoji="" title="Admin Panel API" description="Use the Admin Panel API to have your plugin interact with the admin panel of Strapi." link="/dev-docs/api/plugins/admin-panel-api" />
<CustomDocCard emoji="" title="Server API" description="Use the Server API to have your plugin interact with the backend server of Strapi." link="/dev-docs/api/plugins/server-api" />
</CustomDocCardsWrapper>

:::strapi Custom fields plugins
Plugins can also be used to add [custom fields](/dev-docs/custom-fields) to Strapi.
:::

## Guides

<CustomDocCard small emoji="💁" title="How to store and access data from a Strapi plugin" description="" link="/dev-docs/plugins/guides/store-and-access-data" />
<CustomDocCard small emoji="💁" title="How to pass data from the backend server to the admin panel with a plugin" description="" link="/dev-docs/plugins/guides/pass-data-from-server-to-admin" />

<br />

:::strapi Additional resources
The Strapi blog features a [tutorial series](https://strapi.io/blog/how-to-create-a-strapi-v4-plugin-server-customization-4-6) about creating a Strapi v4 'Todo' plugin. The [contributors documentation](https://contributor.strapi.io/) can also include additional information useful while developing a Strapi plugin.
:::
