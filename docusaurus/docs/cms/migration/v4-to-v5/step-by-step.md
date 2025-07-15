---
title: Step-by-step guide to upgrade to Strapi 5
description: Follow this step-by-step guide to upgrade from Strapi v4 to Strapi 5
sidebar_label: Step-by-step guide
tags:
- upgrade to Strapi 5
- upgrade tool
- breaking changes
- guides
---

import DoNotMigrateYet from '/docs/snippets/_do-not-migrate-to-v5-yet.md'

# Step-by-step guide to upgrade to Strapi 5

The latest major version of Strapi is Strapi 5.

The present page is meant to be used as step-by-step instructions for upgrading your Strapi v4 application to Strapi 5.

:::prerequisites
Your Strapi v4 application is already running on the latest v4 minor and patch version. If it's not, run the [upgrade tool](/cms/upgrade-tool) with the `minor` command to reach it: `npx @strapi/upgrade minor`.
:::

## Step 1: Get ready to upgrade

Before getting into the upgrade process itself, take the following precautions:

1. **Backup your database**:
    * If you are using SQLite with the default configuration (the default database provided with Strapi), your database file is named `data.db` and is located in the `.tmp/` folder at the root of your Strapi application.
    * If you are using another type of database, please refer to their official documentation (see <ExternalLink to="https://www.postgresql.org/docs/" text="PostgreSQL docs"/> and <ExternalLink to="https://dev.mysql.com/doc/" text="MySQL docs"/>).
    * If your project is hosted on Strapi Cloud, you can manually [create a backup](/cloud/projects/settings#creating-a-manual-backup).
2. **Backup your code**:
    * If your code is versioned with git, create a new dedicated branch to run the migration.
    * If your code is _not_ versioned with git, create a backup of your working Strapi v4 code and store it in a safe place.
3. **Ensure the plugins you are using are compatible with Strapi 5**.

  To do so, list the plugins you are using, then check compatibility for each of them by reading their dedicated documentation on the <ExternalLink to="https://market.strapi.io/plugins?version=v5" text="Marketplace"/> website.

## Step 2: Run automated migrations

Strapi provides a tool to automate some parts of the upgrade to Strapi 5: the [upgrade tool](/cms/upgrade-tool).

1. **Run the upgrade tool**.  

  ```sh
  npx @strapi/upgrade major
  ```

  The command will execute the update and installation of the dependencies of Strapi 5, and run the codemods to handle some of the breaking changes that come with Strapi 5.

  The codemods will handle the following changes:

  | Codemod name and GitHub code link | Description |
  |-----------------------------------|-------------|
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/comment-out-lifecycle-files.code.ts" text="comment-out-lifecycle-files"/> | Comment out lifecycles files in favor of [Document Service Middlewares](/cms/migration/v4-to-v5/breaking-changes/lifecycle-hooks-document-service) | 
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/dependency-remove-strapi-plugin-i18n.json.ts" text="dependency-remove-strapi-plugin-i18n"/> | Remove the i18n plugin dependency as i18n is now integrated into the core of Strapi |
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/dependency-upgrade-react-and-react-dom.json.ts" text="dependency-upgrade-react-and-react-dom"/>  | Upgrade the react and react-dom dependencies | 
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/dependency-upgrade-react-router-dom.json.ts" text="dependency-upgrade-react-router-dom"/>  | Upgrade the react-router-dom dependency |
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/dependency-upgrade-styled-components.json.ts" text="dependency-upgrade-styled-components"/>  | Upgrade the styled-components dependency |
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/deprecate-helper-plugin.code.ts" text="deprecate-helper-plugin"/>  | Partly handle migrations from `@strapi/helper-plugin` |
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/entity-service-document-service.code.ts" text="entity-service-document-service"/>            | Partly handle the migration from the Entity Service API to the new Document Service API |
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/s3-keys-wrapped-in-credentials.code.ts" text="s3-keys-wrapped-in-credentials"/>            | Wrap the `accessKeyId` and `secretAccessKey` properties inside a `credentials` object for users using the `aws-s3` provider | 
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/sqlite3-to-better-sqlite3.json.ts" text="sqlite3-to-better-sqlite3"/>                                                                    | Update the sqlite dependency to better-sqlite3 | 
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/strapi-public-interface.code.ts" text="strapi-public-interface"/>                          | Transform `@strapi/strapi` imports to use the new public interface | 
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/use-uid-for-config-namespace.code.ts" text="use-uid-for-config-namespace"/>                | Replace string dot format for config get/set/has with uid format for 'plugin' and 'api' namespace where possible | 
  | <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/utils-public-interface.code.ts" text="utils-public-interface"/>                            | Update utils to use the new public interface | 

:::tip
If you develop Strapi plugins, other codemods handle some aspects of the helper-plugin deprecation. See the [related breaking change](/cms/migration/v4-to-v5/breaking-changes/helper-plugin-deprecated) for more information.
:::

2. Go over the changes made by the upgrade tool to **check if you have to manually complete some code updates**:

  Look for `__TODO__` automatically added to your code by the codemods. Some of them might have been added while migrating from the Entity Service API to the new Document Service API introduced in Strapi 5.
  
  :::info Document Service API
  Additional information about the Document Service API can be found in the [breaking change entry description](/cms/migration/v4-to-v5/breaking-changes/entity-service-deprecated), the [specific migration guide](/cms/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service), and the [API reference](/cms/api/document-service).
  :::

## Step 3: Check and handle manual upgrades

The following main changes might affect your Strapi application and require you to do some manual actions.

For each of them, read the indicated breaking change entry and check if some manual actions are still required after the upgrade tool has run:

1. **Database migration**:
    1. MySQL v5 is not supported 👉 see [breaking change](/cms/migration/v4-to-v5/breaking-changes/mysql5-unsupported)
    2. Only better-sqlite3 is supported 👉 see [breaking change](/cms/migration/v4-to-v5/breaking-changes/only-better-sqlite3-for-sqlite)
    3. Only mysql2 is supported 👉 see [breaking change](/cms/migration/v4-to-v5/breaking-changes/only-mysql2-package-for-mysql)
    4. Lifecycle hooks are triggered differently 👉 see [breaking change](/cms/migration/v4-to-v5/breaking-changes/lifecycle-hooks-document-service)
2. **Configuration**:
    1. Some environment variables are handled by the server configuration 👉 see [breaking change](/cms/migration/v4-to-v5/breaking-changes/removed-support-for-some-env-options)
    2. Custom configuration must meet specific requirements 👉 see [breaking change](/cms/migration/v4-to-v5/breaking-changes/strict-requirements-config-files)
3. **Admin panel customization**:
    * The helper-plugin has been removed 👉 see [migration reference](/cms/migration/v4-to-v5/additional-resources/helper-plugin)

👉 Finally, go over the rest of the [breaking changes database](/cms/migration/v4-to-v5/breaking-changes) for any edge case you might be concerned about.

## Step 4: Migrate the API consuming side

Strapi 5 has updated both the REST and GraphQL APIs.

Follow the steps below and leverage retro-compatibility flags and guided migration resources to gradually update your code for Strapi 5.

### Migrate REST API calls

1. Enable the retro-compatibility flag by setting the `Strapi-Response-Format: v4` header.
2. Update your queries & mutations only, guided by the dedicated [breaking change entry for REST API](/cms/migration/v4-to-v5/breaking-changes/new-response-format).
3. Validate that your client is running correctly.
4. Disable the retro-compatibiliy flag by removing the `Strapi-Response-Format: v4` header and start using the new response format.

### Migrate GraphQL API calls

1. Enable the retro-compatibility flag by setting `v4ComptabilityMode` to `true` in the `graphql.config` object of [the `/config/plugins.js|ts` file](/cms/plugins/graphql#code-based-configuration).
2. Update your queries and mutations only, guided by the dedicated [breaking change entry for GraphQL](/cms/migration/v4-to-v5/breaking-changes/graphql-api-updated).
3. Validate that your client is running correctly.
4. Disable the retro-compatibily flag by setting `v4ComptabilityMode` to `false` and start using the new response format.
