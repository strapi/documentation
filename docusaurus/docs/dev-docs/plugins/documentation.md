---
title: Documentation plugin
displayed_sidebar: cmsSidebar
description: By using Swagger UI, the API documentation plugin takes out most of your pain to generate your documentation.
toc_max_heading_level: 5
tags:
- admin panel 
- excludeFromGeneration function
- OpenAPI specification
- override service 
- pluginOrigin 
- plugins 
- register function
- Swagger UI
---

# Documentation plugin

The Documentation plugin automates your API documentation creation. It basically generates a swagger file. It follows the [Open API specification version](https://swagger.io/specification/).

<Guideflow lightId="5pvjz4zswp" darkId="6kw4vdwizp"/>

If installed, the Documentation plugin will inspect content types and routes found on all APIs in your project and any plugin specified in the configuration. The plugin will then programmatically generate documentation to match the [OpenAPI specification](https://swagger.io/specification/). The Documentation plugin generates the [paths objects](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#paths-object) and [schema objects](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#schema-object) and converts all Strapi types to [OpenAPI data types](https://swagger.io/docs/specification/data-models/data-types/).

The generated documentation JSON file can be found in your application at the following path: `src/extensions/documentation/documentation/<version>/full_documentation.json`

## Installation

To install the documentation plugin, run following command in your terminal:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add @strapi/plugin-documentation
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install @strapi/plugin-documentation
```

</TabItem>

</Tabs>

Once the plugin is installed, starting Strapi generates the API documentation.

## Configuration

Most configuration options for the Documentation plugin are handled via your Strapi project's code. A few settings are available in the admin panel.

### Admin panel settings

The Documentation plugin affects multiple parts of the admin panel. The following table lists all the additional options and settings that are added to a Strapi application once the plugin has been installed:

| Section impacted    | Options and settings         |
|------------------|-------------------------------------------------------------|
| Documentation    | <ul>Addition of a new Documentation option in the main navigation ![Documentation plugin icon](/img/assets/icons/v5/info.svg) which shows a panel with buttons to ![Eye icon](/img/assets/icons/v5/Eye.svg) open and ![Regenerate icon](/img/assets/icons/v5/ArrowClockwise.svg) regenerate the documentation.</ul>        |
| Settings     | <ul><li>Addition of a "Documentation plugin" setting section, which controls whether the documentation endpoint is private or not (see [restricting access](#restricting-access)).<br/> 👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Documentation plugin* </li><br/>  <li> Activation of role based access control for accessing, updating, deleting, and regenerating the documentation. Administrators can authorize different access levels to different types of users in the *Plugins* tab and the *Settings* tab (see [Users & Permissions documentation](/user-docs/users-roles-permissions/configuring-administrator-roles#editing-a-role)).<br/>👉 Path reminder: ![Settings icon](/img/assets/icons/v5/Cog.svg) *Settings > Administration Panel > Roles* </li></ul>| 

#### Restricting access to your API documentation {#restricting-access}

By default, your API documentation will be accessible by anyone.

To restrict API documentation access, enable the **Restricted Access** option from the admin panel:

1. Navigate to ![Cog icon](/img/assets/icons/v5/Cog.svg) *Settings* in the main navigation of the admin panel.
2. Choose **Documentation**.
3. Toggle **Restricted Access** to `ON`.
4. Define a password in the `password` input.
5. Save the settings.

### Code-based configuration

To configure the Documentation plugin, create a `settings.json` file in the `src/extensions/documentation/config` folder. In this file, you can specify all your environment variables, licenses, external documentation links, and all the entries listed in the [specification](https://swagger.io/specification/). 

The following is an example configuration:

```json title="src/extensions/documentation/config/settings.json"
{
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "DOCUMENTATION",
    "description": "",
    "termsOfService": "YOUR_TERMS_OF_SERVICE_URL",
    "contact": {
      "name": "TEAM",
      "email": "contact-email@something.io",
      "url": "mywebsite.io"
    },
    "license": {
      "name": "Apache 2.0",
      "url": "https://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  "x-strapi-config": {
    "plugins": ["upload", "users-permissions"],
    "path": "/documentation"
  },
  "servers": [
    {
      "url": "http://localhost:1337/api",
      "description": "Development server"
    }
  ],
  "externalDocs": {
    "description": "Find out more",
    "url": "https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html"
  },
  "security": [
    {
      "bearerAuth": []
    }
  ]
}
```

:::tip
If you need to add a custom key, prefix it by `x-` (e.g., `x-strapi-something`).
:::

#### Creating a new version of the documentation

To create a new version, change the `info.version` key in the `settings.json` file:

```json title="src/extensions/documentation/config/settings.json"
{
  "info": {
    "version": "2.0.0"
  }
}
```

This will automatically create a new version.

#### Defining which plugins need documentation generated

If you want plugins to be included in documentation generation, they should be included in the `plugins` array in the `x-strapi-config` object. By default, the array is initialized with `["upload", "users-permissions"]`:

```json title="src/extensions/documentation/config/settings.json"
{
  "x-strapi-config": {
    "plugins": ["upload", "users-permissions"]
  }
}
```

To add more plugins, such as your custom plugins, add their name to the array.

If you do not want plugins to be included in documentation generation, provide an empty array (i.e., `plugins: []`).

#### Overriding the generated documentation

The Documentation plugins comes with 3 methods to override the generated documentation: [`excludeFromGeneration`](#exclude-from-generation), [`registerOverride`](#register-override), and [`mutateDocumentation`](#mutate-documentation).

<h3 id="exclude-from-generation"><code>excludeFromGeneration</code></h3>

To exclude certain APIs or plugins from being generated, use the `excludeFromGeneration` found on the documentation plugin’s `override` service in your application or plugin's [`register` lifecycle](/dev-docs/plugins/admin-panel-api#register).

:::note
`excludeFromGeneration` gives more fine-grained control over what is generated.

For example, pluginA might create several new APIs while pluginB may only want to generate documentation for some of those APIs. In that case, pluginB could still benefit from the generated documentation it does need by excluding only what it does not need.
:::

*****

| Parameter | Type                       | Description                                              |
| --------- | -------------------------- | -------------------------------------------------------- |
| `api`       | String or Array of Strings | The name of the API/plugin, or list of names, to exclude |

```js title="Application or plugin register lifecycle"

module.exports = {
  register({ strapi }) {
    strapi
      .plugin("documentation")
      .service("override")
      .excludeFromGeneration("restaurant");
    // or several
    strapi
      .plugin("documentation")
      .service("override")
      .excludeFromGeneration(["address", "upload"]);
  }
}
```

<h3 id="register-override"><code>registerOverride()</code></h3>

If the Documentation plugin fails to generate what you expect, it is possible to replace what has been generated.

The Documentation plugin exposes an API that allows you to replace what was generated for the following OpenAPI root level keys: `paths`, `tags`, `components` .

To provide an override, use the `registerOverride` function found on the Documentation plugin’s `override` service in your application or plugin's [`register` lifecycle](/dev-docs/plugins/admin-panel-api#register).

| Parameter                     | Type                      | Description                                                                                                   |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `override`                     | Object                    | OpenAPI object including any of the following keys paths, tags, components. Accepts JavaScript, JSON, or yaml |
| `options`                      | Object                    | Accepts `pluginOrigin` and `excludeFromGeneration`                                                               |
| `options.pluginOrigin`          | String                    | The plugin that is registering the override                                                                   |
| `options.excludeFromGeneration` | String or Array of String | The name of the API/plugin, or list of names, to exclude                                                      |

:::caution
Plugin developers providing an override should always specify the `pluginOrigin` options key. Otherwise the override will run regardless of the user’s configuration.
:::

The Documentation plugin will use the registered overrides to replace the value of common keys on the generated documentation with what the override provides. If no common keys are found, the plugin will add new keys to the generated documentation.

If the override completely replaces what the documentation generates, you can specify that generation is no longer necessary by providing the names of the APIs or plugins to exclude in the options key array `excludeFromGeneration`.

If the override should only be applied to a specific version, the override must include a value for `info.version`. Otherwise, the override will run on all documentation versions.

```js title="Application or plugin register lifecycle"

module.exports = {
  register({ strapi }) {
    if (strapi.plugin('documentation')) {
      const override = {
        // Only run this override for version 1.0.0
        info: { version: '1.0.0' },
        paths: {
          '/answer-to-everything': {
            get: {
              responses: { 200: { description: "*" }}
            }
          }
        }
      }

      strapi
        .plugin('documentation')
        .service('override')
        .registerOverride(override, {
          // Specify the origin in case the user does not want this plugin documented
          pluginOrigin: 'upload',
          // The override provides everything don't generate anything
          excludeFromGeneration: ['upload'],
        });
    }
  },
}
```

The overrides system is provided to try and simplify amending the generated documentation. It is the only way a plugin can add or modify the generated documentation.

<h3 id="mutate-documentation"><code>mutateDocumentation()</code></h3>

The Documentation plugin’s configuration also accepts a `mutateDocumentation` function on `info['x-strapi-config']`. This function receives a draft state of the generated documentation that be can be mutated. It should only be applied from an application and has the final say in the OpenAPI schema.

| Parameter                   | Type   | Description                                                            |
| --------------------------- | ------ | ---------------------------------------------------------------------- |
| `generatedDocumentationDraft` | Object | The generated documentation with applied overrides as a mutable object |

```js title="config/plugins.js"

module.exports = {
  documentation: {
    config: {
      "x-strapi-config": {
        mutateDocumentation: (generatedDocumentationDraft) => {
          generatedDocumentationDraft.paths[
            "/answer-to-everything" // must be an existing path
          ].get.responses["200"].description = "*";
        },
      },
    },
  },
};
```

## Usage

The Documentation plugin visualizes your API using [Swagger UI](https://swagger.io/tools/swagger-ui/). To access the UI, select ![Documentation plugin icon](/img/assets/icons/v5/info.svg) in the main navigation of the admin panel. Then click **Open documentation** to open the Swagger UI. Using the Swagger UI you can view all of the endpoints available on your API and trigger API calls.

:::tip
Once the plugin is installed, the plugin user interface can be accessed at the following URL:
`<server-url>:<server-port>/documentation/<documentation-version>`
(e.g., [`localhost:1337/documentation/v1.0.0`](http://localhost:1337/documentation/v1.0.0)).
:::

### Regenerating documentation

There are 2 ways to update the documentation after making changes to your API:

- restart your application to regenerate the version of the documentation specified in the Documentation plugin's configuration,
- or go to the Documentation plugin page and click the **regenerate** button for the documentation version you want to regenerate.

### Authenticating requests

Strapi is secured by default, which means that most of your endpoints require the user to be authorized. If the CRUD action has not been set to Public in the [Users & Permissions plugin](/user-docs/features/users-permissions#configuring-end-user-roles) then you must provide your JSON web token (JWT). To do this, while viewing the API Documentation, click the **Authorize** button and paste your JWT in the _bearerAuth_ _value_ field.
