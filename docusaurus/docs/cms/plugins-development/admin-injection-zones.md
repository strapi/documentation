---
title: Admin injection zones
description: Extend and customize the Strapi admin panel by injecting React components into predefined or custom injection zones.
pagination_prev: cms/plugins-development/content-manager-apis
pagination_next: cms/plugins-development/admin-redux-store
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
  - admin panel
  - admin panel customization
  - admin panel API
  - injection zones
  - plugin customization
  - Content Manager
  - plugins development
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-admin-panel.md'
import InjectionVsCmApis from '/docs/snippets/injection-zones-vs-content-manager-apis.md'

# Admin Panel API: Injection zones

<Tldr>

Injection zones are predefined areas in the admin UI where plugins can inject React components. Use `getPlugin('content-manager').injectComponent()` to extend built-in views, or define your own zones with `injectionZones` in `registerPlugin`.

</Tldr>

Plugins can extend and customize existing admin panel sections by injecting custom React components into predefined areas. This allows you to add functionality to Strapi's built-in interfaces without modifying core code.

:::note
Injection zones are defined in the [`register`](/cms/plugins-development/admin-panel-api#register) lifecycle function, but components are injected in the [`bootstrap`](/cms/plugins-development/admin-panel-api#bootstrap) lifecycle function.
:::

:::tip
For adding panels, actions, or buttons to the Content Manager, the [Content Manager APIs](/cms/plugins-development/content-manager-apis) (`addDocumentAction`, `addEditViewSidePanel`, etc.) are often more robust and better typed than injection zones. Use injection zones when you need to insert components into specific UI areas not covered by the Content Manager APIs.
:::

<Prerequisite />

<InjectionVsCmApis />

## Predefined injection zones

Strapi's Content Manager provides predefined injection zones that plugins can use:

| View | Injection zone | Location |
|---|---|---|
| List view | `listView.actions` | Between the Filters and the cogs icon |
| List view | `listView.publishModalAdditionalInfos` | Informational content in the publish confirmation modal |
| List view | `listView.unpublishModalAdditionalInfos` | Informational content in the unpublish confirmation modal |
| List view | `listView.deleteModalAdditionalInfos` | Informational content in the delete confirmation modal |
| Edit view | `editView.right-links` | Between the "Configure the view" and "Edit" buttons |
| Edit view | `editView.informations` | In the informations box of the Edit view (internal, see note below) |
| Preview | `preview.actions` | In the preview view action area |

The `listView.*ModalAdditionalInfos` zones are intended to enrich the informational content displayed in publish, unpublish, and delete confirmation modals.

:::caution
The `editView.informations` zone exists in the Content Manager source code but is considered internal. For third-party plugins, `editView.right-links` is the most stable and officially recommended Edit view extension point. Use `editView.informations` only when you specifically need the information panel area and accept potential UI changes between versions.
:::

### Injecting into Content Manager zones

To inject a component into a Content Manager injection zone, use `getPlugin('content-manager').injectComponent()` in the `bootstrap` lifecycle:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/index.js"
import { MyCustomButton } from './components/MyCustomButton';
import { PreviewAction } from './components/PreviewAction';
import { PublishModalInfo } from './components/PublishModalInfo';

export default {
  register(app) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
  bootstrap(app) {
    // Inject a button into the Edit view's right-links zone
    // highlight-start
    app
      .getPlugin('content-manager')
      .injectComponent('editView', 'right-links', {
        name: 'my-plugin-custom-button',
        Component: MyCustomButton,
      });
    // highlight-end

    // Inject a component into the List view's actions zone
    // highlight-start
    app
      .getPlugin('content-manager')
      .injectComponent('listView', 'actions', {
        name: 'my-plugin-list-action',
        Component: () => <button>Custom List Action</button>,
    });
    // highlight-end

    // Inject additional information into the publish modal
    // highlight-start
    app
      .getPlugin('content-manager')
      .injectComponent('listView', 'publishModalAdditionalInfos', {
        name: 'my-plugin-publish-modal-info',
        Component: PublishModalInfo,
      });
    // highlight-end

    // Inject a component into the Preview view's actions zone
    // highlight-start
    app
      .getPlugin('content-manager')
      .injectComponent('preview', 'actions', {
        name: 'my-plugin-preview-action',
        Component: PreviewAction,
    });
    // highlight-end
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';
import { MyCustomButton } from './components/MyCustomButton';
import { PreviewAction } from './components/PreviewAction';
import { PublishModalInfo } from './components/PublishModalInfo';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin',
    });
  },
  bootstrap(app: StrapiApp) {
    // Inject a button into the Edit view's right-links zone
    // highlight-start
    app
      .getPlugin('content-manager')
      .injectComponent('editView', 'right-links', {
        name: 'my-plugin-custom-button',
        Component: MyCustomButton,
      });
    // highlight-end

    // Inject a component into the List view's actions zone
    app
    // highlight-start
      .getPlugin('content-manager') 
      .injectComponent('listView', 'actions', {
        name: 'my-plugin-list-action',
        Component: () => <button>Custom List Action</button>,
    });
    // highlight-end

    // Inject additional information into the publish modal
    app
    // highlight-start
      .getPlugin('content-manager')
      .injectComponent('listView', 'publishModalAdditionalInfos', {
        name: 'my-plugin-publish-modal-info',
        Component: PublishModalInfo,
      });
    // highlight-end

    // Inject a component into the Preview view's actions zone
    app
    // highlight-start
      .getPlugin('content-manager')
      .injectComponent('preview', 'actions', {
        name: 'my-plugin-preview-action',
        Component: PreviewAction,
    });
    // highlight-end
  },
};
```

</TabItem>
</Tabs>

## Custom injection zones

Plugins can define their own injection zones to allow other plugins to extend their UI. Declare injection zones in the `registerPlugin` configuration:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/index.js"
export default {
  register(app) {
    app.registerPlugin({
      id: 'dashboard',
      name: 'Dashboard',
      // highlight-start
      injectionZones: {
        homePage: {
          top: [],
          middle: [],
          bottom: [],
        },
        sidebar: {
          before: [],
          after: [],
        },
      },
    });
    // highlight-end
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'dashboard',
      name: 'Dashboard',
      // highlight-start
      injectionZones: {
        homePage: {
          top: [],
          middle: [],
          bottom: [],
        },
        sidebar: {
          before: [],
          after: [],
        },
      },
      // highlight-end
    });
  },
};
```

