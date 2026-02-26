---
title: Accessing the Redux store
description: Read state, dispatch actions, and subscribe to changes in Strapi's admin panel Redux store from your plugin.
pagination_prev: cms/plugins-development/admin-injection-zones
pagination_next: cms/plugins-development/admin-panel-api
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
  - admin panel
  - Redux store
  - useSelector
  - useDispatch
  - plugins development
---

# Accessing the Redux store

<Tldr>

Strapi's admin panel uses a global Redux store. Plugins can read state with `useSelector`, update state with `useDispatch`, and subscribe to changes with `useStore`. The `admin_app` slice exposes theme, locale, permissions, and authentication data.

</Tldr>

Strapi's admin panel uses a global Redux store to manage application state. Plugins can access this store to read state, dispatch actions, and subscribe to state changes. This enables plugins to interact with core admin functionality like theme settings, language preferences, and authentication state.

:::prerequisites
You have [created a Strapi plugin](/cms/plugins-development/create-a-plugin) and are familiar with the [admin entry file lifecycle](/cms/plugins-development/admin-configuration-customization#overview).
:::

## Store overview

The Redux store is automatically provided to all plugin components through React Redux's `Provider`. The store contains several slices:

- `admin_app`: core admin state including theme, language, permissions, and authentication token
- `adminApi`: RTK Query API state for admin endpoints
- Plugin-specific slices: additional reducers added by plugins

## Reading state with `useSelector`

The most common way to access Redux state in your plugin components is using the `useSelector` hook from `react-redux`:

```typescript
// admin/src/pages/HomePage.tsx
import { useSelector } from 'react-redux';

const HomePage = () => {
  // Read current theme
  const currentTheme = useSelector(
    (state: any) => state.admin_app?.theme?.currentTheme
  );

  // Read current locale
  const currentLocale = useSelector(
    (state: any) => state.admin_app?.language?.locale
  );

  // Read authentication status
  const isAuthenticated = useSelector((state: any) => !!state.admin_app?.token);

  // Read available locales
  const availableLocales = useSelector(
    (state: any) => state.admin_app?.language?.localeNames || {}
  );

  return (
    <div>
      <p>Current Theme: {currentTheme}</p>
      <p>Current Locale: {currentLocale}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

### Available state properties

The `admin_app` slice contains the following state properties:

| Property | Type | Description |
|---|---|---|
| `theme.currentTheme` | `string` | Current theme (`'light'`, `'dark'`, or `'system'`) |
| `theme.availableThemes` | `string[]` | Array of available theme names |
| `language.locale` | `string` | Current locale code (e.g., `'en'`, `'fr'`) |
| `language.localeNames` | `object` | Object mapping locale codes to display names |
| `token` | `string \| null` | Authentication token |
| `permissions` | `object` | User permissions object |

## Dispatching actions

To update the Redux store, use the `useDispatch` hook:

```typescript
// admin/src/pages/HomePage.tsx
import { useDispatch } from 'react-redux';

const HomePage = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(
    (state: any) => state.admin_app?.theme?.currentTheme
  );

  const handleToggleTheme = () => {
    const newTheme =
      currentTheme === 'light'
        ? 'dark'
        : currentTheme === 'dark'
        ? 'system'
        : 'light';
    dispatch({
      type: 'admin/setAppTheme',
      payload: newTheme,
    } as any);
  };

  const handleChangeLocale = (locale: string) => {
    dispatch({
      type: 'admin/setLocale',
      payload: locale,
    } as any);
  };

  return (
    <div>
      <button onClick={handleToggleTheme}>
        Toggle Theme (Current: {currentTheme})
      </button>
      <button onClick={() => handleChangeLocale('en')}>Set English</button>
    </div>
  );
};
```

### Available actions

The `admin_app` slice provides the following actions:

| Action type | Payload type | Description |
|---|---|---|
| `admin/setAppTheme` | `string` | Set the theme (`'light'`, `'dark'`, or `'system'`) |
| `admin/setLocale` | `string` | Set the locale (e.g., `'en'`, `'fr'`) |
| `admin/setToken` | `string \| null` | Set the authentication token |
| `admin/login` | `{ token: string, persist?: boolean }` | Login action with token and persistence option |
| `admin/logout` | `void` | Logout action (no payload) |

:::note
When dispatching actions, use the Redux Toolkit action type format: `'sliceName/actionName'`. The admin slice is named `'admin'`, so actions follow the pattern `'admin/actionName'`.
:::

## Accessing the store instance

For advanced use cases, you can access the store instance directly using the `useStore` hook:

```typescript
// admin/src/pages/App.tsx
import { useStore } from 'react-redux';
import { useEffect } from 'react';

