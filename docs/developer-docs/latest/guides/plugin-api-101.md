---
title: Plugin API 101 - Strapi Developer Docs
description: Learn in this guide how to restrict content editing to content authors only.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/plugin-api-101.html
---

# Plugin API 101

This guide shows you how to create a plugin on Strapi.

## Introduction

The documentation already covers a [plugin development](/developer-docs/latest/development/plugins-development.html) section. However, this might be a little bit complicated to follow especially if you discovered Strapi recently. This guide aims to make it easier for you to learn this process with a concrete example of a to-do list plugin.

The plugin API you are going to use was born from a [request for change](https://plugin-api-rfc.vercel.app/) (RFC) that we invite you to read if you are curious to know more about it.

You will learn to create a simple todo plugin in which you'll create a plugin content-type for persiting data, customize the back-end, inject a React component in the admin, use the [Strapi Design System](https://design-system.strapi.io/) and more.

## Generate a plugin

We assume that you have a Strapi project and that you are located inside it from your terminal. From there, you can simply generate a plugin using the [generate](/developer-docs/latest/developer-resources/cli/CLI.html#strapi-generate) CLI command. This command, allows you to generate APIs, controllers, content-types, **plugins**, policies, middlewares and services.

:::: tabs card

::: tab yarn

```bash
yarn strapi generate
```

:::

::: tab npx

```bash
npm run strapi generate
```

:::

::::

```
$ strapi generate
? Strapi Generators
  api - Generate a basic API
  controller - Generate a controller for an API
  content-type - Generate a content type for an API
❯ plugin - Generate a basic plugin
  policy - Generate a policy for an API
  middleware - Generate a middleware for an API
  service - Generate a service for an API
```

We are going to call this plugin: `todo`

```
$ strapi generate
? Strapi Generators plugin - Generate a basic plugin
? Plugin name todo
✔  +! 25 files added
...
You can now enable your plugin by adding the following in ./config/plugins.js.
─────────────────────────────────
module.exports = {
  // ...
  'todo': {
    enabled: true,
    resolve: './src/plugins/todo'
  },
  // ...
}
─────────────────────────────────
```

Strapi created a new `./src/plugins/todo` folder containing the default files of your plugin.

The result of the generate command invite you to update your `./config/plugins.js` file if it already exists or to create it with the following:

```js
module.exports = {
  todo: {
    enabled: true,
    resolve: './src/plugins/todo',
  },
};
```

Now the last step of this section is to [build the admin](/developer-docs/latest/developer-resources/cli/CLI.html#strapi-build) of your Strapi project.

::: tip
**Updating the admin requires to build your Strapi project**. By default, Strapi will inject some plugin components (menu link, homepage) in the admin which is why, a build is required.

**However**, you can directly start you server with `'yarn'|'npm run' develop --watch-admin` options. It will starts your application with the autoReload enabled and the front-end development server. It allows you to customize the administration panel. But once you are done with your customizations, **you'll need to build your application**.

So instead of building your application again and again during your plugin development, I advise you to customize your plugin while having your Strapi project running with the autoReload enabled with: `--watch-admin`
:::

:::: tabs card

::: tab yarn

```bash
yarn build
```

:::

::: tab npx

```bash
npm run build
```

:::

::::

If you start your server with the `develop` command, you should see your todo plugin in the main navigation linking to an empty homepage.

## Architecture file

Here is what the `generate` command has created for you.

```
├── README.md                 // You know...
├── admin                     // Front-end of your plugin.
│   └── src
│       ├── components        // Contains your front-end components.
│       │   ├── Initializer
│       │   │   └── index.js  // Plugin initializer.
│       │   └── PluginIcon
│       │       └── index.js  // Contains the icon of your plugin in the main navigation.
│       ├── index.js          // Main configurations of your plugin.
│       ├── pages             // Contains the pages of your plugin.
│       │   ├── App
│       │   │   └── index.js  // Skeleton around the actual pages.
│       │   └── HomePage
│       │       └── index.js  // Homepage of your plugin.
│       ├── pluginId.js       // pluginId variable computed from package.json name.
│       ├── translations      // Translations files to make your plugin i18n friendly
│       │   ├── en.json
│       │   └── fr.json
│       └── utils
│           ├── getTrad.js        // getTrad function to return corresponding traduction
|           └── axiosInstance.js  // axios with a custom config
├── package.json
├── server                    // Back-end of your plugin
│   ├── bootstrap.js          // Function that is called right after the plugin has registered.
│   ├── config
│   │   └── index.js          // Contains the default server configuration.
│   ├── controllers
│   │   ├── index.js          // File that loads all your controllers
│   │   └── my-controller.js  // Default controller, you can rename/delete it
│   ├── destroy.js            // Function that is called to clean up the plugin after Strapi instance is destroyed
│   ├── index.js
│   ├── register.js           // Function that is called to load the plugin, before bootstrap.
│   ├── routes
│   │   └── index.js          // Plugin routes, you can update/delete it
│   └── services
│       ├── index.js          // File that loads all your services
│       └── my-service.js     // Default services, you can rename/delete it
├── strapi-admin.js           // Entrypoint for the admin (front-end)
└── strapi-server.js          // Entrypoint for the server (back-end)
```

A plugin is divided in two parts: **admin** and **server**. It is interesting to know that a plugin can have multiple purposes:

#### Server plugin

You can create a plugin that will just use the server part to have a unique API. We can think of a plugin that will have its own visible or invisible content-types, controller actions and routes that are usefull for a specific use case. In this scenario, you don't need your plugin to have a specific interface in the admin.

#### Admin plugin

You can create a plugin just to inject some components in the admin. However, just know that you can basically do this by creating an `./src/admin/app.js` file, invoking the bootstrap lifecycle to inject your components:

:::: tabs card

::: tab app.js

```js
import TweetButton from './extensions/components/TweetButton'; // Component displaying a tweet button in the Content Manager

export default {
  // ...
  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'TweetButton',
      Component: TweetButton,
    });
  },
  // ...
};
```

:::

::: tab TweetButton/index.js

```js
import React from 'react';
import { Button } from '@strapi/design-system/Button';
import Twitter from '@strapi/icons/Twitter';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';

const TweetButton = () => {
  const { formatMessage } = useIntl();
  const { modifiedData, layout } = useCMEditViewDataManager();
  const allowedTypes = ['restaurant', 'article'];

  if (!allowedTypes.includes(layout.apiID)) {
    return <></>;
  }

  const base = layout.apiID == 'restaurant' ? 'restaurants' : 'blog';

  const handleTweet = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${`${encodeURIComponent(
      modifiedData.seo.metaTitle
    )} (powered by Strapi)`}&url=${process.env.STRAPI_ADMIN_CLIENT_URL}/${base}/${
      modifiedData.slug
    }`;

    window.open(tweetUrl, '_blank').focus();
  };

  const content = {
    id: 'components.TweetButton.button',
    defaultMessage: 'Share on Twitter',
  };

  return (
    <Button variant="secondary" startIcon={<Twitter />} onClick={handleTweet}>
      {formatMessage(content)}
    </Button>
  );
};

export default TweetButton;
```

:::

::::

#### Complete plugin

This is what we are going to do. A plugin that involves some server customization but also a nice interface in the admin. You can find a lot of plugins already on the [Marketplace.](https://market.strapi.io/) The [SEO plugin made by us](https://github.com/strapi/strapi-plugin-seo) is a good example of such plugin.

## Create a collection-type for persisting data

The idea of the todo plugin is to have a todo list for every entry that you'll create in your project. This can be very useful for content-manager that wants to keep a clear vision of what needs to be done for a unique entry.

A todo is a simple list of tasks that need to be saved in your application. Also, each task will be related to an existing entry but will see this later.

You can create a new collection-type using the `generate` CLI command or by directly creating/updating the necessary files in your code editor. Here, we'll do both:

:::: tabs card

::: tab yarn

```bash
yarn strapi generate
```

:::

::: tab npx

```bash
npm run strapi generate
```

:::

::::

```
$ strapi generate
? Strapi Generators
  api - Generate a basic API
  controller - Generate a controller for an API
❯ content-type - Generate a content type for an API
  plugin - Generate a basic plugin
  policy - Generate a policy for an API
  middleware - Generate a middleware for an API
  service - Generate a service for an API
```

```
$ strapi generate
? Strapi Generators content-type - Generate a content type for an API
? Content type display name: Task
? Content type singular name: task
? Content type plural name: tasks
? Please choose the model type: Collection Type
? Use draft and publish? No
? Do you want to add attributes? Yes
? Name of attribute: name
? What type of attribute: string
? Do you want to add another attribute? Yes
? Name of attribute: isDone
? What type of attribute: boolean
? Do you want to add another attribute? No
? Where do you want to add this model? Add model to an existing plugin
? Which plugin is this for? todo
? Bootstrap API related files? No
```

#### Content-type schema

The most important thing here is the `./src/plugins/todo/server/content-types/task/schema.json`. This is the schema of your plugin collection-type. We are going to add some customization by opening it in a code editor:

:::: tabs card

::: tab Before

```json
{
  "kind": "collectionType",
  "collectionName": "tasks",
  "info": {
    "singularName": "task",
    "pluralName": "tasks",
    "displayName": "Task"
  },
  "options": {
    "draftAndPublish": false,
    "comment": ""
  },
  "attributes": {
    "name": {
      "type": "string"
    },
    "isDone": {
      "type": "boolean"
    }
  }
}
```

:::

::: tab After

```json
{
  "kind": "collectionType",
  "collectionName": "tasks",
  "info": {
    "singularName": "task",
    "pluralName": "tasks",
    "displayName": "Task"
  },
  "options": {
    "draftAndPublish": false,
    "comment": ""
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "maxLength": 40
    },
    "isDone": {
      "type": "boolean",
      "default": false
    }
  }
}
```

:::

::::

As you can see, we are making the `name` field required and it can only contains less than 40 characters. Also, the `isDone` field is now false by default.

However, something is missing for Strapi to use this new collection-type. You need to make some manual updates.

:::caution
These manual updates are necessary because of a bug in the generate CLI command. This will not be necessary inn the futur. The bug is that the schema created by Strapi are not automatically exported as it should be.
:::

- Create a `./src/plugins/todo/server/content-types/task/index.js` file that will export the schema generated by Strapi:

```js
'use strict';

