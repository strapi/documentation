# Local plugins

## Quick start

Strapi allows you to create local plugins that will work exactly the same as external ones. All your local plugins will be located in the `./plugins` folder of your application.

### Development Environment Setup

Create a development project

1. Create a new project `cd .. && strapi new myDevelopmentProject`.
2. `cd myDevelopmentProject && strapi develop` To start the Strapi project

### Plugin development Setup

In a new terminal window:

Generate a new plugin: `cd /path/to/myDevelopmentProject && strapi generate:plugin my-plugin`

::: tip NOTE
After you have successfully generated a plugin, you need to run `strapi build` which adds the new plugin to the admin panel. 
:::

## Plugin Folders and Files Architecture

The logic of a plugin is located at its root directory `./plugins/**`. The admin panel related parts of each plugin are contained in the `/admin` folder.
The folders and files structure are the following:

```
plugin/
└─── admin/ # Contains the plugin's front-end
|     └─── src/ # Source code directory
|          └─── index.js # Entry point of the plugin
|          └─── pluginId.js # Name of the plugin
|          |
|          └─── components/ # Contains the list of React components used by the plugin
|          └─── containers/
|          |    └─── App/ # Container used by every others containers
|          |    └─── Initializer/ # This container is required, it is used to executed logic right after the plugin is mounted.
|          └─── translations/ # Contains the translations to make the plugin internationalized
|               └─── en.json
|               └─── index.js # File that exports all the plugin's translations.
|               └─── fr.json
└─── config/ # Contains the configurations of the plugin
|     └─── functions/
|     |    └─── bootstrap.js # Asynchronous bootstrap function that runs before the app gets started
|     └─── policies/ # Folder containing the plugin's policies
|     └─── queries/ # Folder containing the plugin's models queries
|     └─── routes.json # Contains the plugin's API routes
└─── controllers/ # Contains the plugin's API controllers
└─── middlewares/ # Contains the plugin's middlewares
└─── models/ # Contains the plugin's API models
└─── services/ # Contains the plugin's API services
```

<!--- DEVELOPMENT OF LOCAL PLUGIN --->

## Back-end Development

This section explains how the 'back-end part' of your plugin works.

### Routes

The plugin API routes are defined in the `./plugins/**/config/routes.json` file.

::: tip
Please refer to [router documentation](/developer-docs/latest/development/backend-customization.md#routing) for information.
:::

**Route prefix**

Each route of a plugin is prefixed by the name of the plugin (eg: `/my-plugin/my-plugin-route`). Using the `prefix` key you can change this option to something custom. You can disable the prefix, by setting the `config.prefix` key to an empty string.

```json
{
  "method": "GET",
  "path": "/my-plugin-route",
  "handler": "MyPlugin.action",
  "config": {
    "policies": [],
    "prefix": "my-custom-prefix"
  }
}
```

### CLI

The CLI can be used to generate files in the plugins folders.

Please refer to the [CLI documentation](/developer-docs/latest/developer-resources/cli/CLI.md) for more information.

### Controllers

Controllers contain functions executed according to the requested route.

Please refer to the [Controllers documentation](/developer-docs/latest/development/backend-customization.md#controllers) for more information.

### Models

A plugin can have its own models.

#### Table/Collection naming

Sometimes it happens that the plugins inject models that have the same name as yours. Let's take a quick example.

You already have `User` model defining in your `./api/user/models/User.settings.json` API. And you decide to install the `Users & Permissions` plugin. This plugin also contains a `User` model. To avoid the conflicts, the plugins' models are not globally exposed which means you cannot access to the plugin's model like this:

```js
module.exports = {
  findUser: async function(params) {
    // This `User` global variable will always make a reference the User model defining in your `./api/xxx/models/User.settings.json`.
    return await User.find();
  },
};
```

Also, the table/collection name won't be `users` because you already have a `User` model. That's why, the framework will automatically prefix the table/collection name for this model with the name of the plugin. Which means in our example, the table/collection name of the `User` model of our plugin `Users & Permissions` will be `users-permissions_users`. If you want to force the table/collection name of the plugin's model, you can add the `collectionName` attribute in your model.

Please refer to the [Models documentation](/developer-docs/latest/development/backend-customization.md#models) for more information.

### Policies

#### Global policies

A plugin can also use a globally exposed policy in the current Strapi project.

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/",
      "handler": "MyPlugin.index",
      "config": {
        "policies": ["global::isAuthenticated"]
      }
    }
  ]
}
```

#### Plugin policies

A plugin can have its own policies, such as adding security rules. For instance, if the plugin includes a policy named `isAuthenticated`, the syntax to use this policy would be:

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/",
      "handler": "MyPlugin.index",
      "config": {
        "policies": ["plugins::myplugin.isAuthenticated"]
      }
    }
  ]
}
```

