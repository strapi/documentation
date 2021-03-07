# Admin panel customization

## Admin extension

The admin panel is a `node_module` that is similar to a [plugin](/developer-docs/latest/development/plugin-customization.md), with the slight difference that it encapsulates all the installed plugins of your application.

To extend this package you will have to create an `admin` folder at the root of your application.

In this folder you will be able to override admin files and functions.


## Customization options

The administration panel can be customized according to your needs, so you can make it reflect your identity.

::: warning
To apply your changes you need to [rebuild](#build) your admin panel
:::

### Change access URL

By default, the administration panel is exposed via [http://localhost:1337/admin](http://localhost:1337/admin). However, for security reasons, you can easily update this path. For more advanced settings please see the [server config](/developer-docs/latest/setup-deployment-guides/configurations.md#server) documentation.

**Path —** `./config/server.js`.

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    url: '/dashboard',
  },
});
```

The panel will be available through [http://localhost:1337/dashboard](http://localhost:1337/dashboard) with the configuration above.

### Development mode

To enable the front-end development mode you need to start your application using the `--watch-admin` flag.

```bash
cd my-app
strapi develop --watch-admin
```

With this option you can do the following:

#### Customize the `strapi-admin` package

All files added in `my-app/admin/src/` will either be replaced or added

**Example: Changing the available locales of your application**

```bash
# Create both the admin and admin/src/translations folders
cd my-app && mkdir -p admin/src/translations
# Change the available locales of the administration panel
touch admin/src/i18n.js
# Change the import and exports of the translations files
touch admin/src/translations/index.js
```

**Path -** `my-app/admin/src/translations/index.js`

```js
import en from './en.json';
import fr from './fr.json';

const trads = {
  en,
  fr,
};

export const languageNativeNames = {
  en: 'English',
  fr: 'Français',
};

export default trads;
```

::: tip
With this modification only English and French will be available in your admin
:::

#### Customize a plugin

Similarly to the back-end override system, any file added in `my-app/extensions/<plugin-name>/admin/` will be copied and used instead of the original one (use with care).

**Example: Changing the current WYSIWYG**

```bash
cd my-app/extensions
# Create the content manager folder
mkdir content-manager && cd content-manager
# Create the admin folder
mkdir -p admin/src
# Create the components folder and the WysiwygWithErrors one
cd admin/src && mkdir -p components/WysiwygWithErrors
# Create the index.js so the original file is overridden
touch components/WysiwygWithErrors/index.js
```

**Path -** `my-app/extensions/content-manager/admin/src/components/WysiwygWithErrors/index.js`

```js
import React from 'react';
import MyNewWYSIWYG from 'my-awesome-lib';

// This is a dummy example
const WysiwygWithErrors = props => <MyNewWYSIWYG {...props} />;

export default WysiwygWithErrors;
```

#### Styles

The AdminUI package source can be easily found in `./node_modules/strapi-admin/src/`.

For example, to change the top-left displayed admin panel's color, copy the `./node_modules/strapi-admin/admin/src/components/LeftMenu/LeftMenuHeader` folder to `./admin/src/components/LeftMenu/LeftMenuHeader` (create these folders if they don't exist) and change the styles inside `./admin/src/components/LeftMenu/LeftMenuHeader/Wrapper.js`.


Thus, you are replacing the files that would normally be in `node_modules/strapi-admin/admin/src` and directing them to `admin/src/some/file/path`.

To apply your changes you need to rebuild your admin panel

```
npm run build
```

#### Logo

To change the top-left displayed admin panel's logo, add your custom image at `./admin/src/assets/images/logo-strapi.png`.

To change the login page's logo, add your custom image at `./admin/src/assets/images/logo_strapi.png`.

::: tip
make sure the size of your image is the same as the existing one (434px x 120px).
:::

#### Tutorial videos

To disable the information box containing the tutorial videos, create a file at `./admin/src/config.js`

Add the following configuration:

```js
export const LOGIN_LOGO = null;
export const SHOW_TUTORIALS = false;
export const SETTINGS_BASE_URL = '/settings';
export const STRAPI_UPDATE_NOTIF = true;
```

#### Changing the host and port

By default, the front-development server runs on `localhost:8000`. However, you can change this setting by updating the following configuration:

**Path —** `./config/server.js`.

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    host: 'my-host', // only used along with `strapi develop --watch-admin` command
    port: 3000, // only used along with `strapi develop --watch-admin` command
  },
});
```

### Build

To build the administration, run the following command from the root directory of your project.

:::: tabs

::: tab yarn

```
yarn build
```

:::

::: tab npm

```
npm run build
```

:::

::: tab strapi

```
strapi build
```

:::

::::

This will replace the folder's content located at `./build`. Visit [http://localhost:1337/admin](http://localhost:1337/admin) to make sure your updates have been taken into account.

## Custom Webpack Config

In order to extend the usage of webpack, you can define a function that extends its config inside `admin/admin.config.js`, like so:

```js
module.exports = {
  webpack: (config, webpack) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

    return config;
  },
};
```


## Deployment

The administration is nothing more than a React front-end application calling an API. The front-end and the back-end are independent and can be deployed on different servers which brings us to different scenarios:

1. Deploy the entire project on the same server.
2. Deploy the administration panel on another server (AWS S3, Azure, etc) than the API.

Let's dive into the build configurations for each case.

### Deploy the entire project on the same server.

You don't need to touch anything in your configuration file. This is the default behavior and the build configuration will be automatically set. The server will start on the defined port and the administration panel will be accessible through `http://yourdomain.com:1337/dashboard`.

You might want to change the path to access the administration panel. Here is the required configuration to change the path:

**Path —** `./config/server.js`.

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    url: '/dashboard', // We change the path to access to the admin (highly recommended for security reasons).
  },
});
```

**You have to rebuild the administration panel to make this work.** [Build instructions](/developer-docs/latest/development/admin-customization.md#build).

### Deploy the administration panel on another server (AWS S3, Azure, etc) than the API.

It's very common to deploy the front-end and the back-end on different servers. Here is the required configuration to handle this case:

**Path —** `./config/server.js`.

```js
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

After running `yarn build` with this configuration, the folder `build` will be created/overwritten. You can then use this folder to serve it from another server with the domain of your choice (ex: `http://yourfrontend.com`).

The administration URL will then be `http://yourfrontend.com` and every request from the panel will hit the backend at `http://yourbackend.com`.

::: tip NOTE
If you add a path to the `url` option, it won't prefix your app. To do so, you need to also use a proxy server like Nginx. More [here](/developer-docs/latest/setup-deployment-guides/deployment.md#optional-software-guides).
:::


## Forgot Password Email

### Customize forgot password email

You may want to customize the forgot password email.
You can do it by providing your own template (formatted as a [lodash template](https://lodash.com/docs/4.17.15#template)).

The template will be compiled with the following variables: `url`, `user.email`, `user.username`, `user.firstname`, `user.lastname`.

### Example

**Path -** `./config/servers.js`

```js
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

**Path -** `./config/email-templates/forgot-password.js`

```js
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
