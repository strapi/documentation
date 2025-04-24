---
title: Admin panel extension
description: Learn more about extending Strapi's admin panel.
displayed_sidebar: cmsSidebar
sidebar_label: Extension
toc_max_heading_level: 4
tags:
  - admin panel
  - admin panel customization
---
# Admin panel extension

Strapi's admin panel is a React-based single-page application that encapsulates all the features and installed plugins of a Strapi application. If the [customization options](/cms/admin-panel-customization/options) provided by Strapi are not enough for your use case, you will need to extend Strapi's admin panel.

Extending Strapi's admin panel means leveraging its React foundation to adapt and enhance the interface and features according to the specific needs of your project, which might imply creating new components or adding new types of fields.

There are 2 use cases where you might want to extend the admin panel:

- As a Strapi plugin developer, you want to develop a Strapi plugin that extends the admin panel **everytime it's installed in any Strapi application**.

  👉 This can be done by taking advantage of the [Admin Panel API for plugins](/cms/plugins-development/admin-panel-api).

- As a Strapi developer, you want to develop a unique solution for a Strapi user who only needs to extend a specific instance of a Strapi application.

  👉 This can be done by directly updating the `/src/admin/app.[tsx|js]` file, which can import any file located in `/src/admin/extensions`.

:::strapi Additional resources
* If you're searching for ways of replacing the default WYSIWYG editor, please refer to the [corresponding page](/cms/admin-panel-customization/wysiwyg-editor).
* The  will also provide additional information on developing for Strapi's admin panel.
:::



## Adding a Widget to the Sidebar

Strapi allows you to extend the admin panel by adding custom widgets to the sidebar. This feature enables you to integrate additional functionality or information directly into the main navigation area of the admin panel.

To add a widget to the sidebar, you need to use the `admin.injectComponent` method in your `src/admin/app.js` file. Here's an example of how to implement this:

```javascript
export default {
  bootstrap(app) {
    app.injectContentManagerComponent('sidebar', {
      name: 'my-custom-widget',
      Component: () => 'Hello World',
    });
  },
};
```

In this example:

- `app.injectContentManagerComponent` is used to inject a new component into the Content Manager.
- The first argument, `'sidebar'`, specifies that we want to add the component to the sidebar.
- The second argument is an object that defines the properties of our custom widget:
  - `name`: A unique identifier for your widget.
  - `Component`: A React component that defines what will be rendered in the sidebar.

You can replace the simple string `'Hello World'` with a more complex React component to create a fully functional widget. This component can include any custom logic, state management, or API calls you need for your specific use case.

By leveraging this feature, you can enhance the admin panel with tailored functionality, such as displaying summary data, providing quick access to specific content types, or integrating with external services directly from the sidebar.

Remember to follow Strapi's design guidelines and best practices when creating your custom widget to ensure a consistent user experience across the admin panel.
