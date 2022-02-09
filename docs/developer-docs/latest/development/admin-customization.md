---
title: Admin panel customization - Strapi Developer Docs
description: The administration panel of Strapi can be customized according to your needs, so you can make it reflect your identity.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/admin-customization.html
---

# Admin panel customization

The admin panel is a `node_module` that is similar to a plugin, except that it encapsulates all the installed plugins of a Strapi application. Some of its aspects can be [customized](#customization-options), and plugins can also [extend](#extension) it.

To toggle hot reloading and get errors in the console while developing, start Strapi in front-end development mode by running the application with the `--watch-admin` flag:

```bash
cd my-app # cd into the root directory of the Strapi application project
strapi develop --watch-admin
```

## Customization options

Customizing the admin panel is helpful to better reflect your brand identity or to modify some default Strapi behavior:

- The [access URL, host and port](#access-url) can be modified through the server configuration.
- The [configuration object](#configuration-options) allows replacing the logos and favicon, defining locales and extending translations, extending the theme, and disabling some Strapi default behaviors like displaying video tutorials or notifications about new Strapi releases.
- The [WYSIWYG editor](#wysiwyg-editor) can be replaced or customized.
- The [forgotten password email](#forgotten-password-email) can be customized with a template and variables.
- The [webpack configuration](#webpack-configuration) based on webpack 5 can also be extended for advanced customization

### Access URL

By default, the administration panel is exposed via [http://localhost:1337/admin](http://localhost:1337/admin). For security reasons, this path can be updated.

**Example:**

To make the admin panel accessible from `http://localhost:1337/dashboard`, use this in the [server configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md) file:

```js
//path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

});


// path: ./config/admin.js

module.exports = ({ env }) => ({
  url: '/dashboard',
})
```

:::strapi Advanced settings
For more advanced settings please see the [admin panel configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md) documentation.
:::

#### Host and port

By default, the front end development server runs on `localhost:8000` but this can be modified:

```js
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
});


// path: ./config/admin.js

module.exports = ({ env }) => ({
  host: 'my-host', // only used along with `strapi develop --watch-admin` command
  port: 3000, // only used along with `strapi develop --watch-admin` command
});

```

### Configuration options

The `config` object found at `./src/admin/app.js` stores the admin panel configuration.

Any file used by the `config` object (e.g. a custom logo) should be placed in the `./src/admin/extensions/` folder and imported inside `./src/admin/app.js`.

The `config` object accepts the following parameters:

| Parameter       | Type             | Description                                                                                                                                   |
| --------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`          | Object           | Accepts a `logo` key to replace the default Strapi [logo](#logos) on login screen                                                    |
| `head`          | Object           | Accepts a `favicon` key to replace the default Strapi [favicon](#favicon)                                                        |
| `locales`       | Array of Strings | Defines availables locales (see [updating locales](/developer-docs/latest/development/admin-customization.md#locales)) |
| `translations`  | Object           | [Extends the translations](#extending-translations)                                                                                                                       |
| `menu`          | Object           | Accepts the `logo` key to change the [logo](#logos) in the main navigation                                                           |
| `theme`         | Object           | Overrides or [extends the theme](#theme-extension)                                                                                          |
| `tutorials`     | Boolean          | Toggles [displaying the video tutorials](#tutorial-videos)                                                            |
| `notifications` | Object           | Accepts the `releases` key (Boolean) to toggle [displaying notifications about new releases](#releases-notifications)          |

::: details Example of a custom configuration for the admin panel:

```jsx
// path: ./my-app/src/admin/app.js

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

#### Locales

To update the list of available locales in the admin panel, use the `config.locales` array:

```jsx
// path: ./my-app/src/admin/app.js

export default {
  config: {
    locales: ['ru', 'zh']
  },
  bootstrap() {},
}
```

::: note NOTES

* The `en` locale cannot be removed from the build as it is both the fallback (i.e. if a translation is not found in a locale, the `en` will be used) and the default locale (i.e. used when a user opens the administration panel for the first time).
* The full list of available locales is accessible on [Strapi's Github repo](https://github.com/strapi/strapi/blob/v4.0.0/packages/plugins/i18n/server/constants/iso-locales.json).
:::

##### Extending translations

Translation key/value pairs are declared in `@strapi/admin/admin/src/translations/[language-name].json` files. These keys can be extended through the `config.translations` key:

```js
// path: ./my-app/src/admin/app.js

export default {
  config: {
    locales: ['fr'],
    translations: {
      fr: {
        'Auth.form.email.label': 'test',
        Users: 'Utilisateurs',
        City: 'CITY (FRENCH)',
        // Customize the label of the Content Manager table.
        Id: 'ID french',
      },
    },
  },
  bootstrap() {},
};
```

If more translations files should be added, place them in `./src/admin/extensions/translations` folder.

#### Logos

The Strapi admin panel displays a logo in 2 different locations, represented by 2 different keys in the [admin panel configuration](#configuration-options):

| Location in the UI     | Configuration key to update |
| ---------------------- | --------------------------- |
| On the login page      | `config.auth.logo`          |
| In the main navigation | `config.menu.logo`          |

To update the logos, put image files in the `./src/admin/extensions` folder and update the corresponding keys.

The size of the custom image should be the same as the default one (434px x 120px).

#### Favicon

To update the favicon, put a favicon file in the `./src/admin/extensions` folder and update the `config.head.favicon` key in the [admin panel configuration](#configuration-options).

#### Tutorial videos

To disable the information box containing the tutorial videos, set the `config.tutorials` key to `false`.

#### Releases notifications

To disable notifications about new Strapi releases, set the `config.notifications.release` key to `false`.

#### Theme extension

<!-- TODO: complete this section once design system is ready -->

To extend the theme, use the `config.theme` key.

::: Strapi Design System
The default [Strapi theme](https://github.com/strapi/design-system/tree/main/packages/strapi-design-system/src/themes) defines various theme-related keys (shadows, colors…) that can be updated through the `config.theme` key in `./admin/src/app.js`.
:::

<!-- TODO: maybe provide a theme extension example once design system is ready? -->

### WYSIWYG editor

To change the current WYSIWYG, you can either install a third-party plugin, or take advantage of the bootstrap lifecycle (see [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md#bootstrap)).

### 'Forgotten password' email

To customize the 'Forgotten password' email, provide your own template (formatted as a [lodash template](https://lodash.com/docs/4.17.15#template)).

The template will be compiled with the following variables: `url`, `user.email`, `user.username`, `user.firstname`, `user.lastname`.

**Example**:

```js
// path: ./config/admin.js

const forgotPasswordTemplate = require('./email-templates/forgot-password');

module.exports = ({ env }) => ({
  // ...
  forgotPassword: {
    from: 'support@mywebsite.fr',
    replyTo: 'support@mywebsite.fr',
    emailTemplate: forgotPasswordTemplate,
  },
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

### Webpack configuration

In order to extend the usage of webpack v5, define a function that extends its configuration inside `./my-app/src/admin/webpack.config.js`:

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
Only `./src/admin/app.js` and the files under the `./src/admin/extensions` folder are being watched by the webpack dev server.
:::

## Extension

There are 2 use cases to extend the admin panel:

- A plugin developer wants to develop a Strapi plugin that extends the admin panel everytime it's installed in any Strapi application. This can be done by taking advantage of the [Admin Panel API](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md).

- A Strapi user only needs to extend a specific instance of a Strapi application. This can be done by directly updating the `./src/admin/app.js` file, which can import any file located in `./src/admin/extensions`.

## Deployment

The administration is a React front-end application calling an API. The front end and the back end are independent and can be deployed on different servers, which brings us to different scenarios:

* Deploy the entire project on the same server.
* Deploy the administration panel on a server (AWS S3, Azure, etc) different from the API server.

Build configurations differ for each case.

Before deployment, the admin panel needs to be built, by running the following command from the project's root directory:

<code-group>

<code-block title="NPM">
```sh
npm run build
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

### Same server

Deploying the admin panel and the API on the same server is the default behavior. The build configuration will be automatically set. The server will start on the defined port and the administration panel will be accessible through `http://yourdomain.com:1337/admin`.

:::tip
You might want to [change the path to access the administration panel](#access-url).
:::

### Different servers

To deploy the front end and the back end on different servers, use the following configuration:

```js
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'http://yourbackend.com',
});


// path: ./config/admin.js

module.exports = ({ env }) => ({
  url: '/', // Note: The administration will be accessible from the root of the domain (ex: http://yourfrontend.com/)
  serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
});
```

After running `yarn build` with this configuration, the `build` folder will be created/overwritten. Use this folder to serve it from another server with the domain of your choice (e.g. `http://yourfrontend.com`).

The administration URL will then be `http://yourfrontend.com` and every request from the panel will hit the backend at `http://yourbackend.com`.

:::note
If you add a path to the `url` option, it won't prefix your app. To do so, use a proxy server like Nginx (see [optional software guides](/developer-docs/latest/setup-deployment-guides/deployment.md#optional-software-guides)).
:::