const schema = require('./schema');

module.exports = {
  schema,
};
```

- Update the `./src/plugins/todo/server/content-types/index.js` file by exporting the content-type you just created:

```js
'use strict';

const task = require('./task');

module.exports = {
  task,
};
```

You should now be able to see your new collection-type in the Content-Type Builder and Content Manager of your project.

::: tip
Don't forget, build your admin to see your changes or follow this guide while having your server running with the `--watch-admin` option.
:::

You can verify the integrity of your collection-type by running your server and eval commands in your application in real time using the `strapi console` command.

:::: tabs card

::: tab yarn

```bash
yarn strapi console
```

:::

::: tab npx

```bash
npm run strapi console
```

:::

::::

- Then type the following:

```
strapi.contentType('plugin::todo.task')
```

You should see this:

```json
{
  "kind": "collectionType",
  "collectionName": "tasks",
  "info": { "singularName": "task", "pluralName": "tasks", "displayName": "Task" },
  "options": { "draftAndPublish": false, "comment": "" },
  "attributes": {
    "name": { "type": "string", "required": true, "maxLength": 40 },
    "isDone": { "type": "boolean", "default": false },
    "createdAt": { "type": "datetime" },
    "updatedAt": { "type": "datetime" },
    "createdBy": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "admin::user",
      "configurable": false,
      "writable": false,
      "visible": false,
      "useJoinTable": false,
      "private": true
    },
    "updatedBy": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "admin::user",
      "configurable": false,
      "writable": false,
      "visible": false,
      "useJoinTable": false,
      "private": true
    }
  },
  "__schema__": {
    "collectionName": "tasks",
    "info": { "singularName": "task", "pluralName": "tasks", "displayName": "Task" },
    "options": { "draftAndPublish": false, "comment": "" },
    "attributes": { "name": [Object], "isDone": [Object] },
    "kind": "collectionType"
  },
  "modelType": "contentType",
  "modelName": "task",
  "connection": "default",
  "uid": "plugin::todo.task",
  "plugin": "todo",
  "globalId": "TodoTask",
  "actions": undefined,
  "lifecycles": undefined
}
```

#### Content-type Visibility

However, you might not want your collection-type to be visible in the Content-Type Builder and/or Content Manager. In fact, for this use case, having all the tasks displayed in the Content manager doesn't make sense since what it interesting here, is to see every tasks just for another entry (article for example) inside the view of this particular entry.

- You can give a `pluginOptions` object to your schema.json with the following config in order to make your task collection-type invisible in your admin:

:::: tabs card

::: tab Before

```json
{
  "kind": "collectionType",
  "collectionName": "tasks",
  "info": {
    "singularName": "task",
    "pluralName": "tasks",
    "displayName": "Task"
  },
  "options": {
    "draftAndPublish": false,
    "comment": ""
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "maxLength": 40
    },
    "isDone": {
      "type": "boolean",
      "default": false
    }
  }
}
```

:::

::: tab After

```json
{
  "kind": "collectionType",
  "collectionName": "tasks",
  "info": {
    "singularName": "task",
    "pluralName": "tasks",
    "displayName": "Task"
  },
  "options": {
    "draftAndPublish": false,
    "comment": ""
  },
  "pluginOptions": {
    "content-manager": {
      "visible": false
    },
    "content-type-builder": {
      "visible": false
    }
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "maxLength": 40
    },
    "isDone": {
      "type": "boolean",
      "default": false
    }
  }
}
```

:::

::::

**Note**: For the purpose of this guide, leave the content-type visible by setting both fields to `true`, we'll set them back to false at the end.

## Server customization

The server part of a plugin is nothing more than an API you can consume from the outside or in the admin of your plugin. It is made of routes, controllers and services but also middlewares and policies. Knowing how to master this little API you are ready to create, is definitely important in the development of a plugin.

#### Internal and External API

When creating an API, we first start by creating the route. We would like to be able to fetch the number of tasks.

By default, Strapi generate the following route:

```js
module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'myController.index',
    config: {
      policies: [],
    },
  },
];
```

This means that if you execute a GET request to the url `http://localhost:1337/<name-of-your-plugin>`, the index action of the myController controller will be executed. In this case the route is using [authentication](/developer-docs/latest/guides/auth-request.html#introduction). We can make it public and see the result:

```js
module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'myController.index',
    config: {
      policies: [],
      auth: false,
    },
  },
];
```

- Open the `http://localhost:1337/todo` url in your browser. You should see a `Welcome to Strapi 🚀` message.

Defaults routes, controllers and services can be modified and this is what we are going to do. The goal is to create a route for getting the total number of tasks.

- Update the `./src/plugins/todo/server/routes/index.js` file with the following:

```js
module.exports = [
  {
    method: 'GET',
    path: '/count',
    handler: 'task.count',
    config: {
      policies: [],
      auth: false,
    },
  },
];
```

This routes indicates that when requesting the url: `http://localhost:1337/todo/count`, the task will execute the count action to return something.

- Rename the `./src/plugins/todo/server/controller/my-controller.js` file by `task.js`.
- Modify the import in the `./src/plugins/todo/server/controller/index.js` with the following:

```js
'use strict';

const task = require('./task');

module.exports = {
  task,
};
```

- Finally, replace the content of the `task.js` file with the following:

```js
'use strict';

module.exports = {
  count(ctx) {
    ctx.body = 'todo';
  },
};
```

- Wait for your server to restart and open the `http://localhost:1337/todo/count` url in your browser. You should see a `todo` message.

What is left to do is to actually get the number of tasks instead of just a message.