const App = () => {
  const store = useStore();

  useEffect(() => {
    // Get current state
    const state = store.getState();
    console.log('Redux Store State:', state);

    // Subscribe to store changes
    const unsubscribe = store.subscribe(() => {
      const currentState = store.getState();
      console.log('Store state changed:', {
        theme: currentState.admin_app?.theme?.currentTheme,
        locale: currentState.admin_app?.language?.locale,
        timestamp: new Date().toISOString(),
      });
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [store]);

  return <div>My Plugin</div>;
};
```

## Complete example

<details>
<summary>Example combining all 3 patterns (useSelector, useDispatch, useStore)</summary>

```typescript
// admin/src/pages/HomePage.tsx
import { Main } from '@strapi/design-system';
import { Button, Box, Typography, Flex } from '@strapi/design-system';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const dispatch = useDispatch();
  const store = useStore();

  // Example 1: Reading state from Redux store using useSelector
  const currentTheme = useSelector(
    (state: any) => state.admin_app?.theme?.currentTheme
  );
  const currentLocale = useSelector(
    (state: any) => state.admin_app?.language?.locale
  );
  const isAuthenticated = useSelector((state: any) => !!state.admin_app?.token);
  const availableLocales = useSelector(
    (state: any) => state.admin_app?.language?.localeNames || {}
  );

  // Example 2: Dispatching actions to update the store
  const handleToggleTheme = () => {
    const newTheme =
      currentTheme === 'light'
        ? 'dark'
        : currentTheme === 'dark'
        ? 'system'
        : 'light';
    dispatch({
      type: 'admin/setAppTheme',
      payload: newTheme,
    } as any);
  };

  const handleChangeLocale = (locale: string) => {
    dispatch({
      type: 'admin/setLocale',
      payload: locale,
    } as any);
  };

  // Example 3: Subscribing to store changes
  const [storeChangeCount, setStoreChangeCount] = useState(0);
  const [lastChange, setLastChange] = useState<string>('');

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      setStoreChangeCount((prev) => prev + 1);
      setLastChange(new Date().toLocaleTimeString());

      console.log('Store state changed:', {
        theme: state.admin_app?.theme?.currentTheme,
        locale: state.admin_app?.language?.locale,
        timestamp: new Date().toISOString(),
      });
    });

    return () => {
      unsubscribe();
    };
  }, [store]);

  return (
    <Main>
      <Box padding={8}>
        <Typography variant="alpha" as="h1">
          Redux Store Examples
        </Typography>

        <Flex direction="column" gap={4} paddingTop={6}>
          {/* Reading State */}
          <Box padding={4} background="neutral100" hasRadius>
            <Typography variant="omega" fontWeight="bold" paddingBottom={2}>
              Reading state
            </Typography>
            <Flex direction="column" gap={2}>
              <Typography variant="omega">
                Current Theme: <strong>{currentTheme || 'system'}</strong>
              </Typography>
              <Typography variant="omega">
                Current Locale: <strong>{currentLocale || 'en'}</strong>
              </Typography>
              <Typography variant="omega">
                Authentication Status:{' '}
                <strong>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </strong>
              </Typography>
            </Flex>
          </Box>

          {/* Dispatching Actions */}
          <Box padding={4} background="neutral100" hasRadius>
            <Typography variant="omega" fontWeight="bold" paddingBottom={2}>
              Dispatching actions
            </Typography>
            <Flex direction="row" gap={2} wrap="wrap">
              <Button onClick={handleToggleTheme} variant="secondary">
                Toggle Theme
              </Button>
              {Object.keys(availableLocales).map((locale) => (
                <Button
                  key={locale}
                  onClick={() => handleChangeLocale(locale)}
                  variant={currentLocale === locale ? 'default' : 'tertiary'}
                >
                  Set {availableLocales[locale] || locale}
                </Button>
              ))}
            </Flex>
          </Box>

          {/* Subscribing to Store Changes */}
          <Box padding={4} background="neutral100" hasRadius>
            <Typography variant="omega" fontWeight="bold" paddingBottom={2}>
              Subscribing to store changes
            </Typography>
            <Flex direction="column" gap={2}>
              <Typography variant="omega">
                Store has changed <strong>{storeChangeCount}</strong> time(s)
              </Typography>
              {lastChange && (
                <Typography variant="omega">
                  Last change at: <strong>{lastChange}</strong>
                </Typography>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Main>
  );
};

export { HomePage };
```

</details>

## Best practices

- **Use `useSelector` for reading state.** Prefer `useSelector` over direct store access. It automatically subscribes to updates and re-renders components when the selected state changes.
- **Clean up subscriptions.** Always unsubscribe from store subscriptions in `useEffect` cleanup functions to prevent memory leaks.
- **Consider type safety.** For better TypeScript support, create typed selectors or use typed hooks from `@strapi/admin` if available.
- **Avoid unnecessary dispatches.** Only dispatch actions when you need to update state. Reading state does not require dispatching actions.
- **Respect core state.** Be careful when modifying core admin state (like theme or locale) as it affects the entire admin panel. Consider whether your plugin should modify global state or maintain its own local state.

:::tip
For plugins that need to add their own state to the Redux store, use the `addReducers` method in the `register` lifecycle function to inject custom reducers. See the [Admin Panel API documentation](/cms/plugins-development/admin-panel-api) for details.
:::
