---
title: Homepage customization
description: >-
  Learn about the Strapi admin panel Homepage and how to customize it with
  widgets.
toc_max_heading_level: 6
tags:
  - admin panel
  - homepage
  - widgets
  - features
---
# Homepage customization

The  Homepage is the landing page of the Strapi admin panel. By default, it provides an overview of your content with 2 default widgets:

- _Last edited entries_: Displays recently modified content entries, including their content type, status, and when they were updated.
- _Last published entries_: Shows recently published content entries, allowing you to quickly access and manage your published content.



These default widgets cannot currently be removed, but you can customize the Homepage by creating your own widgets.

:::note
If you recently created a Strapi project, the Homepage may also display a quick tour above widgets if you haven't skipped it yet.
:::

## Adding custom widgets 

To add a custom widget, you need to:

- register it
- create a widget component

### Enabling the feature flag

To enable custom widgets, set the `unstableWidgetsApi` feature flag to `true` in [the `config/features` file](/cms/configurations/features):





```js title="config/features.js"
module.exports = ({ env }) => ({
  future: {
    unstableWidgetsApi: true,
  },
});
```





```ts title="config/features.ts"
export default ({ env }) => ({
  future: {
    unstableWidgetsApi: true,
  },
});
```





After enabling the feature flag and restarting your application, the Homepage will be able to display the registered custom widgets.

### Registering custom widgets

The recommended way to create a widget is through a Strapi plugin (see [plugins development](/cms/plugins-development/developing-plugins) for additional information on how to create a plugin). But like [custom fields](/cms/features/custom-fields), you can also register a widget through the [application's global `register()` lifecycle](/cms/configurations/functions#register).

To register a widget, use `app.widgets.register()`.

If you're building a plugin, use this in the plugin's [`register` lifecycle method](/cms/plugins-development/server-api#register) in the `index` file. If you're adding the widget to just one Strapi application, without a plugin, use the global `register()` lifecycle method instead.




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




#### Widget API reference

The `app.widgets.register()` method can take either a single widget configuration object or an array of configuration objects. Each widget configuration object can accept the following properties:

| Property    | Type                   | Description                                           | Required |
|-------------|------------------------|-------------------------------------------------------|----------|
| `icon`      | `React.ComponentType`  | Icon component to display beside the widget title     | Yes      |
| `title`     | `MessageDescriptor`    | Title for the widget with translation support         | Yes      |
| `component` | `() => Promise` | Async function that returns the widget component | Yes      |
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
    return ;
  }

  if (error) {
    return ;
  }

  if (!data || data.length === 0) {
    return No data available;
  }

  return (
    
      {/* Your widget content here */}
      
        {data.map((item) => (
          {item.name}
        ))}
      
    
  );
};

export default MyWidget;
```





```tsx title="src/plugins/my-plugin/admin/src/components/MyWidget/index.tsx"
import React, { useState, useEffect } from 'react';
import { Widget } from '@strapi/admin/strapi-admin';

interface DataItem {
  id: number;
  name: string;
}

const MyWidget: React.FC = () => {
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
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return ;
  }

  if (error) {
    return ;
  }

  if (!data || data.length === 0) {
    return No data available;
  }

  return (
    
      {/* Your widget content here */}
      
        {data.map((item) => (
          {item.name}
        ))}
      
    
  );
};

export default MyWidget;
```







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
    return ;
  }
  
  if (error) {
    return ;
  }
  
  if (!metrics || Object.keys(metrics).length === 0) {
    return No content types found;
  }
  
  return (
    
      
        
          {Object.entries(metrics).map(([contentType, count]) => (
            
              
                {contentType}
              
              
                {count}
              
            
          ))}
        
      
    
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
        id: `${pluginId}.widget.metrics
