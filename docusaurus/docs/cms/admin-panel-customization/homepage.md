---
title: Homepage customization
description: Learn about the Strapi admin panel Homepage and how to customize it with widgets.
toc_max_heading_level: 6
tags:
- admin panel
- homepage
- widgets
- features
---

# Homepage customization

The <Icon name="house" /> Homepage is the landing page of the Strapi admin panel. By default, it provides an overview of your content with 2 default widgets:

- _Last edited entries_: Displays recently modified content entries, including their content type, status, and when they were updated.
- _Last published entries_: Shows recently published content entries, allowing you to quickly access and manage your published content.

<ThemedImage
  alt="Homepage with default widgets"
  sources={{
    light: '/img/assets/admin-homepage/admin-panel-homepage.png',
    dark: '/img/assets/admin-homepage/admin-panel-homepage_DARK.png',
  }}
/>

These default widgets cannot currently be removed, but you can customize the Homepage by creating your own widgets.

:::note
If you recently created a Strapi project, the Homepage may also display a quick tour above widgets if you haven't skipped it yet.
:::

## Adding custom widgets <FeatureFlagBadge feature="unstableWidgetsApi"/>

To add a custom widget, you need to:

- register it
- create a widget component

### Enabling the feature flag

To enable custom widgets, set the `unstableWidgetsApi` feature flag to `true` in [the `config/features` file](/cms/configurations/features):

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="config/features.js"
module.exports = ({ env }) => ({
  future: {
    unstableWidgetsApi: true,
  },
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="config/features.ts"
export default ({ env }) => ({
  future: {
    unstableWidgetsApi: true,
  },
});
```

</TabItem>

</Tabs>

After enabling the feature flag and restarting your application, the Homepage will be able to display the registered custom widgets.

### Registering custom widgets

The recommended way to create a widget is through a Strapi plugin (see [plugins development](/cms/plugins-development/developing-plugins) for additional information on how to create a plugin). But like [custom fields](/cms/features/custom-fields), you can also register a widget through the [application's global `register()` lifecycle](/cms/configurations/functions#register).

To register a widget, use `app.widgets.register()`.

If you're building a plugin, use this in the plugin’s [`register` lifecycle method](/cms/plugins-development/server-api#register) in the `index` file. If you're adding the widget to just one Strapi application, without a plugin, use the global `register()` lifecycle method instead.

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```jsx title="src/plugins/my-plugin/admin/src/index.js"
import pluginId from './pluginId';
import MyWidgetIcon from './components/MyWidgetIcon';

export default {
  register(app) {
    // Register the plugin itself
    app.registerPlugin({
      id: pluginId,
      name: 'My Plugin',
    });
    
    // Register a widget for the Homepage
    app.widgets.register({
      icon: MyWidgetIcon,
      title: {
        id: `${pluginId}.widget.title`,
        defaultMessage: 'My Widget',
      },
      component: async () => {
        const component = await import('./components/MyWidget');
        return component.default;
      },
      id: 'my-custom-widget',
      pluginId: pluginId,
    });
  },
  
  bootstrap() {},
  // ...
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```tsx title="src/plugins/my-plugin/admin/src/index.ts"
import pluginId from './pluginId';
import MyWidgetIcon from './components/MyWidgetIcon';
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    // Register the plugin itself
    app.registerPlugin({
      id: pluginId,
      name: 'My Plugin',
    });
    
    // Register a widget for the Homepage
    app.widgets.register({
      icon: MyWidgetIcon,
      title: {
        id: `${pluginId}.widget.title`,
        defaultMessage: 'My Widget',
      },
      component: async () => {
        const component = await import('./components/MyWidget');
        return component.default;
      },
      id: 'my-custom-widget',
      pluginId: pluginId,
    });
  },
  
  bootstrap() {},
  // ...
};
```

</TabItem>
</Tabs>

#### Widget API reference

The `app.widgets.register()` method can take either a single widget configuration object or an array of configuration objects. Each widget configuration object can accept the following properties:

| Property    | Type                   | Description                                           | Required |
|-------------|------------------------|-------------------------------------------------------|----------|
| `icon`      | `React.ComponentType`  | Icon component to display beside the widget title     | Yes      |
| `title`     | `MessageDescriptor`    | Title for the widget with translation support         | Yes      |
| `component` | `() => Promise<React.ComponentType>` | Async function that returns the widget component | Yes      |
| `id`        | `string`               | Unique identifier for the widget                      | Yes      |
| `link`      | `Object`               | Optional link to add to the widget (see link object properties)| No       |
| `pluginId`  | `string`               | ID of the plugin registering the widget               | No       |
| `permissions` | `Permission[]`       | Permissions required to view the widget               | No       |

**Link object properties:**

If you want to add a link to your widget (e.g., to navigate to a detailed view), you can provide a `link` object with the following properties:

| Property | Type              | Description                                    | Required |
|----------|-------------------|------------------------------------------------|----------|
| `label`  | `MessageDescriptor` | The text to display for the link               | Yes      |
| `href`   | `string`          | The URL where the link should navigate to      | Yes      |


### Creating a widget component

Widget components should be designed to display content in a compact and informative way. Here's how to implement a basic widget component:

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```jsx title="src/plugins/my-plugin/admin/src/components/MyWidget/index.js"
import React, { useState, useEffect } from 'react';
import { Widget } from '@strapi/admin/strapi-admin';

const MyWidget = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch your data here
    const fetchData = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch('/my-plugin/data');
        const result = await response.json();
        
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Widget.Loading />;
  }

  if (error) {
    return <Widget.Error />;
  }

  if (!data || data.length === 0) {
    return <Widget.NoData>No data available</Widget.NoData>;
  }

  return (
    <div>
      {/* Your widget content here */}
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MyWidget;
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```tsx title="src/plugins/my-plugin/admin/src/components/MyWidget/index.tsx"
import React, { useState, useEffect } from 'react';
import { Widget } from '@strapi/admin/strapi-admin';

interface DataItem {
  id: number;
  name: string;
}

const MyWidget: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DataItem[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch your data here
    const fetchData = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch('/my-plugin/data');
        const result = await response.json();
        
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Widget.Loading />;
  }

  if (error) {
    return <Widget.Error />;
  }

  if (!data || data.length === 0) {
    return <Widget.NoData>No data available</Widget.NoData>;
  }

  return (
    <div>
      {/* Your widget content here */}
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MyWidget;
```

</TabItem>
</Tabs>


<!-- TODO: document the "Data management" part from the RFC: see https://www.notion.so/strapi/Homepage-widgets-API-RFC-1988f3598074807493e1f594b66dd82d?pvs=4#1998f35980748019966acb49feaf27e3 -->

##### Widget helper components

Strapi provides several helper components to maintain a consistent user experience across widgets:

| Component        | Description                                         | Usage                                |
|------------------|-----------------------------------------------------|--------------------------------------|
| `Widget.Loading` | Displays a loading spinner and message              | When data is being fetched           |
| `Widget.Error`   | Displays an error state                             | When an error occurs                 |
| `Widget.NoData`  | Displays when no data is available                  | When the widget has no data to show  |
| `Widget.NoPermissions` | Displays when user lacks required permissions | When the user cannot access the widget |

These components help maintain a consistent look and feel across different widgets.

## Example: Adding a content metrics widget

The following is a complete example of creating a content metrics widget that displays a count of different content types entries saved in your Strapi application:

<!-- TODO: update code with my own repo's code -->
<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```jsx title="src/plugins/content-metrics/admin/src/index.js"
import { ChartBar } from '@strapi/icons';
import pluginId from './pluginId';

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      name: 'Content Metrics',
    });
    
    app.widgets.register({
      icon: ChartBar,
      title: {
        id: `${pluginId}.widget.metrics.title`,
        defaultMessage: 'Content Overview',
      },
      component: async () => {
        const component = await import('./components/MetricsWidget');
        return component.default;
      },
      id: 'content-metrics',
      pluginId: pluginId,
    });
  },
  
  bootstrap() {},
};
```

```jsx title="src/plugins/content-metrics/admin/src/components/MetricsWidget/index.js"
import React, { useState, useEffect } from 'react';
import { Widget } from '@strapi/admin/strapi-admin';
import { Table, Tbody, Tr, Td, Typography, Box } from '@strapi/design-system';
import { useStrapiApp } from '@strapi/helper-plugin';

