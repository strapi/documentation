---
id: admin-panel-api
---

# Admin Panel API for plugins

A Strapi [plugin](#) can interact with both the [back end](#) or the front end of the Strapi app. The Admin Panel API is about the front end part, i.e. it allows a plugin to customize Strapi's [admin panel](/docs/user-docs/intro).

The admin panel is a [React](https://reactjs.org/) application that can embed other React applications. These other React applications are the admin parts of each Strapi plugin.

To create a plugin that interacts with the Admin Panel API:

1. Create an [entry file](#entry-file).
2. Within this file, declare and export a plugin interface that uses the [available actions](#available-actions).
3. Require this plugin interface in a `strapi-admin.js` file at the root of the plugin package folder:

  ```js title="[plugin-name]/strapi-admin.js"

  'use strict';

  module.exports = require('./admin/src').default;
  ```

## Entry file

The entry file for the Admin Panel API is `[plugin-name]/admin/src/index.js`. This file exports the required interface, with the following functions available:

| Function type      | Available functions                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| Lifecycle functions | <ul><li> [register](#register)</li><li>[bootstrap](#bootstrap)</li></ul> |
| Async function      | [registerTrads](#registertrads)                                          |

## Lifecycle functions

### register()

**Type:** `Function`

This function is called to load the plugin, even before the app is actually [bootstrapped](#bootstrap). It takes the running Strapi application as an argument (`app`).

Within the register function, a plugin can:

* [register itself](#registerplugin) so it's available to the admin panel
* add a new link to the main navigation (see [Menu API](#menu-api))
* [create a new settings section](#createsettingsection)
* define [injection zones](#injection-zones-api)
* [add reducers](#reducers-api)

#### registerPlugin()

**Type:** `Function`

Registers the plugin to make it available in the admin panel.

This function returns an object with the following parameters:

| Parameter        | Type                     | Description                                                                                        |
| ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `id`             | String                   | Plugin id                                                                                          |
| `name`           | String                   | Plugin name                                                                                        |
| `injectionZones` | Object                   | Declaration of available [injection zones](#injection-zones-api)                                       |

:::note
Some parameters can be imported from the `package.json` file.
:::

**Example:**

```js title="my-plugin/admin/src/index.js"

// Auto-generated component
import PluginIcon from './components/PluginIcon';
import pluginId from './pluginId'

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'My plugin',
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "my-plugin" */ './pages/App');

        return component;
      },
      permissions: [], // array of permissions (object), allow a user to access a plugin depending on its permissions
    });
    app.registerPlugin({
      id: pluginId,
      name,
    });
  },
};
```

### bootstrap()

**Type**: `Function`

Exposes the bootstrap function, executed after all the plugins are [registered](#register).

Within the bootstrap function, a plugin can:

* extend another plugin, using `getPlugin('plugin-name')`,
* register hooks (see [Hooks API](#hooks-api))
* [add links to a settings section](#settings-api)

**Example:**

```js
module.exports = () => {
  return {
    // ...
    bootstrap(app) {
      // execute some bootstrap code
      app.injectContentManagerComponent('editView', 'right-links', { name: 'my-compo', Component: () => 'my-compo' })
    },
  };
};
```

## Async function

While [`register()`](#register) and [`bootstrap()`](#bootstrap) are lifecycle functions, `registerTrads()` is an async function.

### registerTrads()

**Type**: `Function`

To reduce the build size, the admin panel is only shipped with 2 locales by default (`en` and `fr`). The `registerTrads()` function is used to register a plugin's translations files and to create separate chunks for the application translations. It does not need to be modified.

<details>
<summary>Example: Register a plugin's translation files</summary>

```jsx
export default {
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map(locale => {
        return import(
          /* webpackChunkName: "[pluginId]-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
```

</details>

## Available actions

The Admin Panel API allows a plugin to take advantage of several small APIs to perform actions. Use this table as a reference:

| Action                                   | API to use                              | Function to use                                   | Related lifecycle function  |
| ---------------------------------------- | --------------------------------------- | ------------------------------------------------- | --------------------------- |
| Add a new link to the main navigation    | [Menu API](#menu-api)                   | [`addMenuLink()`](#menu-api)                      | [`register()`](#register)   |
| Create a new settings section            | [Settings API](#settings-api)           | [`createSettingSection()`](#createsettingsection) | [`register()`](#register)   |
| Declare an injection zone                | [Injection Zones API](#injection-zones-api) | [`registerPlugin()`](#registerplugin)             | [`register()`](#register)   |
| Add a reducer                            | [Reducers API](#reducers-api)                                       | [`addReducers()`](#reducers-api)                      | [`register()`](#register)   |
| Create a hook                          | [Hooks API](#hooks-api)                 | [`createHook()`](#hooks-api)                    | [`register()`](#register)   |
| Add a single link to a settings section  | [Settings API](#settings-api)           | [`addSettingsLink()`](#addsettingslink)             | [`bootstrap()`](#bootstrap) |
| Add multiple links to a settings section | [Settings API](#settings-api)           | [`addSettingsLinks()`](#addsettingslinks)           | [`bootstrap()`](#bootstrap) |
| Inject a Component in an injection zone  | [Injection Zones API](#injection-zones-api) | [`injectComponent()`](#injection-zones-api)           | [`bootstrap()`](#register)  |
| Register a hook                          | [Hooks API](#hooks-api)                 | [`registerHook()`](#hooks-api)                    | [`bootstrap()`](#bootstrap)   |

:::strapi Replacing the WYSIWYG
The WYSIWYG editor can be replaced by taking advantage of the [register lifecycle](#register) (see [new WYSIWYG field in the admin panel](#) guide).
:::

:::tip
The admin panel supports dotenv variables.

All variables defined in a `.env` file and prefixed by `STRAPI_ADMIN_` are available while customizing the admin panel through `process.env`.
:::

### Menu API

The Menu API allows a plugin to add a new link to the main navigation through the `addMenuLink()` function with the following parameters:

| Parameter     | Type             | Description                                                                                                                                                                                                              |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `to`          | String           | Path the link should point to                                                                                                                                                                                            |
| `icon`        | React Component       | Icon to display in the main navigation                                                                                                                                                                                   |
| `intlLabel`   | Object           | Label for the link, following the [React Int'l](https://formatjs.io/docs/react-intl) convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the link</li></ul> |
| `Component`   | Async function   | Returns a dynamic import of the plugin entry point                                                                                                                                                                      |
| `permissions` | Array of Objects |  Permissions declared in the `permissions.js` file of the plugin                                                                                                                                                                                                                         |

:::note
`intlLabel.id` are ids used in translation files (`[plugin-name]/admin/src/translations/[language].json`)
:::

**Example:**

```jsx title="my-plugin/admin/src/index.js"
import PluginIcon from './components/PluginIcon';

export default {
  register(app) {
    app.addMenuLink({
      to: '/plugins/my-plugin',
      icon: PluginIcon,
      intlLabel: {
        id: 'my-plugin.plugin.name',
        defaultMessage: 'My plugin',
      },
      Component: () => 'My plugin',
      permissions: [], // permissions to apply to the link
    });
    app.registerPlugin({ ... });
  },
  bootstrap() {},
};
```

### Settings API

The Settings API allows:

* [creating a new setting section](#createsettingsection)
* adding [a single link](#addsettingslink) or [multiple links at once](#addsettingslinks) to existing settings sections

:::note
Adding a new section happens in the [register](#register) lifecycle while adding links happens during the [bootstrap](#bootstrap) lifecycle.
:::

All functions accept links as objects with the following parameters:

| Parameter     | Type             | Description                                                                                                                                                                                                              |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`          | String           | React id                                                                                                                                                                                                                 |
| `to`          | String           | Path the link should point to                                                                                                                                                                                            |
| `intlLabel`   | Object           | Label for the link, following the [React Int'l](https://formatjs.io/docs/react-intl) convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the link</li></ul> |
| `Component`   | Async function   | Returns a dynamic import of the plugin entry point                                                                                                                                                                       |
| `permissions` | Array of Objects | Permissions declared in the `permissions.js` file of the plugin                                                                                                                                                          |

#### createSettingSection()

**Type**: `Function`

Create a new settings section.

The function takes 2 arguments:

| Argument        | Type             | Description                                                                                                                                                                                                                                                                                                                   |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| first argument  | Object           | Section label:<ul><li>`id` (String): section id</li><li>`intlLabel` (Object): localized label for the section, following the [React Int'l](https://formatjs.io/docs/react-intl) convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the section</li></ul></li></ul> |
| second argument | Array of Objects | Links included in the section                                                                                                                                                                                                                                                                                                 |

:::note
`intlLabel.id` are ids used in translation files (`[plugin-name]/admin/src/translations/[language].json`)
:::

**Example:**

```jsx title="my-plugin/admin/src/index.js"

const myComponent = async () => {
  const component = await import(
    /* webpackChunkName: "users-providers-settings-page" */ './pages/Providers'
  );

  return component;
};

export default {
  register(app) {
    app.createSettingSection(
      { id: String, intlLabel: { id: String, defaultMessage: String } }, // Section to create
      [
        // links
        {
          intlLabel: { id: String, defaultMessage: String },
          id: String,
          to: String,
          Component: myComponent,
          permissions: Object[],
        },
      ]
    );
  },
};
```

#### addSettingsLink()

**Type**: `Function`

Add a unique link to an existing settings section.

**Example:**

```jsx title="my-plugin/admin/src/index.js"

const myComponent = async () => {
  const component = await import(
    /* webpackChunkName: "users-providers-settings-page" */ './pages/Providers'
  );

  return component;
};

export default {
  bootstrap(app) {
		// Adding a single link
		app.addSettingsLink(
		 'global', // id of the section to add the link to
			{
				intlLabel: { id: String, defaultMessage: String },
				id: String,
				to: String,
				Component: myComponent,
				permissions: Object[]
			}
    )
  }
}
```

#### addSettingsLinks()

**Type**: `Function`

Add multiple links to an existing settings section.

**Example:**

```jsx title="my-plugin/admin/src/index.js"

const myComponent = async () => {
  const component = await import(
    /* webpackChunkName: "users-providers-settings-page" */ './pages/Providers'
  );

  return component;
};

export default {
  bootstrap(app) {
    // Adding several links at once
    app.addSettingsLinks(
      'global', // id of the section to add the link in
        [{
          intlLabel: { id: String, defaultMessage: String },
          id: String,
          to: String,
          Component: myComponent,
          permissions: Object[]
        }]
    )
  }
}
```

### Injection Zones API

Injection zones refer to areas of a view's layout where a plugin allows another to inject a custom React component (e.g. a UI element like a button).

Plugins can use:

* Strapi's [predefined injection zones](#using-predefined-injection-zones) for the Content Manager,
* or custom injection zones, created by a plugin

:::note
Injection zones are defined in the [register()](#register) lifecycle but components are injected in the [bootstrap()](#bootstrap) lifecycle.
:::

#### Using predefined injection zones

Strapi admin panel comes with predefined injection zones so components can be added to the UI of the [Content Manager](/docs/user-docs/intro#):

<!-- TODO: maybe add screenshots once the design system is ready? -->

| View      | Injection zone name & Location                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List view | <ul><li>`actions`: sits between Filters and the cogs icon</li><li>`deleteModalAdditionalInfos()`: sits at the bottom of the modal displayed when deleting items</li></ul> |
| Edit view | <ul><li>`informations`: sits at the top right of the edit view</li><li>`right-links`: sits between "Configure the view" and "Edit" buttons</li></ul>                       |

#### Creating a custom injection zone

To create a custom injection zone, declare it as a `<InjectionZone />` React component with an `area` prop that takes a string with the following naming convention: `plugin-name.viewName.injectionZoneName`.

#### Injecting components

A plugin has 2 different ways of injecting a component:

* to inject a component from a plugin into another plugin's injection zones, use the `injectComponent()` function
* to specifically inject a component into one of the Content Manager's [predefined injection zones](#using-predefined-injection-zones), use the `injectContentManagerComponent()` function instead

Both the `injectComponent()` and `injectContentManagerComponent()` methods accept the following arguments:

| Argument        | Type   | Description                                                                                                                                                                   |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| first argument  | String | The view where the component is injected
| second argument | String | The zone where the component is injected
| third argument  | Object | An object with the following keys:<ul><li>`name` (string): the name of the component</li><li>`Component` (function or class): the React component to be injected</li></ul> |

<details>
<summary>Example: Inject a component in the informations box of the Edit View of the Content Manager:</summary>

```jsx title="path: my-plugin/admin/src/index.js"

export default {
  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'my-plugin-my-compo',
      Component: () => 'my-compo',
    });
  }
}
```

</details>

<details>
<summary>Example: Creating a new injection zone and injecting it from a plugin to another one:</summary>

```jsx
// Use the injection zone in a view
// path: my-plugin/admin/src/injectionZones.js

import { InjectionZone } from '@strapi/helper-plugin';

const HomePage = () => {
  return (
    <main>
      <h1>This is the homepage</h1>
	    <InjectionZone area="my-plugin.homePage.right" />
    </main>
  );
};

// Declare this injection zone in the register lifecycle of the plugin
// path: my-plugin/admin/src/index.js

export default {
  register() {
    app.registerPlugin({
      // ...
      injectionZones: {
        homePage: {
          right: []
        }
      }
    });
  },
}

// Inject the component from a plugin in another plugin
// path: my-other-plugin/admin/src/index.js

export default {
  register() {
    // ...
  },
  bootstrap(app) {
    app.getPlugin('my-plugin').injectComponent('homePage', 'right', {
      name: 'my-other-plugin-component',
      Component: () => 'This component is injected',
    });
  }
};
```

</details>

#### Accessing data with the `useCMEditViewDataManager` React hook

Once an injection zone is defined, the component to be injected in the Content Manager can have access to all the data of the Edit View through the `useCMEditViewDataManager` React hook.

<details>
<summary>Example of a basic component using the 'useCMEditViewDataManager' hook</summary>

```js
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

const MyCompo = () => {
  const {
    createActionAllowedFields: [], // Array of fields that the user is allowed to edit
    formErrors: {}, // Object errors
    readActionAllowedFields: [], // Array of field that the user is allowed to edit
    slug: 'api::address.address', // Slug of the content-type
    updateActionAllowedFields: [],
    allLayoutData: {
      components: {}, // components layout
      contentType: {}, // content-type layout
    },
    initialData: {},
    isCreatingEntry: true,
    isSingleType: true,
    status: 'resolved',
    layout: {}, // Current content-type layout
    hasDraftAndPublish: true,
    modifiedData: {},
    onPublish: () => {},
    onUnpublish: () => {},
    addComponentToDynamicZone: () => {},
    addNonRepeatableComponentToField: () => {},
    addRelation: () => {},
    addRepeatableComponentToField: () => {},
    moveComponentDown: () => {},
    moveComponentField: () => {},
    moveComponentUp: () => {},
    moveRelation: () => {},
    onChange: () => {},
    onRemoveRelation: () => {},
    removeComponentFromDynamicZone: () => {},
    removeComponentFromField: () => {},
    removeRepeatableField: () => {},
  } = useCMEditViewDataManager()

  return null
}
```

</details>

### Reducers API

Reducers are [Redux](https://redux.js.org/) reducers that can be used to share state between components. Reducers can be useful when:

* Large amounts of application state are needed in many places in the application.
* The application state is updated frequently.
* The logic to update that state may be complex.

Reducers can be added to a plugin interface with the `addReducers()` function during the [`register`](#register) lifecycle.

A reducer is declared as an object with this syntax:

**Example:**

```js title="my-plugin/admin/src/index.js"
import { exampleReducer } from './reducers'

const reducers = {
  // Reducer Syntax
  [`${pluginId}_exampleReducer`]: exampleReducer
}

export default {
  register(app) {
    app.addReducers(reducers)
  },
  bootstrap() {},
};


```

### Hooks API

The Hooks API allows a plugin to create and register hooks, i.e. places in the application where plugins can add personalized behavior.

Hooks should be registered during the [bootstrap](#bootstrap) lifecycle of a plugin.

Hooks can then be run in series, in waterfall or in parallel:

* `runHookSeries` returns an array corresponding to the result of each function executed, ordered
* `runHookParallel` returns an array corresponding to the result of the promise resolved by the function executed, ordered
* `runHookWaterfall` returns a single value corresponding to all the transformations applied by the different functions starting with the initial value `args`.

<details>
<summary>Example: Create a hook in a plugin and use it in another plugin</summary>

```jsx title="my-plugin/admin/src/index.js"
// Create a hook in a plugin
export default {
  register(app) {
    app.createHook('My-PLUGIN/MY_HOOK');
  }
}

```

```jsx title="my-other-plugin/admin/src/index.js"
// Use the hook in another plugin
export default {
  bootstrap(app) {
    app.registerHook('My-PLUGIN/MY_HOOK', (...args) => {
      console.log(args)

      // important: return the mutated data
      return args
    });

    app.registerPlugin({...})
  }
}
```

</details>

#### Predefined hook

Strapi includes a predefined `Admin/CM/pages/ListView/inject-column-in-table` hook that can be used to add or mutate a column of the List View of the [Content Manager](/docs/user-docs/intro).

<details>
<summary>Example: 'Admin/CM/pages/ListView/inject-column-in-table' hook, as used by the Internationalization plugin to add the 'Content available in' column</summary>

```jsx title="./plugins/my-plugin/admin/src/index.js"
import get from 'lodash/get';
import cellFormatter from './components/cellFormatter';

export default {
  bootstrap(app) {
	  app.registerHook('Admin/CM/pages/ListView/inject-column-in-table', ({ displayedHeaders, layout }) => {
			const isFieldLocalized = get(layout, 'contentType.pluginOptions.i18n.localized', false);

			if (!isFieldLocalized) {
			  return { displayedHeaders, layout };
			}

			return {
        layout,
        displayedHeaders: [
          ...displayedHeaders,
          {
            key: '__locale_key__', // Needed for the table
            fieldSchema: { type: 'string' }, // Schema of the attribute
            metadatas: {
              label: 'Content available in', // Label of the header,
              sortable: true|false // Define if the column is sortable
            }, // Metadatas for the label
            // Name of the key in the data we will display
            name: 'locales',
            // Custom renderer: props => Object.keys(props).map(key => <p key={key}>key</p>)
            cellFormatter,
          },
			  ]
      };
    });
  },
}
```

</details>
