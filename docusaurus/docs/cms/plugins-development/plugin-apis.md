---
title: Plugin APIs
pagination_prev: cms/plugins-development/content-manager-apis
pagination_next: cms/plugins-development/plugin-initialization
toc_max_heading_level: 4
tags:
  - plugin APIs
  - plugin communication
  - registerPlugin
  - plugin ecosystem
  - plugins development
---

# Plugin APIs

Plugin APIs allow your plugin to expose functionality that other plugins can use, creating a plugin ecosystem where plugins can interact and extend each other's capabilities.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin) and understand the [Admin Panel API](/cms/plugins-development/admin-panel-api).
:::

## What are Plugin APIs?

Plugin APIs are methods and functionality that your plugin exposes through the `apis` parameter in `registerPlugin`. Other plugins can access these APIs to extend functionality, share data, or integrate features.

```typescript
app.registerPlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  apis: {
    // Expose APIs here
    myApi: (data) => {
      /* implementation */
    },
    anotherApi: () => {
      /* implementation */
    },
  },
});
```

## Use Case: Notification Plugin

Let's build a **Notification Plugin** that other plugins can use to send notifications throughout the admin panel.

### 1. Creating the Notification Plugin

```typescript
// src/plugins/notifications/admin/src/index.ts
export default {
  register(app: any) {
    app.registerPlugin({
      id: 'notifications',
      name: 'Notifications',
      apis: {
        // Send a notification to the admin panel
        sendNotification: (
          message: string,
          type: 'success' | 'error' | 'warning' | 'info'
        ) => {
          // Show notification in admin panel
          console.log(`[${type.toUpperCase()}] ${message}`);
          // Could integrate with toast notifications, email, etc.
        },

        // Schedule a notification for later
        scheduleNotification: (message: string, delay: number) => {
          setTimeout(() => {
            console.log(`Scheduled: ${message}`);
          }, delay);
        },

        // Get notification history
        getNotificationHistory: () => {
          return [
            { message: 'User created', type: 'success', timestamp: new Date() },
            { message: 'Failed to save', type: 'error', timestamp: new Date() },
          ];
        },

        // Add custom notification types
        addCustomType: (typeName: string, config: any) => {
          console.log(`Added custom notification type: ${typeName}`, config);
        },
      },
    });
  },
};
```

### 2. Using the Notification Plugin

Now other plugins can use the notification functionality:

```typescript
// src/plugins/user-management/admin/src/index.ts
export default {
  register(app: any) {
    app.registerPlugin({
      id: 'user-management',
      name: 'User Management',
    });
  },

  bootstrap(app: any) {
    const notifications = app.getPlugin('notifications');

    if (notifications && notifications.apis) {
      // Send welcome notification when plugin loads
      notifications.apis.sendNotification(
        'User Management plugin loaded successfully',
        'success'
      );

      // Schedule a reminder
      notifications.apis.scheduleNotification(
        'Remember to review user permissions weekly',
        5000 // 5 seconds delay
      );
    }
  },
};
```

### 3. Real-world Usage in Action

```typescript
// When a user is created
const createUser = async (userData: any) => {
  try {
    const user = await strapi.entityService.create(
      'plugin::users-permissions.user',
      {
        data: userData,
      }
    );

    // Notify success using the notification plugin
    const notifications = strapi.plugin('notifications');
    if (notifications && notifications.apis) {
      notifications.apis.sendNotification(
        `User "${user.username}" created successfully`,
        'success'
      );
    }

    return user;
  } catch (error) {
    // Notify error
    const notifications = strapi.plugin('notifications');
    if (notifications && notifications.apis) {
      notifications.apis.sendNotification(
        `Failed to create user: ${error.message}`,
        'error'
      );
    }
    throw error;
  }
};
```

## API Design Best Practices

### 1. Clear Method Names

```typescript
// ✅ Good - Clear and descriptive
apis: {
  sendNotification: (message: string, type: string) => { /* ... */ },
  getNotificationHistory: () => { /* ... */ },
  scheduleNotification: (message: string, delay: number) => { /* ... */ }
}

// ❌ Bad - Unclear purpose
apis: {
  do: (a: any, b: any) => { /* ... */ },
  stuff: () => { /* ... */ },
  thing: (x: number) => { /* ... */ }
}
```

### 2. Type Safety

```typescript
// ✅ Good - TypeScript interfaces
interface NotificationConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

apis: {
  sendNotification: (config: NotificationConfig) => {
    /* ... */
  };
}
```

### 3. Error Handling

