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
| `auth`                         | Object           | Accepts a `logo` key to replace the default Strapi [logo](/cms/admin-panel-customization/logos) on login screen                                     |
| `head`                         | Object           | Accepts a `favicon` key to replace the default Strapi [favicon](/cms/admin-panel-customization/favicon)                                             |
| `locales`                      | Array of Strings | Defines availables locales (see [updating locales](/cms/admin-panel-customization/locales-translations))                                                         |
| `translations`                 | Object           | [Extends the translations](/cms/admin-panel-customization/locales-translations#extending-translations)                                                                   |
| `menu`                         | Object           | Accepts the `logo` key to change the [logo](/cms/admin-panel-customization/logos) in the main navigation                                            |
| `theme.light` and `theme.dark` | Object           | [Overwrite theme properties](/cms/admin-panel-customization/theme-extension) for Light and Dark modes                                               |
| `tutorials`                    | Boolean          | Toggles [displaying the video tutorials](/cms/configurations/admin-panel)                                                            |
| `notifications`                | Object           | Accepts the `releases` key (Boolean) to toggle [displaying notifications about new releases](/cms/configurations/admin-panel) |

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
