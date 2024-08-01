---
title: Admin panel extension
# description: todo
sidebar_label: Extension
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization

---

import HotReloading from '/docs/snippets/hot-reloading-admin-panel.md'

# Admin panel extension

Strapi's admin panel is a React-based single-page application that encapsulates all the features and installed plugins of a Strapi application. If the [customization options](/dev-docs/admin-panel-customization/options) provided by Strapi are not enough for your use case, you will need to extend Strapi's admin panel.

Extending Strapi's admin panel means leveraging its React foundation to adapt and enhance the interface and features according to the specific needs of your project, which might imply creating new components or adding new types of fields.

There are 2 use cases where you might want to extend the admin panel:

- As a Strapi plugin developer, you want to develop a Strapi plugin that extends the admin panel **everytime it's installed in any Strapi application**.

  👉 This can be done by taking advantage of the [Admin Panel API for plugins](/dev-docs/plugins/admin-panel-api).

- As a Strapi developer, you want to develop a unique solution for a Strapi user who only needs to extend a specific instance of a Strapi application.

  👉 This can be done by directly updating the `/src/admin/app.[tsx|js]` file, which can import any file located in `/src/admin/extensions`.

:::strapi Additional resources
* If you're searching for ways of replacing the default WYSIWYG editor, please refer to the [corresponding page](/dev-docs/admin-panel-customization/wysiwyg-editor).
* The [Strapi Design System documentation](https://design-system.strapi.io/?path=/docs/getting-started-welcome--docs) will also provide additional information on developing for Strapi's admin panel.
:::

<HotReloading />
