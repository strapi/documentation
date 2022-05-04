---
title: Create a v4 plugin - Strapi Developer Docs
description: Learn in this guide how to restrict content editing to content authors only.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/plugin-api-101.html
---

# Create a v4 plugin

This guide is a solid introduction to Strapi v4 plugin development.

## Introduction

The documentation already covers a [plugin development](/developer-docs/latest/development/plugins-development.html) section. However, this might be a little bit hard to follow especially if you discovered Strapi recently. This guide aims to make it easier for you to learn this process with a real example of a To-Do list plugin.

The plugin API you are going to use was born from a [request for change](https://plugin-api-rfc.vercel.app/) (RFC) that we invite you to read if you are curious to know more about it.

You will learn to create a simple To-Do plugin in which you'll create a plugin content-type for persisting data, customize the back-end, create settings, create a plugin homepage, inject a React component in the admin, use the [Strapi Design System](https://design-system.strapi.io/) and more.

:::caution
This guide is working for the Strapi v4 version only.
:::

## Generate a plugin

We assume you have a Strapi project and you are located inside of it from your terminal. From there, you can simply generate a plugin using the [generate](/developer-docs/latest/developer-resources/cli/CLI.html#strapi-generate) CLI command.

This command, allows you to generate APIs, controllers, content-types, **plugins**, policies, middlewares, and services for your Strapi project.

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

- We are going to call this plugin: `todo`

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

Strapi created a new `./src/plugins/todo` folder containing the default files of your v4 plugin.

The result of the `generate` command invite you to update your `./config/plugins.js` file if it already exists or to create it with the following:

```js
// ./config/plugins.js
module.exports = {
  todo: {
    enabled: true,
    resolve: './src/plugins/todo',
  },
};
```

The last step of this section is to [build the admin](/developer-docs/latest/developer-resources/cli/CLI.html#strapi-build) of your Strapi project.

::: tip
**Updating the admin requires building your Strapi project**. By default, Strapi will inject some plugin components (menu link, homepage) in the admin which is why a build is required.

**However**, you can directly start your server with `'yarn'|'npm run' develop --watch-admin` options. It will start your application with the autoReload enabled and the front-end development server. It allows you to customize the administration panel while not having to build everytime.

Instead of building your application again and again during your plugin development, I advise you to work on your plugin while having your Strapi project running with the autoReload enabled by using: `--watch-admin`

Once you are done with your plugin development, **you'll need to build your application**

:::

:::: tabs card

::: tab yarn

```bash
yarn build
# or
yarn develop --watch-admin
```

:::

::: tab npx

```bash
npm run build
# or
npm run develop --watch-admin
```

:::

::::

If you start your server after building or after running `develop --watch-admin`, you should see your todo plugin in the main navigation linking to an empty homepage.

## Architecture file

When creating a plugin, this is what Strapi will generate for you in the `./src/plugins/your-plugin-folder`:

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
│           ├── getTrad.js        // getTrad function to return the corresponding plugin translations
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

A plugin is divided into two parts: **admin** and **server**. It is interesting to know that a plugin can have multiple purposes:

#### Server plugin

You can create a plugin that will just use the server part to have a unique API. We can think of a plugin that will have its own visible or invisible content-types, controller actions, and routes that are useful for a specific use case. In such a scenario, you don't need your plugin to have a specific interface in the admin.

#### Admin plugin

You can create a plugin just to inject some components into the admin. However, just know that you can basically do this by creating an `./src/admin/app.js` file, invoking the bootstrap lifecycle function to inject your components:

:::: tabs card

::: tab app.js

```js
// ./src/admin/app.js
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
// ./src/admin/extensions/TweetButton/index.js
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

This is what we are going to do. A plugin that involves some server customization but also a nice interface in the admin. You can find a lot of plugins already on the [Marketplace.](https://market.strapi.io/).

## Create a plugin content-type

The idea of the todo plugin is to have a list of tasks for every entry that you'll create in your project. This can be very useful for content-manager who wants to keep a clear vision of what needs to be done for a unique entry.

Todo is a simple list of tasks that needs to be saved in your application. Also, each task will be **related** to an existing entry but will see this later in this guide.

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

The most important thing here is the `./src/plugins/todo/server/content-types/task/schema.json`. This is the schema of your plugin collection-type. We are going to customize it by opening it in a code editor:

:::: tabs card

::: tab Before

```json
// ./src/plugins/todo/server/content-types/task/schema.json
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
// ./src/plugins/todo/server/content-types/task/schema.json
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

As you can see, we are making the `name` field required and it can only contain less than 40 characters. Also, the `isDone` field is now false by default.

However, something is missing for Strapi to use this new collection-type. You need to make some manual updates.

:::caution
These manual updates are necessary because of a bug in the generate CLI command. This will not be necessary for the future. The bug is that the schema created by Strapi is not automatically exported as it should be.
:::

- Create a `./src/plugins/todo/server/content-types/task/index.js` file that will export the schema generated by Strapi:

```js
// ./src/plugins/todo/server/content-types/task/index.js
'use strict';

const schema = require('./schema');

module.exports = {
  schema,
};
```

- Update the `./src/plugins/todo/server/content-types/index.js` file by exporting the content-type you just created:

```js
// ./src/plugins/todo/server/content-types/index.js
'use strict';

const task = require('./task');

module.exports = {
  task,
};
```

You should now be able to see your new collection-type in the Content-Type Builder and Content Manager of your project.

::: tip
Don't forget, to build your admin to see your changes or follow this guide while having your server running with the `--watch-admin` option.
:::

You can verify the integrity of your collection-type by running your server and eval commands in your application in real-time using the `strapi console` command.

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

- Then type the following command:

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

You might not want your collection-type to be visible in the Content-Type Builder and/or Content Manager. In fact, for this use case, having all the tasks displayed in the Content manager doesn't make sense since what is interesting here, is to see every task just for another content-type entry (article or product for example) inside the view of this particular entry.

- You can give a `pluginOptions` object to your schema.json with the following config in order to make your task collection-type invisible in your admin:

:::: tabs card

::: tab Before

```json
// ./src/plugins/todo/server/content-types/task/schema.json
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
// ./src/plugins/todo/server/content-types/task/schema.json
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

**Note**: For the purpose of this guide, we'll leave the content-type visible by setting both fields to `true`, we'll set them back to `false` at the very end of this guide.

## Server customization

The server part of a plugin is nothing more than an API you can consume from the outside (**http://localhost:1337/api/plugin-name/...**) or in the admin of your plugin (**http://localhost:1337/plugin-name/...**). It is made of routes, controllers, and services but also middlewares and policies.

Knowing how to master this little API you are ready to create, is definitely important in the development of a plugin.

#### Internal and External API

When creating an API, we first start by creating the route. We would like to be able to fetch the total number of tasks.

By default, Strapi generates the following route:

```js
// server/routes/index.js
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

This means that if you execute a GET request to the url `http://localhost:1337/<name-of-your-plugin>`, the `index` action of the `myController` controller will be executed. In this case, the route is using [authentication](/developer-docs/latest/guides/auth-request.html#introduction). We can make it public and see the result:

```js
// server/routes/index.js
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

- Open the [http://localhost:1337/todo](http://localhost:1337/todo) URL in your browser. You should see a `Welcome to Strapi 🚀` message.

Default routes, controllers, and services can be modified and this is what we are going to do. Again, the goal is to create a route for getting the total number of tasks.

- Update the `./src/plugins/todo/server/routes/index.js` file with the following:

```js
// server/routes/index.js
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

This route indicates that when requesting the URL: `http://localhost:1337/todo/count`, the task controller will execute the `count` action in order to return something.

- Rename the `./src/plugins/todo/server/controller/my-controller.js` file to `task.js`.
- Modify the import in the `./src/plugins/todo/server/controller/index.js` with the following:

```js
// server/controller/index.js
'use strict';

const task = require('./task');

module.exports = {
  task,
};
```

- Finally, replace the content of the `task.js` file with the following:

```js
// server/controller/task.js
'use strict';

module.exports = {
  count(ctx) {
    ctx.body = 'todo';
  },
};
```

- Wait for your server to restart and open the [http://localhost:1337/todo/count](http://localhost:1337/todo/count) URL in your browser. You should see a `todo` message.

What is left to do is to get the number of tasks instead of just a message.

- Create, via the Content Manager some tasks, at least one so your function returns something else than 0.

We are going to use a service to get the number of tasks.

- Rename the `./src/plugins/todo/server/services/my-service.js` by `task.js`
- Modify the import in the `./src/plugins/todo/server/services/index.js` with the following:

```js
// server/services/index.js
'use strict';

const task = require('./task');

module.exports = {
  task,
};
```

- Update the content of the `task.js` file with the following:

```js
// server/services/task.js
'use strict';

module.exports = ({ strapi }) => ({
  async count() {
    return await strapi.query('plugin::todo.task').count();
  },
});
```

- Update the `server/controllers/task.js` file with the following:

```js
// server/controller/task.js
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

If we summarize, the route tells your application that when receiving the `http://localhost:1337/todo/count` GET request, the task controller will execute the `count` action which will use the [Query engine](/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html) count function to return the actual count of tasks.

- Give it a try by browsing the [http://localhost:1337/todo/count](http://localhost:1337/todo/count) URL in your browser.

::: tip
Do you remember when you created your tasks content-type using the CLI? We answered no at the last question which was `Bootstrap API related files?`. If you said yes, Strapi would have generated the right controller, service, and route with correct and simple names so you don't have to modify it by yourself.

It is nice for you to see that you have the freedom to modify your files first but for your next content-type, you might want to answer yes to this question.

Just know that the default files would have been different. Let's see the controller file for example:

```js
// server/controllers/task.js
'use strict';

/**
 *   controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('plugin::todo.task');
```

If you want to add an action to this controller as we did previously, you must do the following:

```js
// server/controllers/task.js
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

It will be the same for services:

```js
// server/services/task.js
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

Concerning the default router file, it is about the core router configuration. You can leave it like this and keep creating your routes in the `server/routes/index.js` file:

```js
// server/routes/index.js
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

These endpoints will be accessible directly with this URL `http://localhost:1337/plugin-name/<path>` without having permissions to set like you must do with content-api routes type. These ones are admin routes type.

We can better structure our routes:

- The first thing to do, is to replace the content of your `server/routes/index.js` file with this:

```js
module.exports = {};
```

Then, you can create a route file for every content-types you have. When saying Yes to the `Bootstrap API related files?` question in the CLI, this is what Strapi does. It creates a `server/routes/task.js` file with the following:

```js
// server/routes/task.js
'use strict';

/**
 *  router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('plugin::todo.task');
```

- You can replace all of this content with custom routes like this:

```js
// server/routes/task.js
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

- Then, you just need to export this router in the `server/routes/index.js`:

```js
// server/routes/index.js
const task = require('./task');

module.exports = {
  task,
};
```

If you have another content-type, then you just need to create another custom router: `server/routes/report.js` and to export it:

```js
// server/routes/report.js
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
// server/routes/index.js
const task = require('./task');
const report = require('./report');

module.exports = {
  task,
  report,
};
```

:::caution
Please be aware of the different types of routes:

- content-api: It is external: The routes will be available from this endpoint: `/api/plugin-name/...`. It needs to be activated in the Users & Permissions plugin setting in the admin.
- admin: It is internal: The routes will be available from this endpoint: `/plugin-name/...` and will **only be accessible from the front-ent part of Strapi**: the admin. No need to define permissions but you can enable or disable authentication.
  :::

Lear more about [routes in the documentation](/developer-docs/latest/development/backend-customization/routes.html#implementation)

#### Strapi object

In the previous section, we used the [Query Engine](/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html) to interact with the database layer.

```js
// server/services/task.js
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

It is important to know what the `strapi` object allows you to do, and you can see this by using the `strapi console commmand`:

:::: tabs card

::: tab yarn

```bash
# stop your server and run
yarn strapi console
```

:::

::: tab npx

```bash
# stop your server and run
npm run strapi console
```

:::

::::

This will start your Strapi project and eval commands in your application in real-time. From there, you can type `strapi`, press enter, and see everything you can have access to.

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

It means that `strapi.store` has 3 async functions available for me to use in order to play with the application store. [A global Strapi API reference](https://docs-v3.strapi.io/developer-docs/latest/developer-resources/global-strapi/api-reference.html) existed for Strapi v3. It is outdated but some references are still working on v4.

[Learn more about server customization in the documentation](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#backend-customization)

#### Relations

Most of the time, when developing a plugin, you'll need to create a content-type. It can be independent by making the plugin works under the hood. In other scenarios, associating this plugin content-type to a regular (api) content-type **(the ones you create in the admin)**, is possible and pretty easy to do.

For this guide, we want to have a to-do list for every api content-types our application contains. This means that we'll create a relation between the task content-type to every other api content-types.

However, we are not going to use the [regular relations](/developer-docs/latest/development/backend-customization/models.html#model-attributes). In fact, for this use case, we'll use the specific relation that the Media Library is using for managing file relations: Polymorphic relationships. It is a good occasion to learn how to use them since they are not documented.

:::tip
This relationship involves a column in a table (task table with an id) that can link to different columns in other tables (article table, product table, etc...). In a polymorphic relationship, a model/table can be associated with different models/tables.

This plugin will require a polymorphic relation to work properly. In fact, if you create an `article` content-type and create a regular oneToMany relationship, it will work, your articles will have many related tasks, but if you create 99 other content-types, you'll need to create the 99 relationships manually in the admin...

Also, by creating a non-polymorphic oneToMany, manyToOne or manyToMany relation, Strapi will create a lookup database table to match your entries, this is how 'regular' relationships work. By creating a Polymorphic relation, only 1 table will be created whether you have 1 or 99 content-types related to your task content-type but this is true if you use a morphToMany relation for your task. If you use a `morphToOne`, and this is the one we are going to use, no lookup table will be necessary!

In non-polymorphic relationships, the foreign keys reference a primary ID in a specific table. On the other hand, a foreign key in a polymorphic lookup table can reference many tables.
:::

One other advantage of the polymorphic relation is that you'll don't have a right-links block in the content-manager displaying your tasks. We don't want that for our plugin since it will not be useful at all. We want to manage how we'll display our tasks in order to correctly interact with them

You can learn more by browsing the source code of Strapi. [Here](https://github.com/strapi/strapi/blob/master/packages/core/upload/server/content-types/file/schema.js), you can find the schema file of the upload plugin (Media Library) that is using a polymorphic `morphToMany` relation.

- First, we need to update the schema file of the task (`./server/content-types/task/schema.json`) content-type to include a `morphToOne` relation.

```json
// ./server/content-types/task/schema.json
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
      "visible": true
    },
    "content-type-builder": {
      "visible": true
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
    },
    "related": {
      "type": "relation",
      "relation": "morphToOne"
    }
  }
}
```

By selecting a `morphToOne` related field, Strapi will create in the task table, a `target_id` and a `target_type` column. If you create a task for an article entry, you will fill the `target_id` with the id of the article and the `target_type` with the internal slug of the entry which will probably be: `api::article.article`. But we'll see that later in the front-end section.

For a relationship to work, it must be indicated on both sides (1.task <> 2.article, product, page, etc...). We did half of the job. We are going to use the [register phase](/developer-docs/latest/developer-resources/plugin-api-reference/server.html#register) of the plugin to automatically create the relation on every other content-types.

- Update the `server/register.js` file with the following:

```js
// server/register.js
'use strict';

module.exports = ({ strapi }) => {
  // Iterating on every content-types
  Object.values(strapi.contentTypes).forEach(contentType => {
    // Add tasks property to the content-type
    contentType.attributes.tasks = {
      type: 'relation',
      relation: 'morphMany',
      target: 'plugin::todo.task', // internal slug of the target
      morphBy: 'related', // field in the task schema that is used for the relation
      private: false, // false: This will not be exposed in API call
      configurable: false,
    };
  });
};
```

This code will associate tasks to every content-types by creating a `tasks` object containing the `relation` type which will be a `morphMany` here since you want this content-type to have multiple tasks using polymorphic relation.

However, even the other plugins will have this relation (i18n, Users and Permission, etc...). We can add a very simple condition to only associate the task content-type to api content-types:

```js
// server/register.js
'use strict';

module.exports = ({ strapi }) => {
  // Iterating on every content-types
  Object.values(strapi.contentTypes).forEach(contentType => {
    // If this is an api content-type
    if (contentType.uid.includes('api::')) {
      // Add tasks property to the content-type
      contentType.attributes.tasks = {
        type: 'relation',
        relation: 'morphMany',
        target: 'plugin::todo.task', // internal slug of the target
        morphBy: 'related', // field in the task schema that is used for the relation
        private: false, // false: This will not be exposed in API call
        configurable: false,
      };
    }
  });
};
```

In fact, every content-types created in the admin will have a uid beginning with `api::`. For plugins, it will begin with `plugin::` etc...

We created a polymorphic relation between a plugin content-type and every other api content-types.

#### Managing settings with the store

A plugin might need to have some settings. This section will cover the server part of handling settings for a plugin. For this guide, we'll define a setting to disable or cross tasks when they are marked as done.

- Update the `server/routes/task.js` file with the following:

```js
// server/routes/task.js
'use strict';

/**
 *  router.
 */

module.exports = {
  type: 'admin',
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
    {
      method: 'GET',
      path: '/settings',
      handler: 'task.getSettings',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/settings',
      handler: 'task.setSettings',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
```

This custom router creates 2 new admin routes that will be using two new `task` controller actions.

- Update the `server/controllers/task.js` file with the following:

```js
// server/controllers/task.js
'use strict';

/**
 *  controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('plugin::todo.task', {
  async count(ctx) {
    ctx.body = await strapi
      .plugin('todo')
      .service('task')
      .count();
  },
  async getSettings(ctx) {
    try {
      ctx.body = await strapi
        .plugin('todo')
        .service('task')
        .getSettings();
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async setSettings(ctx) {
    const { body } = ctx.request;
    try {
      await strapi
        .plugin('todo')
        .service('task')
        .setSettings(body);
      ctx.body = await strapi
        .plugin('todo')
        .service('task')
        .getSettings();
    } catch (err) {
      ctx.throw(500, err);
    }
  },
});
```

This controller has two actions:

- `getSettings`: Uses `getSettings` service
- `setSettings`: Uses `setSettings` service

- Update the `server/services/task.js` file with the following:

```js
// server/services/task.js
'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

function getPluginStore() {
  return strapi.store({
    environment: '',
    type: 'plugin',
    name: 'todo',
  });
}
async function createDefaultConfig() {
  const pluginStore = getPluginStore();
  const value = {
    disabled: false,
  };
  await pluginStore.set({ key: 'settings', value });
  return pluginStore.get({ key: 'settings' });
}

module.exports = createCoreService('plugin::todo.task', {
  async count() {
    return await strapi.query('plugin::todo.task').count();
  },
  async getSettings() {
    const pluginStore = getPluginStore();
    let config = await pluginStore.get({ key: 'settings' });
    if (!config) {
      config = await createDefaultConfig();
    }
    return config;
  },
  async setSettings(settings) {
    const value = settings;
    const pluginStore = getPluginStore();
    await pluginStore.set({ key: 'settings', value });
    return pluginStore.get({ key: 'settings' });
  },
});
```

This service allows you to manage your plugin store. It will create a default config with an object containing a `disabled` key to false. It means that, by default, we want our tasks to be crossed when marked as done not disabled. We'll see this in the next section.

- Browse the [http://localhost:1337/todo/settings](http://localhost:1337/todo/settings) URL, you should have the following result:

```json
{
  "disabled": false
}
```

It is time for some admin customization.

## Admin customization

A plugin allows you to customize the front-end part of your Strapi application. In fact, you can:

- Create a plugin homepage
- Create a plugin settings page
- Insert React components in [injection zones](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html#injection-zones-api)
- Way more...

We are going to explore the entry point of the admin of your plugin: `./src/plugins/todo/admin/src/index.js`.

#### Admin entrypoint

By default, your `admin/src/index.js` file should look like this:

```js
// admin/src/index.js
import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');

        return component;
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },

  bootstrap(app) {},
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map(locale => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
```

This file will, first, add your plugin to the menu link and register your plugin during the register phase:

```js
register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');

        return component;
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },
```

Then, nothing is happening during the bootstrap phase:

```js
bootstrap(app) {},
```

This is the phase where we are going to inject our components later.
Finally, it handles the translation files in your plugin allowing you to make it i18n friendly.

```js
async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map(locale => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
```

There are a lot of things you can already do here. You may want to customize the icon of your plugin in the menu link for example by updating the `admin/src/components/PluginIcon/index.js` file. Find another icon in the [Strapi Design System website](https://design-system-git-main-strapijs.vercel.app/?path=/story/design-system-components-theme--icons) and update it:

```js
// admin/src/components/PluginIcon/index.js
// Replace the default Puzzle icon by a Brush one
import React from 'react';
import Brush from '@strapi/icons/Brush';

const PluginIcon = () => <Brush />;

export default PluginIcon;
```

::: tip
Don't forget to build your admin or to run your project with the `--watch-admin` option.
:::

If you don't want your plugin to be listed in the menu link for some reason, you can remove this function.

Now is the time to get into the front-end part of this plugin but first, an introduction to our Design System is necessary.

#### Strapi Design System

Strapi Design System provides guidelines and tools to help anyone make Strapi's contributions more cohesive and to build plugins more efficiently. You can find the [guidelines for publishing a plugin to the marketplace](https://strapi.io/marketplace/guidelines). As you can see: `Plugins compatible with Strapi v4 MUST use the Strapi Design System for the UI.`.

:::caution
We insist on the fact that v4 plugins must use the Design System.
:::

Feel free to browse the [Design System website](https://design-system.strapi.io/) but what is more important for you is the [components](https://design-system-git-main-strapijs.vercel.app/). This is every React component you can use within your project to give a beautiful UI to your plugin.

You can also find [every icon](https://design-system-git-main-strapijs.vercel.app/?path=/story/design-system-components-theme--icons) you can use. Click on them to have the import js line copied in your clipboard.

You don't need to install anything, you can directly create components, import some items from the Design System like this: `import { Button } from '@strapi/design-system/Button';` and that's it.

#### Homepage

A Strapi plugin can have a homepage or not, you decide if it is necessary. For our todo use case, it doesn't make sense to have a specific homepage since the most important part would be to inject a todo on every entry we have (article, product, etc...)

But this section will cover this anyway. We are going to use the route we created to get the total number of tasks in order to display it on this homepage.

The route we created is the following:

```js
// server/routes/task.js
module.exports = {
  type: 'admin',
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
    // ...
  ],
};
```

::: tip
This is an admin route, which means that it will be directly accessible from the admin. Not from the outside (/api/...)
:::

We are going to create a file that will execute every HTTP request to our server in a specific folder but feel free to name it differently or manage this file in another way.

- Create an `./admin/src/api/task.js` file containing the following:

```js
// ./admin/src/api/task.js
import { request } from '@strapi/helper-plugin';

const taskRequests = {
  getTaskCount: async () => {
    const data = await request(`/todo/count`, {
      method: 'GET',
    });
    return data;
  },
};
export default taskRequests;
```

We are using the [helper-plugin](https://github.com/strapi/strapi/tree/0f9b69298b2d94b31b434bd7217060570ae89374/packages/core/helper-plugin). This is a core package containing hooks, components, functions and more. We are using the [request function](https://github.com/strapi/strapi/blob/0f9b69298b2d94b31b434bd7217060570ae89374/packages/core/helper-plugin/lib/src/utils/request/index.js) for making HTTP request.

Feel free to take some time exploring the [strapi](https://github.com/strapi/strapi) repository, a lot of useful things, sometimes not yet documented, can be found.

- Update the content of the `admin/src/pages/Homepage/index.js` file with the following:

```js
// admin/src/pages/Homepage/index.js
/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from 'react';

import taskRequests from '../../api/task';

import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { EmptyStateLayout } from '@strapi/design-system/EmptyStateLayout';
import { BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';

import { Illo } from '../../components/Illo';

const HomePage = () => {
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    taskRequests.getTaskCount().then(data => {
      setTaskCount(data);
    });
  }, []);

  return (
    <>
      <BaseHeaderLayout
        title="Todo Plugin"
        subtitle="Discover the number of tasks you have in your project"
        as="h2"
      />
      <ContentLayout>
        {taskCount === 0 && (
          <EmptyStateLayout icon={<Illo />} content="You don't have any tasks yet..." />
        )}
        {taskCount > 0 && (
          <Box background="neutral0" hasRadius={true} shadow="filterShadow">
            <Flex justifyContent="center" padding={8}>
              <Typography variant="alpha">You have a total of {taskCount} tasks 🚀</Typography>
            </Flex>
          </Box>
        )}
      </ContentLayout>
    </>
  );
};

export default memo(HomePage);
```

For this homepage to work, you'll just need to create the `Illo` icon that the `EmptyStateLayout` is using.

- Create an `admin/src/components/Illo/index.js` file containing the following:

```js
// admin/src/components/Illo/index.js
import React from 'react';

export const Illo = () => (
  <svg width="159" height="88" viewBox="0 0 159 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M134.933 17.417C137.768 17.417 140.067 19.7153 140.067 22.5503C140.067 25.3854 137.768 27.6837 134.933 27.6837H105.6C108.435 27.6837 110.733 29.9819 110.733 32.817C110.733 35.6521 108.435 37.9503 105.6 37.9503H121.733C124.568 37.9503 126.867 40.2486 126.867 43.0837C126.867 45.9187 124.568 48.217 121.733 48.217H114.272C110.698 48.217 107.8 50.5153 107.8 53.3503C107.8 55.2404 109.267 56.9515 112.2 58.4837C115.035 58.4837 117.333 60.7819 117.333 63.617C117.333 66.4521 115.035 68.7503 112.2 68.7503H51.3333C48.4982 68.7503 46.2 66.4521 46.2 63.617C46.2 60.7819 48.4982 58.4837 51.3333 58.4837H22.7333C19.8982 58.4837 17.6 56.1854 17.6 53.3503C17.6 50.5153 19.8982 48.217 22.7333 48.217H52.0666C54.9017 48.217 57.2 45.9187 57.2 43.0837C57.2 40.2486 54.9017 37.9503 52.0666 37.9503H33.7333C30.8982 37.9503 28.6 35.6521 28.6 32.817C28.6 29.9819 30.8982 27.6837 33.7333 27.6837H63.0666C60.2316 27.6837 57.9333 25.3854 57.9333 22.5503C57.9333 19.7153 60.2316 17.417 63.0666 17.417H134.933ZM134.933 37.9503C137.768 37.9503 140.067 40.2486 140.067 43.0837C140.067 45.9187 137.768 48.217 134.933 48.217C132.098 48.217 129.8 45.9187 129.8 43.0837C129.8 40.2486 132.098 37.9503 134.933 37.9503Z"
      fill="#DBDBFA"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M95.826 16.6834L102.647 66.4348L103.26 71.4261C103.458 73.034 102.314 74.4976 100.706 74.695L57.7621 79.9679C56.1542 80.1653 54.6906 79.0219 54.4932 77.4139L47.8816 23.5671C47.7829 22.7631 48.3546 22.0313 49.1586 21.9326C49.1637 21.932 49.1688 21.9313 49.1739 21.9307L52.7367 21.5311L95.826 16.6834ZM55.6176 21.208L58.9814 20.8306Z"
      fill="white"
    />
    <path
      d="M55.6176 21.208L58.9814 20.8306M95.826 16.6834L102.647 66.4348L103.26 71.4261C103.458 73.034 102.314 74.4976 100.706 74.695L57.7621 79.9679C56.1542 80.1653 54.6906 79.0219 54.4932 77.4139L47.8816 23.5671C47.7829 22.7631 48.3546 22.0313 49.1586 21.9326C49.1637 21.932 49.1688 21.9313 49.1739 21.9307L52.7367 21.5311L95.826 16.6834Z"
      stroke="#7E7BF6"
      strokeWidth="2.5"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M93.9695 19.8144L100.144 64.9025L100.699 69.4258C100.878 70.8831 99.8559 72.2077 98.416 72.3845L59.9585 77.1065C58.5185 77.2833 57.2062 76.2453 57.0272 74.7881L51.0506 26.112C50.9519 25.308 51.5236 24.5762 52.3276 24.4775L57.0851 23.8934"
      fill="#F0F0FF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M97.701 7.33301H64.2927C63.7358 7.33301 63.2316 7.55873 62.8667 7.92368C62.5017 8.28862 62.276 8.79279 62.276 9.34967V65.083C62.276 65.6399 62.5017 66.1441 62.8667 66.509C63.2316 66.874 63.7358 67.0997 64.2927 67.0997H107.559C108.116 67.0997 108.62 66.874 108.985 66.509C109.35 66.1441 109.576 65.6399 109.576 65.083V19.202C109.576 18.6669 109.363 18.1537 108.985 17.7755L99.1265 7.92324C98.7484 7.54531 98.2356 7.33301 97.701 7.33301Z"
      fill="white"
      stroke="#7F7CFA"
      strokeWidth="2.5"
    />
    <path
      d="M98.026 8.17871V16.6833C98.026 17.8983 99.011 18.8833 100.226 18.8833H106.044"
      stroke="#807EFA"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M70.1594 56.2838H89.2261M70.1594 18.8838H89.2261H70.1594ZM70.1594 27.6838H101.693H70.1594ZM70.1594 37.2171H101.693H70.1594ZM70.1594 46.7505H101.693H70.1594Z"
      stroke="#817FFA"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
```

You should be able to see the total number of tasks on your plugin homepage. Let's explore in detail what's happening.

```js
// admin/src/pages/Homepage/index.js
import React, { memo, useState, useEffect } from 'react';

import taskRequests from '../../api/task';

import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { EmptyStateLayout } from '@strapi/design-system/EmptyStateLayout';
import { BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';
```

First, we import every hook from React that we'll need for this to work. We import the function to get the task count we created just before and then we import every Design system components we'll need.

```js
const [taskCount, setTaskCount] = useState(0);

useEffect(() => {
  taskRequests.getTaskCount().then(data => {
    setTaskCount(data);
  });
}, []);
```

We create a `taskCount` state with 0 as a default value. We use the [useEffect React hook](https://reactjs.org/docs/hooks-effect.html) to fetch our task count using the function we created earlier and replace our state variable with the result.

```js
return (
  <>
    <BaseHeaderLayout
      title="Todo Plugin"
      subtitle="Discover the number of tasks you have in your project"
      as="h2"
    />
    <ContentLayout>
      {taskCount === 0 && (
        <EmptyStateLayout icon={<Illo />} content="You don't have any tasks yet..." />
      )}
      {taskCount > 0 && (
        <Box background="neutral0" hasRadius={true} shadow="filterShadow">
          <Flex justifyContent="center" padding={8}>
            <Typography variant="alpha">You have a total of {taskCount} tasks 🚀</Typography>
          </Flex>
        </Box>
      )}
    </ContentLayout>
  </>
);
```

Then, depending on the number of tasks you have, it will display something on the homepage of your plugin.
As mentioned before, for this use case, making this homepage is not really necessary but you are now familiar with it and with the Design System.

Let's add something that may be useful in the future. We want to display a loading indicator while the request is pending and for this, we'll use the [helper-plugin](https://github.com/strapi/strapi/tree/0f9b69298b2d94b31b434bd7217060570ae89374/packages/core/helper-plugin) again.

- Import the `LoadingIndicatorPage` component from the `helper-plugin`

```js
// admin/src/pages/Homepage/index.js
import { LoadingIndicatorPage } from '@strapi/helper-plugin';
```

- Create a new state variable that will indicate the page it is loading by default:

```js
const [isLoading, setIsLoading] = useState(true);
```

- Add this conditional return just after the `useEffect` hook:

```js
if (isLoading) return <LoadingIndicatorPage />;
```

Final code:

```js
// admin/src/pages/Homepage/index.js
/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from 'react';

import taskRequests from '../../api/task';

import { LoadingIndicatorPage } from '@strapi/helper-plugin';

import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { EmptyStateLayout } from '@strapi/design-system/EmptyStateLayout';
import { BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';

import { Illo } from '../../components/Illo';

const HomePage = () => {
  const [taskCount, setTaskCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    taskRequests.getTaskCount().then(data => {
      setTaskCount(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <LoadingIndicatorPage />;

  return (
    <>
      <BaseHeaderLayout
        title="Todo Plugin"
        subtitle="Discover the number of tasks you have in your project"
        as="h2"
      />

      <ContentLayout>
        {taskCount === 0 && (
          <EmptyStateLayout icon={<Illo />} content="You don't have any tasks yet..." />
        )}
        {taskCount > 0 && (
          <Box background="neutral0" hasRadius={true} shadow="filterShadow">
            <Flex justifyContent="center" padding={8}>
              <Typography variant="alpha">You have a total of {taskCount} tasks 🚀</Typography>
            </Flex>
          </Box>
        )}
      </ContentLayout>
    </>
  );
};

export default memo(HomePage);
```

The content of your page will only be displayed if the request has returned something.
We strongly advise you to take a look at the helper-plugin which deserves to have this name.
You can find the source code of the `LoadingIndicatorPage` component [here](https://github.com/strapi/strapi/blob/0f9b69298b2d94b31b434bd7217060570ae89374/packages/core/helper-plugin/lib/src/components/LoadingIndicatorPage/index.js).

#### Settings page

We created a settings API in a previous section. Now is the time to create the settings view in the admin to be able to interact with it.
By default, Strapi creates a Homepage folder, the one you just played with, but it doesn't create the Settings which is needed to implement a settings section for your plugin in the main settings view.

We need to create the necessary HTTP requests from the admin.

- Update the `admin/src/api/task.js` file with the following content:

```js
// admin/src/api/task.js
import { request } from '@strapi/helper-plugin';

const taskRequests = {
  getTaskCount: async () => {
    const data = await request(`/todo/count`, {
      method: 'GET',
    });
    return data;
  },
  getSettings: async () => {
    const data = await request(`/todo/settings`, {
      method: 'GET',
    });
    return data;
  },
  setSettings: async data => {
    return await request(`/todo/settings`, {
      method: 'POST',
      body: data,
    });
  },
};
export default taskRequests;
```

These two new functions will request the API you created earlier for the settings.

- Create an `admin/src/pages/Settings` folder with an `index.js` file inside of it with the following:

```js
// admin/src/pages/Settings/index.js
import React, { useEffect, useState } from 'react';

import taskRequests from '../../api/task';

import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin';

import { Box } from '@strapi/design-system/Box';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { HeaderLayout } from '@strapi/design-system/Layout';
import { ContentLayout } from '@strapi/design-system/Layout';
import { Typography } from '@strapi/design-system/Typography';
import { ToggleInput } from '@strapi/design-system/ToggleInput';

import Check from '@strapi/icons/Check';

const Settings = () => {
  const [settings, setSettings] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toggleNotification = useNotification();

  useEffect(() => {
    taskRequests.getSettings().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    const data = await taskRequests.setSettings(settings);
    setSettings(data);
    setIsSaving(false);
    toggleNotification({
      type: 'success',
      message: 'Settings successfully updated',
    });
  };

  return (
    <>
      <HeaderLayout
        id="title"
        title="Todo General settings"
        subtitle="Manage the settings and behaviour of your todo plugin"
        primaryAction={
          isLoading ? (
            <></>
          ) : (
            <Button
              onClick={handleSubmit}
              startIcon={<Check />}
              size="L"
              disabled={isSaving}
              loading={isSaving}
            >
              Save
            </Button>
          )
        }
      ></HeaderLayout>
      {isLoading ? (
        <LoadingIndicatorPage />
      ) : (
        <ContentLayout>
          <Box
            background="neutral0"
            hasRadius
            shadow="filterShadow"
            paddingTop={6}
            paddingBottom={6}
            paddingLeft={7}
            paddingRight={7}
          >
            <Stack size={3}>
              <Typography>General settings</Typography>
              <Grid gap={6}>
                <GridItem col={12} s={12}>
                  <ToggleInput
                    checked={settings?.disabled ?? false}
                    hint="Cross or disable checkbox tasks marked as done"
                    offLabel="Cross"
                    onLabel="Disable"
                    onChange={e => {
                      setSettings({
                        disabled: e.target.checked,
                      });
                    }}
                  />
                </GridItem>
              </Grid>
            </Stack>
          </Box>
        </ContentLayout>
      )}
    </>
  );
};

export default Settings;
```

This settings page is displaying a toggle that will allow you to manage if you want to cross or disable your tasks marked as done.

The next thing that is necessary, tell your plugin to create a settings section. You can achieve this by using the `createSettingSection` function. Learn more about it just right [here](https://github.com/strapi/strapi/blob/5cbb60ce4b652e84dd8d65ffa2713437ecb4e619/packages/core/admin/admin/src/StrapiApp.js).

- Update the `admin/src/index.js` file by adding the following code just before the `app.registerPlugin` call:

```js
// admin/src/index.js
//...
app.createSettingSection(
  {
    id: pluginId,
    intlLabel: {
      id: `${pluginId}.plugin.name`,
      defaultMessage: 'Todo',
    },
  },
  [
    {
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'General settings',
      },
      id: 'settings',
      to: `/settings/${pluginId}`,
      Component: async () => {
        return import('./pages/Settings');
      },
    },
  ]
);
//..
```

If you go to the main settings of your application, you should be able to see a `TODO - General settings` section. From there, you can save the way you'll want to display your tasks marked as done in the store.

We'll be able to get this setting directly from the component that we'll inject later.

#### Translations

You can translate your plugin into several languages if you wish. It's quite simple, you just have to do 2 things:

1. Create a locale file containing all the translations for the language you want to have for your plugin. By default, we'll ask for your plugin to have an English file containing all the wording of your application in English and then, you can create as many files as you would like to have.

By default, a plugin contains an English JSON file and also a french one inside the `admin/src/translations` folder:

```
├── translations
    ├── en.json
    └── fr.json
```

The format of this file is straight to the point. You need to create a key which is an id corresponding to a translation string:

For the `en.json` file, we can have:

```JSON
// admin/src/translations/en.json
{
  "Homepage.BaseHeaderLayout.title": "Todo Plugin",
  // etc...
}
```

You are free to name the ids as you would like to, but we advise you to name them correctly so it's easy to understand in your front-end code.
`Homepage.BaseHeaderLayout.title` corresponds to the title prop of the `BaseHeaderLayout` component that we use on the homepage. Instead of having a fixed value, we can now use this translation with this id.

- Update the `admin/src/translations/en.json` file with the following code:

```JSON
// admin/src/translations/en.json
{
  "Homepage.BaseHeaderLayout.title": "Todo Plugin"
}
```

- Update the `admin/src/translations/fr.json` file with the following code:

```JSON
// admin/src/translations/fr.json
{
  "Homepage.BaseHeaderLayout.title": "Plugin des tâches" // French translation for Todo Plugin :)
}
```

The only thing that is needed is to replace hard text by dynamically loading the translations in your pages/components.

2. Use the `useIntl` hook from `react-intl` and the `admin/src/utils/getTrad.js` function to internationalize your plugin.

- Update the `admin/src/pages/Homepage/index.js` by importing these two elements:

```js
// admin/src/pages/Homepage/index.js
//...
import { useIntl } from 'react-intl';
import getTrad from '../../utils/getTrad';
//...
```

- Implement the `formatMessage` function just before the `useEffect`:

```js
//...
const { formatMessage } = useIntl();
//...
```

- Finally, replace the content of your `BaseHeaderLayout` component with the following:

```js
<BaseHeaderLayout
  title={formatMessage({
    id: getTrad('Homepage.BaseHeaderLayout.title'),
    defaultMessage: 'Todo Plugin',
  })}
  subtitle="Discover the number of tasks you have in your project"
  as="h2"
/>
```

You can have a `defaultMessage` in case it doesn't succeed to load the requested translation.

This is what your file should look like:

```js
// admin/src/pages/Homepage/index.js
/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from 'react';

import { useIntl } from 'react-intl';
import getTrad from '../../utils/getTrad';

import taskRequests from '../../api/task';

import { LoadingIndicatorPage } from '@strapi/helper-plugin';

import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { EmptyStateLayout } from '@strapi/design-system/EmptyStateLayout';
import { BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';

import { Illo } from '../../components/Illo';

const HomePage = () => {
  const [taskCount, setTaskCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { formatMessage } = useIntl();

  useEffect(() => {
    taskRequests.getTaskCount().then(data => {
      setTaskCount(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <LoadingIndicatorPage />;

  return (
    <>
      <BaseHeaderLayout
        title={formatMessage({
          id: getTrad('Homepage.BaseHeaderLayout.title'),
          defaultMessage: 'Todo Plugin',
        })}
        subtitle="Discover the number of tasks you have in your project"
        as="h2"
      />

      <ContentLayout>
        {taskCount === 0 && (
          <EmptyStateLayout icon={<Illo />} content="You don't have any tasks yet..." />
        )}
        {taskCount > 0 && (
          <Box background="neutral0" hasRadius={true} shadow="filterShadow">
            <Flex justifyContent="center" padding={8}>
              <Typography variant="alpha">You have a total of {taskCount} tasks 🚀</Typography>
            </Flex>
          </Box>
        )}
      </ContentLayout>
    </>
  );
};

export default memo(HomePage);
```

Feel free to change the language of your admin in the general settings to see your different translations.

#### Component injection

A plugin allows you to inject React components where the admin allows you to. In fact, some areas were designed to receive any kind of components. This is possible thanks to the [injection Zones](/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html#injection-zones-api).

You need to use the `bootstrap` lifecycle function to inject your components in the `admin/src/index.js`. For this use case, we'll simply tell our plugin to inject a `TodoCard` React component in the `editView` > `right-links` injection zone.

- Update the `admin/src/index.js` file by importing the component:

```js
// admin/src/index.js
//...
import TodoCard from './components/TodoCard';
//...
```

- Update the `admin/src/index.js` file by injecting this component in the bootstrap lifecycle function:

```js
 bootstrap(app) {
    app.injectContentManagerComponent("editView", "right-links", {
      name: "todo-component",
      Component: TodoCard,
    });
  },
```

Your file should look like this:

```js
// admin/src/index.js
import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import TodoCard from './components/TodoCard';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');

        return component;
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });
    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: `${pluginId}.plugin.name`,
          defaultMessage: 'Todo',
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: 'General settings',
          },
          id: 'settings',
          to: `/settings/${pluginId}`,
          Component: async () => {
            return import('./pages/Settings');
          },
        },
      ]
    );
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },
  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'todo-component',
      Component: TodoCard,
    });
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map(locale => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
```

Your application will not work since this `TodoCard` doesn't exist yet.

- Create an `admin/src/components/TodoCard/index.js` with the following code:

```js
// admin/src/components/TodoCard/index.js
import React, { useState, useEffect } from 'react';

import { useCMEditViewDataManager } from '@strapi/helper-plugin';

import axiosInstance from '../../utils/axiosInstance';

import { Box, Typography, Divider, Checkbox, Stack, Flex, Icon } from '@strapi/design-system';

import Plus from '@strapi/icons/Plus';

import TaskModal from '../TaskModal';

function useRelatedTasks() {
  const { initialData, isSingleType, slug } = useCMEditViewDataManager();

  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [settings, setSettings] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data } = await axiosInstance.get(`todo/settings`);
      setSettings(data.disabled);
    } catch (e) {
      console.log(e);
    }
  };

  const refetchTasks = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/content-manager/${isSingleType ? 'single-types' : 'collection-types'}/${slug}/${
          isSingleType ? '' : initialData.id
        }?populate=tasks`
      );

      setTasks(data.tasks);
      setStatus('success');
    } catch (e) {
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchSettings();
    refetchTasks();
  }, [initialData, isSingleType, axiosInstance, setTasks, setStatus, setSettings]);

  return { status, tasks, refetchTasks, fetchSettings, settings };
}

const TodoCard = () => {
  const { status, tasks, refetchTasks, settings } = useRelatedTasks();
  const [createModalIsShown, setCreateModalIsShown] = useState(false);

  const toggleTask = async (taskId, isChecked) => {
    // Update task in database
    await axiosInstance.put(`/content-manager/collection-types/plugin::todo.task/${taskId}`, {
      isDone: isChecked,
    });
    // Call API to update local cache
    await refetchTasks();
  };

  const showTasks = () => {
    // Loading state
    if (status === 'loading') {
      return <p>Fetching todos...</p>;
    }

    // Error state
    if (status === 'error') {
      return <p>Could not fetch tasks.</p>;
    }

    // Empty state
    if (tasks == null || tasks.length === 0) {
      return <p>No todo yet.</p>;
    }

    // Success state, show all tasks
    return tasks.map(task => (
      <>
        <Checkbox
          value={task.isDone}
          onValueChange={isChecked => toggleTask(task.id, isChecked)}
          key={task.id}
          disabled={task.isDone && settings ? true : false}
        >
          <span
            style={{
              textDecoration: task.isDone && settings == false ? 'line-through' : 'none',
            }}
          >
            {task.name}
          </span>
        </Checkbox>
      </>
    ));
  };

  return (
    <>
      {createModalIsShown && (
        <TaskModal handleClose={() => setCreateModalIsShown(false)} refetchTasks={refetchTasks} />
      )}
      <Box
        as="aside"
        aria-labelledby="additional-informations"
        background="neutral0"
        borderColor="neutral150"
        hasRadius
        paddingBottom={4}
        paddingLeft={4}
        paddingRight={4}
        paddingTop={3}
        shadow="tableShadow"
      >
        <Typography variant="sigma" textColor="neutral600" id="additional-informations">
          Todos
        </Typography>
        <Box paddingTop={2} paddingBottom={6}>
          <Box paddingBottom={2}>
            <Divider />
          </Box>
          <Typography
            fontSize={2}
            textColor="primary600"
            as="button"
            type="button"
            onClick={() => setCreateModalIsShown(true)}
          >
            <Flex>
              <Icon as={Plus} color="primary600" marginRight={2} width={3} height={3} />
              Add todo
            </Flex>
          </Typography>

          <Stack paddingTop={3} size={2}>
            {showTasks()}
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default TodoCard;
```

There are 3 important things to see in this code:

1. `useCMEditViewDataManager`. This hook is coming from the [helper-plugin](https://github.com/strapi/strapi/tree/0f9b69298b2d94b31b434bd7217060570ae89374/packages/core/helper-plugin). It allows you to have access, from the content-manager to the data of the actual entry. In this case, we are fetching the `initialData`, if the entry is from a single-type (`isSingleType`), and the `slug` of the entry in the admin.

You can have access to more data with it. [Learn more about this hook](https://github.com/strapi/strapi/blob/master/packages/core/helper-plugin/lib/src/content-manager/hooks/useCMEditViewDataManager/useCMEditViewDataManager.stories.mdx).

2. Usage of the Strapi Content Manager API. In one of the previous sections, we saw how we can fetch data from the server of our plugin by creating an API (controller, routes, etc...). Well, there is another way to fetch your data without having to create all this, you can use the undocumented Strapi Content Manager API. It will allow you to fetch, from the admin only, your data using the `/content-manager/` endpoint.

- To learn more about this API you need to clone the [strapi](https://github.com/strapi/strapi) repository and start the open-api server for the core/content-manager:

```
git clone https://github.com/strapi/strapi.git
cd strapi
yarn doc:api core/content-manager
```

:::caution
It is internal documentation. There might be breaking changes.
:::

3. The component is using the settings we created in one of the previous sections. In fact, the function `fetchSettings` will execute an API call to the route we created in one of the previous sections.

```js
const fetchSettings = async () => {
  try {
    const { data } = await axiosInstance.get(`todo/settings`);
    setSettings(data.disabled);
  } catch (e) {
    console.log(e);
  }
};
```

Then, depending on the value of these settings, it will render the checkbox:

```js
return tasks.map(task => (
  <>
    <Checkbox
      value={task.isDone}
      onValueChange={isChecked => toggleTask(task.id, isChecked)}
      key={task.id}
      disabled={task.isDone && settings ? true : false}
    >
      <span
        style={{
          textDecoration: task.isDone && settings == false ? 'line-through' : 'none',
        }}
      >
        {task.name}
      </span>
    </Checkbox>
  </>
));
```

However, this component requires another one (`TaskModal`).

- Create an `admin/src/components/TaskModal/index.js` with the following code:

```js
// admin/src/components/TaskModal/index.js
import React, { useState } from 'react';
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  TextInput,
} from '@strapi/design-system';

import { useCMEditViewDataManager } from '@strapi/helper-plugin';

import axiosInstance from '../../utils/axiosInstance';

const TaskModal = ({ handleClose, refetchTasks }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState();

  const { slug, initialData } = useCMEditViewDataManager();

  const handleSubmit = async e => {
    // Prevent submitting parent form
    e.preventDefault();
    e.stopPropagation();

    try {
      // Show loading state
      setStatus('loading');

      // Create task and link it to the related entry
      await axiosInstance.post('/content-manager/collection-types/plugin::todo.task', {
        name,
        isDone: false,
        related: {
          __type: slug,
          id: initialData.id,
        },
      });

      // Refetch tasks list so it includes the created one
      await refetchTasks();

      // Remove loading and close popup
      setStatus('success');
      handleClose();
    } catch (e) {
      setStatus('error');
    }
  };

  const getError = () => {
    // Form validation error
    if (name.length > 40) {
      return 'Content is too long';
    }
    // API error
    if (status === 'error') {
      return 'Could not create todo';
    }
    return null;
  };

  return (
    <ModalLayout onClose={handleClose} labelledBy="title" as="form" onSubmit={handleSubmit}>
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          Add todo
        </Typography>
      </ModalHeader>
      <ModalBody>
        <TextInput
          placeholder="What do you need to do?"
          label="Name"
          name="text"
          hint="Max 40 characters"
          error={getError()}
          onChange={e => setName(e.target.value)}
          value={name}
        />
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={handleClose} variant="tertiary">
            Cancel
          </Button>
        }
        endActions={
          <Button type="submit" loading={status === 'loading'}>
            {status === 'loading' ? 'Saving...' : 'Save'}
          </Button>
        }
      />
    </ModalLayout>
  );
};

export default TaskModal;
```

The most important thing here, is that we create tasks using the Content Manager API:

```js
await axiosInstance.post('/content-manager/collection-types/plugin::todo.task', {
  name,
  isDone: false,
  related: {
    __type: slug,
    id: initialData.id,
  },
});
```

We create the association by adding a `related` object containing the `id` of the current entry and the internal `slug` for the `__type` field. A task creation for an article will have this data:

```js
{
  name, // name of the task
  isDone: false,
  related: {
    __type: "api::article.article",
    id: initialData.id, // id of the article
  },
}
```

As mentioned at the beginning of this guide, you can make your task content-type invisible in the admin:

```json
// ./src/plugins/todo/server/content-types/task/schema.json
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
    // option to make your content-type invisible
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

Your todo plugin should be 100% working now. Give it a try.

This guide doesn't cover yet [middlewares](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) and [policies](/developer-docs/latest/development/backend-customization/policies.html), this will come later.

## Publish on npm

Publishing your plugin on npm will allow anyone to use it in their Strapi project. Also, if you want to submit it on the Strapi Marketplace, this is mandatory to publish it first on npm.

But before publishing on npm, you must push it on GitHub. In order to develop your plugin, you might have, or not, develop your plugin in a Strapi project. The thing is, you don't want to push your Strapi application, only your plugin.

**Note:** You might already have pushed your code on GitHub, perfect you can skip this and go to the npm part down below.

#### Make your plugin open-source on GitHub

- Create a new public repository on GitHub.
- Be sure to be in the root of your plugin (`./src/plugins/<plugin-namem>`) and create a new repository from there:

```
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<github_username>/<github_repository_name>.git
git push -u origin main
```

Your plugin is now open-source.

:::caution
If you are willing to list your plugin on the Strapi Marketplace, be sure to check the [guidelines](https://strapi.io/marketplace/guidelines) first. When your `package.json` is ready, push it on GitHub and proceed to publish it on npm.

This is what a very basic plugin `package.json` looks like:

```JSON
{
  "name": "@strapi/plugin-seo",
  "version": "1.7.2",
  "description": "Make your Strapi content SEO friendly.",
  "strapi": { // This section is the most important
    "name": "seo",
    "displayName": "SEO",
    "description": "Make your Strapi content SEO friendly.",
    "kind": "plugin"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/strapi/strapi-plugin-seo.git"
  },
  "dependencies": {
    "eslint-plugin-react-hooks": "^4.3.0",
    "lodash": "^4.17.21",
    "showdown": "^1.9.1"
  },
  "resolutions": {
    "yargs": "^17.2.1"
  },
  "peerDependencies": {
    "@strapi/strapi": "^4.0.0" // This is mandatory for the marketplace
  },
  "author": {
    "name": "Strapi Solutions SAS",
    "email": "hi@strapi.io",
    "url": "https://strapi.io"
  },
  "maintainers": [
    {
      "name": "Strapi Solutions SAS",
      "email": "hi@strapi.io",
      "url": "https://strapi.io"
    }
  ],
  "engines": {
    "node": ">=12.x. <=16.x.x",
    "npm": ">=6.0.0"
  },
  "license": "MIT"
}
```

:::

Don't forget to provide a complete README.md that explains what your plugin is about at the root of your plugin. It will be the content of your npm package page.

### Publishing on npm

We assume that you have a npm account in order to follow this section.
You can create two kinds of public packages. You'll see how to publish them accordingly just below.

#### Scoped package

Scopes are a way of grouping related packages together and also affect a few things about the way npm treats the package.

Each npm user/organization has its own scope, and only you can add packages to your scope. This means you don't have to worry about someone taking your package name ahead of you. Thus it is also a good way to signal official packages for organizations.

Scoped packages are private by default. You'll need to use a specific option to make it public during the publishing process.

At Strapi, we are using the `@strapi` scope. Every plugin developed by use will be scoped packages like this: `@strapi/<plugin-name>`

#### Publish a scoped package

Be sure that everything in your `package.json` is fine, it is recommended to have a `1.0.0` version to start with.

- Run the following command to publish your package on npm:

```bash
npm publish --access public
```

By default, scoped packages are private, this `--access public` option will make it public.

#### Unscoped packaged

Unscoped packages are always public and are referred to by the package name only: strapi-plugin-...

#### Publish a unscoped package

- Run the following command to publish your package on npm:

```bash
npm publish
```

Your plugin is now live on npm. You can now install this plugin in a Strapi project by running the following command:

:::: tabs card

::: tab yarn

```bash
yarn add strapi-plugin-<name>
```

:::

::: tab npx

```bash
npm install strapi-plugin-<name>
```

:::

::::

### Managing your plugin

You might bring updates, features, or patches to your plugin. To do this, you'll need to update the code on GitHub but also update the package on npm.

The [npm version](https://docs.npmjs.com/cli/v7/commands/npm-version) command allows you to automatically update the version of your package while creating a commit also:

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]
```

If you want to push a patch to your package you can execute the following command:

```bash
npm version patch
```

It will create a commit with a tag associated with the version, and update the version in your `package.json` file. Assuming that your actual package version is `1.0.0`, for a patch it will be `1.0.1`, `1.1.0` for a minor, and `2.0.0` for a major.

- Push your code on GitHub by making a PR and merging or directly pushing on the main branch.
- Push the tag that npm created for you:

```bash
git push origin v1.0.1
```

If you browse the tags of your plugin on GitHub, you should see your new tag. You can make a release out of it to explain what were the modifications or not.

Then, you can run:

```bash
npm publish --access public # option for scoped package only
```

## Publish on the marketplace

If you follow the guide, you might be ready to submit your plugin on the Strapi marketplace. Again, be sure to read the [guidelines](https://strapi.io/marketplace/guidelines).

[Submit my plugin on the Marketplace](https://market.strapi.io/submit-plugin)
