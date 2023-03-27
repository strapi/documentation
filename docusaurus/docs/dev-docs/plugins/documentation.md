---
title: API Documentation
displayed_sidebar: devDocsSidebar
description: By using Swagger UI, the API documentation plugin takes out most of your pain to generate your documentation.
---

# API Documentation

The Documentation plugin is useful to document the available endpoints once you created an API.

If installed, the Documentation plugin will inspect content types and routes found on all APIs in your project and any plugin specified in the configuration. The plugin will then programmatically generate documentation to match the [OpenAPI specification](https://swagger.io/specification/). The Documentation plugin generates the [paths objects](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#paths-object) and [schema objects](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#schema-object) and converts all Strapi types to [OpenAPI data types](https://swagger.io/docs/specification/data-models/data-types/).

## Installation

To install the plugin run following command in your terminal:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi install documentation
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi install documentation
```

</TabItem>

</Tabs>

Once the plugin is installed, starting the application generates the API documentation.

## Swagger UI

The documentation plugin visualizes your API using [Swagger UI](https://swagger.io/tools/swagger-ui/). To access the UI, select "Documentation" in the left sidebar under the "plugins" section. Then click "Open documentation" to open the Swagger UI. Using the Swagger UI you can view all of the endpoints available on your API and trigger API calls.

### Authenticated requests

Strapi is secured by default, which means that most of your end-points require the user to be authorized. If the action has not been set to public in users and permission then you must provide your JWT. To do this, click the “Authorize” button and paste your JWT.

## Administration panel

This plugin comes with an interface that is available in your administration panel and a configuration file.

### Restrict the access to your API documentation

By default, your documentation will be accessible by anyone.

If you want to restrict API documentation access, you must enable the **Restricted Access** option.

- Go to **Settings**, **Documentation**
- Toggle **Restricted Access** to `ON`
- Select a password in the `password` input
- Save your settings

The API documentation is now password restricted.

### Regenerate documentation

There are 2 ways to update the documentation after making changes to your API. 

1. Restart your application to regenerate the version of the documentation specified in the documentation plugin's config.
2. Go to the Documentation plugin page and click the **regenerate** button for the documentation version you want to regenerate.

## Configuration

The documentation plugin is initialized with the following config. All of these properties can be altered by providing new values to the documentation plugin's config object in `config/plugins.js`.

```js
{
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'DOCUMENTATION',
    description: '',
    termsOfService: 'YOUR_TERMS_OF_SERVICE_URL',
    contact: {
      name: 'TEAM',
      email: 'contact-email@something.io',
      url: 'mywebsite.io'
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
    },
  },
  'x-strapi-config': {
		// Leave empty to ignore plugins during generation
    plugins: [ 'upload', 'users-permissions'],
    path: '/documentation',
  },
  servers: [{ url: 'http://localhost:1337/api/api', description: 'Development server' }],
  externalDocs: {
    description: 'Find out more',
    url: 'https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html'
  },
  security: [ { bearerAuth: [] } ]
}
```

### Create a new version of the documentation

To create a new version of your documentation, update the `version` key

```js title="config/plugin.js"

module.exports = {
  documentation: {
    enabled: true,
    config: {
      info: { version: "2.0.0" },
    },
  },
};
```

### Indicate which plugins need documentation generated

If you want plugins to be included in documentation generation they should be included in the `plugins` array on the `x-strapi-config`. By default this array is initialized with `["upload", "users-permissions"]`.

Similarly, if you do not want plugins to be included in documentation generation, provide an empty array.

```js title="config/plugins.js"

module.exports = {
  documentation: {
    enabled: true,
    config: {
      "x-strapi-config": {
        // Default
        plugins: ["upload", "users-permissions"],
        // Custom
        plugins: ["upload"],
        // Do not generate for plugins
        plugins: [],
      },
    },
  },
};
```

## Overriding the generated documentation

### Excluding from generation

If you simply want to exclude certain apis or plugins from being generated you can use the `excludeFromGeneration` found on the documentation plugin’s `override` service in your application or plugin's [`register` lifecycle](http://localhost:8080/dev-docs/api/plugins/admin-panel-api#register).


**`excludeFromGeneration()`**

| Parameter | Type                       | Description                                              |
| --------- | -------------------------- | -------------------------------------------------------- |
| api       | String or Array of Strings | The name of the api/plugin, or list of names, to exclude |

**Example**:

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

### Providing replacement documentation

If the documentation plugin fails to generate what you expect, it is possible to replace what has been generated.

The documentation plugin exposes an API that allows you to replace what was generated for the following OpenAPI root level keys: `paths`, `tags`, `components` .

To provide an override, use the `registerOverride` function found on the Documentation plugin’s `override` service in your application or plugin's [`register` lifecycle](http://localhost:8080/dev-docs/api/plugins/admin-panel-api#register).

**`registerOverride()`**

| Parameter                     | Type                      | Description                                                                                                   |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| override                      | Object                    | OpenAPI object including any of the following keys paths, tags, components. Accepts JavaScript, JSON, or yaml |
| options                       | Object                    | Accepts pluginOrigin and excludeFromGeneration                                                                |
| options.pluginOrigin          | String                    | The plugin that is registering the override                                                                   |
| options.excludeFromGeneration | String or Array of String | The name of the api/plugin, or list of names, to exclude                                                      |

:::note
Plugin developers providing an override should always specify the `pluginOrigin` options key, otherwise the override will run regardless of the user’s config.
:::

The Documentation plugin will use the registered overrides to replace the value of common keys on the generated documentation with what the override provides. If no common keys are found, the plugin will add new keys to the generated documentation.

If the override completely replaces what the documentation generates then you can specify that generation is no longer necessary by providing the names of the apis or plugins to exclude in the options key array `excludeFromGeneration`.

If the override should only be applied to a specific version then the override must include a value for `info.version` , otherwise the override will run on all documentation versions.

**Example:**

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

The documentation plugin’s config also accepts a `mutateDocumentation` function on `info['x-strapi-config']`. This function receives a draft state of the generated documentation that be can be mutated. It should only be applied from an application and has the final say in what the OpenAPI schema will look like.

**`mutateDocumentation()`**

| Parameter                   | Type   | Description                                                            |
| --------------------------- | ------ | ---------------------------------------------------------------------- |
| generatedDocumentationDraft | Object | The generated documentation with applied overrides as a mutable object |

**Example:**

```js title="config/plugins.js"

module.exports = {
  documentation: {
    config: {
      "x-strapi-config": {
        mutateDocumentation: (generatedDocumentationDraft) => {
          generatedDocumentationDraft.paths[
            "/answer-to-everything"
          ].get.responses["200"].description = "*";
        },
      },
    },
  },
};
```
