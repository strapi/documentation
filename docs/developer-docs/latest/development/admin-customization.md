---
title: Admin panel customization - Strapi Developer Documentation
description: The administration panel of Strapi can be customized according to your needs, so you can make it reflect your identity.
sidebarDepth: 3
---

# Admin panel customization

The admin panel is a `node_module` that is similar to a plugin, with the slight difference that it encapsulates all the installed plugins of your application. Most of its aspects can be [customized](#customizing-the-admin-panel), and plugins can also [extend](#extending-the-admin-panel) it.

<!-- ? wording: should we use 'admin panel' or 'administration panel' throughout the whole documentation? -->

## Using the development mode and rebuilding the admin panel

### Development mode

To toggle hot reloading and get errors in the console while developing, start Strapi in front-end development mode by running the application with the `--watch-admin` flag:

```bash
cd my-app # cd into the root directory of the Strapi application project
strapi develop --watch-admin
```

### Build

Once satisfied with the changes, the admin panel needs to be built before deployment, by running the following command from the project's root directory:

<code-group>

<code-block title="NPM">
```sh
npm  build
```
</code-block>

<code-block title="YARN">
```sh
yarn build
```
</code-block>

<code-block title="STRAPI CLI">
```sh
strapi build
```
</code-block>

</code-group>

This will replace the folder's content located at `./build`. Visit [http://localhost:1337/admin](http://localhost:1337/admin) to make sure customizations have been taken into account.

## Customizing the admin panel

Customizing the admin panel is helpful to better reflect your brand identity or to modify some default Strapi behavior.

:::caution
To apply the following customizations you need to [rebuild](#build) the admin panel.
:::

### Changing the access URL

By default, the administration panel is exposed via [http://localhost:1337/admin](http://localhost:1337/admin). For security reasons, this path can be updated.

**Example:**

To make the admin panel accessible from `http://localhost:1337/dashboard`, use this in the [server configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md) file:

```js
//path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    url: '/dashboard',
  },
});
```

:::strapi Advanced server settings
For more advanced settings please see the [server configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md) documentation.
:::

#### Changing the host and port

By default, the front end development server runs on `localhost:8000` but this can be modified:

```js
//path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    host: 'my-host', // only used along with `strapi develop --watch-admin` command
    port: 3000, // only used along with `strapi develop --watch-admin` command
  },
});
```

### Changing the configuration

The `config` object found at `./admin/src/app.js` stores the admin panel configuration and accepts the following parameters:

| Parameter       | Type             | Description                                                                                                                                   |
| --------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`          | Object           | Accepts a `logo` key to replace the default Strapi [logo](#updating-logos) on login screen                                                    |
| `head`          | Object           | Accepts a `favicon` key to replace the default Strapi [favicon](#updating-the-favicon)                                                        |
| `locales`       | Array of Strings | Defines availables locales (see [updating locales](/developer-docs/latest/development/admin-customization.md#updating-locales)) |
| `menu`          | Object           | Accepts the `logo` key to change the [logo](#updating-logos) in the main navigation                                                           |
| `theme`         | Object           | Overrides or [extends the theme](#extending-the-theme)                                                                                          |
| `translations`  | Object           | [Extends the translations](#extending-translations)                                                                                                                       |
| `tutorial`      | Boolean          | Toggles [displaying the video tutorials](#toggling-the-display-of-tutorial-videos)                                                            |
| `notifications` | Object           | Accepts the `release` key (Boolean) to toggle [displaying notifications about new releases](#toggling-strapi-releases-notifications)          |

::: details Example of a custom configuration for the admin panel:

```jsx
// path: ./admin/src/app.js

import AuthLogo from './extensions/my-logo.png';
import MenuLogo from './extensions/logo.png';
import favicon from './extensions/favicon.ico';

export default {
  config: {
    // Replace the Strapi logo in auth (login) views
    auth: {
      logo: AuthLogo,
    },
   // Replace the favicon
    head: {
      favicon: favicon,
    },
    // Add a new locale, other than 'en'
    locales: ['fr', 'de'],
    // Replace the Strapi logo in the main navigation
    menu: {
      logo: MenuLogo,
    },
    // Override or extend the theme
    theme: {
      colors: {
        alternative100: '#f6ecfc',
        alternative200: '#e0c1f4',
        alternative500: '#ac73e6',
        alternative600: '#9736e8',
        alternative700: '#8312d1',
        danger700: '#b72b1a'
      },
    },
    // Extend the translations
    translations: {
      fr: {
        'Auth.form.email.label': 'test',
        Users: 'Utilisateurs',
        City: 'CITY (FRENCH)',
        // Customize the label of the Content Manager table.
        Id: 'ID french',
      },
    },
   // Disable video tutorials
    tutorials: false,
   // Disable notifications about new Strapi releases
    notifications: { release: false },
  },

  bootstrap() {},
};

```

:::

#### Updating locales

To update the list of available locales in the admin panel, use the `config.locales` array:

<!-- ? is it the right path? -->
```jsx
// path: ./my-app/admin/src/app.js

module.exports = {
  // Custom webpack config
  webpack: (config, webpack) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config;
  },

  // App customizations
  app: config => {
    config.locales = ['ru', 'zh'];

    return config;
  },
};
```

::: note NOTES

* The `en` locale cannot be removed from the build as it is both the fallback (if a translation is not found in a locale, the `en` will be used) and the default locale (used when a user opens the administration panel for the first time).
* The full list of available locales is accessible on [Strapi's Github repo](https://github.com/strapi/strapi/blob/master/packages/strapi-plugin-i18n/constants/iso-locales.json).
:::

##### Extending translations

Translation key/value pairs are declared in `./translations/[language-name].json` files. These keys can be extended through the `config.translations` key.

#### Updating logos

The Strapi admin panel displays a logo in 2 different locations, represented by 2 different keys in the [admin panel configuration](#changing-the-configuration):

| Location in the UI     | Configuration key to update |
| ---------------------- | --------------------------- |
| On the login page      | `config.auth.logo`          |
| In the main navigation | `config.menu.logo`          |

To update the logos, put image files in the `./extensions` folder and update the corresponding keys.

::: tip
Make sure the size of your image is the same as the existing one (434px x 120px).
:::

#### Updating the favicon

To update the favicon, put a favicon file in the `.extensions` folder and update the `config.head.favicon` key in the [admin panel configuration](#changing-the-configuration).

#### Toggling the display of tutorial videos

To disable the information box containing the tutorial videos, set the `config.tutorials` key to `false`.

#### Toggling Strapi releases notifications

To disable notifications about new Strapi releases, set the `config.notifications.release` key to `false`.

#### Extending the theme

<!-- TODO: complete this section once design system is ready -->

To extend the theme, use the `config.theme` key.

::: strapi Strapi Parts! theme
The default [Strapi Parts! theme](https://github.com/strapi/parts/tree/develop/packages/strapi-parts/src/themes) defines various theme-related keys (shadows, colors…) that can be updated through the `config.theme` key in `./admin/src/app.js`.
:::

<!-- TODO: maybe provide a theme extension example once design system is ready? -->

### Customizing the WYSIWYG editor

To change the current WYSIWYG, you can either install a third-party plugin, or take advantage of the bootstrap lifecycle (see [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#bootstrap)).

<!-- TODO: Add Component API -->

### Customizing the 'Forgotten password' email

To customize the 'Forgotten password' email, provide your own template (formatted as a [lodash template](https://lodash.com/docs/4.17.15#template)).

The template will be compiled with the following variables: `url`, `user.email`, `user.username`, `user.firstname`, `user.lastname`.

**Example**:


```js
// path: ./config/servers.js

const forgotPasswordTemplate = require('./email-templates/forgot-password');

module.exports = ({ env }) => ({
  // ...
  admin: {
    // ...
    forgotPassword: {
      from: 'support@mywebsite.fr',
      replyTo: 'support@mywebsite.fr',
      emailTemplate: forgotPasswordTemplate,
    },
    // ...
  },
  // ...
});
```

```js
// path: ./config/email-templates/forgot-password.js

const subject = `Reset password`;

const html = `<p>Hi <%= user.firstname %></p>
<p>Sorry you lost your password. You can click here to reset it: <%= url %></p>`;

const text = `Hi <%= user.firstname %>
Sorry you lost your password. You can click here to reset it: <%= url %>`;

module.exports = {
  subject,
  text,
  html,
};
```

### Customizing the webpack configuration

In order to extend the usage of webpack v5, define a function that extends its configuration inside `./admin/webpack.config.js`:

```js
module.exports = {
  webpack: (config, webpack) => {
    // Note: we provide webpack above so you should not `require` it

    // Perform customizations to webpack config
    config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

    // Important: return the modified config
    return config;
  },
};
```

::: note
Only `./admin/app.js` and the files under the `./admin/extensions` folder are being watched by the webpack dev server.
:::

## Extending the admin panel

The admin panel can also be extended by plugins. To extend the admin panel:

1. Create an `admin/extensions` folder at the root of your application.
2. Inside this folder, override admin panel files and functions.

::: strapi Admin Panel API
To extend the admin panel, you can take advantage of the [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md).
:::

## Deploying the admin panel

The administration is nothing more than a React front-end application calling an API. The front end and the back end are independent and can be deployed on different servers, which brings us to different scenarios:

* Deploy the entire project on the same server.
* Deploy the administration panel on a server (AWS S3, Azure, etc) different from the API server.

Build configurations differ for each case.

### Deploy the entire project on the same server

This is the default behavior and the build configuration will be automatically set. The server will start on the defined port and the administration panel will be accessible through `http://yourdomain.com:1337/admin`.

<!-- ? is it /admin or /dashboard? -->

:::tip
You might want to [change the path to access the administration panel](#changing-the-access-url).
:::

### Deploy the administration panel on a server different from the API server

It's very common to deploy the front end and the back end on different servers. Here is the required configuration to handle this case:


```js
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'http://yourbackend.com',
  admin: {
    url: '/', // Note: The administration will be accessible from the root of the domain (ex: http://yourfrontend.com/)
    serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
  },
});
```

After running `yarn build` with this configuration, the `build` folder will be created/overwritten. Use this folder to serve it from another server with the domain of your choice (e.g. `http://yourfrontend.com`).

The administration URL will then be `http://yourfrontend.com` and every request from the panel will hit the backend at `http://yourbackend.com`.

:::note
If you add a path to the `url` option, it won't prefix your app. To do so, you need to also use a proxy server like Nginx (see [optional software guides](/developer-docs/latest/setup-deployment-guides/deployment.md#optional-software-guides)).
:::
