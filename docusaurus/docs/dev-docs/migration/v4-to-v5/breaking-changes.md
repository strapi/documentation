---
title: Breaking changes
description: View the list of all breaking changes introduced between Strapi v4 and v5.
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
---

# Strapi v4 to Strapi 5 breaking changes

:::callout 🚧  Work in progress
This page is a work-in-progress and the list of breaking changes is not 100% final yet.
:::

This page lists all the breaking changes introduced in Strapi 5.

:::danger
It is currently strongly advised that you refrain from migrating from Strapi v4 to Strapi 5, especially in a production environment.

The beta version of Strapi 5 is not meant to be used in production yet.
:::

## Configuration

* [Some `env`-only configuration options are handled by the server configuration](/dev-docs/migration/v4-to-v5/breaking-changes/removed-support-for-some-env-options)
* [Configuration filenames should meet strict requirements](/dev-docs/migration/v4-to-v5/breaking-changes/strict-requirements-config-files)
* [Server log level is `http`](/dev-docs/migration/v4-to-v5/breaking-changes/server-default-log-level)
* [Model config path uses uid instead of dot notation](/dev-docs/migration/v4-to-v5/breaking-changes/model-config-path-uses-uid)
* [The `webhooks.populateRelations` server configuration is removed](/dev-docs/migration/v4-to-v5/breaking-changes/remove-webhook-populate-relations)

## Content API

* [Strapi 5 has a new, flattened response format for API calls](/dev-docs/migration/v4-to-v5/breaking-changes/new-response-format)
* [`documentId` should be used instead of `id` in API calls](/dev-docs/migration/v4-to-v5/breaking-changes/use-document-id)
* [The `publicationState` parameter is not supported and replaced by `status`](/dev-docs/migration/v4-to-v5/breaking-changes/publication-state-removed)
* [Sorting by id is no longer possible to sort by chronological order](/dev-docs/migration/v4-to-v5/breaking-changes/sort-by-id)
<!-- * [Draft & Publish is always enabled](/dev-docs/migration/v4-to-v5/breaking-changes/draft-and-publish-always-enabled) -->
* [There is no `findPage()` method with the Document Service API](/dev-docs/migration/v4-to-v5/breaking-changes/no-find-page-in-document-service)
* [The `localizations` field does not exist anymore](/dev-docs/migration/v4-to-v5/breaking-changes/no-localizations-field)
* [The `locale` attribute name is reserved by Strapi](/dev-docs/migration/v4-to-v5/breaking-changes/locale-attribute-reserved)
<!-- * [Components and dynamic zones do not return an `id` with REST API requests](/dev-docs/migration/v4-to-v5/breaking-changes/components-and-dynamic-zones-do-not-return-id) not implemented yet -->
* [The GraphQL API has been updated](/dev-docs/migration/v4-to-v5/breaking-changes/graphql-api-updated)

## Database

- [MySQL v5 is not supported anymore](/dev-docs/migration/v4-to-v5/breaking-changes/mysql5-unsupported)
- [Database identifiers can't be longer than 53 characters](/dev-docs/migration/v4-to-v5/breaking-changes/database-identifiers-shortened)

## Plugins, plugins configuration, and plugins development

- [Users & Permissions `register.allowedFields` defaults to `[]`](/dev-docs/migration/v4-to-v5/breaking-changes/register-allowed-fields)
- [The helper-plugin is deprecated](/dev-docs/migration/v4-to-v5/breaking-changes/helper-plugin-deprecated)

## Strapi objects, methods, and packages

- [`strapi.fetch` uses the native `fetch()` API](/dev-docs/migration/v4-to-v5/breaking-changes/fetch)
<!-- - [`strapiFactory` should be used in main imports](/dev-docs/migration/v4-to-v5/breaking-changes/strapi-imports) might change -->
<!-- - [`Strapi` is a subclass of `Container`](/dev-docs/migration/v4-to-v5/breaking-changes/strapi-container) might change -->
- [The `isSupportedImage` method is removed in Strapi 5](/dev-docs/migration/v4-to-v5/breaking-changes/is-supported-image-removed)
- [`strapi-utils` has been refactored](/dev-docs/migration/v4-to-v5/breaking-changes/strapi-utils-refactored)

## Content Manager

- [The `ContentManagerAppState` redux is modified](/dev-docs/migration/v4-to-v5/breaking-changes/redux-content-manager-app-state)
- [The `EditViewLayout` and `ListViewLayout` have been refactored](/dev-docs/migration/v4-to-v5/breaking-changes/edit-view-layout-and-list-view-layout-rewritten)

## Dependencies

- [Vite is the default bundler in Strapi 5](/dev-docs/migration/v4-to-v5/breaking-changes/vite)
- [Strapi 5 uses react-router-dom v6](/dev-docs/migration/v4-to-v5/breaking-changes/react-router-dom-6)
- [Webpack Aliases are removed in Strapi 5](/dev-docs/migration/v4-to-v5/breaking-changes/webpack-aliases-removed)
- [Apollo Server v3 upgraded to Apollo Server v4](/dev-docs/migration/v4-to-v5/breaking-changes/upgrade-to-apollov4)


## Internal changes

The following changes should only affect users who deeply customize Strapi.

* [i18n is now part of the strapi core](/dev-docs/migration/v4-to-v5/breaking-changes/i18n-content-manager-locale)
