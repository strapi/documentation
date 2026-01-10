---
title: Injection Zones
pagination_prev: cms/plugins-development/plugin-initialization
pagination_next: cms/plugins-development/plugin-readiness
toc_max_heading_level: 4
tags:
  - injection zones
  - plugin UI components
  - component injection
  - plugin customization
  - plugins development
---

# Injection Zones

Injection zones allow your plugin to define areas where other plugins can inject UI components. This creates a flexible system for extending and customizing the admin panel interface.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin) and understand the [Admin Panel API](/cms/plugins-development/admin-panel-api).
:::

## What are Injection Zones?

Injection zones are predefined areas in your plugin's UI where other plugins can inject components. They provide a structured way for plugins to extend each other's interfaces without modifying the original plugin's code.

```typescript
app.registerPlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  injectionZones: {
    'my-plugin.dashboard': {
      top: [],
      bottom: [],
    },
    'my-plugin.settings': {
      before: [],
      after: [],
    },
  },
});
```

## Use Case: Dashboard Widget Plugin

Let's build a **Dashboard Plugin** that provides injection zones for other plugins to add widgets.

### 1. Creating the Dashboard Plugin with Injection Zones

```typescript
// src/plugins/dashboard/admin/src/index.ts
export default {
  register(app: any) {
    app.registerPlugin({
      id: 'dashboard',
      name: 'Dashboard',
      injectionZones: {
        'dashboard.main': {
          top: [], // Widgets at the top of dashboard
          middle: [], // Widgets in the middle
          bottom: [], // Widgets at the bottom
        },
        'dashboard.sidebar': {
          before: [], // Widgets before sidebar content
          after: [], // Widgets after sidebar content
        },
      },
    });
  },
};
```

### 2. Creating the Dashboard Component

```typescript
// src/plugins/dashboard/admin/src/components/Dashboard.tsx
import React from 'react';

const Dashboard: React.FC = () => {
  const topWidgets = app.getAdminInjectedComponents('dashboard', 'main', 'top');
  const middleWidgets = app.getAdminInjectedComponents(
    'dashboard',
    'main',
    'middle'
  );
  const bottomWidgets = app.getAdminInjectedComponents(
    'dashboard',
    'main',
    'bottom'
  );
  const sidebarBefore = app.getAdminInjectedComponents(
    'dashboard',
    'sidebar',
    'before'
  );
  const sidebarAfter = app.getAdminInjectedComponents(
    'dashboard',
    'sidebar',
    'after'
  );

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Top Widgets */}
        <div style={{ marginBottom: '20px' }}>
          {topWidgets.map((widget, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <widget.Component />
            </div>
          ))}
        </div>

        {/* Middle Widgets */}
        <div style={{ marginBottom: '20px' }}>
          {middleWidgets.map((widget, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <widget.Component />
            </div>
          ))}
        </div>

        {/* Bottom Widgets */}
        <div>
          {bottomWidgets.map((widget, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <widget.Component />
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width: '300px' }}>
        {/* Before Sidebar Content */}
        {sidebarBefore.map((widget, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <widget.Component />
          </div>
        ))}

        {/* Default Sidebar Content */}
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <h3>Dashboard Info</h3>
          <p>Welcome to your dashboard!</p>
        </div>

        {/* After Sidebar Content */}
        {sidebarAfter.map((widget, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <widget.Component />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
```

### 3. Other Plugins Injecting Components

```typescript
// src/plugins/analytics/admin/src/index.ts
import AnalyticsWidget from './components/AnalyticsWidget';

export default {
  register(app: any) {
    app.registerPlugin({
      id: 'analytics',
      name: 'Analytics',
    });
  },

  bootstrap(app: any) {
    // Inject analytics widget into dashboard
    app.injectComponent('dashboard', 'main', 'top', {
      name: 'analytics-widget',
      Component: AnalyticsWidget,
    });
  },
};
```

```typescript
// src/plugins/notifications/admin/src/index.ts
import NotificationWidget from './components/NotificationWidget';

export default {
  register(app: any) {
    app.registerPlugin({
      id: 'notifications',
      name: 'Notifications',
    });
  },

  bootstrap(app: any) {
    // Inject notification widget into dashboard sidebar
    app.injectComponent('dashboard', 'sidebar', 'before', {
      name: 'notification-widget',
      Component: NotificationWidget,
    });
  },
};
```

### 4. Widget Components

```typescript
// src/plugins/analytics/admin/src/components/AnalyticsWidget.tsx
import React from 'react';

const AnalyticsWidget: React.FC = () => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    // Fetch analytics data
    fetch('/api/analytics/summary')
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  if (!data) {
    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h4>Analytics</h4>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h4>Analytics Summary</h4>
      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        <div>
          <div
            style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}
          >
            {data.pageViews}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Page Views</div>
        </div>
        <div>
          <div
            style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}
          >
            {data.uniqueVisitors}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Unique Visitors</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
```

```typescript
// src/plugins/notifications/admin/src/components/NotificationWidget.tsx
import React from 'react';

const NotificationWidget: React.FC = () => {
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    // Fetch recent notifications
    fetch('/api/notifications/recent')
      .then((response) => response.json())
      .then((data) => setNotifications(data));
  }, []);

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h4>Recent Notifications</h4>
      {notifications.length === 0 ? (
        <p style={{ color: '#666', fontSize: '14px' }}>
          No recent notifications
        </p>
      ) : (
        <div style={{ marginTop: '10px' }}>
          {notifications.slice(0, 3).map((notification, index) => (
            <div
              key={index}
              style={{
                padding: '8px',
                borderLeft: `3px solid ${getColorForType(notification.type)}`,
                marginBottom: '8px',
                backgroundColor: '#f8f9fa',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {notification.title}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {new Date(notification.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getColorForType = (type: string) => {
  switch (type) {
    case 'success':
      return '#28a745';
    case 'error':
      return '#dc3545';
    case 'warning':
      return '#ffc107';
    default:
      return '#007bff';
  }
};

export default NotificationWidget;
```

