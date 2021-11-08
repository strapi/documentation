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

:::: note
If the Strapi project was created with the [starter CLI](https://strapi.io/blog/announcing-the-strapi-starter-cli), its structure includes both a `frontend` and `backend` folder, where the `backend` folder has the default structure.

::: details Structure of a project created with the starter CLI

```sh
my-project
├─── frontend # starter folder
├─── backend  # template folder, has the default structure of a project
└─── node_modules
```

:::
::::

The default structure of a Strapi project created without the starter CLI looks like the following:

<!-- TODO: remove /documentation from URLs once moved to docs.strapi.io -->

<pre>
  <code>
. <span class="token comment"># root of the application</span>
├──── .cache <span class="token comment"># files used to build the admin panel</span>
├──── .tmp
├──── <a href="/developer-docs/latest/development/admin-customization.html#build">build</a> <span class="token comment"># build of the admin panel</span>
├──── config <span class="token comment"># API configurations</span>
│     ├──── src
│     │     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks">cron-tasks.js</a>
│     │     └ response-handlers.js
│     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/api.html">api.js</a>
│     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/required/admin.html">admin.js</a>
│     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html#database-configuration">database.js</a>
│     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.html">middleware.js</a>
│     ├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.html">plugins.js</a>
│     └ <a href="/developer-docs/latest/setup-deployment-guides/configurations/required/server.html#server-configuration">server.js</a>
├──── database
│     └──── migrations
├──── node_modules <span class="token comment"># npm packages used by the project</span>
├──── <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.html">public</a> <span class="token comment"># files accessible to the outside world</span>
│     └──── uploads
├──── src
│     ├──── admin <span class="token comment"># admin customization files</span>
│     │     ├ <a href="/developer-docs/latest/development/admin-customization.html#configuration-options">app.js</a>
│     │     └ <a href="/developer-docs/latest/development/admin-customization.html#webpack-configuration">webpack.config.js</a>
│     ├──── api <span class="token comment"># business logic of the project split into sub-folders per API</span>
│     │     └──── (api-name)
│     │           ├──── <a href="/developer-docs/latest/development/backend-customization/models.html">content-types</a>
│     │           │     └──── (content-type-name)
│     │           │           └ <a href="/developer-docs/latest/development/backend-customization/models.html#model-schema">schema.json</a>
│     │           ├──── <a href="/developer-docs/latest/development/backend-customization/controllers.html">controllers</a>
│     │           ├──── <a href="/developer-docs/latest/development/backend-customization/policies.html">policies</a>
│     │           ├──── <a href="/developer-docs/latest/development/backend-customization/routing.html">routes</a>
│     │           ├──── <a href="/developer-docs/latest/development/backend-customization/services.html">services</a>
│     │           └ index.js
│     ├──── <a href="/developer-docs/latest/development/backend-customization/models.html">components</a>
│     │     └──── (category-name)
│     │           ├ (componentA).json
│     │           └ (componentB).json
│     ├──── <a href="/developer-docs/latest/development/plugins-extension.html">extensions</a> <span class="token comment"># files to extend installed plugins</span>
│     │     └──── (plugin-to-be-extended)
│     │           ├──── content-types
│     │           │     └──── (content-type-name)
│     │           │           └ schema.json
│     │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">strapi-server.js</a>
│     ├──── <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/middlewares.html">middlewares</a>
│     │     └──── (middleware-name)
│     │           ├ defaults.json
│     │           └ index.js
│     ├──── <a href="/developer-docs/latest/development/plugins-development.html">plugins</a> <span class="token comment"># local plugins files</span>
│     │     └──── (plugin-name)
│     │           ├──── admin
│     │           │     └──── src
│     │           │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html">index.js</a>
│     │           ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">server</a>
│     │           ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html#controllers">controllers</a>
│     │           ├──── <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html#policies">policies</a>
│     │           ├ package.json
│     │           ├ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html">strapi-admin.js</a>
│     │           └ <a href="/developer-docs/latest/developer-resources/plugin-api-reference/server.html">strapi-server.js</a>
│     ├─── <a href="/developer-docs/latest/development/backend-customization/policies.html">policies</a>
│     └ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.html">index.js</a> <span class="token comment"># include register(), bootstrap() and destroy() functions</span>
├ <a href="/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html">.env</a>
└ package.json
  </code>
</pre>
