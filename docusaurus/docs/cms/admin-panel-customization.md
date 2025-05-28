---
title: Admin panel customization
description: The administration panel of Strapi can be customized according to your needs, so you can make it reflect your identity.
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization
---

import HotReloading from '/docs/snippets/hot-reloading-admin-panel.md'

# Admin panel customization

The **front-end part of Strapi** <Annotation>For a clarification on the distinction between:<ul><li>the Strapi admin panel (front end of Strapi),</li><li>the Strapi server (back end of Strapi),</li><li>and the end-user-facing front end of a Strapi-powered application,</li></ul> refer to the [development introduction](/cms/customization).</Annotation> is called the admin panel. The admin panel presents a graphical user interface to help you structure and manage the content that will be accessible through the Content API. To get an overview of the admin panel, please refer to the [Getting Started > Admin panel](/cms/features/admin-panel) page.

From a developer point of view, Strapi's admin panel is a React-based single-page application that encapsulates all the features and installed plugins of a Strapi application.

Admin panel customization is done by tweaking the code of the `src/admin/app` fileor other files included in the `src/admin` folder (see [project structure](/cms/project-structure)). By doing so, you can:

- Customize some parts of the admin panel to better reflect your brand identity (logos, favicon) or your language,
- Replace some other parts of the admin panel, such as the Rich text editor and the bundler,
- Extend the theme or the admin panel to add new features or customize the existing user interface.

## General considerations

:::prerequisites
Before updating code to customize the admin panel:

- Rename the default `app.example.tsx|js` file into `app.ts|js`.
- Create a new `extensions` folder in `/src/admin/`.
- If you want to see your changes applied live while developing, ensure the admin panel server is running (it's usually done with the `yarn develop` or `npm run develop` command if you have not changed the default [host, port, and path](/cms/configurations/admin-panel#admin-panel-server) of the admin panel).
:::

Most basic admin panel customizations will be done in the `/src/admin/app` file, which includes a `config` object.

Any file used by the `config` object (e.g., a custom logo) should be placed in a `/src/admin/extensions/` folder and imported inside `/src/admin/app.js`.

<HotReloading />

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

</Tabs>

This will replace the folder's content located at `./build`. Visit <ExternalLink to="http://localhost:1337/admin" text="http://localhost:1337/admin"/> to make sure customizations have been taken into account.

:::note Note: Admin panel extensions vs. plugins extensions
By default, Strapi projects already contain another `extensions` folder in `/src` but it is for plugins extensions only (see [Plugins extension](/cms/plugins-development/plugins-extension)).
:::

## Available customizations

The `config` object of `/src/admin/app` accepts the following parameters:

| Parameter                      | Type             | Description                                                                                                           |
| ------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `auth`                         | Object           | Accepts a `logo` key to replace the default Strapi logo on login screen                                     |
| `head`                         | Object           | Accepts a `favicon` key to replace the default Strapi favicon                                             |
| `locales`                      | Array of Strings | Defines availables locales |
| `translations`                 | Object           | Extends the translations                                                                   |
| `menu`                         | Object           | Accepts the `logo` key to change the logo in the main navigation                                            |
| `theme.light` and `theme.dark` | Object           | Overwrite theme properties for light and dark modes                                               |
| `tutorials`                    | Boolean          | Toggles displaying the video tutorials
| `notifications`                | Object           | Accepts the `releases` key (Boolean) to toggle displaying notifications about new releases |

Click on any of the following cards to get more details about a specific topic:

<CustomDocCardsWrapper>
<CustomDocCard icon="image" title="Logos" description="Update the logos displayed in the admin panel to match your own brand." link="/cms/admin-panel-customization/logos" />
<CustomDocCard icon="image" title="Favicon" description="Update the favicon to match your own brand." link="/cms/admin-panel-customization/favicon" />
<CustomDocCard icon="globe" title="Locales & translations" description="Define locales and extend translations available in the admin panel." link="/cms/admin-panel-customization/locales-translations" />
<CustomDocCard icon="swap" title="Rich text editor" description="Learn more about the possible strategies to replace the built-in Rich text editor." link="/cms/admin-panel-customization/wysiwyg-editor" />
<CustomDocCard icon="package" title="Bundlers" description="Choose between the Vite and webpack bundlers and configure them." link="/cms/admin-panel-customization/bundlers" />
<CustomDocCard icon="palette" title="Theme extension" description="Learn the basics of extending the built-in theme of the admin panel." link="/cms/admin-panel-customization/theme-extension" />
<CustomDocCard icon="paint-bucket" title="Admin panel extension" description="Learn the basics of extending the admin panel." link="/cms/admin-panel-customization/extension" />
</CustomDocCardsWrapper>

## Basic example

The following is an example of a basic customization of the admin panel:

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

</TabItem>
</Tabs>

:::strapi Detailed examples in the codebase

* You can see the full translation keys, for instance to change the welcome message, [on GitHub](https://github.com/strapi/strapi/blob/develop/packages/core/admin/admin/src/translations).
* Light and dark colors are also found [on GitHub](https://github.com/strapi/design-system/tree/main/packages/design-system/src/themes).
:::