---
title: Admin panel customization options
description: Various options help you configure Strapi's administration panel behavior and look, so you can make it reflect your identity.
displayed_sidebar: cmsSidebar
sidebar_label: Customization options
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization

---

import HotReloading from '/docs/snippets/hot-reloading-admin-panel.md'

Many aspects of Strapi's [admin panel](/cms/admin-panel-customization) can be customized through the code using the admin panel's `/src/admin/app.[tsx|js]` entry point file (see [project structure](/cms/project-structure)).

:::prerequisites
Before trying to update code to configure any admin panel customization option:

- Rename the default `app.example.[tsx|js]` file into `app.[ts|js]`.
- Create a new `extensions` folder in `/src/admin/`.
- If you want to see your changes applied live while developing, ensure the admin panel server is running (it's usually done with the `yarn develop` or `npm run develop` command if you have not changed the default [host, port, and path](/cms/admin-panel-customization/host-port-path) of the admin panel).
:::

:::note Note: Admin panel extensions vs. plugins extensions
By default, Strapi projects already contain another `extensions` folder in `/src` but it is for plugins extensions only (see [Plugins extension](/cms/plugins-development/plugins-extension)).
:::

The `config` object found in `/src/admin/app.[ts|js]` stores the admin panel configuration.

Any file used by the `config` object (e.g., a custom logo) should be placed in a `/src/admin/extensions/` folder and imported inside `/src/admin/app.js`.

<HotReloading />

## Available configuration options

The `config` object of `/src/admin/app.[tsx|js]` accepts the following parameters:

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
<summary>Example of a custom configuration for the admin panel:</summary>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="/src/admin/app.js"
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

```jsx title="/src/admin/app.ts"
// Note: you may see some ts errors, don't worry about them
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
	    dark:{
	      colors: {
			  alternative100: '#f6ecfc',
			  alternative200: '#e0c1f4',
			  alternative500: '#ac73e6',
			  alternative600: '#9736e8',
			  alternative700: '#8312d1',
			  buttonNeutral0: '#ffffff',
			  buttonPrimary500: '#7b79ff',
			  // you can see other colors in the link below
			  },
		},
		light:{
			// you can see the light color here just like dark colors https://github.com/strapi/design-system/blob/main/packages/design-system/src/themes/lightTheme/light-colors.ts
		},
  },
    },
    // Extend the translations
    // you can see the traslations keys here https://github.com/strapi/strapi/blob/develop/packages/core/admin/admin/src/translations
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

:::note
You can see the full translation keys, for instance to change the welcome message, [on GitHub](https://github.com/strapi/strapi/blob/develop/packages/core/admin/admin/src/translations).
Light and dark colors are also found [on GitHub](https://github.com/strapi/design-system/tree/main/packages/design-system/src/themes).
:::

</TabItem>
</Tabs>

</details>

## Locales

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
- The full list of available locales is accessible on <ExternalLink to="https://github.com/strapi/strapi/blob/v4.0.0/packages/plugins/i18n/server/constants/iso-locales.json" text="Strapi's Github repo"/>.

:::

### Extending translations

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

## Logos

The Strapi admin panel displays a logo in 2 different locations, represented by 2 different keys in the admin panel configuration:

| Location in the UI     | Configuration key to update |
| ---------------------- | --------------------------- |
| On the login page      | `config.auth.logo`          |
| In the main navigation | `config.menu.logo`          |

:::note
Both logos can also be customized directly via the admin panel (see [Customizing the logo](/cms/features/admin-panel)).
Logos uploaded via the admin panel supersede any logo set through the configuration files.
:::

### Logos location in the admin panel

<!--TODO: update screenshot #2 -->

The logo handled by `config.auth.logo` logo is only shown on the login screen:

![Location of the auth logo](/img/assets/development/config-auth-logo.png)

The logo handled by `config.menu.logo` logo is located in the main navigation at the top left corner of the admin panel:

![Location of Menu logo](/img/assets/development/config-menu-logo.png)

### Updating logos

To update the logos, put image files in the `/src/admin/extensions` folder, import these files in `src/admin/app.[tsx|js]` and update the corresponding keys as in the following example:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="/src/admin/app.js"
import AuthLogo from "./extensions/my-auth-logo.png";
import MenuLogo from "./extensions/my-menu-logo.png";

export default {
  config: {
    // … other configuration properties 
    auth: { // Replace the Strapi logo in auth (login) views
      logo: AuthLogo,
    },
    menu: { // Replace the Strapi logo in the main navigation
      logo: MenuLogo,
    },
    // … other configuration properties 

  bootstrap() {},
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```jsx title="/src/admin/app.ts"
import AuthLogo from "./extensions/my-auth-logo.png";
import MenuLogo from "./extensions/my-menu-logo.png";

export default {
  config: {
    // … other configuration properties 
    auth: { // Replace the Strapi logo in auth (login) views
      logo: AuthLogo,
    },
    menu: { // Replace the Strapi logo in the main navigation
      logo: MenuLogo,
    },
    // … other configuration properties 

  bootstrap() {},
};
```

</TabItem>
</Tabs>

:::note
There is no size limit for image files set through the configuration files.
:::

## Favicon

To replace the favicon:

1. Create a `/src/admin/extensions/` folder if the folder does not already exist.
2. Upload your favicon into `/src/admin/extensions/`.
3. Replace the existing **favicon.png|ico** file at the Strapi application root with a custom `favicon.png|ico` file.
4. Update `/src/admin/app.[tsx|js]` with the following:

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

## Theme extension

Strapi applications can be displayed either in Light or Dark mode (see [administrator profile setup in the User Guide](/cms/getting-started/setting-up-admin-panel#setting-up-your-administrator-profile)), and both can be extended through custom theme settings.

To extend the theme, use either:

- the `config.theme.light` key for the Light mode
- the `config.theme.dark` key for the Dark mode

:::strapi Strapi Design System
The default <ExternalLink to="https://github.com/strapi/design-system/tree/main/packages/design-system/src/themes" text="Strapi theme"/> defines various theme-related keys (shadows, colors…) that can be updated through the `config.theme.light` and `config.theme.dark` keys in `./admin/src/app.js`. The <ExternalLink to="https://design-system.strapi.io/" text="Strapi Design System"/> is fully customizable and has a dedicated <ExternalLink to="https://design-system-git-main-strapijs.vercel.app" text="StoryBook"/> documentation.
:::
