---
sidebar_position: 1
slug: /cms/plugins
tags:
- Content Manager
- Content-type Builder
- introduction
- plugins
- provider
- media library
- upload plugin
pagination_next: cms/plugins/installing-plugins-via-marketplace
---

# Introduction to plugins

Strapi is built around different types of plugins. Every default Strapi application comes with the following pre-installed plugins:

* Content Manager (see [Introduction to the Content Manager](/cms/features/content-manager))
* Content Type Builder (see [Introduction to the Content-type Builder](/cms/features/content-type-builder/))
* Email
* Media Library (implemented via the [Upload plugin](/cms/plugins/upload/))
* Internationalization
* Roles and Permissions

These plugins are essential for your Strapi application to function and cannot be uninstalled.

Additional plugins that you can use to extend and customize your Strapi applications are available in the [Marketplace](../plugins/installing-plugins-via-marketplace.md). This section focuses on how to install and manage these additional plugins.

From the admin panel, administrators are allowed to:

- discover additional plugins and [providers](#providers) in the <Icon name="shopping-cart" /> _Marketplace_ (see [Managing Marketplace plugins](./installing-plugins-via-marketplace.md))
- review the currently installed plugins and [providers](#providers) in <Icon name="gear-six" /> _Settings > Plugins_

<ThemedImage
  alt="Plugins in Settings section"
  sources={{
    light: '/img/assets/plugins/plugins-settings.png',
    dark: '/img/assets/plugins/plugins-settings_DARK.png',
  }}
/>

## Providers

Some plugins can be further extended through the configuration of _providers_, packages designed to be used on top of an existing plugin and add a specific integration to it. For example, you can use the AWS S3 provider to extend the Media Library plugin and store files in your S3 bucket rather than locally on your server.

Currently, the only plugins designed to work with providers are the:

* [Email plugin](/cms/features/email/), and
* Media Library plugin (implemented via the [Upload plugin](/cms/plugins/upload/)).

## Custom fields

Some plugins can add custom fields to Strapi (for additional information about creating custom fields plugins, see [Developer Docs](/cms/plugins-development/custom-fields)). Custom fields are a way to extend Strapi’s capabilities by adding new types of fields to content-types or components.

Once added to Strapi (see [Marketplace](./installing-plugins-via-marketplace.md)), custom fields can be created in the [Content-type Builder](/cms/features/content-type-builder#custom-fields) and used in the [Content Manager](/cms/features/content-manager#creating--writing-content).
