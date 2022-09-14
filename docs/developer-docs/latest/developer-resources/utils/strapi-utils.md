---
title: Core Utilities - Strapi Developer Docs
description: Various tools and utilities that are used throughout the Strapi codebase and your project.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/utils/strapi-utils.md
---

# Core Utilities package: @strapi/utils

| Utils function | Description | Is Experimental |
| --- | --- | --- |
| `build-query` | Convert Strapi query params to Knex query | false |
| `code-generator` | Used to generate timestamp codes | true |
| `config` | Used to construct config and absolute URLs (server/admin) | false |
| `content-types` | Various tooling around content-type checking | true |
| `convert-query-params` | Converts the standard Strapi REST query params to a more usable format for querying | false |
| `env-helper` | Helper for parsing env vars into proper types | false |
| `errors` | Error classes for sanely handling errors through the Strapi application | false |
| `format-yup-error` | Addon util for the errors which converts [Yup](https://www.npmjs.com/package/yup) errors into more human readable responses | true |
| `hooks` | Various functions used for hook management (create series, waterfall, and parallel hooks) | true |
| `object-formatting` | Used for removing keys who's value is undefined | true |
| `pagination` | Handles pagination management with limits and conversion | true |
| `parse-multipart` | Used for parsing `multipart/form-data` requests and extracting files | false |
| `parse-type` | Used for parsing various type and converting them, mainly for population | true |
| `pipe-async` | ??? | false |
| `policy` | Core policy management functions for resolving, creating, and passing the Koa `ctx` | true |
| `print-value` | Copied function from the [Yup Library](https://github.com/jquense/yup/blob/2778b88bdacd5260d593c6468793da2e77daf21f/src/util/printValue.ts) | true |
| `provider-factory` | Constructs the provider factory by registering hooks | true |
| `relations` | Extracts relation fields from a content-type schema | true |
| `sanitize` | ??? | false |
| `set-creator-fields` | Sets the default created_by and updated_by attributes for the Strapi Admin | true |
| `string-formatting` | Various functions used for handling naming conventions throughout the Strapi application | true |
| `template-configuration` | Allow dynamic config values through the native ES6 template string function | true |
| `traverse-entity` | Used for deeply traversing Strapi responses, commonly combined with sanitize | false |
| `validators` | Validators and testing for schemas and key/value checking | true |
| `webhook` | Provides a list of various webhook event types | true |