</TabItem>
</Tabs>

### Rendering injection zones in components

<!-- TODO: Verify the correct import path for InjectionZone in Strapi 5. The @strapi/helper-plugin package was deprecated in v5. Check if InjectionZone should be imported from @strapi/strapi/admin or another package. -->

To render injected components in your plugin's UI, use the `<InjectionZone />` React component with an `area` prop following the naming convention `plugin-name.viewName.injectionZoneName`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/pages/Dashboard.jsx"
import { InjectionZone } from '@strapi/helper-plugin';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Render components injected into the top zone */}
      <InjectionZone area="dashboard.homePage.top" />

      <div className="main-content">{/* Main dashboard content */}</div>

      {/* Render components injected into the bottom zone */}
      <InjectionZone area="dashboard.homePage.bottom" />
    </div>
  );
};

export default Dashboard;
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="admin/src/pages/Dashboard.tsx"
import { InjectionZone } from '@strapi/helper-plugin';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Render components injected into the top zone */}
      <InjectionZone area="dashboard.homePage.top" />

      <div className="main-content">{/* Main dashboard content */}</div>

      {/* Render components injected into the bottom zone */}
      <InjectionZone area="dashboard.homePage.bottom" />
    </div>
  );
};

export default Dashboard;
```

</TabItem>
</Tabs>

### Injecting into custom zones

Other plugins can inject components into your custom injection zones using the `injectComponent()` method in their `bootstrap` lifecycle:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="another-plugin/admin/src/index.js"
import { Widget } from './components/Widget';

export default {
  register(app) {
    app.registerPlugin({
      id: 'widget-plugin',
      name: 'Widget Plugin',
    });
  },
  // highlight-start
  bootstrap(app) {
    const dashboardPlugin = app.getPlugin('dashboard');

    if (dashboardPlugin) {
      dashboardPlugin.injectComponent('homePage', 'top', {
        name: 'widget-plugin-statistics',
        Component: Widget,
      });
    }
  },
  // highlight-end
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="another-plugin/admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';
import { Widget } from './components/Widget';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'widget-plugin',
      name: 'Widget Plugin',
    });
  },
  // highlight-start
  bootstrap(app: StrapiApp) {
    const dashboardPlugin = app.getPlugin('dashboard');

    if (dashboardPlugin) {
      dashboardPlugin.injectComponent('homePage', 'top', {
        name: 'widget-plugin-statistics',
        Component: Widget,
      });
    }
  },
  // highlight-end
};
```

