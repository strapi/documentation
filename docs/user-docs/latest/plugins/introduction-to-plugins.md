---
title: Plugins - Strapi User Guide
description: Reference guide to all Strapi plugins and instructions to use these plugins.
canonicalUrl: https://docs.strapi.io/user-docs/latest/plugins/introduction-to-plugins.html
---

# Introduction to plugins

Strapi is built around different types of plugins. There is a set of core plugins that are pre-installed in a default Strapi application and cannot be deactivated as they are essential for your Strapi application to function. These core plugins are:

* Content Manager
* Content Type Builder
* Email
* Media Library
* Internationalization
* Roles and Permissions

::: note
Core plugins such as the Content Manager and the Content-type Builder are documented in their own sections of the user guide (see [Introduction to the Content Manager](../content-manager/introduction-to-content-manager.md) and [Introduction to the Content-type Builder](../content-types-builder/introduction-to-content-types-builder.md)). This section focuses on how to manage plugins in general and provides documentation for other, non-core plugins.
:::

Additional plugins that you can use to extend and customize your Strapi applications are available in the [Marketplace](../plugins/installing-plugins-via-marketplace.md).

From the admin panel, administrators are allowed to:

- discover additional plugins and [providers](#providers) in the ![Marketplace icon](../assets/icons/marketplace.svg) _Marketplace_ (see [Managing Marketplace plugins](/user-docs/latest/plugins/installing-plugins-via-marketplace.md))
- review the currently installed plugins and [providers](#providers) in ![Plugins icon](../assets/icons/plugins.svg) _Plugins_

![Plugins settings](../assets/plugins/plugins-settings.png)

## Providers

Some plugins can be further extended through the configuration of _providers_, packages designed to be used on top of an existing plugin and add a specific integration to it. For example, you can use the AWS S3 provider to extend the Upload plugin and store files in your S3 bucket rather than locally on your server.

Currently, the only plugins designed to work with providers are the:

* [Email plugin](../../../developer-docs/latest/plugins/email.html#configure-the-plugin), and
* [Upload plugin](../../../developer-docs/latest/plugins/upload.html#using-a-provider).
