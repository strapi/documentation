---
title: Migrating the back end
description: Migrate the backend of a Strapi plugin from v3.6.x to v4.0.x with step-by-step instructions
displayed_sidebar: devDocsSidebar

---

import PluginMigrationIntro from '/docs/snippets/plugin-migration-intro.md'
import CodemodsModifySourceCode from '/docs/snippets/codemods-modify-source-code.md'

# v4 plugin migration: Migrating the back end

<PluginMigrationIntro components={props.components} />

Migrating the back end of a plugin to Strapi v4 requires:

- updating [Strapi packages](#updating-strapi-packages)
- updating content-types [getters](#updating-content-types-getters) and, optionally, [relations](#updating-content-types-relations)
- updating the [plugin configuration](#updating-plugin-configuration)

Depending on these steps, some actions can only be done manually while others can be performed automatically by scripts that modify the code, which are called codemods. The following table lists available options for each step of the migration:

| Action                         | Migration type                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Update Strapi packages                 | [Automatic](#automatic-strapi-packages-update) or [manual](#manual-strapi-packages-update)                             |
| Update content-types getters   | [Automatic](#automatic-content-types-getters-update) or [manual](#manual-content-types-getters-update) |
| Update content-types relations | [Manual](#updating-content-types-relations)                                                                    |
| Update configuration           | [Manual](#updating-plugin-configuration)                                                                              |

## Updating Strapi packages

:::strapi v3/v4 comparison
Package names in Strapi v3 are prefixed by `strapi-`.

Strapi v4 uses scoped packages.
:::

To migrate to Strapi v4, rename all Strapi packages from `strapi-package-name` to `@strapi/package-name`. This needs to be done in the `package.json` dependencies and anywhere the package is imported.

Strapi scoped packages can be updated [automatically](#automatic-strapi-packages-update) or [manually](#manual-strapi-packages-update).

### Automatic Strapi packages update

:::caution
<CodemodsModifySourceCode components={props.components} />
:::

To update Strapi scoped packages automatically:

1. Use the [`update-package-dependencies` codemod](https://github.com/strapi/codemods/blob/main/lib/v4/migration-helpers/update-package-dependencies.js) by running the following command:

    ```sh
    npx @strapi/codemods migrate:dependencies [path-to-strapi-plugin]
    ```

2. Use the [`update-strapi-scoped-imports` codemod](https://github.com/strapi/codemods/blob/main/lib/v4/transforms/update-strapi-scoped-imports.js) by running the following command:

    ```sh
    npx @strapi/codemods transform update-strapi-scoped-imports [path-to-file | folder]
    ```

### Manual Strapi packages update

To update Strapi scoped packages manually:

1. Rename all Strapi packages (e.g. `strapi-package-name`) in `package.json` to `@strapi/package-name`
2. Repeat for all instances where the package is imported.

## Updating content-types getters

:::strapi v3/v4 comparison
Strapi v3 models have been renamed to [content-types](/dev-docs/backend-customization/models.md#content-types) in Strapi v4.
:::

If the plugin declares models, update the syntax for all getters from `strapi.models` to `strapi.contentTypes`. The syntax can be updated [automatically](#automatic-content-types-getters-update) or [manually](#manual-content-types-getters-update).

### Automatic content-types getters update

:::caution
<CodemodsModifySourceCode />
:::

To update the syntax for content-types getters automatically, use the [`change-model-getters-to-content-types` codemod](https://github.com/strapi/codemods/blob/main/lib/v4/transforms/change-model-getters-to-content-types.js). The codemod replaces all instances of `strapi.models` with `strapi.contentTypes` in the indicated file or folder.

To use the codemod, run the following command in a terminal:

```jsx
npx @strapi/codemods transform change-model-getters-to-content-types [path-to-file | folder]
```

### Manual content-types getters update

To update the syntax for content-types getters manually, replace any instance of `strapi.models` with `strapi.contentTypes`.

:::tip
Strapi v4 introduced new getters that can be used to refactor the plugin code further (see [Server API usage documentation](/dev-docs/api/plugins/server-api.md#usage)).
:::

## Updating content-types relations

:::prerequisites
Updating content-types relations to Strapi v4 requires that the v3 models have been converted to Strapi v4 content-types (see [converting models to content-types documentation](/dev-docs/migration/v3-to-v4/plugin/update-folder-structure.md#converting-models-to-content-types)).
:::

:::strapi v3/v4 comparison
Strapi v3 defines relations between content-types with the `via`, `model` and `collection` properties in the model settings.

In Strapi v4, relations should be explicitly described in the `schema.json` file of the content-types (see [relations documentation](/dev-docs/backend-customization/models.md#relations)).
:::

If the plugin declares content-types with relations between them, migrating relations to Strapi v4 should be done manually in the [schema](/dev-docs/backend-customization/models.md#model-schema) of the content-types.

To update content-type relations, update the `server/content-types/<content-type-name>/schema.json` file for each content-type with the following procedure:

1. Declare the relation explicitly by setting the `type` attribute value to `"relation"`.

2. Define the type of relation with the `relation` property.<br/>The value should be a string among the following possible options: `"oneToOne"`, `"oneToMany"`, `"manyToOne"` or `"manyToMany"`.

3. Define the content-type target with the `target` property.<br/>The value should be a string following the `api::api-name.content-type-name` or `plugin::plugin-name.content-type-name` syntax convention.

4. (_optional_) In [bidirectional relations](/dev-docs/backend-customization/models.md#relations), define `mappedBy` and `inversedBy` properties on each content-type.

<details>
<summary>Example of all possible relations between an article and an author content-types</summary>

  ```json title="./src/plugins/my-plugin/server/content-types/article/schema.json"
  
  // Attributes for the Article content-type
  "articleHasOneAuthor": {
    "type": "relation",
    "relation": "oneToOne",
    "target": "api::author.author"
  },
  "articleHasAndBelongsToOneAuthor": {
    "type": "relation",
    "relation": "oneToOne",
    "target": "api::author.author",
    "inversedBy": "article"
  },
  "articleBelongsToManyAuthors": {
    "type": "relation",
    "relation": "oneToMany",
    "target": "api::author.author",
    "mappedBy": "article"
  },
  "authorHasManyArticles": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::author.author",
    "inversedBy": "articles"
  },
  "articlesHasAndBelongsToManyAuthors": {
    "type": "relation",
    "relation": "manyToMany",
    "target": "api::author.author",
    "inversedBy": "articles"
  },
  "articleHasManyAuthors": {
    "type": "relation",
    "relation": "oneToMany",
    "target": "api::author.author"
  }
  ```

  ```json title="./src/plugins/my-plugin/server/content-types/author/schema.json"

  // Attributes for the Author content-type
  "article": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::article.article",
    "inversedBy": "articleBelongsToManyAuthors"
  },
  "articles": {
    "type": "relation",
    "relation": "manyToMany",
    "target": "api::article.article",
    "inversedBy": "articlesHasAndBelongsToManyAuthors"
  }
  ```

</details>

## Updating plugin configuration

:::strapi v3/v4 comparison
Strapi v3 defines plugin configurations in a `config` folder.

In Strapi v4, the default configuration of a plugin is defined as an object found in the `config.js` file or in the `config/index.js` file. These are then called from the entry file (see [default plugin configuration documentation](/dev-docs/api/plugins/server-api.md#configuration)).
:::

To handle default plugin configurations in Strapi v4 the recommended way:

1. Create the `server/config/index.js` file containing an exported object.

2. Within the `config` object:
   - Define a `default` key that takes an object to store the default configuration.
   - (_optional_) Add a `validator` key, which is a function taking the `config` as an argument.

    <details>
      <summary>Example of a default plugin configuration</summary>

      ```jsx title="./src/plugins/my-plugin/server/config/index.js"

      module.exports = {
        default: { optionA: true },
        validator: (config) => {
          if (typeof config.optionA !== 'boolean') {
            throw new Error('optionA has to be a boolean');
          }
        },
      }
      ```

    </details>

3. In the `server/index.js` file, import the configuration and export it.

    <details>
      <summary>Example of a default entry file</summary>

      ```jsx title="./src/plugins/my-plugin/server/index.js"

      // ...
      const config = require('./config');
      // ...

      module.exports = {
        // ...
        config,
        // ...
      };
      ```

    </details>

4. Make sure that Strapi is aware of the plugin's back-end interface exported from `server/index.js` by adding the following line to the `<plugin-name>/strapi-server.js` entry file:

    ```jsx title="./src/plugins/my-plugin/strapi-server.js"

    module.exports = require('./server');
    ```
