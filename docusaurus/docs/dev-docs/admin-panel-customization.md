---
title: Admin panel customization
description: The administration panel of Strapi can be customized according to your needs, so you can make it reflect your identity.
toc_max_heading_level: 4
---

<!-- not required but if we don't include an import line the 2 JavaScript lines below are interpreted as Markdown text 🤷  -->

import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'
const captionStyle = {fontSize: '12px'}
const imgStyle = {width: '100%', margin: '0' }

The admin panel is a React-based single-page application. It encapsulates all the installed plugins of a Strapi application. Some of its aspects can be [customized](#customization-options), and plugins can also [extend](#extension) it.

To start your strapi instance with hot reloading while developing, run the following command:

```bash
cd my-app # cd into the root directory of the Strapi application project
strapi develop --watch-admin
```

## Customization options

Customizing the admin panel is helpful to better reflect your brand identity or to modify some default Strapi behavior:

- The [access URL, host and port](#access-url) can be modified through the server configuration.
- The [configuration object](#configuration-options) allows replacing the logos and favicon, defining locales and extending translations, extending the theme, and disabling some Strapi default behaviors like displaying video tutorials or notifications about new Strapi releases.
- The [WYSIWYG editor](#wysiwyg-editor) can be replaced or customized.
- The [email templates](#email-templates) should be customized using the Users and Permissions plugin.

### Access URL

By default, the administration panel is exposed via [http://localhost:1337/admin](http://localhost:1337/admin). For security reasons, this path can be updated.

**Example:**

To make the admin panel accessible from `http://localhost:1337/dashboard`, use this in the [server configuration](/dev-docs/configurations/server) file:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

```js title="./config/admin.js"
module.exports = ({ env }) => ({
  url: "/dashboard",
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

```js title="./config/admin.ts"
export default ({ env }) => ({
  url: "/dashboard",
});
```

</TabItem>
</Tabs>

:::strapi Advanced settings
For more advanced settings please see the [admin panel configuration](/dev-docs/configurations/admin-panel) documentation.
:::

#### Host and port

:::note
From 4.15.1 this is now deprecated. The strapi server now supports the live updating of the admin panel in development mode.
:::

By default, the front end development server runs on `localhost:8000` but this can be modified:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

```js title="./config/admin.js"
module.exports = ({ env }) => ({
  host: "my-host", // only used along with `strapi develop --watch-admin` command
  port: 3000, // only used along with `strapi develop --watch-admin` command
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
});
```

```js title="./config/admin.ts"
export default ({ env }) => ({
  host: "my-host", // only used along with `strapi develop --watch-admin` command
  port: 3000, // only used along with `strapi develop --watch-admin` command
});
```

</TabItem>
</Tabs>

### Configuration options

:::prerequisites
Before configuring any admin panel customization option, make sure to:

- rename the default `app.example.js` file into `app.js`,
- and create a new `extensions` folder in `./src/admin/`. Strapi projects already contain by default another `extensions` folder in `./src/` but it is for plugins extensions only (see [Plugins extension](/dev-docs/plugins-extension)).
:::

The `config` object found at `./src/admin/app.js` stores the admin panel configuration.

Any file used by the `config` object (e.g. a custom logo) should be placed in a `./src/admin/extensions/` folder and imported inside `./src/admin/app.js`.

The `config` object accepts the following parameters:

| Parameter                      | Type             | Description                                                                                                           |
| ------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `auth`                         | Object           | Accepts a `logo` key to replace the default Strapi [logo](#logos) on login screen                                     |
| `head`                         | Object           | Accepts a `favicon` key to replace the default Strapi [favicon](#favicon)                                             |
| `locales`                      | Array of Strings | Defines availables locales (see [updating locales](#locales))                                                         |
| `translations`                 | Object           | [Extends the translations](#extending-translations)                                                                   |
| `menu`                         | Object           | Accepts the `logo` key to change the [logo](#logos) in the main navigation                                            |
| `theme.light` and `theme.dark` | Object           | [Overwrite theme properties](#theme-extension) for Light and Dark modes                                               |
| `tutorials`                    | Boolean          | Toggles [displaying the video tutorials](#tutorial-videos)                                                            |
| `notifications`                | Object           | Accepts the `releases` key (Boolean) to toggle [displaying notifications about new releases](#releases-notifications) |

<details>
<summary>Example of a custom configuration for the admin panel</summary>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="./my-app/src/admin/app.js"
import AuthLogo from "./extensions/my-logo.png";
import MenuLogo from "./extensions/logo.png";
import favicon from "./extensions/favicon.png";

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
    locales: ["fr", "de"],
    // Replace the Strapi logo in the main navigation
    menu: {
      logo: MenuLogo,
    },
    // Override or extend the theme
    theme: {
      // overwrite light theme properties
      light: {
        colors: {
          primary100: "#f6ecfc",
          primary200: "#e0c1f4",
          primary500: "#ac73e6",
          primary600: "#9736e8",
          primary700: "#8312d1",
          danger700: "#b72b1a",
        },
      },

      // overwrite dark theme properties
      dark: {
        // ...
      },
    },
    // Extend the translations
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        Users: "Utilisateurs",
        City: "CITY (FRENCH)",
        // Customize the label of the Content Manager table.
        Id: "ID french",
      },
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false },
  },

  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```jsx title="./my-app/src/admin/app.ts"
import AuthLogo from "./extensions/my-logo.png";
import MenuLogo from "./extensions/logo.png";
import favicon from "./extensions/favicon.png";

export default {
  config: {
    // Replace the Strapi logo in auth (login) views
    auth: {
      logo: AuthLogo,
    },
    // Replace the favicon
    head: {
      // Try to change the origin favicon.png file in the
      // root of strapi project if this config don't work.
      favicon: favicon, 
    },
    // Add a new locale, other than 'en'
    locales: ["fr", "de"],
    // Replace the Strapi logo in the main navigation
    menu: {
      logo: MenuLogo,
    },
    // Override or extend the theme
    theme: {
      colors: {
        primary100: "#f6ecfc",
        primary200: "#e0c1f4",
        primary500: "#ac73e6",
        primary600: "#9736e8",
        primary700: "#8312d1",
        danger700: "#b72b1a",
      },
    },
    // Extend the translations
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        Users: "Utilisateurs",
        City: "CITY (FRENCH)",
        // Customize the label of the Content Manager table.
        Id: "ID french",
      },
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false },
  },

  bootstrap() {},
};
```

</TabItem>
</Tabs>

</details>

#### Locales

To update the list of available locales in the admin panel, use the `config.locales` array:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="./my-app/src/admin/app.js"
export default {
  config: {
    locales: ["ru", "zh"],
  },
  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```jsx title="./my-app/src/admin/app.ts"
export default {
  config: {
    locales: ["ru", "zh"],
  },
  bootstrap() {},
};
```

</TabItem>
</Tabs>

:::note NOTES

- The `en` locale cannot be removed from the build as it is both the fallback (i.e. if a translation is not found in a locale, the `en` will be used) and the default locale (i.e. used when a user opens the administration panel for the first time).
- The full list of available locales is accessible on [Strapi's Github repo](https://github.com/strapi/strapi/blob/v4.0.0/packages/plugins/i18n/server/constants/iso-locales.json).

:::

##### Extending translations

Translation key/value pairs are declared in `@strapi/admin/admin/src/translations/[language-name].json` files. These keys can be extended through the `config.translations` key:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./my-app/src/admin/app.js"
export default {
  config: {
    locales: ["fr"],
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        Users: "Utilisateurs",
        City: "CITY (FRENCH)",
        // Customize the label of the Content Manager table.
        Id: "ID french",
      },
    },
  },
  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./my-app/src/admin/app.ts"
export default {
  config: {
    locales: ["fr"],
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        Users: "Utilisateurs",
        City: "CITY (FRENCH)",
        // Customize the label of the Content Manager table.
        Id: "ID french",
      },
    },
  },
  bootstrap() {},
};
```

</TabItem>
</Tabs>

A plugin's key/value pairs are declared independently in the plugin's files at `./admin/src/translations/[language-name].json`. These key/value pairs can similarly be extended in the `config.translations` key by prefixing the key with the plugin's name (i.e. `[plugin name].[key]: 'value'`) as in the following example:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./my-app/src/admin/app.js"
export default {
  config: {
    locales: ["fr"],
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        // Translate a plugin's key/value pair by adding the plugin's name as a prefix
        // In this case, we translate the "plugin.name" key of plugin "content-type-builder"
        "content-type-builder.plugin.name": "Constructeur de Type-Contenu",
      },
    },
  },
  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./my-app/src/admin/app.ts"
export default {
  config: {
    locales: ["fr"],
    translations: {
      fr: {
        "Auth.form.email.label": "test",
        // Translate a plugin's key/value pair by adding the plugin's name as a prefix
        // In this case, we translate the "plugin.name" key of plugin "content-type-builder"
        "content-type-builder.plugin.name": "Constructeur de Type-Contenu",
      },
    },
  },
  bootstrap() {},
};
```

</TabItem>
</Tabs>

If more translations files should be added, place them in `./src/admin/extensions/translations` folder.

#### Logos

The Strapi admin panel displays a logo in 2 different locations, represented by 2 different keys in the [admin panel configuration](#configuration-options):

| Location in the UI     | Configuration key to update |
| ---------------------- | --------------------------- |
| On the login page      | `config.auth.logo`          |
| In the main navigation | `config.menu.logo`          |

<details>
<summary>Logos location in the admin panel:</summary>
<figure style={imgStyle}>
  <img src="/img/assets/development/config-auth-logo.png" alt="Simplified Strapi backend diagram with controllers highlighted" />
  <em><figcaption >The logo handled by <code>config.auth.logo</code> logo is only shown on the login screen.</figcaption></em>
</figure>
<br/>
<figure style={imgStyle}>
  <img src="/img/assets/development/config-menu-logo.png" alt="Location of Menu logo" />
  <em><figcaption >The logo handled by <code>config.menu.logo</code> logo is located in the main navigation at the top left corner of the admin panel.</figcaption></em>
</figure>
</details>

To update the logos, put image files in the `./src/admin/extensions` folder and update the corresponding keys. There is no size limit for image files set through the configuration files.

:::note
Both logos can also be customized directly via the admin panel (see [User Guide](/user-docs/settings/admin-panel.md)).
Logos uploaded via the admin panel supersede any logo set through the configuration files.
:::

#### Favicon

To replace the favicon, use the following procedure:

1. (_optional_) Create a `./src/admin/extensions/` folder if the folder does not already exist.
2. Upload your favicon into `./src/admin/extensions/`.
3. Replace the existing **favicon.png|ico** file at the Strapi application root with a custom `favicon.png|ico` file.
4. Update `./src/admin/app.js` with the following:

   ```js title="./src/admin/app.js"
   import favicon from "./extensions/favicon.png";

   export default {
     config: {
       // replace favicon with a custom icon
       head: {
         favicon: favicon,
       },
     },
   };
   ```

5. Rebuild, launch and revisit your Strapi app by running `yarn build && yarn develop` in the terminal.

:::tip
This same process may be used to replace the login logo (i.e. `AuthLogo`) and menu logo (i.e. `MenuLogo`) (see [logos customization documentation](#logos)).
:::

:::caution
Make sure that the cached favicon is cleared. It can be cached in your web browser and also with your domain management tool like Cloudflare's CDN.
:::

#### Tutorial videos

To disable the information box containing the tutorial videos, set the `config.tutorials` key to `false`.

#### Releases notifications

To disable notifications about new Strapi releases, set the `config.notifications.releases` key to `false`.

#### Theme extension

Strapi applications can be displayed either in Light or Dark mode (see [administrator profile setup in the User Guide](/user-docs/intro#setting-up-your-administrator-profile)), and both can be extended through custom theme settings.

To extend the theme, use either:

- the `config.theme.light` key for the Light mode
- the `config.theme.dark` key for the Dark mode

:::strapi Strapi Design System
The default [Strapi theme](https://github.com/strapi/design-system/tree/main/packages/strapi-design-system/src/themes) defines various theme-related keys (shadows, colors…) that can be updated through the `config.theme.light` and `config.theme.dark` keys in `./admin/src/app.js`. The [Strapi Design System](https://design-system.strapi.io/) is fully customizable and has a dedicated [StoryBook](https://design-system-git-main-strapijs.vercel.app) documentation.
:::

:::caution
The former syntax for `config.theme` without `light` or `dark` keys is deprecated and will be removed in the next major release. We encourage you to update your custom theme to use the new syntax that supports light and dark modes.
:::

### WYSIWYG editor

To change the current WYSIWYG, you can install a [third-party plugin](https://market.strapi.io/), create your own plugin (see [creating a new field in the admin panel](/dev-docs/custom-fields)) or take advantage of the [bootstrap lifecycle](/dev-docs/api/plugins/admin-panel-api#bootstrap) and the [extensions](#extension) system:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/admin/app.js"
import MyNewWYSIGWYG from "./extensions/components/MyNewWYSIGWYG"; // this file contains the logic for your new WYSIWYG

export default {
  bootstrap(app) {
    app.addFields({ type: "wysiwyg", Component: MyNewWYSIGWYG });
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/admin/app.ts"
import MyNewWYSIGWYG from "./extensions/components/MyNewWYSIGWYG"; // this file contains the logic for your new WYSIWYG

export default {
  bootstrap(app) {
    app.addFields({ type: "wysiwyg", Component: MyNewWYSIGWYG });
  },
};
```

</TabItem>
</Tabs>

### Email templates

Email templates should be edited through the admin panel, using the [Users and Permissions plugin settings](/user-docs/settings/configuring-users-permissions-plugin-settings#configuring-email-templates).

## Bundlers (experimental)

2 different bundlers can be used with your Strapi application, [webpack](#webpack) and [vite](#vite).

### Webpack

In v4 this is the defacto bundler that Strapi uses to build the admin panel.

:::prerequisites
Make sure to rename the default `webpack.config.example.js` file into `webpack.config.[js|ts]` before customizing webpack.
:::

In order to extend the usage of webpack v5, define a function that extends its configuration inside `./my-app/src/admin/webpack.config.[js|ts]`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./my-app/src/admin/webpack.config.js"
module.exports = (config, webpack) => {
  // Note: we provide webpack above so you should not `require` it

  // Perform customizations to webpack config
  config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

  // Important: return the modified config
  return config;
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./my-app/src/admin/webpack.config.ts"
export default (config, webpack) => {
  // Note: we provide webpack above so you should not `require` it

  // Perform customizations to webpack config
  config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

  // Important: return the modified config
  return config;
};
```

</TabItem>
</Tabs>

### Vite

:::caution
This is considered experimental. Please report any issues you encounter.
:::

To use `vite` as a bundler you will need to pass it as an option to the `strapi develop` command:

```bash
strapi develop --watch-admin --bundler=vite
```

To extend the usage of `vite`, define a function that extends its configuration inside `./my-app/src/admin/vite.config.[js|ts]`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./my-app/src/admin/vite.config.js"
const { mergeConfig } = require("vite");

module.exports = (config) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  });
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./my-app/src/admin/vite.config.ts"
import { mergeConfig } from "vite";

export default (config) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  });
};
```

</TabItem>
</Tabs>

## Extension

There are 2 use cases to extend the admin panel:

- A plugin developer wants to develop a Strapi plugin that extends the admin panel everytime it's installed in any Strapi application. This can be done by taking advantage of the [Admin Panel API](/dev-docs/api/plugins/admin-panel-api).

- A Strapi user only needs to extend a specific instance of a Strapi application. This can be done by directly updating the `./src/admin/app.js` file, which can import any file located in `./src/admin/extensions`.

## Deployment

The administration is a React front-end application calling an API. The front end and the back end are independent and can be deployed on different servers, which brings us to different scenarios:

- Deploy the entire project on the same server.
- Deploy the administration panel on a server (AWS S3, Azure, etc) different from the API server.

Build configurations differ for each case.

Before deployment, the admin panel needs to be built, by running the following command from the project's root directory:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn build
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm run build
```

</TabItem>

<TabItem value="strapi-cli" label="Strapi CLI">

```sh
strapi build
```

</TabItem>

</Tabs>

This will replace the folder's content located at `./build`. Visit [http://localhost:1337/admin](http://localhost:1337/admin) to make sure customizations have been taken into account.

### Same server

Deploying the admin panel and the API on the same server is the default behavior. The build configuration will be automatically set. The server will start on the defined port and the administration panel will be accessible through `http://yourdomain.com:1337/admin`.

:::tip
You might want to [change the path to access the administration panel](#access-url).
:::

### Different servers

To deploy the front end and the back end on different servers, use the following configuration:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: "http://yourbackend.com",
});
```

```js title="./config/admin.js"
module.exports = ({ env }) => ({
  url: "/", // Note: The administration will be accessible from the root of the domain (ex: http://yourfrontend.com/)
  serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: "http://yourbackend.com",
});
```

```js title="./config/admin.ts"
export default ({ env }) => ({
  url: "/", // Note: The administration will be accessible from the root of the domain (ex: http://yourfrontend.com/)
  serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
});
```

</TabItem>
</Tabs>

After running `yarn build` with this configuration, the `build` folder will be created/overwritten. Use this folder to serve it from another server with the domain of your choice (e.g. `http://yourfrontend.com`).

The administration URL will then be `http://yourfrontend.com` and every request from the panel will hit the backend at `http://yourbackend.com`.

:::note
If you add a path to the `url` option, it won't prefix your app. To do so, use a proxy server like Nginx (see [optional software guides](/dev-docs/deployment#optional-software-guides)).
:::
