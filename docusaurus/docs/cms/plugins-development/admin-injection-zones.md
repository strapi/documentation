---
title: Admin injection zones
description: Extend and customize the Strapi admin panel by injecting React components into predefined or custom injection zones.
pagination_prev: cms/plugins-development/admin-localization
pagination_next: cms/plugins-development/admin-redux-store
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
  - admin panel
  - injection zones
  - plugin customization
  - Content Manager
  - plugins development
---

# Admin injection zones

<Tldr>

Injection zones are predefined areas in the admin UI where plugins can inject React components. Use `getPlugin('content-manager').injectComponent()` to extend built-in views, or define your own zones with `injectionZones` in `registerPlugin`.

</Tldr>

Plugins can extend and customize existing admin panel sections by injecting custom React components into predefined areas. This allows you to add functionality to Strapi's built-in interfaces without modifying core code.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin) and are familiar with the [admin entry file lifecycle](/cms/plugins-development/admin-configuration-customization#overview).
:::

## What are injection zones?

Injection zones are predefined areas in a plugin's UI where other plugins can inject custom React components. They are defined in the `register` lifecycle function, but components are injected in the `bootstrap` lifecycle function.

## Predefined injection zones

Strapi's Content Manager provides predefined injection zones that plugins can use:

| View | Injection zone | Location |
|---|---|---|
| List view | `listView.actions` | Between the Filters and the cogs icon |
| Edit view | `editView.right-links` | Between the "Configure the view" and "Edit" buttons |
| Preview | `preview.actions` | In the preview view action area |

### Injecting into Content Manager zones

To inject a component into a Content Manager injection zone, use `getPlugin('content-manager').injectComponent()` in the `bootstrap` lifecycle:

```typescript
// admin/src/index.ts
import type { StrapiApp } from '@strapi/admin/strapi-admin';
import { MyCustomButton } from './components/MyCustomButton';
import { PreviewAction } from './components/PreviewAction';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
  bootstrap(app: StrapiApp) {
    // Inject a button into the Edit view's right-links zone
    app
      .getPlugin('content-manager')
      .injectComponent('editView', 'right-links', {
        name: 'my-plugin-custom-button',
        Component: MyCustomButton,
      });

    // Inject a component into the List view's actions zone
    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: 'my-plugin-list-action',
      Component: () => <button>Custom List Action</button>,
    });

    // Inject a component into the Preview view's actions zone
    app.getPlugin('content-manager').injectComponent('preview', 'actions', {
      name: 'my-plugin-preview-action',
      Component: PreviewAction,
    });
  },
};
```

## Creating custom injection zones

Plugins can define their own injection zones to allow other plugins to extend their UI. Declare injection zones in the `registerPlugin` configuration:

```typescript
// admin/src/index.ts
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'dashboard',
      name: 'Dashboard',
      injectionZones: {
        'dashboard.main': {
          top: [], // Components injected at the top
          middle: [], // Components injected in the middle
          bottom: [], // Components injected at the bottom
        },
        'dashboard.sidebar': {
          before: [], // Components injected before sidebar content
          after: [], // Components injected after sidebar content
        },
      },
    });
  },
};
```

### Using injection zones in components

To render injected components in your plugin's UI, use the `<InjectionZone />` component from `@strapi/helper-plugin`:

```typescript
// admin/src/pages/Dashboard.tsx
import { InjectionZone } from '@strapi/helper-plugin';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Render components injected into the top zone */}
      <InjectionZone area="dashboard.main.top" />

      <div className="main-content">{/* Main dashboard content */}</div>

      {/* Render components injected into the bottom zone */}
      <InjectionZone area="dashboard.main.bottom" />
    </div>
  );
};

export default Dashboard;
```

### Injecting into custom zones

Other plugins can inject components into your custom injection zones using the `injectComponent()` method in their `bootstrap` lifecycle:

```typescript
// Another plugin's admin/src/index.ts
import type { StrapiApp } from '@strapi/admin/strapi-admin';
import { Widget } from './components/Widget';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'widget-plugin',
      name: 'Widget Plugin',
    });
  },
  bootstrap(app: StrapiApp) {
    // Get the dashboard plugin and inject a widget
    const dashboardPlugin = app.getPlugin('dashboard');

    if (dashboardPlugin) {
      dashboardPlugin.injectComponent('dashboard.main', 'top', {
        name: 'widget-plugin-statistics',
        Component: Widget,
      });
    }
  },
};
```

## Injection component parameters

The `injectComponent()` method accepts the following parameters:

| Parameter | Type | Description |
|---|---|---|
| `view` | `string` | The view name where the component should be injected |
| `zone` | `string` | The zone name within the view where the component should be injected |
| `component` | `object` | Configuration object with `name` (unique string) and `Component` (React component to inject) |

## Accessing Content Manager data

When injecting components into Content Manager injection zones, you can access the Edit View data using the `useCMEditViewDataManager` hook:

```typescript
// admin/src/components/MyCustomButton.tsx
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

export const MyCustomButton = () => {
  const {
    slug, // Content type slug (e.g., 'api::article.article')
    modifiedData, // Current form data
    initialData, // Original data
    isCreatingEntry, // Whether creating a new entry
    layout, // Content type layout
    onPublish, // Function to publish the entry
    onChange, // Function to update field values
  } = useCMEditViewDataManager();

  const handleCustomAction = () => {
    // Access and modify the entry data
    onChange({ target: { name: 'customField', value: 'new value' } });
  };

  return <button onClick={handleCustomAction}>Custom Action</button>;
};
```

## Best practices

- **Use descriptive zone names.** Choose clear names for your injection zones (e.g., `top`, `bottom`, `before`, `after`).

- **Check plugin availability.** Always verify that a plugin exists before injecting components into its zones:

  ```typescript
  bootstrap(app: StrapiApp) {
    const targetPlugin = app.getPlugin('target-plugin');
    if (targetPlugin) {
      targetPlugin.injectComponent('view', 'zone', {
        name: 'my-component',
        Component: MyComponent,
      });
    }
  }
  ```

- **Use unique component names.** Ensure component names are unique to avoid conflicts with other plugins.

- **Handle missing zones gracefully.** Components should handle cases where injection zones might not be available.

- **Document your injection zones.** Clearly document which injection zones your plugin provides and their intended use.