</TabItem>
</Tabs>

## Injection component parameters

The `injectComponent()` method accepts the following parameters:

| Parameter | Type | Description |
|---|---|---|
| `view` | `string` | The view name where the component should be injected |
| `zone` | `string` | The zone name within the view where the component should be injected |
| `component` | `object` | Configuration object with `name` (unique string) and `Component` (React component to inject) |

## Content Manager data access

When injecting components into Content Manager injection zones, you can access the Edit View data using the `useContentManagerContext` hook:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="admin/src/components/MyCustomButton.jsx"
import {
  unstable_useContentManagerContext as useContentManagerContext,
} from '@strapi/strapi/admin';

export const MyCustomButton = () => {
  const {
    slug, // Content type slug (e.g., 'api::article.article')
    model, // Content type model
    id, // Document ID (undefined when creating)
    collectionType, // 'single-types' or 'collection-types'
    isCreatingEntry, // Whether creating a new entry
    isSingleType, // Whether the content type is a single type
    hasDraftAndPublish, // Whether draft & publish is enabled
    contentType, // Content type schema
    components, // Component schemas
    layout, // Content type layout
    form, // Form state and handlers
  } = useContentManagerContext();

  const { initialValues, values, onChange } = form;

  const handleCustomAction = () => {
    onChange({ target: { name: 'customField', value: 'new value' } });
  };

  return <button onClick={handleCustomAction}>Custom Action</button>;
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="admin/src/components/MyCustomButton.tsx"
import {
  unstable_useContentManagerContext as useContentManagerContext,
} from '@strapi/strapi/admin';

export const MyCustomButton = () => {
  const {
    slug, // Content type slug (e.g., 'api::article.article')
    model, // Content type model
    id, // Document ID (undefined when creating)
    collectionType, // 'single-types' or 'collection-types'
    isCreatingEntry, // Whether creating a new entry
    isSingleType, // Whether the content type is a single type
    hasDraftAndPublish, // Whether draft & publish is enabled
    contentType, // Content type schema
    components, // Component schemas
    layout, // Content type layout
    form, // Form state and handlers
  } = useContentManagerContext();

  const { initialValues, values, onChange } = form;

  const handleCustomAction = () => {
    onChange({ target: { name: 'customField', value: 'new value' } });
  };

  return <button onClick={handleCustomAction}>Custom Action</button>;
};
```

</TabItem>
</Tabs>

:::caution
The `useContentManagerContext` hook is currently exported as `unstable_useContentManagerContext`. The `unstable_` prefix indicates the API may change in future releases. This hook replaces the [deprecated `useCMEditViewDataManager`](/cms/migration/v4-to-v5/additional-resources/helper-plugin#usecmeditviewdatamanager)  from `@strapi/helper-plugin` which is not available in Strapi 5.
:::

## Best practices

- **Use descriptive zone names.** Choose clear names for your injection zones (e.g., `top`, `bottom`, `before`, `after`).

- **Check plugin availability.** Always verify that a plugin exists before injecting components into its zones:

  ```js
  bootstrap(app) {
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