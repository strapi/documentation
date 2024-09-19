---
title: Breaking changes
description: View the list of all breaking changes introduced between Strapi v4 and v5.
displayed_sidebar: devDocsMigrationV5Sidebar
pagination_prev: dev-docs/migration/v4-to-v5/step-by-step
pagination_next: dev-docs/migration/v4-to-v5/additional-resources/introduction
tags:
 - breaking changes
 - upgrade to Strapi 5
---

# Strapi v4 to Strapi 5 breaking changes

The present page lists all the breaking changes introduced in Strapi 5.
Breaking changes are grouped into topic-related categories, and for each line in the following tables line you will find:

- a short description of the breaking change,
- and 2 other columns, "Affects plugins" and "Handled by codemods", that sum up whether the breaking change also affects plugins and whether the breaking change is automatically handled by a codemod from the [upgrade CLI tool](/dev-docs/upgrade-tool).

You can click on the description of any breaking change in the following tables to jump to the corresponding page with more details.

:::tip Tips
* To view a full list of available codemods, run the `npx @strapi/upgrade codemods ls` command in your terminal.
* To have a deeper look at the code executed by the codemods, head over to the [list of codemods](https://github.com/strapi/strapi/tree/v5/main/packages/utils/upgrade/resources/codemods/5.0.0) in the GitHub repository.
:::

## Database

| Description | Affects plugins | Handled by codemods |
|-------------|-----------------|---------------------|
| [Content types always have feature columns](/dev-docs/migration/v4-to-v5/breaking-changes/database-columns) | Yes | No|
| [MySQL v5 is not supported anymore](/dev-docs/migration/v4-to-v5/breaking-changes/mysql5-unsupported) | No | No |
| [Database identifiers longer than 55 characters will be automatically shortened](/dev-docs/migration/v4-to-v5/breaking-changes/database-identifiers-shortened) | Yes | ✅ Yes |
| [Only the `better-sqlite3` package is supported for the SQLite client](/dev-docs/migration/v4-to-v5/breaking-changes/only-better-sqlite3-for-sqlite) | No | ✅ Yes |
| [Only the `mysql2` package is supported for the MySQL client](/dev-docs/migration/v4-to-v5/breaking-changes/only-mysql2-package-for-mysql) | No | ✅ Yes |

## Dependencies

| Description | Affects plugins | Handled by codemods |
|-------------|-----------------|---------------------|
| [The CLI default package manager is not yarn anymore](/dev-docs/migration/v4-to-v5/breaking-changes/yarn-not-default) | No | No |
| [Vite is the default bundler in Strapi 5](/dev-docs/migration/v4-to-v5/breaking-changes/vite) | Yes | No |
| [Strapi 5 uses `react-router-dom` v6](/dev-docs/migration/v4-to-v5/breaking-changes/react-router-dom-6) | Yes | ✅ Yes |
| [Strapi 5 uses `koa-body` v6](/dev-docs/migration/v4-to-v5/breaking-changes/koa-body-v6) | Yes | No |
| [Webpack aliases are removed in Strapi 5](/dev-docs/migration/v4-to-v5/breaking-changes/webpack-aliases-removed) | Yes | No |
| [Apollo Server v3 upgraded to Apollo Server v4](/dev-docs/migration/v4-to-v5/breaking-changes/upgrade-to-apollov4) | Yes | No |

## Configuration

| Description | Affects plugins | Handled by codemods |
|-------------|-----------------|---------------------|
| [Some `env`-only configuration options are handled by the server configuration](/dev-docs/migration/v4-to-v5/breaking-changes/removed-support-for-some-env-options) | No | No |
| [Configuration filenames should meet strict requirements](/dev-docs/migration/v4-to-v5/breaking-changes/strict-requirements-config-files) | No | No |
| [Server log level is `http`](/dev-docs/migration/v4-to-v5/breaking-changes/server-default-log-level) | No | No |
| [Model config path uses uid instead of dot notation](/dev-docs/migration/v4-to-v5/breaking-changes/model-config-path-uses-uid) | Yes | 👷 Partly |
| [The `webhooks.populateRelations` server configuration is removed](/dev-docs/migration/v4-to-v5/breaking-changes/remove-webhook-populate-relations) | Yes | No |
| [The `defaultIndex` option is removed from the `public` middleware](/dev-docs/migration/v4-to-v5/breaking-changes/default-index-removed) | No | No |
| [Server proxy configuration options are grouped under the `server.proxy` object](/dev-docs/migration/v4-to-v5/breaking-changes/server-proxy) | No | No |

## Strapi objects, methods, packages, and back-end customization

| Description | Affects plugins | Handled by codemods |
|-------------|-----------------|---------------------|
| [`strapi.fetch` uses the native `fetch()` API](/dev-docs/migration/v4-to-v5/breaking-changes/fetch) | Yes | No |
| [strapi factories import have changed](/dev-docs/migration/v4-to-v5/breaking-changes/strapi-imports) | Yes | 👷 Partly |
| [The `isSupportedImage` method is removed in Strapi 5](/dev-docs/migration/v4-to-v5/breaking-changes/is-supported-image-removed) | Yes | No |
| [`strapi-utils` has been refactored](/dev-docs/migration/v4-to-v5/breaking-changes/strapi-utils-refactored) | Yes | ✅ Yes |
| [Core service methods use the Document Service API](/dev-docs/migration/v4-to-v5/breaking-changes/core-service-methods-use-document-service) | Yes | No |
| [i18n is now part of the strapi core](/dev-docs/migration/v4-to-v5/breaking-changes/i18n-content-manager-locale) | Yes | ✅ Yes |


## Plugins, providers, and admin panel customization

| Description | Affects plugins | Handled by codemods |
|-------------|-----------------|---------------------|
| [Users & Permissions `register.allowedFields` defaults to `[]`](/dev-docs/migration/v4-to-v5/breaking-changes/register-allowed-fields) | No | ✅ Yes |
| [The `helper-plugin` is removed](/dev-docs/migration/v4-to-v5/breaking-changes/helper-plugin-deprecated) | Yes | 👷 Partly |
| [`injectContentManagerComponent()` is removed in favor of `getPlugin('content-manager').injectComponent()`](/dev-docs/migration/v4-to-v5/breaking-changes/inject-content-manager-component) | Yes | No |
| [Some Mailgun provider legacy variables are not supported](/dev-docs/migration/v4-to-v5/breaking-changes/mailgun-provider-variables) | Yes | No |
| [The `lockIcon` property has been replaced by `licenseOnly`](/dev-docs/migration/v4-to-v5/breaking-changes/license-only) | Yes | No |
| [The `ContentManagerAppState` redux is modified](/dev-docs/migration/v4-to-v5/breaking-changes/redux-content-manager-app-state) | Yes | No |
| [The `EditViewLayout` and `ListViewLayout` have been refactored](/dev-docs/migration/v4-to-v5/breaking-changes/edit-view-layout-and-list-view-layout-rewritten) | Yes | No |
| [The Admin Panel RBAC redux store has been updated](/dev-docs/migration/v4-to-v5/breaking-changes/admin-panel-rbac-store-updated) | Yes | No |
| [The `getWhere` method for permission provider instances has been removed](/dev-docs/migration/v4-to-v5/breaking-changes/get-where-removed) | Yes | No |

## Content API

| Description | Affects plugins | Handled by codemods |
|-------------|-----------------|---------------------|
| [Strapi 5 has a new, flattened response format for API calls](/dev-docs/migration/v4-to-v5/breaking-changes/new-response-format) | Yes | No |
| [REST API input is validated by default in controllers](/dev-docs/migration/v4-to-v5/breaking-changes/default-input-validation) | Yes | No |
| [The GraphQL API has been updated](/dev-docs/migration/v4-to-v5/breaking-changes/graphql-api-updated) | Yes | No |
| [The Entity Service API is deprecated and replaced by the Document Service API](/dev-docs/migration/v4-to-v5/breaking-changes/entity-service-deprecated) | Yes | 👷 Partly |
| [`documentId` should be used instead of `id` in API calls](/dev-docs/migration/v4-to-v5/breaking-changes/use-document-id) | Yes | 👷 Partly |
| [Database lifecycle hooks are triggered differently based on Document Service API methods](/dev-docs/migration/v4-to-v5/breaking-changes/lifecycle-hooks-document-service) | Yes | No |
| [The `publicationState` parameter is not supported and replaced by `status`](/dev-docs/migration/v4-to-v5/breaking-changes/publication-state-removed) | Yes | ✅ Yes |
| [Sorting by id is no longer possible to sort by chronological order](/dev-docs/migration/v4-to-v5/breaking-changes/sort-by-id) | Yes | ✅ Yes |
| [There is no `findPage()` method with the Document Service API](/dev-docs/migration/v4-to-v5/breaking-changes/no-find-page-in-document-service) | Yes | No |
| [Some attributes and content-types names are reserved by Strapi](/dev-docs/migration/v4-to-v5/breaking-changes/attributes-and-content-types-names-reserved) | Yes | No |
| [Upload a file at entry creation is no longer possible](/dev-docs/migration/v4-to-v5/breaking-changes/no-upload-at-entry-creation) | Yes | No |
| [Components and dynamic zones should be populated using the detailed population strategy](/dev-docs/migration/v4-to-v5/breaking-changes/no-shared-population-strategy-components-dynamic-zones) | Yes | No |
