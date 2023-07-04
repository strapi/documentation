---
title: Documentation
displayed_sidebar: devDocsSidebar
description: By using Swagger UI, the API documentation plugin takes out most of your pain to generate your documentation.
---

# Documentation plugin

The Documentation plugin is useful to document the available endpoints once you created an API.

If installed, the Documentation plugin will inspect content types and routes found on all APIs in your project and any plugin specified in the configuration. The plugin will then programmatically generate documentation to match the [OpenAPI specification](https://swagger.io/specification/). The Documentation plugin generates the [paths objects](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#paths-object) and [schema objects](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#schema-object) and converts all Strapi types to [OpenAPI data types](https://swagger.io/docs/specification/data-models/data-types/).

The generated documentation can be found in your application at the following path: `src/extensions/documentation/documentation/<version>/full_documentation.json`

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

The Documentation plugin visualizes your API using [Swagger UI](https://swagger.io/tools/swagger-ui/). To access the UI, select *Plugins > ![Documentation plugin icon](/img/assets/icons/documentation-plugin.svg) Documentation* in the main navigation of the admin panel. Then click **Open documentation** to open the Swagger UI. Using the Swagger UI you can view all of the endpoints available on your API and trigger API calls.

:::tip
Once installed, the Documentation plugin UI can be accessed at the following URL:
`<server-url>:<server-port>/documentation/<documentation-version>`
(e.g., [`localhost:1337/documentation/v1.0.0`](http://localhost:1337/documentation/v1.0.0)).
:::

### Authenticated requests

Strapi is secured by default, which means that most of your end-points require the user to be authorized. If the action has not been set to public in users and permission then you must provide your JWT. To do this, click the “Authorize” button and paste your JWT.

## Administration panel

This plugin comes with an interface that is available in your administration panel and a configuration file.

### Restrict the access to your API documentation

By default, your documentation will be accessible by anyone.

To restrict API documentation access, enable the **Restricted Access** option from the admin panel:

1. Navigate to ![Settings icon](/img/assets/icons/settings.svg) *Settings* in the main navigation of the admin panel.
2. Choose **Documentation**.
3. Toggle **Restricted Access** to `ON`.
4. Define a password in the `password` input.
5. Save the settings.

### Regenerate documentation

There are 2 ways to update the documentation after making changes to your API:

- restart your application to regenerate the version of the documentation specified in the Documentation plugin's configuration,
- or go to the Documentation plugin page and click the **regenerate** button for the documentation version you want to regenerate.

## Configuration

The Documentation plugin is initialized with the following configuration, where all properties can be altered by providing new values to the documentation plugin's configuration object in `config/plugins.js`:

```js
module.exports = {
  documentation: {
    enabled: true,
    config: {
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
      servers: [{ url: 'http://localhost:1337/api', description: 'Development server' }],
      externalDocs: {
        description: 'Find out more',
        url: 'https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html'
      },
      security: [ { bearerAuth: [] } ]
    }
  }
}
```

### Create a new version of the documentation

To create a new version of your documentation, update the `version` key as follows:

```js title="config/plugins.js"

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

If you want plugins to be included in documentation generation, they should be included in the `plugins` array on the `x-strapi-config`. By default, the array is initialized with `["upload", "users-permissions"]`.

Similarly, if you do not want plugins to be included in documentation generation, provide an empty array:

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

To exclude certain APIs or plugins from being generated, use the `excludeFromGeneration` found on the documentation plugin’s `override` service in your application or plugin's [`register` lifecycle](/dev-docs/api/plugins/admin-panel-api#register).

:::note
`excludeFromGeneration` gives more fine-grained control over what is generated.

For example, pluginA might create several new APIs while pluginB may only want to generate documentation for some of those APIs. In that case, pluginB could still benefit from the generated documentation it does need by excluding only what it does not need.
:::

**`excludeFromGeneration()`**

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

### Providing replacement documentation

If the Documentation plugin fails to generate what you expect, it is possible to replace what has been generated.

The Documentation plugin exposes an API that allows you to replace what was generated for the following OpenAPI root level keys: `paths`, `tags`, `components` .

To provide an override, use the `registerOverride` function found on the Documentation plugin’s `override` service in your application or plugin's [`register` lifecycle](/dev-docs/api/plugins/admin-panel-api#register).

**`registerOverride()`**

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

The Documentation plugin’s configuration also accepts a `mutateDocumentation` function on `info['x-strapi-config']`. This function receives a draft state of the generated documentation that be can be mutated. It should only be applied from an application and has the final say in the OpenAPI schema.

**`mutateDocumentation()`**

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