- Create via the Content Manager some tasks, at least one so your function returns something.

We are going to use a service for getting the number of tasks.

- Rename the `./src/plugins/todo/server/services/my-service.js` by `task.js`
- Modify the import in the `./src/plugins/todo/server/services/task.js` with the following:

```js
'use strict';

const task = require('./task');

module.exports = {
  task,
};
```

- Update the content of the `task.js` file with the following:

```js
'use strict';

module.exports = ({ strapi }) => ({
  async count() {
    return await strapi.query('plugin::todo.task').count();
  },
});
```

- Update the `task.js` file with the following:

```js
'use strict';

module.exports = {
  async count(ctx) {
    ctx.body = await strapi
      .plugin('todo')
      .service('task')
      .count();
  },
};
```

If we summarize, the route tells your application that when receiving the `http://localhost:1337/todo/count` GET request, the task will execute the count action that will use the task count function to return the actual count of tasks.

- Give it a try by browsing the `http://localhost:1337/todo/count` url in your browser.

::: tip
Do you remember when you created your tasks content-type using the CLI? We answered no at the last question which was `Bootstrap API related files?`. If you said yes, Strapi would have generated the right controller, service and route with correct and simple names so you don't have to modify it by yourself.

We think it is nice for you to see that you have the freedom to modify your files first but for your next content-type, you might want to answer yes to this question.

Just know that the default files will be different. Let's see the controller file for example:

```js
'use strict';

/**
 *   controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('plugin::todo.task');
```

If you want to add an action to this controller like we did previously, you must do the following:

```js
'use strict';

/**
 *   controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('plugin::todo.task', {
  async count(ctx) {
    ctx.body = await strapi
      .plugin('todo')
      .service('task')
      .count();
  },
});
```