## Advanced Injection Zone Patterns

### 1. Conditional Injection

```typescript
// Only inject component if certain conditions are met
bootstrap(app) {
  const user = getCurrentUser();

  if (user.role === 'admin') {
    app.injectComponent('dashboard', 'main', 'top', {
      name: 'admin-widget',
      Component: AdminWidget
    });
  }
}
```

### 2. Multiple Component Injection

```typescript
// Inject multiple components at once
bootstrap(app) {
  const widgets = [
    { name: 'widget-1', Component: Widget1 },
    { name: 'widget-2', Component: Widget2 },
    { name: 'widget-3', Component: Widget3 }
  ];

  widgets.forEach(widget => {
    app.injectComponent('dashboard', 'main', 'middle', widget);
  });
}
```

### 3. Dynamic Component Injection

```typescript
// Inject components based on configuration
bootstrap(app) {
  const config = getPluginConfig();

  config.enabledWidgets.forEach(widgetName => {
    const WidgetComponent = getWidgetComponent(widgetName);
    if (WidgetComponent) {
      app.injectComponent('dashboard', 'main', 'bottom', {
        name: widgetName,
        Component: WidgetComponent
      });
    }
  });
}
```

### 4. Component with Props

```typescript
// Inject component with specific props
bootstrap(app) {
  app.injectComponent('dashboard', 'main', 'top', {
    name: 'configurable-widget',
    Component: (props: any) => <ConfigurableWidget {...props} config={getWidgetConfig()} />
  });
}
```

## Best Practices

### 1. Clear Zone Naming

```typescript
// ✅ Good - Clear, descriptive zone names
injectionZones: {
  'dashboard.main': {
    'top': [],
    'middle': [],
    'bottom': []
  },
  'dashboard.sidebar': {
    'before': [],
    'after': []
  }
}

// ❌ Bad - Unclear zone names
injectionZones: {
  'dashboard.area1': {
    'zone1': [],
    'zone2': []
  }
}
```

### 2. Consistent Component Structure

```typescript
// ✅ Good - Consistent component structure
const Widget: React.FC = () => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Widget content */}
    </div>
  );
};
```

### 3. Error Boundaries

```typescript
// ✅ Good - Wrap injected components in error boundaries
const Dashboard: React.FC = () => {
  const widgets = app.getAdminInjectedComponents('dashboard', 'main', 'top');

  return (
    <div>
      {widgets.map((widget, index) => (
        <ErrorBoundary key={index}>
          <widget.Component />
        </ErrorBoundary>
      ))}
    </div>
  );
};
```

### 4. Performance Optimization

```typescript
// ✅ Good - Lazy load heavy components
bootstrap(app) {
  app.injectComponent('dashboard', 'main', 'top', {
    name: 'heavy-widget',
    Component: React.lazy(() => import('./components/HeavyWidget'))
  });
}
```

## Common Patterns

### 1. Settings Page Extension

```typescript
// Plugin provides settings injection zones
app.registerPlugin({
  id: 'settings',
  name: 'Settings',
  injectionZones: {
    'settings.general': {
      'before': [],
      'after': []
    },
    'settings.advanced': {
      'before': [],
      'after': []
    }
  }
});

// Other plugins inject settings
bootstrap(app) {
  app.injectComponent('settings', 'general', 'after', {
    name: 'plugin-settings',
    Component: PluginSettings
  });
}
```

### 2. Content Manager Extension

```typescript
// Extend Content Manager with custom fields
bootstrap(app) {
  app.injectComponent('content-manager', 'edit-view', 'right-side', {
    name: 'custom-field-panel',
    Component: CustomFieldPanel
  });
}
```

### 3. User Profile Extension

```typescript
// Extend user profile with additional sections
bootstrap(app) {
  app.injectComponent('user-profile', 'main', 'after', {
    name: 'plugin-profile-section',
    Component: PluginProfileSection
  });
}
```

## Troubleshooting

### Common Issues

1. **Components not appearing**

   - Check zone names match exactly
   - Verify component is properly exported
   - Ensure bootstrap function is called

2. **Component errors**

   - Wrap components in error boundaries
   - Check for missing dependencies
   - Verify component props

3. **Performance issues**
   - Use lazy loading for heavy components
   - Implement proper memoization
   - Check for memory leaks

### Debugging Tips

```typescript
// Debug injection zones
const Dashboard: React.FC = () => {
  const widgets = app.getAdminInjectedComponents('dashboard', 'main', 'top');

  console.log('Injected widgets:', widgets);

  return (
    <div>
      {widgets.map((widget, index) => (
        <div key={index}>
          <h5>Widget: {widget.name}</h5>
          <widget.Component />
        </div>
      ))}
    </div>
  );
};
```

## Next Steps

- Learn about [Plugin Readiness](/cms/plugins-development/plugin-readiness) for managing plugin lifecycle
- Explore [Plugin APIs](/cms/plugins-development/plugin-apis) for inter-plugin communication
- Check out [Plugin Initialization](/cms/plugins-development/plugin-initialization) for async plugin setup
