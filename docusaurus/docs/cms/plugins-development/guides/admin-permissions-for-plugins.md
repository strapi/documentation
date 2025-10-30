---
title: How to create admin permissions from plugins
description: Learn how to create and configure admin permissions for your plugin
sidebar_label: Create admin permissions for plugins
displayed_sidebar: cmsSidebar
tags:
- admin panel
- RBAC
- Role Based Access Control
- guides
- plugins
- plugins development guides
---

# How to create admin permissions from plugins

When [developing a Strapi plugin](/cms/plugins-development/developing-plugins), you might want to create admin permissions for your plugin. By doing that you can hook in to the [RBAC system](/cms/features/rbac) of Strapi to selectively grant permissions to certain pieces of your plugin.

To create admin permissions for your Strapi plugin, you'll need to register them on the server side before implementing them on the admin side.

## Register the permissions server side

Each individual permission has to registered in the bootstrap function of your plugin, as follows:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/src/plugins/my-plugin/server/src/bootstrap.js"

'use strict';

const bootstrap = ({ strapi }) => {
  // Register permission actions.
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access the overview page',
      uid: 'overview',
      pluginName: 'my-plugin',
    },
    {
      section: 'plugins',
      displayName: 'Access the content manager sidebar',
      uid: 'sidebar',
      pluginName: 'my-plugin',
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
};

module.exports = bootstrap;
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/src/plugins/my-plugin/server/src/bootstrap.ts"

import type { Core } from '@strapi/strapi';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  // Register permission actions.
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access the overview page',
      uid: 'overview.access',
      pluginName: 'my-plugin',
    },
    {
      section: 'plugins',
      displayName: 'Access the content manager sidebar',
      uid: 'sidebar.access',
      pluginName: 'my-plugin',
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
};

export default bootstrap;
```

</TabItem>

</Tabs>


## Admin implementation

Before we can implement our permissions on the admin side we have to define them in a reusable configuration file. This file can be stored anywhere in your plugin admin code. You can do that as follows:

```js title="/src/plugins/my-plugin/admin/src/permissions.js|ts"
const pluginPermissions = {
  'accessOverview': [{ action: 'plugin::my-plugin.overview.access', subject: null }],
  'accessSidebar': [{ action: 'plugin::my-plugin.sidebar.access', subject: null }],
};

export default pluginPermissions;
```

### Page permissions

Once you've created the configuration file you are ready to implement your permissions! If you've bootstrapped your plugin using the [plugin SDK init command](/cms/plugins-development/plugin-sdk#npx-strapisdk-plugin-init), you will have an example `HomePage.tsx` file. To implement page permissions you can do the following:

```js title="/src/plugins/my-plugin/admin/src/pages/HomePage.jsx|tsx" {2,5,12,16}
import { Main } from '@strapi/design-system';
import { Page } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';

import pluginPermissions from '../permissions';
import { getTranslation } from '../utils/getTranslation';

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <Page.Protect permissions={pluginPermissions.accessOverview}>
      <Main>
        <h1>Welcome to {formatMessage({ id: getTranslation('plugin.name') })}</h1>
      </Main>
    </Page.Protect>
  );
};

export { HomePage };
```

You can see how we use our permissions configuration file together with the `<Page.Protect>` component to require specific permissions in order to view this page.


### Menu link permissions

The above example makes sure that the permissions of a user that visits your page directly will be validated. However, you might want to remove the menu link to that page as well. To do that, you'll have to make a change to the `addMenuLink` implementation. You can do as follows:

```js title="/src/plugins/my-plugin/admin/src/index.js|ts" {21-23,5}
import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import pluginPermissions from './permissions';

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PluginIcon}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
      permissions: [
        pluginPermissions.accessOverview[0],
      ],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },
};

```

### Custom permissions with the useRBAC hook

If you have to have even more control over the permission of the admin user you can utilize the `useRBAC` hook. With that you can use the permissions validation just like you want. You can do that as follows:

```js title="/src/plugins/my-plugin/admin/src/components/Sidebar.jsx|tsx" 
import React from 'react';
import { useRBAC } from '@strapi/strapi/admin';

import pluginPermissions from '../../permissions';

const Sidebar = () => {
  const {
    allowedActions: { canAccessSidebar },
  } = useRBAC(pluginPermissions);

  if (!canAccessSidebar) {
    return null;
  }

  return (
    <div>Sidebar component</div>
  );
};

export default Sidebar;
```