It will then be the same for services:

```js
'use strict';

/**
 *  service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('plugin::todo.task', {
  async count() {
    return await strapi.query('plugin::todo.task').count();
  },
});
```

Concerning the default router file, it is about the core router configuration. You can leave it like this and keep creating your routes in the `routes/index.js` file:

```js
module.exports = [
  {
    method: 'GET',
    path: '/count',
    handler: 'task.count',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/findRandom',
    handler: 'task.findRandomTask',
    config: {
      policies: [],
      auth: false,
    },
  },
];
```

:::

#### Routes structuration

These endpoints will be accessible directly with this url `http://localhost:1337/plugin-name/...` without having permissions to set like you must do with content-api routes type. These ones, are admin routes type.

We can better structurate our routes by doing the following and we advise you to do the same:

- First thing to do, is to replace the content of your `routes/index.js` file with this:

```js
module.exports = {};
```

Then, we advise to create a route file for every content-type you have. When saying Yes to the `Bootstrap API related files?` question in the CLI, this is what Strapi does. It create a `routes/task.js` file with the following:

```js
'use strict';

/**
 *  router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('plugin::todo.task');
```

- You can replace all of this content with custom routes like this:

```js
'use strict';

/**
 *  router.
 */

module.exports = {
  type: 'admin', // other type available: content-api.
  routes: [
    {
      method: 'GET',
      path: '/count',
      handler: 'task.count',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
```

- Then you just need to export this router in the `routes/index.js`:

```js
const task = require('./task');

module.exports = {
  task,
};
```

If you have another content-type, then you just need to create another custom router: `routes/report.js` and to export it:

```js
'use strict';

/**
 *  router.
 */

module.exports = {
  type: 'content-api', // other type available: admin.
  routes: [
    {
      method: 'GET',
      path: '/',
      handler: 'report.findMany',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
```

```js
const task = require('./task');
const report = require('./report');

module.exports = {
  task,
  report,
};
```

:::caution
Please be aware of the different type of routes:

- content-api: It is external: The routes will be available from this endpoint: `/api/plugin-name/...`. It needs to be activated in the Users & Permissions plugin setting in the admin.
- admin: It is internal: The routes will be available from this endpoint: `/plugin-name/...` and will **only be accessible from the fron-ent part of Strapi**: the admin. No need to to define permissions.
:::

