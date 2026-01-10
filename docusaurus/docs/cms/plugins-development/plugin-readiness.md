---
title: Plugin Readiness
pagination_prev: cms/plugins-development/injection-zones
pagination_next: cms/plugins-development/server-api
toc_max_heading_level: 4
tags:
  - plugin readiness
  - isReady flag
  - plugin lifecycle
  - plugin state management
  - plugins development
---

# Plugin Readiness

Plugin readiness controls when your plugin becomes available for use in the admin panel. Understanding and managing plugin readiness is crucial for creating reliable plugins that load in the correct order.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin) and understand the [Admin Panel API](/cms/plugins-development/admin-panel-api).
:::

## What is Plugin Readiness?

Plugin readiness is controlled by the `isReady` flag in `registerPlugin`. It determines whether your plugin is immediately available or needs initialization:

- **`isReady: true`** (default): Plugin is immediately ready
- **`isReady: false`**: Plugin needs initialization via the `initializer` component

```typescript
app.registerPlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  isReady: false, // Plugin needs initialization
  initializer: MyInitializerComponent,
});
```

## Use Case: Multi-Step Configuration Plugin

Let's build a **Configuration Plugin** that manages complex setup steps and only becomes ready when all configuration is complete.

### 1. Creating the Configuration Plugin

```typescript
// src/plugins/configuration/admin/src/index.ts
import ConfigurationInitializer from './components/ConfigurationInitializer';

export default {
  register(app: any) {
    app.registerPlugin({
      id: 'configuration',
      name: 'Configuration',
      isReady: false, // Plugin starts as not ready
      initializer: ConfigurationInitializer,
    });
  },
};
```

### 2. Creating the Initializer with Readiness Management

```typescript
// src/plugins/configuration/admin/src/components/ConfigurationInitializer.tsx
import React from 'react';

interface InitializerProps {
  setPlugin: (pluginId: string) => void;
}

const ConfigurationInitializer: React.FC<InitializerProps> = ({
  setPlugin,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isReady, setIsReady] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const steps = [
    { name: 'Loading configuration', duration: 1000 },
    { name: 'Validating settings', duration: 1500 },
    { name: 'Connecting to services', duration: 2000 },
    { name: 'Finalizing setup', duration: 1000 },
  ];

  React.useEffect(() => {
    const initializeConfiguration = async () => {
      try {
        for (let i = 0; i < steps.length; i++) {
          setCurrentStep(i);

          // Simulate step execution
          await new Promise((resolve) =>
            setTimeout(resolve, steps[i].duration)
          );

          // Simulate potential errors
          if (i === 1 && Math.random() < 0.3) {
            throw new Error('Configuration validation failed');
          }
        }

        // All steps completed successfully
        setIsReady(true);
        setPlugin('configuration');
      } catch (error) {
        console.error('Configuration initialization failed:', error);
        setErrors((prev) => [...prev, error.message]);

        // Still mark as ready to prevent hanging
        setTimeout(() => {
          setIsReady(true);
          setPlugin('configuration');
        }, 3000);
      }
    };

    initializeConfiguration();
  }, [setPlugin]);

  if (errors.length > 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Configuration Errors</h3>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
        <button onClick={() => window.location.reload()}>
          Retry Configuration
        </button>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Configuration Plugin</h3>
        <p>{steps[currentStep]?.name || 'Initializing...'}</p>

        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              width: '300px',
              height: '6px',
              backgroundColor: '#f0f0f0',
              borderRadius: '3px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                height: '100%',
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease',
                borderRadius: '3px',
              }}
            />
          </div>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Configuration Complete!</h3>
      <p style={{ color: 'green' }}>Plugin is now ready to use.</p>
    </div>
  );
};

export default ConfigurationInitializer;
```

### 3. Using the Configuration Plugin

```typescript
// src/plugins/dependent-plugin/admin/src/index.ts
export default {
  register(app: any) {
    app.registerPlugin({
      id: 'dependent-plugin',
      name: 'Dependent Plugin',
    });
  },

  bootstrap(app: any) {
    // Check if configuration plugin is ready
    const configPlugin = app.getPlugin('configuration');

    if (configPlugin && configPlugin.isReady) {
      // Configuration is ready, proceed with setup
      this.setupWithConfiguration();
    } else {
      // Configuration not ready, wait or use defaults
      console.warn('Configuration plugin not ready, using defaults');
      this.setupWithDefaults();
    }
  },

  setupWithConfiguration() {
    const config = this.getConfiguration();
    console.log('Setting up with configuration:', config);
  },

  setupWithDefaults() {
    console.log('Setting up with default values');
  },

  getConfiguration() {
    // Get configuration from the configuration plugin
    return JSON.parse(localStorage.getItem('plugin-configuration') || '{}');
  },
};
```

