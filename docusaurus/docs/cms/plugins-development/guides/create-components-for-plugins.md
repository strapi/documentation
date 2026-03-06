---
title: How to create components for Strapi plugins
description: Learn how to create and configure components for your Strapi plugins
sidebar_label: Create components for plugins
displayed_sidebar: cmsSidebar
tags:
- admin panel
- components
- content-type
- guides
- plugins
- plugins development guides
---

# How to create components for Strapi plugins

When [developing a Strapi plugin](/cms/plugins-development/developing-plugins), you might want to create reusable components for your plugin. Components in Strapi are reusable data structures that can be used across different content-types.

To create components for your Strapi plugin, you'll need to follow a similar approach to creating content-types, but with some specific differences.

## Creating components

You can create components for your plugins in 2 different ways: using the Content-Type Builder (recommended way) or manually.

### Using the Content-Type Builder 

The recommended way to create components for your plugin is through the Content-Type Builder in the admin panel. 

The [Content-Type Builder documentation](/cms/features/content-type-builder#new-component) provides more details on this process.

### Creating components manually

If you prefer to create components manually, you'll need to:

1. Create a component schema in your plugin's structure.
2. Make sure the component is properly registered.

Components for plugins should be placed in the appropriate directory within your plugin structure. You would typically create them within the server part of your plugin (see [plugin structure documentation](/cms/plugins-development/plugin-structure)).

For more detailed information about components in Strapi, you can refer to the [Model attributes documentation](/cms/backend-customization/models#components-json).

## Reviewing the component structure

Components in Strapi follow the following format in their definition:

```javascript title="/my-plugin/server/components/category/component-name.json"
{
  "attributes": {
    "myComponent": {
      "type": "component",
      "repeatable": true,
      "component": "category.componentName"
    }
  }
}
```

## Component schema example

A component schema defines the structure of a reusable data fragment. Here is an example of a component schema for a plugin:

```json title="my-plugin/server/components/my-category/my-component.json"
{
  "collectionName": "components_my_category_my_components",
  "info": {
    "displayName": "My Component",
    "icon": "align-justify"
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "text"
    }
  }
}
```

This configuration ensures your components will be available in both the Content-Type Builder and Content Manager when used in a content-type that has `pluginOptions` visibility enabled.