Lear more about [routes in the documentation](/developer-docs/latest/development/backend-customization/routes.html#implementation)


#### Strapi object

In the previous section, we used the [query engine](/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html) to interact with the database layer.

```js
'use strict';

/**
 *  service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('plugin::todo.task', {
  async count() {
    return await strapi.query('plugin::todo.task').count(); // This
  },
});
```

**It is important to know what the `strapi` object allows you to do, and you can see this by using the `strapi console commmand`:**

:::: tabs card

::: tab yarn

```bash
yarn strapi console
```

:::

::: tab npx

```bash
npm run strapi console
```

:::

::::

This will start your Strapi project and eval commands in your application in real time. From there, you can type `strapi`, press enter and see everything you can have access to.

For example, you can:

- List content-types: `strapi.contentTypes`
- List components: `strapi.components`
- List plugins: `strapi.plugins`
- Get plugin data (services, controllers, config, content-types): `strapi.plugin("plugin-name")`
- Get/Set/Check config: `strapi.config`
- Get/Set/Delete store: `strapi.store`
- etc...

With `strapi.store`, we get:

```
[Function: store] {
  get: [AsyncFunction: get],
  set: [AsyncFunction: set],
  delete: [AsyncFunction: delete]
}
```

It means that `strapi.store` has 3 async functions available for me to use in order to play with the application store. [A global Strapi API reference](https://docs-v3.strapi.io/developer-docs/latest/developer-resources/global-strapi/api-reference.html) existed for Strapi v3. It is outdated but some reference are still working on v4.

[Learn more about server customization in the documentation](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#backend-customization)

#### Relations

Most of the time, when developing a plugin, you'll need to create a content-type. It can be independent by making the plugin works under the hood. In other scenarios, associating this plugin content-type to a regular (api) content-type **(the ones you create in the admin)**, is possible and pretty easy to do.

For this guide, we want to have a todo list for every api content-types our application contains. This means that we'll create a relation between the task content-type to every other api content-types.

- First, we need to update the schema file of the task content-type to include a `...` relation.

```json

```

In fact, for a relation to work, it must be indicated in both side (1.task <> 2.article,product,page etc...). We did half of the job here. Now, we are going to use the [register phase](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#register) of the plugin to automatically create the relation on every other content-types.

- Update the `server/register.js` file with the following:

```js
'use strict';

module.exports = ({ strapi }) => {
  // Iterating on every content-types
  Object.values(strapi.contentTypes).forEach(contentType => {
    // Add tasks property to the content-type
    contentType.attributes.tasks = {
      type: 'relation',
      relation: 'morphToMany',
      target: 'plugin::todo.task',
      morphBy: 'related',
      private: false, // false: This will not be exposed in API call
      configurable: false,
    };
  });
};
```

This code will associates tasks to every content-types, even the other plugin ones (i18n, Users and Permission etc...). We can add a very simple condition to only associate the task content-type to api content-types:

```js
'use strict';

module.exports = ({ strapi }) => {
  // Iterating on every content-types
  Object.values(strapi.contentTypes).forEach(contentType => {
    // If this is an api content-type
    if (contentType.uid.includes('api::')) {
      // Add tasks property to the content-type
      contentType.attributes.tasks = {
        type: 'relation',
        relation: 'morphToMany',
        target: 'plugin::todo.task',
        morphBy: 'related',
        private: false, // false: This will not be exposed in API call
        configurable: false,
      };
    }
  });
};
```

In fact, every content-types created in the admin will have a uid beginning with `api::`. For plugins, it will begins with `plugin::` etc...

[Learn more about relations in the documentation](/developer-docs/latest/development/backend-customization/models.html#model-attributes)


#### Managing settings with the store

A plugin might need to have some some settings depending on the use case. This section will cover the server part of handling settings for a plugin. For this guide, we'll define a setting to hide or either cross tasks when they are marked as done.

- Update the a `routes/task.js` file with the following:

```js
"use strict";

/**
 *  router.
 */

module.exports = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/count",
      handler: "task.count",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/settings",
      handler: "task.getSettings",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/settings",
      handler: "task.setSettings",
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
```

This custom router create 2 new admin routes that will be using two new `task` controller actions.


- Update the `controllers/task.js` file with the following:


```js
"use strict";

/**
 *  controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("plugin::todo.task", {
  async count(ctx) {
    ctx.body = await strapi.plugin("todo").service("todoService").count();
  },
  async getSettings(ctx) {
    try {
      ctx.body = await strapi.plugin("todo").service("task").getSettings();
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async setSettings(ctx) {
    const { body } = ctx.request;
    try {
      await strapi.plugin("todo").service("task").setSettings(body);
      ctx.body = await strapi.plugin("todo").service("task").getSettings();
    } catch (err) {
      ctx.throw(500, err);
    }
  },
});
```

This controller has two actions:

- `getSettings`: Uses getSettings service
- `setSettings`: Uses setSettings service


- Update the `services/task.js` file with the following:

```js
"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

function getPluginStore() {
  return strapi.store({
    environment: "",
    type: "plugin",
    name: "todo",
  });
}
async function createDefaultConfig() {
  const pluginStore = getPluginStore();
  const value = {
    hidden: false,
  };
  await pluginStore.set({ key: "settings", value });
  return pluginStore.get({ key: "settings" });
}

module.exports = createCoreService("plugin::todo.task", {
  async count() {
    return await strapi.query("plugin::todo.task").count();
  },
  async getSettings() {
    const pluginStore = getPluginStore();
    let config = await pluginStore.get({ key: "settings" });
    if (!config) {
      config = await createDefaultConfig();
    }
    return config;
  },
  async setSettings(settings) {
    const value = settings;
    const pluginStore = getPluginStore();
    await pluginStore.set({ key: "settings", value });
    return pluginStore.get({ key: "settings" });
  },
});
```

This service allows you to manage your plugin store. It will create a default config with a object containing an `hidden` key to false.

- Browse the `http://localhost:1337/todo/settings`, you should have the following result:

```json
{
  "hidden": false
}
```

It is time for some admin customization now.

## Admin customization

A plugin allows you to customize the front-end part of your Strapi application. In fact, you can:

- Create a plugin homepage
- Create a plugin settings page
- Insert React components in [injection zones](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html#injection-zones-api)
- Way more


#### Design System introduction

#### Settings page

notify on slack when a task is complete

#### Homepage

show the count of tasks and the last x ones linking to the corresponding entry

#### Component injection

CMdata

## Publish on npm

## Publish on the marketplace

## Install a plugin in Strapi
