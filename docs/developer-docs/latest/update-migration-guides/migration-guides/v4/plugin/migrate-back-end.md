---
title: v4 Plugin Migration - Migrate back end - Strapi Developer Docs
description:
canonicalUrl:
sidebarDepth: 2
---

<!-- TODO: update SEO -->

# v4 plugin migration: Migrate the back end

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/plugin-migration-intro.md)!!!



## Update imports

Strapi has now moved to scoped imports. All Strapi imports will need to be updated from `strapi-package-name` to `@strapi/package-name`.

### Update imports automatically

To update your `package.json` you can use the following codemod:

```jsx
node ./migration-helpers/update-package-dependencies.js <path-to-plugin>
```

::: caution
This will modify your plugin source code.  Before running this command, be sure you have initialized a git repo, the working tree is clean, you've pushed your v3 plugin, and you are on a new branch.
:::


To update any files importing Strapi packages you can run:

```jsx
npx jscodeshift -t ./transforms/update-scoped-imports.js <path-to-file | path-to-folder>
```

::: caution
This will modify your plugin source code.  Before running this command, be sure you have initialized a git repo, the working tree is clean, you've pushed your plugin to GitHub, and you are on a new branch.
:::

### Update imports manually

If you prefer to make this change yourself, you just need to find any imports of Strapi packages and rename them to `@strapi/package-name`

### Update models to content-types

#### Update Getters

If your plugin has models (contentTypes) you will need to make the following changes.

Models are now called ContentTypes. All getters like `strapi.models` will need to be updated to `strapi.contentTypes`

##### Update getters automatically

You can use the following codemod to replace all instances of `strapi.models` with `strapi.contentTypes`

```jsx
npx jscodeshift -t ./transforms/change-model-getters-to-content-types.js <path-to-file | path-to-folder>
```

::: caution
This will modify your plugin source code.  Before running this command, be sure you have initialized a git repo, the working tree is clean, you've pushed your plugin to GitHub, and you are on a new branch.
:::

##### Update getters manually

If you prefer to do this yourself, you just need to replace any instance of `.models` with `.contentTypes`

:::tip
To refactor further, check out the [new getters](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#usage) introduced in the v4 Plugin API.
:::

#### Update relations

If your plugin has contenttTypes with relations, those attributes will have to be updated manually depending on the relation. Here's an example of all possible relations between an `article` and an `author`

```json
// article attributes
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

// author attributes
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

### Update configuration

If you have any default configuration it should be exported as an object on the `[config` property](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#configuration). This object expects a `default` property storing the default plugin configuration, and a `validator` function that takes the `config` as an argument. For example:

```jsx
// strapi-server.js

module.exports = () => {
// ...bootstrap, routes, controllers, etc...
config: {
    default: { optionA: true },
    validator: (config) => {
      if (typeof config.optionA !== 'boolean') {
        throw new Error('optionA has to be a boolean');
      }
    },
  },
}
```
