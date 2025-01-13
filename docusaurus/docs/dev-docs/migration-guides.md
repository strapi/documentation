---
title: Migration Guides
displayed_sidebar: devDocsSidebar
description: Migration guides for a Strapi v4 application.

sidebarDepth: 0
---

# Migration guides

Migrations are necessary when upgrades to Strapi include breaking changes. The migration guides are sequential, meaning if there is more than 1 migration guide between your current version and the latest release, follow each guide in order.

If there is no specific migration guide between your current version and the latest release, you only need to follow the [guide to upgrade Strapi](/dev-docs/update-version.md).

:::caution
[Plugins extension](/dev-docs/plugins/users-permissions) that create custom code or modify existing code will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

:::note
Strapi 5 is out, but Strapi v4 is still supported until March 2026, which means security fixes are still applied to v4 (see [Strapi release notes](https://github.com/strapi/strapi/releases)). When you're ready to upgrade, please refer to the [Strapi 5 upgrade documentation](https://docs.strapi.io/dev-docs/migration/v4-to-v5/introduction-and-faq).
:::

## v4 migration guides

- [Migration guide from 4.0.0+ to 4.0.6](/dev-docs/migration/v4/migration-guide-4.0.0-to-4.0.6)
- [Migration guide from 4.0.6+ to 4.1.8](/dev-docs/migration/v4/migration-guide-4.0.6-to-4.1.8)
- [Migration guide from 4.1.8+ to 4.1.10](/dev-docs/migration/v4/migration-guide-4.1.8-to-4.1.10)
- [Migration guide from 4.2.x to 4.3.x](/dev-docs/migration/v4/migration-guide-4.2.x-to-4.3.x)
- [Migration guide from 4.3.6 to 4.3.8](/dev-docs/migration/v4/migration-guide-4.3.6-to-4.3.8)
- [Migration guide from 4.4.3 to 4.4.5](/dev-docs/migration/v4/migration-guide-4.4.3-to-4.4.5)
- [Migration guide from 4.4.5 to 4.5.1](/dev-docs/migration/v4/migration-guide-4.4.5-to-4.5.1)
- [Migration guide from 4.5.1 to 4.6.1](/dev-docs/migration/v4/migration-guide-4.5.1-to-4.6.1)
- [Migration guide from 4.6.1 to 4.7.0](/dev-docs/migration/v4/migration-guide-4.6.1-to-4.7.0)
- [Migration guide from 4.7.0 to 4.11.4](/dev-docs/migration/v4/migration-guide-4.7.0-to-4.11.4)
- [Migration guide from 4.11.4 to 4.14.0](/dev-docs/migration/v4/migration-guide-4.11.4-to-4.14.0)
- [Migration guide from 4.14.0 to 4.15.5](/dev-docs/migration/v4/migration-guide-4.14.0-to-4.15.5)

## v3 to v4 migration guides

Migrating from v3.6.x to v4.0.x revolves around 3 topics:

- The [code migration guide](/dev-docs/migration/v3-to-v4/code-migration) helps migrating the built-in back-end and front-end code of the Strapi application to v4.
- The [data migration guide](/dev-docs/migration/v3-to-v4/data-migration) helps migrating the database content to v4.
- The [plugin migration guide](/dev-docs/migration/v3-to-v4/plugin-migration) helps migrating a plugin to v4.

## v3 migration guides

v3 migration guides are available in the [v3 documentation](https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html#v3-guides).