Please refer to the [Policies documentation](/developer-docs/latest/development/backend-customization.md#policies) for more information.


## Front-end Development

Strapi's admin panel and plugins system aim to be an easy and powerful way to create new features.

The admin panel is a [React](https://facebook.github.io/react/) application which can embed other React applications. These other React applications are the `admin` parts of each Strapi's plugins.

### Environment setup

To enable local plugin development, you need to start your application with the front-end development mode activated:

:::: tabs

::: tab yarn

```bash
$ cd my-app
$ yarn develop --watch-admin
```

:::

::: tab npm

```bash
$ cd my-app
$ npm run develop -- --watch-admin
```

:::

::::

### API

#### Strapi global variable

The administration exposes a global variable that is accessible for all the plugins.

##### `strapi.backendURL`

Retrieve the back-end URL. (e.g. `http://localhost:1337`).

##### `strapi.currentLanguage`

Retrieve the administration panel default language (e.g. `en-US`)

##### `strapi.languages`

Array of the administration panel's supported languages. (e.g. `['ar', 'en', 'fr', ...]`).

##### `strapi.lockApp()`

Display a loader that will prevent the user from interacting with the application.

##### `strapi.unlockApp()`

Remove the loader so the user can interact with the application

##### `strapi.notification`

Use this command anywhere in your code.

```js
strapi.notification.toggle(config);
```

The properties of the config object are as follows:

| key             | type          | default                  | Description                                                                                                                  |
| --------------- | ------------- | ------------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| type            | string        | success                  | `success`, `warning` or `info`                                                                                               |
| message         | object/string | app.notification.success | The main message to display (works with i18n message object, `{ id: 'app.notification.success', defaultMessage: 'Saved!' }`) |
| title           | object/string | null                     | Add a title to the notification                                                                                              |
| link            | object        | null                     | Add a link to the notification message `{ url: String, label: String|Object, target:String }`                                               |
| timeout         | number        | 2500                     | Time in ms before the notification is closed                                                                                 |
| blockTransition | boolean       | false                    | Block the notification transitions to remove the timeout                                                                     |
| uid             | string        | null                     | Custom the notification uid                                                                                                  |

The previous notification API is still working but will display a warning message in the console

```js
strapi.notification.error('app.notification.error');
strapi.notification.info('app.notification.info');
strapi.notification.success('app.notification.success');
strapi.notification.warning('app.notification.warning');
```

##### `strapi.remoteURL`

The administration url (e.g. `http://localhost:4000/admin`).

#### Main plugin object

Each plugin exports all its configurations in an object. This object is located in `my-plugin/admin/src/index.js`

Here are its properties:

| key                       | type    | Description                                                                                                                                                                                                             |
| ------------------------- | ------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| blockerComponent          | node    | Props can be either `null` or React node (e.g. `() => <div />`)                                                                                                                                                         |
| blockerComponentProps     | object  | Props to provide to customise the [blockerComponent](https://github.com/strapi/strapi/blob/58588e10e5d15921b0966e20ce1bc6cde70df5cc/packages/strapi-helper-plugin/lib/src/components/BlockerComponent/index.js#L81-L86) |
| description               | string  | Plugin's description retrieved from the package.json                                                                                                                                                                    |
| id                        | string  | Id of the plugin from the `package.json`                                                                                                                                                                                |
| initializer               | node    | Refer to the [Initializer documentation](#initializer)                                                                                                                                                                  |
| injectedComponents        | array   | Refer to the [Injected Component documentation](#injected-components)                                                                                                                                                   |
| isReady                   | boolean | The app will load until this property is true                                                                                                                                                                           |
| mainComponent             | node    | The plugin's App container,                                                                                                                                                                                             |
| menu                      | object  | Define where the link of your plugin will be set. Without this your plugin will not display a link in the left menu                                                                                                     |
| name                      | string  | The plugin's name retrieved from the package.json                                                                                                                                                                       |
| pluginLogo                | file    | The plugin's logo                                                                                                                                                                                                       |
| preventComponentRendering | boolean | Whether or not display the plugin's blockerComponent instead of the main component                                                                                                                                      |
| settings                  | object  | Refer to the [Plugins settings API](/developer-docs/latest/development/local-plugins-customization.md#plugin-s-front-end-settings-api)                                                                                                                                                         |
| reducers                  | object  | The plugin's redux reducers                                                                                                                                                                                             |
| trads                     | object  | The plugin's translation files                                                                                                                                                                                          |

#### Displaying the plugin's link in the main menu

To display a plugin link into the main menu the plugin needs to export a menu object.

**Path —** `plugins/my-plugin/admin/src/index.js`.

```js
import pluginPkg from '../../package.json';
import pluginLogo from './assets/images/logo.svg';
import App from './containers/App';
import lifecycles from './lifecycles';
import trads from './translations';
import pluginId from './pluginId';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
  const icon = pluginPkg.strapi.icon;
  const name = pluginPkg.strapi.name;
  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon,
    id: pluginId,
    initializer: null,
    isRequired: pluginPkg.strapi.required || false,
    layout: null,
    lifecycles,
    mainComponent: App,
    name,
    pluginLogo,
    preventComponentRendering: false,
    trads,
    menu: {
      // Set a link into the PLUGINS section
      pluginsSectionLinks: [
        {
          destination: `/plugins/${pluginId}`, // Endpoint of the link
          icon,
          label: {
            id: `${pluginId}.plugin.name`, // Refers to a i18n
            defaultMessage: 'My PLUGIN',
          },
          name,
          // If the plugin has some permissions on whether or not it should be accessible
          // depending on the logged in user's role you can set them here.
          // Each permission object performs an OR comparison so if one matches the user's ones
          // the link will be displayed
          permissions: [{ action: 'plugins::content-type-builder.read', subject: null }],
        },
      ],
    },
  };

  return strapi.registerPlugin(plugin);
};
```

#### Initializer

The component is generated by default when you create a new plugin. Use this component to execute some logic when the app is loading. When the logic has been executed this component should emit the `isReady` event so the user can interact with the application.

::: tip NOTE
Below is the Initializer component of the content-type-builder plugin.

It checks whether or not the auto-reload feature is enabled and depending on this value changes the mainComponent of the plugin.
:::

```js
/**
 *
 * Initializer
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import pluginId from '../../pluginId';

class Initializer extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    const {
      admin: { autoReload, currentEnvironment },
    } = this.props;

    let preventComponentRendering;
    let blockerComponentProps;

    if (currentEnvironment === 'production') {
      preventComponentRendering = true;
      blockerComponentProps = {
        blockerComponentTitle: 'components.ProductionBlocker.header',
        blockerComponentDescription: 'components.ProductionBlocker.description',
        blockerComponentIcon: 'fa-ban',
        blockerComponentContent: 'renderButton',
      };
    } else {
      // Don't render the plugin if the server autoReload is disabled
      preventComponentRendering = !autoReload;
      blockerComponentProps = {
        blockerComponentTitle: 'components.AutoReloadBlocker.header',
        blockerComponentDescription: 'components.AutoReloadBlocker.description',
        blockerComponentIcon: 'fa-refresh',
        blockerComponentContent: 'renderIde',
      };
    }

    // Prevent the plugin from being rendered if currentEnvironment === PRODUCTION
    this.props.updatePlugin(pluginId, 'preventComponentRendering', preventComponentRendering);
    this.props.updatePlugin(pluginId, 'blockerComponentProps', blockerComponentProps);
    // Emit the event plugin ready
    this.props.updatePlugin(pluginId, 'isReady', true);
  }

  render() {
    return null;
  }
}

Initializer.propTypes = {
  admin: PropTypes.object.isRequired,
  updatePlugin: PropTypes.func.isRequired,
};

export default Initializer;
```

#### Injected Components

(Coming soon)

#### Routing

The routing is based on the [React Router V5](https://reacttraining.com/react-router/web/guides/philosophy), due to it's implementation each route is declared in the `containers/App/index.js` file.

::: tip
Each route defined in a plugin must be prefixed by the plugin's id.
:::

**Route declaration :**

Let's say that you want to create a route `/user` with params `/:id` associated with the container UserPage.

The declaration would be as follows :

**Path —** `plugins/my-plugin/admin/src/containers/App/index.js`.

```js
import React from 'react';
import pluginId from '../../pluginId';

import UserPage from '../UserPage';

// ...

class App extends React.Component {
  // ...

  render() {
    return (
      <div>
        <Switch>
          <Route exact path={`/plugins/${pluginId}/user/:id`} component={UserPage} />
        </Switch>
      </div>
    );
  }
}

// ...
```

#### Styling

The administration panel uses [styled-components](https://styled-components.com/) for writing css.

#### i18n

[React Intl](https://github.com/yahoo/react-intl) provides React components and an API to format dates, numbers, and strings, including pluralization and handling translations.

**Usage**

We recommend to set all your components text inside the translations folder.

The example below shows how to use i18n inside your plugin.

**Define all your ids with the associated message:**

**Path —** `./plugins/my-plugin/admin/src/translations/en.json`.

```json
{
  "notification.error.message": "An error occurred"
}
```

**Path —** `./plugins/my-plugin/admin/src/translations/fr.json`

```json
{
  "notification.error.message": "Une erreur est survenue"
}
```

**Usage inside a component**

**Path —** `./plugins/my-plugin/admin/src/components/Foo/index.js`.

```js
import { FormattedMessage } from 'react-intl';
import SomeOtherComponent from 'components/SomeOtherComponent';

const Foo = props => (
  <div className={styles.foo}>
    <FormattedMessage id="my-plugin.notification.error.message" />
    <SomeOtherComponent {...props} />
  </div>
);

export default Foo;
```

See [the documentation](https://github.com/yahoo/react-intl/wiki/Components#formattedmessage) for more extensive usage.

#### Global context

All plugins are wrapped inside the `GlobalContextProvider`, in this object you will have access to all plugins object as well as other utilities.

Usage:

**Inside a functional component:**

```js
import React from 'react';
import { useGlobalContext } from 'strapi-helper-plugin';

const Foo = () => {
  const globalContext = useGlobalContext();

  console.log(globalContext);

  return <div>Foo</div>;
};
```

**Inside a class component:**

```js
import React from 'react';
import { GlobalContext } from 'strapi-helper-plugin';

class Foo extends React.Component {
  static contextType = GlobalContext;

  render() {
    console.log(this.context);

    return <div>Foo</div>;
  }
}
```

<!--- LOCAL PLUGIN API --->

## Plugin's front-end Field API

As plugins developer you may need to add custom fields in your application. To do so, a **Field API** is available in order for a plugin to register a field which will be available for all plugins.

::: warning NOTE

Currently, only the content manager uses this API to extend its current fields.

:::

### Registering a new field

Registering a field can be made in two different ways:

1. During the load phase of a plugin
2. Using the provided `react-hook` in a component.

#### Registering a field during the load of a plugin

Registering a field during the load phase of a plugin can be done as follows:

1. Create a new Field type (in this example a **`media`** field type):

**Path —** `plugins/my-plugin/admin/src/components/InputMedia/index.js`.

```js
import React from 'react';
const InputMedia = props => {
  // Check out the provided props
  console.log(props);

  return <div>InputMedia</div>;
};

export default InputMedia;
```

2. Register the field into the application:

**Path —** `plugins/my-plugin/admin/src/index.js`.

```js
import pluginPkg from '../../package.json';
import InputMedia from './components/InputMedia';
import pluginId from './pluginId';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon: pluginPkg.strapi.icon,
    id: pluginId,
    initializer: () => null,
    injectedComponents: [],
    isReady: true,
    mainComponent: null,
    name: pluginPkg.strapi.name,
    preventComponentRendering: false,
    trads: {},
  };

  strapi.registerField({ type: 'media', Component: InputMedia });

  return strapi.registerPlugin(plugin);
};
```

By doing so, all the plugins from your project will be able to use the newly registered **Field** type.

#### Registering a field inside a React Component

The other way to register a **Field** is to use the provided `react-hook`: **`useStrapi`** it can be done in the `Initializer` Component so it is accessible directly when the user is logged in, if you decide to register your plugin in another component than the `Initializer` the **Field** will only be registered in the administration panel once the component is mounted (the user has navigated to the view where the **Field** is registered).

1. Register the **Field** in the `Initializer` Component:

**Path —** `plugins/my-plugin/admin/src/containers/Initializer/index.js`.

```js
/**
 *
 * Initializer
 *
 */

import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useStrapi } from 'strapi-helper-plugin';
import pluginId from '../../pluginId';
import InputMedia from './components/InputMedia';

const Initializer = ({ updatePlugin }) => {
  const {
    strapi: { fieldApi },
  } = useStrapi();
  const ref = useRef();
  ref.current = updatePlugin;

  useEffect(() => {
    // Register the new field
    fieldApi.registerField({ type: 'media', Component: InputMedia });

    ref.current(pluginId, 'isReady', true);
  }, []);

  return null;
};

Initializer.propTypes = {
  updatePlugin: PropTypes.func.isRequired,
};

export default Initializer;
```

2. Add the `Initializer` component to your plugin so it is mounted in the administration panel once the user is logged in:

```js
import pluginPkg from '../../package.json';
import pluginLogo from './assets/images/logo.svg';
import App from './containers/App';
import Initializer from './containers/Initializer';
import lifecycles from './lifecycles';
import trads from './translations';
import pluginId from './pluginId';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon: pluginPkg.strapi.icon,
    id: pluginId,
    initializer: Initializer,
    injectedComponents: [],
    isRequired: pluginPkg.strapi.required || false,
    layout: null,
    lifecycles,
    mainComponent: App,
    name: pluginPkg.strapi.name,
    pluginLogo,
    preventComponentRendering: false,
    trads,
  };

  return strapi.registerPlugin(plugin);
};
```

### Consuming the Field API

Consuming the **Field** API can only be done by using the provided `react-hook` **`useStrapi`**. Here's an example from the **content-manager** plugin:

**Path —** `~/strapi-plugin-content-manager/admin/src/components/Inputs/index.js`.

```js
import React, { memo, useMemo } from 'react';
// Other imports
// ...
// Import the Inputs component from our component library Buffet.js
import { Inputs as InputsIndex } from '@buffetjs/custom';

// Import the Hook with which you can access the Field API
import { useStrapi } from 'strapi-helper-plugin';

function Inputs({ autoFocus, keys, layout, name, onBlur }) {
  // This is where you will access the field API
  const {
    strapi: { fieldApi },
  } = useStrapi();

  // Other boilerplate code
  // ...

  return (
    <FormattedMessage id={errorId}>
      {error => {
        return (
          <InputsIndex
            {...metadatas}
            autoComplete="new-password"
            autoFocus={autoFocus}
            didCheckErrors={didCheckErrors}
            disabled={disabled}
            error={
              isEmpty(error) || errorId === temporaryErrorIdUntilBuffetjsSupportsFormattedMessage
                ? null
                : error
            }
            inputDescription={description}
            description={description}
            contentTypeUID={layout.uid}
            customInputs={{
              json: InputJSONWithErrors,
              wysiwyg: WysiwygWithErrors,
              uid: InputUID,

              // Retrieve all the fields that other plugins have registered
              ...fieldApi.getFields(),
            }}
            multiple={get(attribute, 'multiple', false)}
            attribute={attribute}
            name={keys}
            onBlur={onBlur}
            onChange={onChange}
            options={enumOptions}
            step={step}
            type={getInputType(type)}
            validations={validations}
            value={inputValue}
            withDefaultValue={false}
          />
        );
      }}
    </FormattedMessage>
  );
}
```

### Field API definition

| Method        | Param         | Description                            |
| :------------ | :------------ | :------------------------------------- |
| getField      | {String} type | Retrieve a Field depending on the type |
| getFields     |               | Retrieve all the Fields                |
| registerField | {Object}      | Register a Field                       |
| removeField   |               | Remove a Field                         |


## Plugin's front-end settings API

As plugins developer you may need to add some settings into the main application **`Settings`** view (it corresponds to the `Settings` link located in the menu). To do so an API is available in order for a plugin to add links into the main view.

These settings can be declared directly into the main plugin object so they will dynamically be injected into the view.

### Adding a setting

The front-end part of a plugin exports a function which registers the plugin in the administration panel. The argument is composed of two main parameters:

- `registerPlugin`: `Function`
- `settingsBaseURL`: `String`

#### Creating the links into the view's menu

Each plugin that comes with a setting object will create a new section into the view's menu.

The menu section can be declared as follows:

**Path —** `plugins/my-plugin/admin/src/index.js`.

```js
import pluginPkg from '../../package.json';
import pluginId from './pluginId';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;

  // Declare the links that will be injected into the settings menu
  const menuSection = {
    // Unique id of the section
    id: pluginId,
    // Title of Menu section using i18n
    title: {
      id: `${pluginId}.foo`,
      defaultMessage: 'Super cool setting',
    },
    // Array of links to be displayed
    links: [
      {
        // Using string
        title: 'Setting page 1',
        to: `${strapi.settingsBaseURL}/${pluginId}/setting1`,
        name: 'setting1',
        permissions: [{ action: 'plugins::my-plugin.action-name', subject: null }], // This key is not mandatory it can be null, undefined or an empty array
      },
      {
        // Using i18n with a corresponding translation key
        title: {
          id: `${pluginId}.bar`,
          defaultMessage: 'Setting page 2',
        },
        to: `${strapi.settingsBaseURL}/${pluginId}/setting2`,
        name: 'setting2',
        // Define a specific component if needed:
        Component: () => <div />,
      },
    ],
  };

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon: pluginPkg.strapi.icon,
    id: pluginId,
    initializer: () => null,
    injectedComponents: [],
    isReady: true,
    mainComponent: null,
    name: pluginPkg.strapi.name,
    preventComponentRendering: false,
    settings: {
      menuSection,
    },
    trads: {},
  };

  return strapi.registerPlugin(plugin);
};
```

At this point, the plugin creates a new section (**_Super cool setting_**) which will contains two links `Setting page 1` and `Setting page 2` these links don't point to any component as the corresponding one as not been declared yet.

#### Declaring the setting Component

The exported Setting component which receives `settingsBaseURL` as props in order to generate a dynamic routing which should be used to associate the two endpoints created with their corresponding components.

With the configuration from above we could easily create our plugin Settings view.

**Path —** `plugins/my-plugin/admin/src/containers/Settings/index.js`.

```js
import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import pluginId from '../../pluginId';

const SettingPage1 = () => (
  <div>
    <h1>Setting Page 1</h1>
  </div>
);
const SettingPage2 = () => (
  <div>
    <h1>Setting Page 2</h1>
  </div>
);

const Settings = ({ settingsBaseURL }) => {
  return (
    <Switch>
      <Route component={SettingPage1} path={`${settingsBaseURL}/${pluginId}/setting1`} />
      <Route component={SettingPage2} path={`${settingsBaseURL}/${pluginId}/setting2`} />
    </Switch>
  );
};

Settings.propTypes = {
  settingsBaseURL: PropTypes.string.isRequired,
};

export default Settings;
```

Now that the `Settings` component is declared in your plugin the only thing left is to add it to your settings configuration:

**Path —** `plugins/my-plugin/admin/src/index.js`.

```js
import pluginPkg from '../../package.json';
// Import the component
import Settings from './containers/Settings';
import pluginId from './pluginId';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;

  // Declare the links that will be injected into the settings menu
  const menuSection = {
    id: pluginId,
    title: {
      id: `${pluginId}.foo`,
      defaultMessage: 'Super cool setting',
    },
    links: [
      {
        title: 'Setting page 1',
        to: `${strapi.settingsBaseURL}/${pluginId}/setting1`,
        name: 'setting1',
        permissions: [{ action: 'plugins::my-plugin.action-name', subject: null }],
      },
      {
        title: {
          id: `${pluginId}.bar`,
          defaultMessage: 'Setting page 2',
        },
        to: `${strapi.settingsBaseURL}/${pluginId}/setting2`,
        name: 'setting2',
      },
    ],
  };

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon: pluginPkg.strapi.icon,
    id: pluginId,
    initializer: () => null,
    injectedComponents: [],
    isReady: true,
    mainComponent: null,
    name: pluginPkg.strapi.name,
    preventComponentRendering: false,
    settings: {
      mainComponent: Settings,
      menuSection,
    },
    trads: {},
  };

  return strapi.registerPlugin(plugin);
};
```

### Adding a setting into the global section

In order to add a link into the global section of the settings view you need to create a global array containing the links you want to add:

**Path —** `plugins/my-plugin/admin/src/index.js`.

```js
import pluginPkg from '../../package.json';
// Import the component
import Settings from './containers/Settings';
import SettingLink from './components/SettingLink';
import pluginId from './pluginId';

export default strapi => {
  const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;

  // Declare the links that will be injected into the settings menu
  const menuSection = {
    id: pluginId,
    title: {
      id: `${pluginId}.foo`,
      defaultMessage: 'Super cool setting',
    },
    links: [
      {
        title: 'Setting page 1',
        to: `${strapi.settingsBaseURL}/${pluginId}/setting1`,
        name: 'setting1',
      },
      {
        title: {
          id: `${pluginId}.bar`,
          defaultMessage: 'Setting page 2',
        },
        to: `${strapi.settingsBaseURL}/${pluginId}/setting2`,
        name: 'setting2',
      },
    ],
  };

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon: pluginPkg.strapi.icon,
    id: pluginId,
    initializer: () => null,
    injectedComponents: [],
    isReady: true,
    mainComponent: null,
    name: pluginPkg.strapi.name,
    preventComponentRendering: false,
    settings: {
      // Add a link into the global section of the settings view
      global: {
        links: [
          {
            title: 'Setting link 1',
            to: `${strapi.settingsBaseURL}/setting-link-1`,
            name: 'settingLink1',
            Component: SettingLink,
            // Bool : https://reacttraining.com/react-router/web/api/Route/exact-bool
            exact: false,
            permissions: [{ action: 'plugins::my-plugin.action-name', subject: null }],
          },
        ],
      },
      mainComponent: Settings,
      menuSection,
    },
    trads: {},
  };

  return strapi.registerPlugin(plugin);
};
```

::: danger
It is currently not possible to add a link into another plugin's setting section
:::
