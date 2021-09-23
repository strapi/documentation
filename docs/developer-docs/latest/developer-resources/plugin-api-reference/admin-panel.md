---
title: Local plugins - Strapi Developer Documentation
description: Strapi allows you to create your own custom local plugins that will work exactly the same as external ones.
sidebarDepth: 3
---
<!-- TODO: update SEO -->

# Admin Panel API for plugins

<!-- ? wording: should we use admin panel or administration panel throughout the docs? -->

A Strapi [plugin](/developer-docs/latest/plugins/plugins-intro.md) can interact with the back end or the front end of the Strapi app. The Admin Panel API is about the front end part, i.e. it allows a plugin to customize Strapi's [administration panel](/developer-docs/latest/development/admin-customization.md).

The admin panel is a [React](https://reactjs.org/) application that can embed other React applications. These other React applications are the admin parts of each Strapi's plugin.

Creating and using a plugin that interacts with the Admin Panel API consists in 2 steps:

1. Declare and export the plugin interface within the [`strapi-admin.js` entry file](#entry-file)
<!-- ? is it really the case or should we use `admin/src/index.js`? -->

2. [Use the available features](#available-features)

## Entry file

To tap into the Admin Panel API, create a `strapi-admin.js` file at the root of the plugin package folder. This file exports the required interface, with the following parameters available:
<!-- ? is it really the case or should we use `admin/src/index.js`? -->

| Parameter type      | Available parameters                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| Lifecycle functions | <ul><li> [register](#register)</li><li>[bootstrap](#bootstrap)</li></ul> |
| Async function      | [registerTrads](#registertrads)                                  |

## Lifecycle functions

### register()

**Type:** `Function`

This function is called as soon as a plugin is loaded, even before the app is actually [bootstrapped](#bootstrap). It takes the running Strapi application as an argument (`app`).

Within the register function, a plugin can:

<!-- ? do we call it "main navigation" or "main menu" ? -->
* [register itself](#registerplugin) so it's available to the admin panel
* add a new link to the main navigation (see [Menu API](#menu-api))
* [create a new settings section](#createsettingsection)
* define [injection zones](#injection-zones)
* [add reducers](#reducers)

#### registerPlugin()

**Type:** `Function`

Registers the plugin to make it available in the admin panel.

This function returns an object with the following parameters:

| Parameter        | Type                     | Description                                                                                        |
| ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `description`    | String or TranslationKey | Description of the plugin, generally used in the marketplace or the plugin's API permissions view. |
| `icon`           | FontAwesome icon                        | Plugin icon, used in the marketplace.<br><br>Default: `PlugIcon` |
| `id`             | String                   | Plugin id                                                                                          |
| `name`           | String                   | Plugin name                                                                                        |
| `injectionZones` | Object                   | Declaration of available [injection zones](#injection-zones)                                       |

::: note
Some parameters can be imported from the `package.json` file.
:::

**Example:**

```js
module.exports = () => {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'My plugin',
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "my-plugin" */ './pages/App');

        return component;
      },
      permissions: [],
    });
    app.registerPlugin({
      description: pluginDescription,
      icon,
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
    //...
    bootstrap(app) {
      // execute some bootstrap code
      app
        .getPlugin('content-manager')
        .decorate('editView', ({ children }) => children({ foo: 'baz' }));
    },
  };
};
```

## registerTrads()

**Type**: `Function`

To reduce the build size, the admin panel is only shipped with 2 locales by default (`en` and `fr`). The `registerTrads()` function is used to register a plugin's translations files.

:::note
`registerTrads()` is not a lifecycle function.
:::

**Example: Register a plugin's translation files**

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

## Available features

The Admin Panel API allows a plugin to take advantage of several small APIs to perform some actions:

| Action                                   | API to use                              | Function to use                                   | Related lifecycle function  |
| ---------------------------------------- | --------------------------------------- | ------------------------------------------------- | --------------------------- |
| Add a new link to the main navigation    | [Menu API](#menu-api)                   | [`addMenuLink()`](#menu-api)                      | [`register()`](#register)   |
| Create a new settings section            | [Settings API](#settings-api)           | [`createSettingSection()`](#createsettingsection) | [`register()`](#register)   |
| Declare an injection zone                | [Injection Zones API](#injection-zones) | [`registerPlugin()`](#registerplugin)             | [`register()`](#register)   |
| Add a reducer                            | -                                       | [`addReducers()`](#reducers)                      | [`register()`](#register)   |
| Add a single link to a settings section  | [Settings API](#settings-api)           | [`addSettingLink()`](#addsettinglink)             | [`bootstrap()`](#bootstrap) |
| Add multiple links to a settings section | [Settings API](#settings-api)           | [`addSettingLinks()`](#addsettinglinks)           | [`bootstrap()`](#bootstrap) |
| Inject a Component in an injection zone  | [Injection Zones API](#injection-zones) | [`injectComponent()`](#injection-zones)           | [`bootstrap()`](#register)  |
| Register a hook                          | [Hooks API](#hooks-api)                 | [`registerHook()`](#hooks-api)                    | [`bootstrap()`](#bootstrap)   |

::: tip
The admin panel supports dotenv variables.

All variables defined in a `.env` file and prefixed by `STRAPI_ADMIN_` are available while customizing the admin panel through `process.env`.
:::
### Menu API

The Menu API allows a plugin to add a new link to the main navigation through the `addMenuLink()` function with the following parameters:

<!-- TODO: update table with permissions descriptions -->
| Parameter     | Type             | Description                                                                                                                                                                                                              |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `to`          | String           | Path the link should point to                                                                                                                                                                                            |
| `icon`        | SVGElement       | Icon to display in the main navigation                                                                                                                                                                                   |
| `intlLabel`   | Object           | Label for the link, following the [React Int'l](https://formatjs.io/docs/react-intl) convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the link</li></ul> |
| `Component`   | Async function   | Returns a dynamic import of the plugin entry point                                                                                                                                                                      |
| `permissions` | Array of Objects |  Permissions declared in the `permissions.js` file of the plugin                                                                                                                                                                                                                         |

<!-- TODO: document permissions.js -->

:::note
`intlLabel.id` are ids used in translation files (`./plugins/[plugin-name]/admin/src/translations/[language.json]`)
:::

**Example:**

```jsx
// path: ./plugins/my-plugin/admin/src/index.js

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'My plugin',
      },
      Component: () => 'My plugin',
      permissions: [],
    });
    app.registerPlugin({ ... });
  },
  bootstrap() {},
};
```

### Settings API

The Settings API allows:

* [creating a new setting section](#createsettingsection)
* adding [a single link](#addsettinglink) or [multiple links at once](#addsettinglinks) to existing settings sections

::: note
Adding a new section happens in the [register](#register) lifecycle while adding links happens during the [bootstrap](#bootstrap) lifecycle.
:::

All functions accept links as objects with the following parameters:

<!-- ? what is the Component used for? -->
<!-- TODO: update table with Component and permissions descriptions -->

| Parameter     | Type             | Description                                                                                                                                                                                                              |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`          | String           | React id
| `to`          | String           | Path the link should point to                                                                                                                                                                                            |
| `intlLabel`   | Object           | Label for the link, following the [React Int'l](https://formatjs.io/docs/react-intl) convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the link</li></ul> |
| `Component`   |  ?               | ?                                                                                                                                                                                                                        |
| `permissions` | Array of Objects |  Permissions declared in the `permissions.js` file of the plugin                                                                                                                                                                                                                         |

#### createSettingSection()

**Type**: `Function`

Create a new settings section.

The function takes 2 arguments:

| Argument        | Type             | Description                                                                                                                                                                                                                                                                                                                   |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| first argument  | Object           | Section label:<ul><li>`id` (String): section id</li><li>`intlLabel` (Object): localized label for the section, following the [React Int'l](https://formatjs.io/docs/react-intl) convention, with:<ul><li>`id`: id used to insert the localized label</li><li>`defaultMessage`: default label for the section</li></ul></li></ul> |
| second argument | Array of Objects | Links included in the section                                                                                                                                                                                                                                                                                                 |

:::note
`intlLabel.id` are ids used in translation files (`./plugins/[plugin-name]/admin/src/translations/[language.json]`)
:::

**Example:**

```jsx
// my-plugin/admin/src/index.js

export default {
  register(app) {
    app.createSettingSection(
	   { id: String, intlLabel: { id: String, defaultMessage: String }, // Section to create
		 [ // links
			 {
			   intLabel: { id: String, defaultMessage: String },
			   id: String,
			   to: String,
			   Component: React.ReactNode,
			   permissions: Object[]
		 ] 
  }
}
```

#### addSettingLink()

**Type**: `Function`

Add a unique link to an existing settings section.

**Example:**

```jsx
// my-plugin/admin/src/index.js

export default {
  bootstrap(app) {
		// Adding a single link
		app.addSettingLink(
		 'global', // id of the section to add the link to
			{
				intLabel: { id: String, defaultMessage: String },
				id: String,
				to: String,
				Component: React.ReactNode,
				permissions: Object[]
			}
    )
  }
}
```

#### addSettingLinks()

**Type**: `Function`

Add multiple links to an existing settings section.

**Example:**

```jsx
// my-plugin/admin/src/index.js

export default {
  bootstrap(app) {
    // Adding several links at once
    app.addSettingLinks(
      'global', // id of the section to addd the link in
        [{
          intLabel: { id: String, defaultMessage: String },
          id: String,
          to: String,
          Component: React.ReactNode,
          permissions: Object[]
        }]
    )
  }
}
```

### Injection zones

Injection zones refer to areas of a view's layout where a plugin allows another to inject a custom React component (e.g. a UI element like a button).

Plugins can use:
* Strapi's [predefined injection zones](#predefined-injection-zones) for the Content Manager,
* or custom injection zones, created by a plugin

::: note
Injection zones are defined in the [register()](#register) lifecycle but components are injected in the [bootstrap()](#bootstrap) lifecycle.
:::

#### Using predefined injection zones

Strapi admin panel comes with predefined injection zones so components can be added to the UI of the [Content Manager](/user-docs/latest/content-manager/introduction-to-content-manager.md):

<!-- TODO: maybe add screenshots once design system is ready? -->

| View      | Injection zone name & Location                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List view | <ul><li>`actions`: sits between Filters and the cogs icon</li><li>`deleteModalAdditionalInfos()`: sits at the bottom of the modal displayed when deleting items</li></ul> |
| Edit view | <ul><li>`information`: sits at the top right of the edit view</li><li>`right-links`: sits between "Configure the view" and "Edit" buttons</li></ul>                       |

#### Creating a custom injection zone

To create a custom injection zone, declare it as a `<InjectionZone />` React component with an `area` prop that takes a string with the following naming convention: `plugin-name.viewName.injectionZoneName`.

#### Injecting components

A plugin has 2 different ways of injecting a component:

* to inject a component from a plugin into another plugin's injection zones, use the `injectComponent()` function
* to specifically inject a component into one of the Content Manager's [predefined injection zones](#using-predefined-injection-zones), use the `injectContentManagerComponent()` function instead

::: details Example: Inject a component in the informations box of the Edit View of the Content Manager:

```jsx
// path: my-plugin/admin/src/index.js

export default {
  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'my-plugin-my-compo',
      Component: () => 'my-compo',
  });
}
```
:::

::: details Example: Creating a new injection zone and injecting it from a plugin to another one:

```jsx
// Use the injection zone in a view
// path: ./plugins/my-plugin/admin/src/injectionZones.js

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
// path: ./plugins/my-plugin/admin/src/index.js

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
// path: ./plugins/my-other-plugin/admin/src/index.js

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

:::

#### The `useCMEditViewDataManager` React hook

Once an injection zone is defined, the component to be injected in the Content Manager can have access to all the data of the Edit View through the `useCMEditViewDataManager` React hook.

::: details Example of a basic component using the 'useCMEditViewDataManager' hook

```js
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

const MyCompo = () => {
  const {
    createActionAllowedFields: [], // Array of fields that the user is allowed to edit
    formErrors: {}, // Object errors
    readActionAllowedFields: [], // Array of field that the user is allowed to edit
    slug: 'api::address.address', // Slug of the content type
    updateActionAllowedFields: [],
    allLayoutData: {
      components: {}, // components layout
      contentType: {}, // content type layout
    },
    initialData: {},
    isCreatingEntry: true,
    isSingleType: true,
    status: 'resolved',
    layout: {}, // Current content type layout
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

:::

### Reducers

Reducers are declared as an object with this syntax:

`['pluginId_reducerName']: function() {}`

**Example:**

```js
const reducers = {
  [`${pluginId}_locales`]: localeReducer
}
```

### Hooks API

The Hooks API allows a plugin to create and register hooks, i.e. places in the application where plugins can add personalized behavior.

Hooks should be registered during the [bootstrap](#bootstrap) lifecycle of a plugin.

Hooks can then be run in series, in waterfall or in parallel:

* `runHookSeries` returns an array corresponding to the result of each function executed, ordered
* `runHookParallel` returns an array corresponding to the result of the promise resolved by the function executed, ordered
* `runHookWaterfall` returns a single value corresponding to all the transformations applied by the different functions starting with the initial value `args`.

:::details Example: Create, register and run a basic 'hello-world' hook

```jsx
const app =  new StrapiApp({ appPlugins, library, middlewares, reducers });

// Creating a new hook
app.createHook('hello-world')

// Registering a function that should execute when the "hello-world" hook is run
app.registerHook('hello-world', () => 'hello world')

// Runs the hook using the different methods
const [result] = app.runHookSeries(args?, asynchronous?);
const result = app.runHookWaterfall(args?, asynchronous?);
const [result] = await app.runHookParallel(args?, asynchronous?);
```

:::

<!-- ? not sure what to do with this example 🤔? -->
<!-- TODO: ask Marvin for a simpler, easier to understand example -->
<!-- For instance, it can be used to allow people to add new information to the content manager like the following:
```jsx
// somewhere at Strapi's core init
app.createHook('CM/custom-cols')

// somewhere in a plugin definition
app.registerHook('CM/custom-cols', () => 'intl') 

// In the content manager, when trying to resolve custom cells
const customCols = app.runSeries('CM/custom-cols')

---
	import { useStrapiApp } from '@strapi/helper-plugin';
	const INJECT_COLUMN_IN_TABLE = 'myhook/Inject';

const MyCompo = () => {
  const { runHookWaterfall } = useStrapiApp();

  const tableHeaders = useMemo(() => {
    const headers = runHookWaterfall(INJECT_COLUMN_IN_TABLE, { displayedHeaders, layout });

    return headers;
  }, [runHookWaterfall, displayedHeaders, layout]);
}
``` -->

#### Predefined hook

Strapi includes a predefined `cm/inject-column-in-table` hook that can be used to add or mutate a column of the List View of the [Content Manager](/user-docs/latest/content-manager/introduction-to-content-manager.md).

::: details Example: 'cm/inject-column-in-table' hook, as used by the Internationalization plugin

```jsx
// ./plugins/my-plugin/admin/src/index.js

export default {
  bootstrap(app) {
	  app.registerHook('cm/inject-column-in-table', ({ displayedHeaders, layout }) => {
			const isFieldLocalized = get(layout, 'contentType.pluginOptions.i18n.localized', false);

			if (!isFieldLocalized) {
			  return displayedHeaders;
			}

			return [
			  ...displayedHeaders,
			  {
			    key: '__locale_key__', // Needed for the table
			    fieldSchema: { type: 'string' }, // Schema of the attribute
			    metadatas: {
						label: 'Content available in', // Label of the header,
						sortable: false|true // Define in the column is sortable
					}, // Metadatas for the label
					// Name of the key in the data we will display
			    name: 'locales',
					// Custom renderer
			    cellFormatter: props => <div>Object.keys(props).map(key => <p key={key}>key</p>)</div>,
			  },
			];
    };
  },
}
```

:::