## Advanced Readiness Patterns

### 1. Conditional Readiness

```typescript
// Plugin becomes ready only under certain conditions
const ConditionalInitializer: React.FC<InitializerProps> = ({ setPlugin }) => {
  React.useEffect(() => {
    const checkReadiness = async () => {
      const user = await getCurrentUser();
      const permissions = await getUserPermissions(user.id);

      if (permissions.includes('admin')) {
        // User has admin permissions, plugin is ready
        setPlugin('admin-plugin');
      } else {
        // User doesn't have permissions, plugin not ready
        console.warn('User lacks required permissions');
        setPlugin('admin-plugin'); // Still mark as ready to prevent hanging
      }
    };

    checkReadiness();
  }, [setPlugin]);

  return <div>Checking permissions...</div>;
};
```

### 2. Dependency-Based Readiness

```typescript
// Plugin waits for other plugins to be ready
const DependencyInitializer: React.FC<InitializerProps> = ({ setPlugin }) => {
  React.useEffect(() => {
    const waitForDependencies = async () => {
      const requiredPlugins = ['database', 'auth', 'config'];

      for (const pluginId of requiredPlugins) {
        const plugin = app.getPlugin(pluginId);
        if (!plugin || !plugin.isReady) {
          console.warn(`Required plugin ${pluginId} is not ready`);
          // Wait and retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return waitForDependencies();
        }
      }

      // All dependencies are ready
      setPlugin('dependent-plugin');
    };

    waitForDependencies();
  }, [setPlugin]);

  return <div>Waiting for dependencies...</div>;
};
```

### 3. Progressive Readiness

```typescript
// Plugin becomes ready in stages
const ProgressiveInitializer: React.FC<InitializerProps> = ({ setPlugin }) => {
  const [readinessLevel, setReadinessLevel] = React.useState(0);

  React.useEffect(() => {
    const progressiveInitialization = async () => {
      // Stage 1: Basic functionality
      await loadBasicConfig();
      setReadinessLevel(1);

      // Stage 2: Enhanced features
      await loadAdvancedFeatures();
      setReadinessLevel(2);

      // Stage 3: Full functionality
      await loadFullConfiguration();
      setReadinessLevel(3);

      // Plugin is fully ready
      setPlugin('progressive-plugin');
    };

    progressiveInitialization();
  }, [setPlugin]);

  const getReadinessMessage = () => {
    switch (readinessLevel) {
      case 0:
        return 'Initializing...';
      case 1:
        return 'Basic features ready';
      case 2:
        return 'Enhanced features ready';
      case 3:
        return 'Fully ready';
      default:
        return 'Unknown state';
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Progressive Plugin</h3>
      <p>{getReadinessMessage()}</p>
      <div
        style={{
          width: '200px',
          height: '4px',
          backgroundColor: '#f0f0f0',
          borderRadius: '2px',
          margin: '10px auto',
        }}
      >
        <div
          style={{
            width: `${(readinessLevel / 3) * 100}%`,
            height: '100%',
            backgroundColor: '#007bff',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
```

## Readiness State Management

### 1. Global Readiness Tracking

```typescript
// Track readiness state globally
const usePluginReadiness = () => {
  const [readinessState, setReadinessState] = React.useState({});

  const updateReadiness = (pluginId: string, isReady: boolean) => {
    setReadinessState((prev) => ({
      ...prev,
      [pluginId]: isReady,
    }));
  };

  const isPluginReady = (pluginId: string) => {
    return readinessState[pluginId] || false;
  };

  const areAllPluginsReady = (pluginIds: string[]) => {
    return pluginIds.every((id) => isPluginReady(id));
  };

  return {
    readinessState,
    updateReadiness,
    isPluginReady,
    areAllPluginsReady,
  };
};
```

### 2. Readiness Events

```typescript
// Emit readiness events
const ReadinessEventInitializer: React.FC<InitializerProps> = ({
  setPlugin,
}) => {
  React.useEffect(() => {
    const initializeWithEvents = async () => {
      try {
        await loadConfiguration();

        // Emit readiness event
        window.dispatchEvent(
          new CustomEvent('plugin-ready', {
            detail: { pluginId: 'event-plugin' },
          })
        );

        setPlugin('event-plugin');
      } catch (error) {
        // Emit error event
        window.dispatchEvent(
          new CustomEvent('plugin-error', {
            detail: { pluginId: 'event-plugin', error: error.message },
          })
        );

        setPlugin('event-plugin');
      }
    };

    initializeWithEvents();
  }, [setPlugin]);

  return <div>Initializing with events...</div>;
};
```

