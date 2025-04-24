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
* The [Admin Panel API for plugins](/cms/plugins-development/admin-panel-api) will also provide additional information on developing for Strapi's admin panel.
:::

## Adding a Widget to the Sidebar

Strapi allows you to extend the admin panel by adding custom widgets to the sidebar. This feature enables you to integrate additional functionality or information directly into the main navigation area of the admin panel. Custom sidebar widgets can enhance the user experience by providing quick access to important data, custom actions, or external resources.

### Implementation

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

### Customizing Your Widget

While the example above shows a simple string being rendered, you can replace it with a more complex React component to create a fully functional widget. This component can include:

- Custom logic and state management
- API calls to fetch and display data
- Interactive elements like buttons or forms
- Styling to match your application's design

For example, you could create a widget that displays a summary of recent content entries or provides quick access to frequently used features.

### Best Practices

When creating a custom sidebar widget, consider the following best practices:

1. **Performance**: Ensure your widget doesn't negatively impact the admin panel's performance, especially if it makes API calls or processes large amounts of data.

2. **Design Consistency**: Follow Strapi's design guidelines to maintain a consistent look and feel within the admin panel.

3. **Responsiveness**: Make sure your widget works well on different screen sizes, as the sidebar may be collapsed on smaller screens.

4. **Error Handling**: Implement proper error handling to gracefully manage any issues that may occur, such as failed API requests.

5. **Internationalization**: If your widget includes text, consider using Strapi's internationalization features to support multiple languages.

6. **Accessibility**: Ensure your widget is accessible, following web accessibility guidelines (WCAG) for all interactive elements.

By leveraging this feature, you can enhance the admin panel with tailored functionality that meets the specific needs of your project or organization. Custom sidebar widgets offer a powerful way to extend Strapi's capabilities and improve the overall user experience for content managers and administrators.
