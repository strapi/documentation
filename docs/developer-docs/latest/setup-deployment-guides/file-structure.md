---
title: Project Structure - Strapi Developer Documentation
description: Discover the project structure of any default Strapi application.
---

<style lang="scss" scoped>
  pre {
    a {
      color: #ffbf00;
      font-weight: 600;
      /* letter-spacing: .1px; */
    }
  }
</style>

# Project structure

By default, the structure of your Strapi project looks as shown below:

<!-- ? where are the controllers, functions and services when you create custom ones ? -->
<!-- ? where is the custom 404 message file ? -->
<!-- ? where will EE files and folders be ? -->
<!-- ? are both .cache and build folders used to build the admin panel ? -->

::: strapi Interactive map
The folder structure below is interactive. You can click on highlighted elements to go directly to the dedicated documentation.
:::

<!-- TODO: remove /documentation from URLs once moved to docs.strapi.io -->

<pre>
  <code>
. <span class="token comment"># root of the application</span>
├──── .cache <span class="token comment"># files used to build the admin panel</span>
├──── .tmp
├──── <a href="/documentation/developer-docs/latest/development/admin-customization.html#build">build</a> <span class="token comment"># build of the admin panel</span>
├──── config <span class="token comment"># API configurations</span>
│     ├──── src
│     │     ├ <a href="/documentation/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.md#cron-tasks">cron-tasks.js</a>
│     │     └ response-handlers.js
│     ├ <a href="/documentation/developer-docs/latest/setup-deployment-guides/configurations/optional/api.html">api.js</a>
│     ├ <a href="/documentation/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html#database-configuration">database.js</a>
│     ├ <a href="/documentation/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.html">middleware.js</a>
│     ├ <a href="/documentation/developer-docs/latest/development/plugins-development.html#configuring-a-plugin">plugins.js</a>
│     └ <a href="/documentation/developer-docs/latest/setup-deployment-guides/configurations/required/server.html#server-configuration">server.js</a>
├──── database
│     └──── migrations
├──── node_modules <span class="token comment"># npm packages used by the project</span>
├──── <a href="/documentation/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.html">public</a> <span class="token comment"># files accessible to the outside world</span>
│     └──── uploads
├──── src
│     ├──── admin <span class="token comment"># admin customization files</span>
│     │     ├ <a href="/documentation/developer-docs/latest/development/admin-customization.html#changing-the-configuration">app.js</a>
│     │     └ <a href="/documentation/developer-docs/latest/development/admin-customization.html#customizing-the-webpack-configuration">webpack.config.js</a>
│     ├──── api <span class="token comment"># business logic of the project split into sub-folders per API</span>
│     │     └──── (api-name)
│     │           ├──── <a href="/documentation/developer-docs/latest/development/backend-customization/models.html">content-types</a>
│     │           │     └──── (content-type-name)
│     │           │           └ <a href="/documentation/developer-docs/latest/development/backend-customization/models.html#model-schema">schema.json</a>
│     │           ├──── <a href="/documentation/developer-docs/latest/development/backend-customization/controllers.html">controllers</a>
│     │           ├──── <a href="/documentation/developer-docs/latest/development/backend-customization/policies.html#how-to-create-a-policy">policies</a>
│     │           ├──── <a href="/documentation/developer-docs/latest/development/backend-customization/routing.html">routes</a>
│     │           ├──── <a href="/documentation/developer-docs/latest/development/backend-customization/services.html">services</a>
│     │           └ index.js
│     ├──── <a href="/documentation/developer-docs/latest/development/backend-customization/models.html#components">components</a>
│     │     └──── (category-name)
│     │           ├ (componentA).json
│     │           └ (componentB).json
│     ├──── <a href="/documentation/developer-docs/latest/development/plugins-extension.html">extensions</a> <span class="token comment"># files to extend installed plugins</span>
│     │     └──── (plugin-to-be-extended)
│     │           └──── content-types
│     │                 ├──── (content-type-name)
│     │                 │     └ schema.json
│     │                 └ <a href="/documentation/developer-docs/latest/developer-resources/plugin-api-reference/server.html">strapi-server.js</a>
│     ├──── <a href="/documentation/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.html">middlewares</a>
│     │     └──── (middleware-name)
│     │           ├ defaults.json
│     │           └ index.js
│     ├──── <a href="/documentation/developer-docs/latest/development/plugins-development.html">plugins</a> <span class="token comment"># local plugins files</span>
│     │     └──── (plugin-name)
│     │           ├──── admin
│     │           │     └──── src
│     │           │           └ <a href="/documentation/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html">index.js</a>
│     │           └──── <a href="/documentation/developer-docs/latest/developer-resources/plugin-api-reference/server.html">server</a>
│     │           ├ package.json
│     │           └ <a href="/documentation/developer-docs/latest/developer-resources/plugin-api-reference/server.html">strapi-server.js</a>
│     └─── <a href="">policies</a>
├ <a href="/documentation/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#configuration-using-environment-variables">.env</a>
└ .package.json
  </code>
</pre>
  
If the Strapi project was created with the [starter CLI](https://strapi.io/blog/announcing-the-strapi-starter-cli), the project structure looks like this:

```sh
my-project
├─── frontend # starter folder
├─── backend  # template folder
└─── node_modules
```

and the `backend` folder has the default structure described above.
