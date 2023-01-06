---
title: Code migration - Content-Type Schema - Strapi Developer Docs
description: Migrate your content-types from Strapi v3.6.x to v4.0.x with step-by-step instructions
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/content-type-schema.html
sidebarDepth: 3
---

# v4 code migration: Updating content-type schemas <!-- omit in toc -->

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

Models in Strapi v4 have been completely overhauled: model files are located in `/content-types/` folders, various keys and settings have been removed, and the relation syntax has completely changed.

Migrating to Strapi v4 requires:

- [converting models to content-types](#convert-models-to-content-types),
- [updating content-type relations](#updating-content-type-relations),
- and [updating lifecycle hooks](#updating-lifecycle-hooks).

## Convert models to content-types

:::strapi v3/v4 comparison
Strapi v3 declares models in `<model-name>.settings.json` files found in a `models` folder.

In Strapi v4, [content-types](/developer-docs/latest/development/backend-customization/models.md#content-types) are declared in `schema.json` files found in `./src/api/<apiName>/content-types/<contentTypeName>` folder. The `schema.json` files introduce some new properties (see [schema documentation](/developer-docs/latest/development/backend-customization/models.md#model-schema)).
:::

::: note
Content-types can be created automatically with the [interactive CLI command `strapi generate`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate).
:::

To convert Strapi v3 models to v4 content-types:

1. Move the `./api` folder at the root of your project into `./src`:

    ```sh
    mkdir src # Only if you haven't created the `./src` folder
    mv api/ src/api/
    ```

2. Move/rename each content-types `models` folder to `./src/api/<apiName>/content-types/`:

    ```sh
    mv src/api/<apiName>/models/ src/api/<apiName>/content-types/
    ```

::: tip
[Strapi codemods](https://github.com/strapi/codemods/) can be used to convert v3 models to v4 content-types.
:::

3. Move/rename each model's `<modelName>.settings.json` file to `./src/api/<apiName>/content-types/<contentTypeName>/schema.json` files.
4. In each `<contentTypeName>/schema.json` file, update [the `info` object](/developer-docs/latest/development/backend-customization/models.md#model-information), which now requires declaring the 3 new `singularName`, `pluralName` and `displayName` keys and respecting some case-formatting conventions:

    ```json
    // path: ./src/api/<apiName>/content-types/<contentTypeName>/schema.json

    // ...
    "info": {
      "singularName": "content-type-name", // kebab-case required
      "pluralName": "content-type-names", // kebab-case required
      "displayName": "Content-type name",
      "name": "Content-type name",
    };
    // ...
    ```

## Updating content-type relations

::: strapi v3/v4 comparison
Strapi v3 defines relations between content-types with the `via`, `model` and `collection` properties in the model settings.

In Strapi v4, relations should be explicitly described in the `schema.json` file of the content-types (see [relations documentation](/developer-docs/latest/development/backend-customization/models.md#relations)).
:::

If the content-type has relations, it's required to manually migrate them to Strapi v4, by updating the [schema](/developer-docs/latest/development/backend-customization/models.md#model-schema) of the content-types.

To update content-type relations, update the `./src/api/<apiName>/content-types/<contentTypeName>/schema.json` file for each content-type with the following procedure:

1. Declare the relation explicitly by setting the `type` attribute value to `"relation"`.

2. Define the type of relation with the `relation` property.<br/>The value should be a string among the following possible options: `"oneToOne"`, `"oneToMany"`, `"manyToOne"` or `"manyToMany"`.

3. Define the content-type target with the `target` property.<br/>The value should be a string following the `api::api-name.content-type-name` or `plugin::plugin-name.content-type-name` syntax convention.

4. (_optional_) In [bidirectional relations](/developer-docs/latest/development/backend-customization/models.md#relations), define `mappedBy` and `inversedBy` properties on each content-type.

::: details Example of all possible relations between an article and an author content-types:

  ```json
  // path: ./src/api/article/content-types/article/schema.json
  
  // Attributes for the Article content-type

  // oneWay relation
  "articleHasOneAuthor": {
    "type": "relation",
    "relation": "oneToOne",
    "target": "api::author.author"
  },
  // oneToOne relation
  "articleHasAndBelongsToOneAuthor": {
    "type": "relation",
    "relation": "oneToOne",
    "target": "api::author.author",
    "inversedBy": "article"
  },
  // oneToMany relation
  "articleBelongsToManyAuthors": {
    "type": "relation",
    "relation": "oneToMany",
    "target": "api::author.author",
    "mappedBy": "article"
  },
  // manyToOne relation
  "authorHasManyArticles": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::author.author",
    "inversedBy": "articles"
  },
  // manyToMany relation
  "articlesHasAndBelongsToManyAuthors": {
    "type": "relation",
    "relation": "manyToMany",
    "target": "api::author.author",
    "inversedBy": "articles"
  },
  // manyWay relation
  "articleHasManyAuthors": {
    "type": "relation",
    "relation": "oneToMany",
    "target": "api::author.author"
  }
  ```

  ```json
  //path: ./src/api/author/content-types/author/schema.json

  // Attributes for the Author content-type

  // inversed oneToMany relation
  "article": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::article.article",
    "inversedBy": "articleBelongsToManyAuthors"
  },
  // inversed manyToOne or manyToMany relation
  "articles": {
    "type": "relation",
    "relation": "manyToMany",
    "target": "api::article.article",
    "inversedBy": "articlesHasAndBelongsToManyAuthors"
  }
  ```

:::

## Updating lifecycle hooks

:::strapi v3/v4 comparison
Strapi v3 declares model lifecycle hooks in `<model-name>.js` files found in a `models` folder.

In Strapi v4, [lifecycle hooks](/developer-docs/latest/development/backend-customization/models.md#lifecycle-hooks) are declared in a `lifecycles.js` file found in `./src/api/<apiName>/content-types/<contentTypeName>/` folder. The `lifecycles.js` file is similar in structure but no longer needs lifecycles to be wrapped in a `lifecycles: {}` object, and new parameters are passed to the hooks (see [lifecycle hooks documentation](/developer-docs/latest/development/backend-customization/models.md#hook-event-object)).
:::

To convert Strapi v3 model lifecycle hooks to v4 lifecycle hooks:

1. Move/rename the `<modelName>.js` in `./src/api/<apiName>/content-types/` to the proper content-type folder you created in [step 3](#convert-models-to-content-types) of the content-type migration, while changing its name to `lifecyles.js`:

    ```sh
    cd src/api/<apiName>
    mv content-types/<modelName>.js content-types/<contentTypeName>/lifecycles.js
    ```

2. In each `lifecycles.js` file, adjust the structure and move each lifecycle outside of the legacy `lifecycles: {}` object, like in the following examples:

    ::: details Example of a Strapi v3 lifecycles file:

    ```jsx
    module.exports = {
      lifecycles: {
        async beforeCreate() {
          // ...
        },
      },
    };
    ```

    :::

    ::: details Example of a Strapi v4 lifecycles file:

    ```jsx
    module.exports = {
      async beforeCreate() {
        // ...
      },
    };
    ```

    :::

3. Refactor the model lifecycle hooks to use the new input variables (see [hook `event` object documentation](/developer-docs/latest/development/backend-customization/models.md#hook-event-object)):

  * All Strapi v3 `params` are placed in an `event` object in Strapi v4 (e.g. `event.params`).
  * Nested inside of this params object, you have access to `data`, `select` (also known as fields), `where` (also known as filters), `orderBy` (also known as sort), `limit`, `offset`, and `populate`.
  * Optionally, for all `after*` events, you have access to `event.result` that contains the result response from the database.

  ::: details Example of a Strapi v3 lifecycle:

  ```jsx 
  module.exports = {
    lifecycles: {
      async beforeCreate(data) {
        data.isTableFull = data.numOfPeople === 4;
      },
      async afterCreate(result, data) {
        // do something with result
      }
    },
  };
  ```

  :::

  ::: details Example of a Strapi v4 lifecycle:

  ```jsx
  module.exports = {
    beforeCreate(event) {
      let { data, where, select, populate } = event.params;

      data.isTableFull = data.numOfPeople === 4;
    },

    afterCreate(event) {
      const { result, params } = event;

      // do something to the result
    },
  };
  ```

  :::

::: strapi Next steps
[Migrating the back end code](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.md) of Strapi to v4 also requires to at least migrate the core features of the Strapi server, such as the [configuration](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.md), [dependencies](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/dependencies.md), [routes](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.md), [controllers](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.md), and [services](/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.md).
:::