```typescript
apis: {
  sendNotification: (message: string, type: string) => {
    try {
      // Implementation
      console.log(`[${type.toUpperCase()}] ${message}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Handle error gracefully
    }
  };
}
```

### 4. Defensive Programming

```typescript
// In the plugin using the APIs
bootstrap(app) {
  const notifications = app.getPlugin('notifications');

  // Always check if plugin exists and has APIs
  if (notifications && notifications.apis) {
    notifications.apis.sendNotification('Plugin loaded', 'success');
  } else {
    console.warn('Notifications plugin not available');
  }
}
```

## Advanced Plugin Communication

### Plugin-to-Plugin Data Sharing

```typescript
// Analytics Plugin - Exposes data collection APIs
app.registerPlugin({
  id: 'analytics',
  name: 'Analytics',
  apis: {
    trackEvent: (eventName: string, data: any) => {
      // Store analytics data
      console.log(`Analytics: ${eventName}`, data);
    },

    getAnalytics: (timeRange: string) => {
      return {
        pageViews: 1250,
        uniqueVisitors: 340,
        timeRange: timeRange
      };
    }
  }
});

// E-commerce Plugin - Uses analytics
bootstrap(app) {
  const analytics = app.getPlugin('analytics');

  if (analytics?.apis) {
    analytics.apis.trackEvent('ecommerce-plugin-loaded', {
      plugin: 'ecommerce',
      timestamp: new Date().toISOString()
    });
  }
}
```

### Plugin Configuration Sharing

```typescript
// Settings Plugin - Manages global settings
app.registerPlugin({
  id: 'settings',
  name: 'Settings',
  apis: {
    getSetting: (key: string) => {
      return localStorage.getItem(`setting_${key}`);
    },

    setSetting: (key: string, value: any) => {
      localStorage.setItem(`setting_${key}`, JSON.stringify(value));
    },

    getAllSettings: () => {
      // Return all settings
      return { theme: 'dark', language: 'en' };
    }
  }
});

// Theme Plugin - Uses settings
bootstrap(app) {
  const settings = app.getPlugin('settings');

  if (settings?.apis) {
    const theme = settings.apis.getSetting('theme');
    if (theme === 'dark') {
      // Apply dark theme
    }
  }
}
```

## Common Patterns

### 1. Plugin Registry Pattern

```typescript
// Registry Plugin - Manages other plugins
app.registerPlugin({
  id: 'plugin-registry',
  name: 'Plugin Registry',
  apis: {
    registerPlugin: (pluginId: string, config: any) => {
      console.log(`Registering plugin: ${pluginId}`, config);
    },

    getRegisteredPlugins: () => {
      return ['plugin-a', 'plugin-b', 'plugin-c'];
    },

    isPluginRegistered: (pluginId: string) => {
      return ['plugin-a', 'plugin-b', 'plugin-c'].includes(pluginId);
    },
  },
});
```

### 2. Event System Pattern

```typescript
// Event Plugin - Provides event system
app.registerPlugin({
  id: 'events',
  name: 'Events',
  apis: {
    emit: (eventName: string, data: any) => {
      console.log(`Event emitted: ${eventName}`, data);
    },

    on: (eventName: string, callback: Function) => {
      console.log(`Listening for event: ${eventName}`);
    },

    off: (eventName: string, callback: Function) => {
      console.log(`Stopped listening for event: ${eventName}`);
    },
  },
});
```

## Troubleshooting

### Common Issues

1. **Plugin not found**

   ```typescript
   // ❌ Wrong - Plugin ID mismatch
   const plugin = app.getPlugin('notification'); // Should be 'notifications'

   // ✅ Correct - Exact plugin ID
   const plugin = app.getPlugin('notifications');
   ```

2. **APIs not available**

   ```typescript
   // ❌ Wrong - No null check
   const apis = app.getPlugin('notifications').apis;
   apis.sendNotification('test', 'info'); // Could throw error

   // ✅ Correct - Safe access
   const plugin = app.getPlugin('notifications');
   if (plugin?.apis) {
     plugin.apis.sendNotification('test', 'info');
   }
   ```

3. **Circular dependencies**

   ```typescript
   // ❌ Wrong - Plugin A depends on B, B depends on A
   // Plugin A
   bootstrap(app) {
     const pluginB = app.getPlugin('plugin-b');
     pluginB.apis.doSomething();
   }

   // Plugin B
   bootstrap(app) {
     const pluginA = app.getPlugin('plugin-a');
     pluginA.apis.doSomethingElse();
   }
   ```

### Debugging Tips

```typescript
// Debug plugin availability
bootstrap(app) {
  console.log('Available plugins:', Object.keys(app.plugins));

  const notifications = app.getPlugin('notifications');
  console.log('Notifications plugin:', notifications);
  console.log('Notifications APIs:', notifications?.apis);
}
```

## Next Steps

- Learn about [Plugin Initialization](/cms/plugins-development/plugin-initialization) for async plugin setup
- Explore [Injection Zones](/cms/plugins-development/injection-zones) for UI component injection
- Check out [Plugin Readiness](/cms/plugins-development/plugin-readiness) for managing plugin lifecycle
