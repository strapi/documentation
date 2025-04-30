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

## Adding custom widgets

To add a custom widget, you need to:

- register it
- create a widget component

<!-- ### Enabling the feature flag

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

After enabling the feature flag and restarting your application, the Homepage will be able to display the registered custom widgets. -->

### Registering custom widgets

To register a widget, use `app.widgets.register()`:
- in the plugin’s [`register` lifecycle method](/cms/plugins-development/server-api#register) of the `index` file if you're building a plugin (recommended way),
- or in the [application's global `register()` lifecycle method](/cms/configurations/functions#register) if you're adding the widget to just one Strapi application without a plugin.

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

| Property | Type                | Description                                    | Required |
|----------|---------------------|------------------------------------------------|----------|
| `label`  | `MessageDescriptor` | The text to display for the link               | Yes      |
| `href`   | `string`            | The URL where the link should navigate to      | Yes      |

### Creating a widget component

Widget components should be designed to display content in a compact and informative way. 

Here's how to implement a basic widget component:

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

**Data management**:

![Rendering and Data management](/img/assets/homepage-customization/rendering-data-management.png)

The green box above represents the area where the user’s React component (from `widget.component` in the [API](#widget-api-reference)) is rendered. You can render whatever you like inside of this box. Everything outside that box is, however, rendered by Strapi. This ensures overall design consistency within the admin panel. The `icon`, `title`, and `link` (optional) properties provided in the API are used to display the widget.

#### Widget helper components reference

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

<Tabs groupId="js-ts">
<TabItem value="javascript" label="JavaScript">

```jsx title="src/plugins/content-metrics/admin/src/index.js" {28-42}
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { Stethoscope } from '@strapi/icons'

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    // Registers the widget
    app.widgets.register({
      icon: Stethoscope,
      title: {
        id: `${PLUGIN_ID}.widget.metrics.title`, 
        defaultMessage: 'Content Metrics',
      },
      component: async () => {
        const component = await import('./components/MetricsWidget');
        return component.default;
      },
      id: 'content-metrics',
      pluginId: PLUGIN_ID, 
    });
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },

  bootstrap() {},
};
```

```jsx title="src/plugins/content-metrics/admin/src/components/MetricsWidget/index.js"
iimport React, { useState, useEffect } from 'react';
import { Table, Tbody, Tr, Td, Typography, Box } from '@strapi/design-system';

const MetricsWidget = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/content-metrics/count');
        const data = await response.json();

        const formattedData = {};
        
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(key => {
            const value = data[key];
            formattedData[key] = typeof value === 'number' ? value : String(value);
          });
        }
        
        setMetrics(formattedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  if (loading) {
    return (
      <Typography variant="omega">Loading content metrics...</Typography>
    );
  }
  
  if (error) {
    return (
      <Typography variant="omega" textColor="danger600">
        Error: {String(error)}
      </Typography>
    );
  }
  
  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <Typography variant="omega">No content types found</Typography>
    );
  }
  
  return (
    <Table>
      <Tbody>
        {Object.entries(metrics).map(([contentType, count], index) => (
          <Tr key={index}>
            <Td>
              <Typography variant="omega">{String(contentType)}</Typography>
            </Td>
            <Td>
              <Typography variant="omega" fontWeight="bold">{String(count)}</Typography>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
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
export default {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/count',
        handler: 'metrics.getContentCounts',
        config: {
          policies: [],
        },
      },
    ],
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```jsx title="src/plugins/content-metrics/admin/src/index.js" {28-42}
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { Stethoscope } from '@strapi/icons'

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');
        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    // Registers the widget
    app.widgets.register({
      icon: Stethoscope,
      title: {
        id: `${PLUGIN_ID}.widget.metrics.title`, 
        defaultMessage: 'Content Metrics',
      },
      component: async () => {
        const component = await import('./components/MetricsWidget');
        return component.default;
      },
      id: 'content-metrics',
      pluginId: PLUGIN_ID, 
    });
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },

  bootstrap() {},
};
```

```jsx title="src/plugins/content-metrics/admin/src/components/MetricsWidget/index.js"
iimport React, { useState, useEffect } from 'react';
import { Table, Tbody, Tr, Td, Typography, Box } from '@strapi/design-system';

const MetricsWidget = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/content-metrics/count');
        const data = await response.json();

        const formattedData = {};
        
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(key => {
            const value = data[key];
            formattedData[key] = typeof value === 'number' ? value : String(value);
          });
        }
        
        setMetrics(formattedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  if (loading) {
    return (
      <Typography variant="omega">Loading content metrics...</Typography>
    );
  }
  
  if (error) {
    return (
      <Typography variant="omega" textColor="danger600">
        Error: {String(error)}
      </Typography>
    );
  }
  
  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <Typography variant="omega">No content types found</Typography>
    );
  }
  
  return (
    <Table>
      <Tbody>
        {Object.entries(metrics).map(([contentType, count], index) => (
          <Tr key={index}>
            <Td>
              <Typography variant="omega">{String(contentType)}</Typography>
            </Td>
            <Td>
              <Typography variant="omega" fontWeight="bold">{String(count)}</Typography>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
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
export default {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/count',
        handler: 'metrics.getContentCounts',
        config: {
          policies: [],
        },
      },
    ],
  },
};
```

</TabItem>
</Tabs>
