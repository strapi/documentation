---
title: Developing plugins
description: Generation introduction about Strapi plugins development
displayed_sidebar: cmsSidebar
pagination_prev: cms/plugins-development/developing-plugins
pagination_next: cms/plugins-development/create-a-plugin
tags:
- admin panel API
- introduction
- plugin APIs
- plugins development
- server API
---

# Developing Strapi plugins

Strapi allows the development of plugins that work exactly like the built-in plugins or 3rd-party plugins available from the <ExternalLink to="https://market.strapi.io" text="Marketplace"/>. Once created, your plugin can be:

- used as a local plugin, working only with a specific Strapi project,
- or <ExternalLink to="https://market.strapi.io/submit-plugin" text="submitted to the Marketplace"/> to be shared with the community.

👉 To start developing a Strapi plugin:

1. [Create a plugin](/cms/plugins-development/create-a-plugin) using the Plugin SDK.
2. Learn more about the [structure of a plugin](/cms/plugins-development/plugin-structure).
3. Get an overview of the [plugin APIs](#plugin-apis) to add features to your plugin.
4. Read some advanced [guides](#guides) based on your use case(s).

:::note
Ensure you release your Strapi 5 plugin as a different major version number to distinguish it from the v4 compatible version.
:::

## Plugin APIs

Strapi provides the following programmatic APIs for plugins to hook into some of Strapi's features:

<CustomDocCardsWrapper>
<CustomDocCard emoji="" title="Admin Panel API" description="Use the Admin Panel API to have your plugin interact with the admin panel of Strapi." link="/cms/plugins-development/admin-panel-api" />
<CustomDocCard emoji="" title="Server API" description="Use the Server API to have your plugin interact with the backend server of Strapi." link="/cms/plugins-development/server-api" />
</CustomDocCardsWrapper>

:::strapi Custom fields plugins
Plugins can also be used to add [custom fields](/cms/features/custom-fields) to Strapi.
:::

## Guides

<CustomDocCard small emoji="💁" title="How to store and access data from a Strapi plugin" description="" link="/cms/plugins-development/guides/store-and-access-data" />
<CustomDocCard small emoji="💁" title="How to pass data from the backend server to the admin panel with a plugin" description="" link="/cms/plugins-development/guides/pass-data-from-server-to-admin" />

<br />

:::strapi Additional resources
The <ExternalLink to="https://contributor.strapi.io/" text="contributors documentation"/> can also include additional information useful while developing a Strapi plugin.
:::
