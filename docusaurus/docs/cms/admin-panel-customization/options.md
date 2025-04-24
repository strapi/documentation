---
title: Admin panel customization options
description: >-
  Various options help you configure Strapi's administration panel behavior and
  look, so you can make it reflect your identity.
displayed_sidebar: cmsSidebar
sidebar_label: Customization options
toc_max_heading_level: 4
tags:
  - admin panel
  - admin panel customization
---
# Admin Panel Customization

import HotReloading from '/docs/snippets/hot-reloading-admin-panel.md'

Many aspects of Strapi's [admin panel](/cms/admin-panel-customization) can be customized through the code using the admin panel's `/src/admin/app.[tsx|js]` entry point file (see [project structure](/cms/project-structure)).

:::prerequisites
Before trying to update code to configure any admin panel customization option:

- Rename the default `app.example.[tsx|js]` file into `app.[ts|js]`.
- Create a new `extensions` folder in `/src/admin/`.
- If you want to see your changes applied live while developing, ensure the admin panel server is running (it's usually done with the `yarn develop` or `npm run develop` command if you have not changed the default [host, port, and path](/cms/admin-panel-customization/host-port-path) of the admin panel).
:::

:::note Note: Admin panel extensions vs. plugins extensions
By default, Strapi projects already contain another `extensions` folder in `/src` but it is for plugins extensions only (see [Plugins extension](/cms/plugins-development/plugins-extension)).
:::

The `config` object found in `/src/admin/app.[ts|js]` stores the admin panel configuration.

Any file used by the `config` object (e.g., a custom logo) should be placed in a `/src/admin/extensions/` folder and imported inside `/src/admin/app.js`.



## Available configuration options

The `config` object of `/src/admin/app.[tsx|js]` accepts the following parameters:

| Parameter                      | Type             | Description                                                                                                           |
| ------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `auth`                         | Object           | Accepts a `logo` key to replace the default Strapi [logo](#logos) on login screen                                     |
| `head`                         | Object           | Accepts a `favicon` key to replace the default Strapi [favicon](#favicon)                                             |
| `locales`                      | Array of Strings | Defines availables locales (see [updating locales](#locales))                                                         |
| `translations`                 | Object           | [Extends the translations](#extending-translations)                                                                   |
| `menu`                         | Object           | Accepts the `logo` key to change the [logo](#logos) in the main navigation                                            |
| `theme.light` and `theme.dark` | Object           | [Overwrite theme properties](#theme-extension) for Light and Dark modes                                               |
| `tutorials`                    | Boolean          | Toggles [displaying the video tutorials](#tutorial-videos)                                                            |
| `notifications`                | Object           | Accepts the `releases` key (Boolean) to toggle [displaying notifications about new releases](#releases-notifications) |

(existing configuration example and other sections remain unchanged)

## Adding a Widget to the Sidebar

Strapi allows you to customize the admin panel by adding custom widgets to the sidebar. This feature enables you to integrate additional functionality or display important information directly in the admin interface.

To add a widget to the sidebar:

1. Create a new React component for your widget in the `/src/admin/extensions/` folder.
2. Import your widget component in the `/src/admin/app.[tsx|js]` file.
3. Use the `config.widgets` array to register your widget in the sidebar.

Here's an example of how to add a custom widget:




```jsx title="/src/admin/app.js"
import MyWidget from './extensions/MyWidget';

export default {
  config: {
    // ... other configurations
    widgets: [
      {
        id: 'my-custom-widget',
        Component: MyWidget,
        position: 'bottom', // 'top' or 'bottom'
      },
    ],
  },
  bootstrap() {},
};
```





```typescript title="/src/admin/app.ts"
import MyWidget from './extensions/MyWidget';

export default {
  config: {
    // ... other configurations
    widgets: [
      {
        id: 'my-custom-widget',
        Component: MyWidget,
        position: 'bottom', // 'top' or 'bottom'
      },
    ],
  },
  bootstrap() {},
};
```




The `widgets` array accepts objects with the following properties:

- `id`: A unique identifier for your widget.
- `Component`: The imported React component for your widget.
- `position`: Determines where the widget appears in the sidebar. Use 'top' to place it at the top of the sidebar, or 'bottom' to place it at the bottom.

You can add multiple widgets by including additional objects in the `widgets` array. The order of the widgets in the array determines their display order in the sidebar.

:::tip
When creating your widget component, consider using Strapi's Design System components to maintain a consistent look and feel with the rest of the admin panel.
:::

By leveraging this feature, you can extend the functionality of your Strapi admin panel and create a more tailored experience for your content managers and administrators.

