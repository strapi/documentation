---
title: Admin hooks
description: Create and register hooks in Strapi plugins to let other plugins add personalized behavior to your application.
pagination_prev: cms/plugins-development/admin-redux-store
pagination_next: cms/plugins-development/admin-fetch-client
displayed_sidebar: cmsSidebar
tags:
- admin panel
- admin panel customization
- admin panel API
- hooks API
- plugins development
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-admin-panel.md'

# Admin Panel API: Hooks

<Tldr>

The Hooks API lets plugins create extension points (`createHook` in `register`) and subscribe to them (`registerHook` in `bootstrap`). Hooks run in series, waterfall, or parallel. Strapi includes predefined hooks for the Content Manager's List and Edit views.

</Tldr>

The Hooks API allows a plugin to create and register hooks, i.e. places in the application where plugins can add personalized behavior.

<Prerequisite />

## Creating hooks

Create hook extension points with `createHook()` during the [`register`](/cms/plugins-development/admin-panel-api#register) lifecycle. This declares that your plugin provides an extension point that other plugins can subscribe to.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/index.js"
export default {
  register(app) {
    app.createHook('My-PLUGIN/MY_HOOK');
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.createHook('My-PLUGIN/MY_HOOK');
  },
};
```

</TabItem>
</Tabs>

:::note
For predictable interoperability between plugins, use stable namespaced hook IDs such as `my-plugin/my-hook`.
:::

## Subscribing to hooks

Subscribe to hooks with `registerHook()` during the [`bootstrap`](/cms/plugins-development/admin-panel-api#bootstrap) lifecycle, once all plugins are loaded. The callback receives arguments from the hook caller and should return the (optionally mutated) data.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-other-plugin/admin/src/index.js"
export default {
  bootstrap(app) {
    app.registerHook('My-PLUGIN/MY_HOOK', (...args) => {
      console.log(args);

      // important: return the mutated data
      return args;
    });
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-other-plugin/admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  bootstrap(app: StrapiApp) {
    app.registerHook('My-PLUGIN/MY_HOOK', (...args: unknown[]) => {
      console.log(args);

      // important: return the mutated data
      return args;
    });
  },
};
```

</TabItem>
</Tabs>

Async callbacks are also supported:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-other-plugin/admin/src/index.js"
export default {
  bootstrap(app) {
    app.registerHook('My-PLUGIN/MY_HOOK', async (data) => {
      const enrichedData = await fetchExternalData(data);

      // always return data for waterfall hooks
      return enrichedData;
    });
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-other-plugin/admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  bootstrap(app: StrapiApp) {
    app.registerHook('My-PLUGIN/MY_HOOK', async (data: unknown) => {
      const enrichedData = await fetchExternalData(data);

      // always return data for waterfall hooks
      return enrichedData;
    });
  },
};
```

</TabItem>
</Tabs>

## Running hooks

Hooks can be run in 3 modes:

| Mode | Function | Return value |
|---|---|---|
| Series | `runHookSeries` | Array of results from each function, in order |
| Parallel | `runHookParallel` | Array of resolved promise results, in order |
| Waterfall | `runHookWaterfall` | Single value after all transformations applied sequentially |

:::caution
For `runHookWaterfall`, each subscriber must return the transformed value so that the next subscriber in the chain receives it. Failing to return a value will break the chain.
:::

## Using predefined hooks

Strapi includes predefined hooks for the Content Manager's List and Edit views.

### `INJECT-COLUMN-IN-TABLE`

The `Admin/CM/pages/ListView/inject-column-in-table` hook can add or mutate columns in the List View of the [Content Manager](/cms/intro):

```tsx
runHookWaterfall(INJECT_COLUMN_IN_TABLE, {
  displayedHeaders: ListFieldLayout[],
  layout: ListFieldLayout,
});
```

The following example subscribes to this hook to add a custom "External id" column:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/index.js"
export default {
  bootstrap(app) {
    app.registerHook(
      'Admin/CM/pages/ListView/inject-column-in-table',
      ({ displayedHeaders, layout }) => {
        return {
          displayedHeaders: [
            ...displayedHeaders,
            {
              attribute: { type: 'custom' },
              label: 'External id',
              name: 'externalId',
              searchable: false,
              sortable: false,
              cellFormatter: (document) => document.externalId,
            },
          ],
          layout,
        };
      }
    );
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  bootstrap(app: StrapiApp) {
    app.registerHook(
      'Admin/CM/pages/ListView/inject-column-in-table',
      ({ displayedHeaders, layout }) => {
        return {
          displayedHeaders: [
            ...displayedHeaders,
            {
              attribute: { type: 'custom' },
              label: 'External id',
              name: 'externalId',
              searchable: false,
              sortable: false,
              cellFormatter: (document) => document.externalId,
            },
          ],
          layout,
        };
      }
    );
  },
};
```

</TabItem>
</Tabs>

**ListFieldLayout and ListLayout type definitions**:

<ExpandableContent>

```tsx
interface ListFieldLayout {
  /**
   * The attribute data from the content-type's schema for the field
   */
  attribute: Attribute.Any | { type: 'custom' };
  /**
   * Typically used by plugins to render a custom cell
   */
  cellFormatter?: (
    data: Document,
    header: Omit<ListFieldLayout, 'cellFormatter'>,
    { collectionType, model }: { collectionType: string; model: string }
  ) => React.ReactNode;
  label: string | MessageDescriptor;
  /**
   * the name of the attribute we use to display the actual name e.g. relations
   * are just ids, so we use the mainField to display something meaninginful by
   * looking at the target's schema
   */
  mainField?: string;
  name: string;
  searchable?: boolean;
  sortable?: boolean;
}

interface ListLayout {
  layout: ListFieldLayout[];
  components?: never;
  metadatas: {
    [K in keyof Contracts.ContentTypes.Metadatas]: Contracts.ContentTypes.Metadatas[K]['list'];
  };
  options: LayoutOptions;
  settings: LayoutSettings;
}

type LayoutOptions = Schema['options'] & Schema['pluginOptions'] & object;

interface LayoutSettings extends Contracts.ContentTypes.Settings {
  displayName?: string;
  icon?: never;
}
```

</ExpandableContent>

### `MUTATE-EDIT-VIEW-LAYOUT`

The `Admin/CM/pages/EditView/mutate-edit-view-layout` hook can mutate the Edit View layout of the [Content Manager](/cms/intro).

The following example subscribes to this hook to force all fields to full width:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="my-plugin/admin/src/index.js"
export default {
  bootstrap(app) {
    app.registerHook(
      'Admin/CM/pages/EditView/mutate-edit-view-layout',
      ({ layout, ...rest }) => {
        // Force all fields to full width in the default edit layout
        const updatedLayout = layout.map((rowGroup) =>
          rowGroup.map((row) => row.map((field) => ({ ...field, size: 12 })))
        );

        return {
          ...rest,
          layout: updatedLayout,
        };
      }
    );
  },
};
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="my-plugin/admin/src/index.ts"
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  bootstrap(app: StrapiApp) {
    app.registerHook(
      'Admin/CM/pages/EditView/mutate-edit-view-layout',
      ({ layout, ...rest }) => {
        // Force all fields to full width in the default edit layout
        const updatedLayout = layout.map((rowGroup) =>
          rowGroup.map((row) => row.map((field) => ({ ...field, size: 12 })))
        );

        return {
          ...rest,
          layout: updatedLayout,
        };
      }
    );
  },
};
```

</TabItem>
</Tabs>

**EditLayout and EditFieldLayout type definitions:**

<ExpandableContent>

```tsx
interface EditLayout {
  layout: Array<Array<EditFieldLayout[]>>;
  components: {
    [uid: string]: {
      layout: Array<EditFieldLayout[]>;
      settings: Contracts.Components.ComponentConfiguration['settings'] & {
        displayName?: string;
        icon?: string;
      };
    };
  };
  metadatas: {
    [K in keyof Contracts.ContentTypes.Metadatas]: Contracts.ContentTypes.Metadatas[K]['edit'];
  };
  options: LayoutOptions;
  settings: LayoutSettings;
}

interface EditFieldSharedProps extends Omit<InputProps, 'hint' | 'type'> {
  hint?: string;
  mainField?: string;
  size: number;
  unique?: boolean;
  visible?: boolean;
}

/**
 * Map over all the types in Attribute Types and use that to create a union of new types where the attribute type
 * is under the property attribute and the type is under the property type.
 */
type EditFieldLayout = {
  [K in Attribute.Kind]: EditFieldSharedProps & {
    attribute: Extract<Attribute.Any, { type: K }>;
    type: K;
  };
}[Attribute.Kind];

type LayoutOptions = Schema['options'] & Schema['pluginOptions'] & object;

interface LayoutSettings extends Contracts.ContentTypes.Settings {
  displayName?: string;
  icon?: never;
}
```

</ExpandableContent>

:::note
The `EditLayout` and `ListLayout` shapes documented here come from the `useDocumentLayout` hook (see <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/core/content-manager/admin/src/hooks/useDocumentLayout.ts" text="source code"/>). Internal package naming can vary, but plugin authors should rely on the `EditLayout` and `ListLayout` shapes exposed in this page.
:::