## Best Practices

### 1. Always Mark as Ready

```typescript
// ✅ Good - Always call setPlugin
React.useEffect(() => {
  const initialize = async () => {
    try {
      await loadData();
      setPlugin('my-plugin'); // Success case
    } catch (error) {
      console.error(error);
      setPlugin('my-plugin'); // Error case - still mark as ready
    }
  };
  initialize();
}, [setPlugin]);

// ❌ Bad - setPlugin might not be called
React.useEffect(() => {
  const initialize = async () => {
    await loadData(); // If this throws, setPlugin is never called
    setPlugin('my-plugin');
  };
  initialize();
}, [setPlugin]);
```

### 2. Provide Clear Status

```typescript
// ✅ Good - Clear readiness status
const [status, setStatus] = React.useState('Initializing...');

const initialize = async () => {
  setStatus('Loading configuration...');
  await loadConfig();

  setStatus('Validating settings...');
  await validateSettings();

  setStatus('Ready!');
  setPlugin('my-plugin');
};
```

### 3. Handle Dependencies

```typescript
// ✅ Good - Check plugin dependencies
bootstrap(app) {
  const requiredPlugins = ['config', 'auth'];

  for (const pluginId of requiredPlugins) {
    const plugin = app.getPlugin(pluginId);
    if (!plugin || !plugin.isReady) {
      console.warn(`Required plugin ${pluginId} is not ready`);
      return;
    }
  }

  // All dependencies ready, proceed
  this.initialize();
}
```

### 4. Timeout Protection

```typescript
// ✅ Good - Prevent infinite waiting
React.useEffect(() => {
  const timeout = setTimeout(() => {
    console.warn('Initialization timeout, marking as ready');
    setPlugin('my-plugin');
  }, 30000); // 30 second timeout

  const initialize = async () => {
    try {
      await loadData();
      clearTimeout(timeout);
      setPlugin('my-plugin');
    } catch (error) {
      clearTimeout(timeout);
      setPlugin('my-plugin');
    }
  };

  initialize();
}, [setPlugin]);
```

## Common Patterns

### 1. Configuration Loading

```typescript
const ConfigReadinessInitializer: React.FC<InitializerProps> = ({
  setPlugin,
}) => {
  React.useEffect(() => {
    const loadConfiguration = async () => {
      const config = await fetch('/api/plugin-config').then((r) => r.json());
      window.pluginConfig = config;
      setPlugin('config-plugin');
    };
    loadConfiguration();
  }, [setPlugin]);

  return <div>Loading configuration...</div>;
};
```

### 2. Feature Flag Readiness

```typescript
const FeatureFlagInitializer: React.FC<InitializerProps> = ({ setPlugin }) => {
  React.useEffect(() => {
    const checkFeatureFlags = async () => {
      const flags = await fetch('/api/feature-flags').then((r) => r.json());

      if (flags.myPluginEnabled) {
        setPlugin('feature-plugin');
      } else {
        console.log('Plugin disabled by feature flag');
        setPlugin('feature-plugin'); // Still mark as ready
      }
    };
    checkFeatureFlags();
  }, [setPlugin]);

  return <div>Checking feature flags...</div>;
};
```

## Troubleshooting

### Common Issues

1. **Plugin never becomes ready**

   - Ensure `setPlugin` is always called
   - Check for unhandled promise rejections
   - Add timeout protection

2. **Dependencies not ready**

   - Check plugin loading order
   - Implement proper dependency checking
   - Use readiness events

3. **Infinite loading**
   - Add timeout mechanisms
   - Check for infinite loops
   - Verify API endpoints

### Debugging Tips

```typescript
// Debug plugin readiness
const DebugInitializer: React.FC<InitializerProps> = ({ setPlugin }) => {
  React.useEffect(() => {
    console.log('Initializer started');

    const initialize = async () => {
      try {
        console.log('Step 1: Loading data...');
        await loadData();

        console.log('Step 2: Processing...');
        await processData();

        console.log('Step 3: Ready!');
        setPlugin('debug-plugin');
      } catch (error) {
        console.error('Initialization error:', error);
        setPlugin('debug-plugin');
      }
    };

    initialize();
  }, [setPlugin]);

  return <div>Debug: Initializing...</div>;
};
```

## Next Steps

- Learn about [Plugin APIs](/cms/plugins-development/plugin-apis) for inter-plugin communication
- Explore [Plugin Initialization](/cms/plugins-development/plugin-initialization) for async plugin setup
- Check out [Injection Zones](/cms/plugins-development/injection-zones) for UI component injection