const MetricsWidget = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const { getPlugin } = useStrapiApp();
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Make a request to a custom endpoint that returns content counts
        const response = await fetch('/content-metrics/count');
        const data = await response.json();
        
        setMetrics(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  if (loading) {
    return <Widget.Loading />;
  }
  
  if (error) {
    return <Widget.Error />;
  }
  
  if (!metrics || Object.keys(metrics).length === 0) {
    return <Widget.NoData>No content types found</Widget.NoData>;
  }
  
  return (
    <Box padding={4}>
      <Table>
        <Tbody>
          {Object.entries(metrics).map(([contentType, count]) => (
            <Tr key={contentType}>
              <Td>
                <Typography variant="omega">{contentType}</Typography>
              </Td>
              <Td>
                <Typography variant="omega" fontWeight="bold">{count}</Typography>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default MetricsWidget;
```

```js title="src/plugins/content-metrics/server/src/controllers/metrics.js"
'use strict';

module.exports = ({ strapi }) => ({
  async getContentCounts(ctx) {
    try {
      // Get all content types
      const contentTypes = Object.keys(strapi.contentTypes)
        .filter(uid => uid.startsWith('api::'))
        .reduce((acc, uid) => {
          const contentType = strapi.contentTypes[uid];
          acc[contentType.info.displayName || uid] = 0;
          return acc;
        }, {});
      
      // Count entities for each content type
      for (const [name, _] of Object.entries(contentTypes)) {
        const uid = Object.keys(strapi.contentTypes)
          .find(key => 
            strapi.contentTypes[key].info.displayName === name || key === name
          );
          
        if (uid) {
          const count = await strapi.db.query(uid).count();
          contentTypes[name] = count;
        }
      }
      
      ctx.body = contentTypes;
    } catch (err) {
      ctx.throw(500, err);
    }
  }
});
```

```js title="src/plugins/content-metrics/server/src/routes/index.js"
module.exports = [
  {
    method: 'GET',
    path: '/count',
    handler: 'metrics.getContentCounts',
    config: {
      policies: [],
    },
  },
];
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```tsx title="src/plugins/content-metrics/admin/src/index.ts"
import { ChartBar } from '@strapi/icons';
import pluginId from './pluginId';
import type { StrapiApp } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: pluginId,
      name: 'Content Metrics',
    });
    
    app.widgets.register({
      icon: ChartBar,
      title: {
        id: `${pluginId}.widget.metrics.title`,
        defaultMessage: 'Content Overview',
      },
      component: async () => {
        const component = await import('./components/MetricsWidget');
        return component.default;
      },
      id: 'content-metrics',
      pluginId: pluginId,
    });
  },
  
  bootstrap() {},
};
```

```tsx title="src/plugins/content-metrics/admin/src/components/MetricsWidget/index.tsx"
import React, { useState, useEffect } from 'react';
import { Widget } from '@strapi/admin/strapi-admin';
import { Table, Tbody, Tr, Td, Typography, Box } from '@strapi/design-system';
import { useStrapiApp } from '@strapi/helper-plugin';

interface ContentMetrics {
  [contentType: string]: number;
}

const MetricsWidget: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { getPlugin } = useStrapiApp();
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Make a request to a custom endpoint that returns content counts
        const response = await fetch('/content-metrics/count');
        const data = await response.json();
        
        setMetrics(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  if (loading) {
    return <Widget.Loading />;
  }
  
  if (error) {
    return <Widget.Error />;
  }
  
  if (!metrics || Object.keys(metrics).length === 0) {
    return <Widget.NoData>No content types found</Widget.NoData>;
  }
  
  return (
    <Box padding={4}>
      <Table>
        <Tbody>
          {Object.entries(metrics).map(([contentType, count]) => (
            <Tr key={contentType}>
              <Td>
                <Typography variant="omega">{contentType}</Typography>
              </Td>
              <Td>
                <Typography variant="omega" fontWeight="bold">{count}</Typography>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default MetricsWidget;
```

```ts title="src/plugins/content-metrics/server/src/controllers/metrics.ts"
import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  async getContentCounts(ctx) {
    try {
      // Get all content types
      const contentTypes = Object.keys(strapi.contentTypes)
        .filter(uid => uid.startsWith('api::'))
        .reduce<Record<string, number>>((acc, uid) => {
          const contentType = strapi.contentTypes[uid];
          acc[contentType.info.displayName || uid] = 0;
          return acc;
        }, {});
      
      // Count entities for each content type
      for (const [name, _] of Object.entries(contentTypes)) {
        const uid = Object.keys(strapi.contentTypes)
          .find(key => 
            strapi.contentTypes[key].info.displayName === name || key === name
          );
          
        if (uid) {
          const count = await strapi.db.query(uid).count();
          contentTypes[name] = count;
        }
      }
      
      ctx.body = contentTypes;
    } catch (err) {
      ctx.throw(500, err);
    }
  }
});
```

```ts title="src/plugins/content-metrics/server/src/routes/index.ts"
export default [
  {
    method: 'GET',
    path: '/count',
    handler: 'metrics.getContentCounts',
    config: {
      policies: [],
    },
  },
];
```

</TabItem>
</Tabs>

### Adding a widget to the sidebar

If you want to create a more detailed view that works alongside your widget, you can add a link to it:

```jsx
app.widgets.register({
  // ... other properties
  link: {
    label: {
      id: `${pluginId}.widget.metrics.link`,
      defaultMessage: 'View detailed metrics',
    },
    href: `/plugins/${pluginId}`,
  },
});
```