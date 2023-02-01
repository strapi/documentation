---
title: Plugins configuration - Strapi Developer Docs
description: Strapi plugins have a single entry point file to define their configurations.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.html
---

# Plugins configuration

The configurations for all plugins are stored in `./config/plugins.js` (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)). Each plugin can be configured with the following available parameters:

| Parameter                  | Description                                                                                                                                                            | Type    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `enabled`                  | Enable (`true`) or disable (`false`) an installed plugin                                                                                                               | Boolean |
| `config`<br><br>_Optional_ | Used to override default plugin configuration ([defined in strapi-server.js](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#configuration)) | Object  |
| `resolve`<br> _Optional, only required for local plugins_             | Path to the plugin's folder                                                                                                                                            | String  |

<code-group>
<code-block title="JAVASCRIPT">


```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  // enable a plugin that doesn't require any configuration
  i18n: true,

  // enable a custom plugin
  myplugin: {
    // my-plugin is going to be the internal name used for this plugin
    enabled: true,
    resolve: './src/plugins/my-local-plugin',
    config: {
      // user plugin config goes here
    },
  },

  // disable a plugin
  myotherplugin: {
    enabled: false, // plugin installed but disabled
  },
});
```

</code-block>

<code-block title="TYPESCRIPT">


```js
// path: ./config/plugins.ts

export default ({ env }) => ({
  // enable a plugin that doesn't require any configuration
  i18n: true,

  // enable a custom plugin
  myplugin: {
    // my-plugin is going to be the internal name used for this plugin
    enabled: true,
    resolve: './src/plugins/my-local-plugin',
    config: {
      // user plugin config goes here
    },
  },

  // disable a plugin
  myotherplugin: {
    enabled: false, // plugin installed but disabled
  },
});
```

</code-block>
</code-group>


:::tip
If no specific configuration is required, a plugin can also be declared with the shorthand syntax `'plugin-name': true`.
:::

## GraphQL configuration

The [GraphQL plugin](/developer-docs/latest/plugins/graphql.md) has the following specific configuration options that should be declared in a `graphql.config` object. All parameters are optional:

| Parameter          | Description                                                                                                                                                   | Type    | Default |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| `apolloServer`     | Additional configuration for [`ApolloServer`](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#apolloserver).                   | Object  | `{}`    |
| `artifacts`        | Object containing filepaths, defining where to store generated artifacts. Can include the following properties: <ul><li>`schema`: path to the generated GraphQL schema file</li><li>`typegen`: path to generated TypeScript types</li></ul>Only works if `generateArtifacts` is set to `true`.  | Object  | <ul><li>`schema: false`</li><li>`typegen: false`</li></ul> |
| `defaultLimit` | Default value for [the `pagination[limit]` parameter](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md#pagination-by-offset) used in API calls | Integer | 100 |
| `depthLimit`       | Limits the [complexity of GraphQL queries](https://www.npmjs.com/package/graphql-depth-limit).                                                                 | Integer  | `10`    |
| `endpoint`         | The URL path on which the plugin is exposed | String | `/graphql` |
| `generateArtifacts`| Whether Strapi should automatically generate and output a GraphQL schema file and corresponding TypeScript definitions.<br/><br/>The file system location can be configured through `artifacts`.  | Boolean | `false` |
| `maxLimit`         | Maximum value for [the `pagination[limit]` parameter](/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.md#pagination-by-offset) used in API calls                                                                                                              | Integer  | `-1`    |
| `playgroundAlways` | Whether the playground should be publicly exposed.<br/><br/>Enabled by default in if `NODE_ENV` is set to `development`.                                        | Boolean | `false`  |
| `shadowCRUD`       | Whether type definitions for queries, mutations and resolvers based on models should be created automatically (see [Shadow CRUD documentation](/developer-docs/latest/plugins/graphql.md#shadow-crud)). | Boolean | `true` |
| `subscriptions`    | Enable GraphQL subscriptions (experimental feature).                                                                                                                                 | Boolean | `false` |

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./config/plugins.js

module.exports = () => ({
  graphql: {
    enabled: true,
    config: {
      playgroundAlways: false,
      defaultLimit: 10,
      maxLimit: 20,
      apolloServer: {
        tracing: true,
      },
    }
  }
})
```


</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/plugins.ts

export default () => ({
  graphql: {
    enabled: true,
    config: {
      playgroundAlways: false,
      defaultLimit: 10,
      maxLimit: 20,
      apolloServer: {
        tracing: true,
      },
    }
  }
})
```


</code-block>
</code-group>

