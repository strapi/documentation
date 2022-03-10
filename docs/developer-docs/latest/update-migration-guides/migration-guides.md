---
title: Migrate Guides - Strapi Developer Docs
description: All the migration guides for a Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html
sidebarDepth: 0
---

# Migration guides

## Instructions

Migrations are necessary when upgrades to Strapi include breaking changes. The migration guides are sequential, meaning if there is more than 1 migration guide between your current version and the latest release, follow each guide in order. If there is no specific migration guide between your current version and the latest release follow the [Update Strapi guide](update-version.md).

:::caution
 [Plugins extension](/developer-docs/latest/plugins/users-permissions.md) that create custom code or modify existing code will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

<!--**Example**

If you were to upgrade your version from `3.2.3` to `3.6.1`, you would have to follow the following guides:

1. Migration guide from 3.2.3 to 3.2.4.
2. Migration guide from 3.2.5 to 3.3.0.
3. Migration guide from 3.3.x to 3.4.0.
4. Migration guide from 3.4.x to 3.4.4.
5. [Update Strapi guide.](update-version.md)-->

## v4 migration guides

- [Migration guide from 4.0.x to 4.0.6](migration-guides/v4/migration-guide-4.0.x-to4.0.6.md)

## v3 to v4 migration guides

::: callout 🚧  Migration guides
This section is still a work in progress and will continue to be updated and improved. In the meantime, feel free to ask for help on the [forum](https://forum.strapi.io/) or on the community [Discord](https://discord.strapi.io).
:::

Migrating from v3.6.x to v4.0.x revolves around 3 topics:

- The [plugin migration guide](/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.md) helps migrating a plugin to v4.
- The code migration guide _(coming soon!)_ helps migrating the built-in back-end and front-end code of the Strapi application to v4.
- The data migration guide _(coming soon!)_ helps migrating the database content to v4.

## v3 migration guides

v3 migration guides are available in the [v3 documentation](https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html#v3-guides).
