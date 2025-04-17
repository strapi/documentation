---
title: Homepage
description: Learn about the Strapi admin panel Homepage and how to customize it with widgets.
toc_max_heading_level: 6
tags:
- admin panel
- homepage
- widgets
- features
---

# Homepage

The <Icon name="house" /> Homepage is the landing page of the Strapi admin panel. It provides an overview of your content with default widgets, and you can also create your own widgets.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">None</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available and activated by default. Custom widgets require enabling the feature flag.</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<ThemedImage
  alt="Homepage with default widgets"
  sources={{
    light: '/img/assets/admin-homepage/admin-panel-homepage.png',
    dark: '/img/assets/admin-homepage/admin-panel-homepage_DARK.png',
  }}
/>

## Configuration

No admin panel configuration is required to use the Homepage. Through custom code, you can add your own widgets.

### Adding custom widgets <FeatureFlagBadge feature="unstableWidgetsApi"/>

The ability to add custom widgets to the Homepage is an experimental feature that needs to be enabled through a feature flag.

#### Enabling the feature flag

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

After enabling the feature flag and restarting your application, the Homepage will be able to display custom widgets registered by plugins.

#### Creating custom widgets

You can extend the Homepage by developing custom widgets through plugins (see [plugins development](/cms/plugins-development/developing-plugins) for an introduction on creating Strapi plugins). This section covers how to use the Widgets API to create your own widgets.

##### Widget API reference

Widgets are registered using the `app.widgets.register()` method during a plugin's [bootstrap phase](/cms/plugins-development/server-api#bootstrap). This method can take either a single widget configuration object or an array of configuration objects. Each widget configuration object can accept the following properties:

| Property    | Type                   | Description                                           | Required |
|-------------|------------------------|-------------------------------------------------------|----------|
| `icon`      | `React.ComponentType`  | Icon component to display beside the widget title     | Yes      |
| `title`     | `MessageDescriptor`    | Title for the widget with translation support         | Yes      |
| `component` | `() => Promise<React.ComponentType>` | Async function that returns the widget component | Yes      |
| `id`        | `string`               | Unique identifier for the widget                      | Yes      |
| `link`      | `Object`               | Optional link to add to the widget (see [link object properties](#link-object-properties))| No       |
| `pluginId`  | `string`               | ID of the plugin registering the widget               | No       |
| `permissions` | `Permission[]`       | Permissions required to view the widget               | No       |

###### Link object properties

If you want to add a link to your widget (e.g., to navigate to a detailed view), you can provide a `link` object with the following properties:

| Property | Type              | Description                                    | Required |
|----------|-------------------|------------------------------------------------|----------|
| `label`  | `MessageDescriptor` | The text to display for the link               | Yes      |
| `href`   | `string`          | The URL where the link should navigate to      | Yes      |

##### Registering a widget

Widgets are registered in the plugin's admin `index` file, in [the `register` function](/cms/plugins-development/server-api#register):

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

##### Implementing a widget component

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

###### Widget helper components

Strapi provides several helper components to maintain a consistent user experience across widgets:

| Component        | Description                                         | Usage                                |
|------------------|-----------------------------------------------------|--------------------------------------|
| `Widget.Loading` | Displays a loading spinner and message              | When data is being fetched           |
| `Widget.Error`   | Displays an error state                             | When an error occurs                 |
| `Widget.NoData`  | Displays when no data is available                  | When the widget has no data to show  |
| `Widget.NoPermissions` | Displays when user lacks required permissions | When the user cannot access the widget |

These components help maintain a consistent look and feel across different widgets.

#### Complete example: Content metrics widget

Below is a complete example of creating a content metrics widget that displays a count of different content types in your Strapi application:

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

#### Adding a widget to the sidebar

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

## Usage

The Strapi admin panel Homepage serves as a dashboard providing quick access to your content. By default, it includes several widgets:

<ThemedImage
  alt="Homepage with default widgets"
  sources={{
    light: '/img/assets/admin-homepage/admin-panel-homepage-with-tour.png',
    dark: '/img/assets/admin-homepage/admin-panel-homepage-with-tour_DARK.png',
  }}
/>

- _Last edited entries_: Displays recently modified content entries, including their content type, status, and when they were updated
- _Last published entries_: Shows recently published content entries, allowing you to quickly access and manage your published content

If you recently created a Strapi project, the Homepage may also display a quick tour above widgets. 

Additional, custom widgets will be displayed below the 2 defaults widgets, which currently can not be removed.

:::tip
To re-enable the homepage quick tour if you've ever clicked on the **Skip the tour** button, you can edit the `GUIDED_TOUR_SKIPPED` value to `false` in your browser's local storage.
:::