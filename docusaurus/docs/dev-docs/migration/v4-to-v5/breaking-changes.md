---
title: Breaking changes
description: View the list of all breaking changes introduced between Strapi v4 and v5.
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
---

# Strapi v4 to Strapi 5 breaking changes

:::callout 🚧  Work in progress
This page is a work-in-progress and the list of breaking changes will grow over time.
:::

This page is part of the [Strapi v4 to v5 migration](/dev-docs/migration/v4-to-v5/introduction) and lists all the breaking changes introduced in Strapi v5.

## Configuration

* [Some `env`-only configuration options are handled by the server configuration](/dev-docs/migration/v4-to-v5/breaking-changes/removed-support-for-some-env-options)
* [Configuration filenames should meet strict requirements](/dev-docs/migration/v4-to-v5/breaking-changes/strict-requirements-config-files)

## Content API

* [Strapi 5 has a new, flattened response format for API calls](/dev-docs/migration/v4-to-v5/breaking-changes/new-response-format)
* [`documentId` should be used instead of `id` in API calls](/dev-docs/migration/v4-to-v5/breaking-changes/use-document-id)
* [The `publicationState` parameter is not supported and replaced by `status`](/dev-docs/migration/v4-to-v5/breaking-changes/publication-state-removed)
* [Draft & Publish is always enabled](/dev-docs/migration/v4-to-v5/breaking-changes/draft-and-publish-always-enabled)
* [There is no `findPage()` method with the Document Service API](/dev-docs/migration/v4-to-v5/breaking-changes/no-find-page-in-document-service)
* [The `localizations` field does not exist anymore](/dev-docs/migration/v4-to-v5/breaking-changes/no-localizations-field)

### Filtering and sorting

* [Sorting by id is no longer possible to sort by chronological order](/dev-docs/migration/v4-to-v5/breaking-changes/sort-by-id)

## Database

- [MySQL v5 is not supported anymore](/dev-docs/migration/v4-to-v5/breaking-changes/mysql5-unsupported)
- [Database identifiers can't be longer than 53 characters](/dev-docs/migration/v4-to-v5/breaking-changes/database-identifiers-shortened)

## Plugins and their configuration

- [Users & Permissions `register.allowedFields` defaults to `[]`](/dev-docs/migration/v4-to-v5/breaking-changes/register-allowed-fields)

## Strapi objects and methods

- [`strapi.fetch` uses the native `fetch()` API](/dev-docs/migration/v4-to-v5/breaking-changes/fetch)
- [`strapiFactory` should be used in main imports](/dev-docs/migration/v4-to-v5/breaking-changes/strapi-imports)
- [The `isSupportedImage` method is removed in Strapi 5](/dev-docs/migration/v4-to-v5/breaking-changes/is-supported-image-removed)
- [`Strapi` is a subclass of `Container`](/dev-docs/migration/v4-to-v5/breaking-changes/strapi-container)

## Content Manager

- [The `ContentManagerAppState` redux is modified](/dev-docs/migration/v4-to-v5/breaking-changes/redux-content-manager-app-state)

## Dependencies

- [Vite is the default bundler in Strapi 5](/dev-docs/migration/v4-to-v5/breaking-changes/vite)
- [Strapi 5 uses react-router-dom v6](/dev-docs/migration/v4-to-v5/breaking-changes/react-router-dom-6)

## Internal changes

The following changes should only affect users who deeply customize Strapi.

* [i18n is now part of the strapi core](/dev-docs/migration/v4-to-v5/breaking-changes/i18n-content-manager-locale)
