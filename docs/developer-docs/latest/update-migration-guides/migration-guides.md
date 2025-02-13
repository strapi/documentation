---
title: Migrate Guides - Strapi Developer Documentation
description: All the migration guides for a Strapi application.
---

# Migration guides

:::strapi Looking for the v3 to v4 migration guide?
The v3 to v4 migration guides are located in the [v4 documentation](https://docs-v4.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html#v3-to-v4-migration-guide)
:::

Migrations are necessary when upgrades to Strapi include breaking changes. The migration guides are sequential, meaning if there is more than 1 migration guide between your current version and the latest release, follow each guide in order. If there is no specific migration guide between your current version and the latest release follow the [Update Strapi guide](update-version.md).

:::caution
 [Plugins extension](/developer-docs/latest/plugins/users-permissions.md) that create custom code or modify existing code will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

::: tip

Upgrading from `3.2.5` to `3.6.9`requires executing all of the guides in the listed order:

1. Migration guide from 3.2.5 to 3.3.0.
2. Migration guide from 3.3.x to 3.4.0.
3. Migration guide from 3.4.x to 3.4.4.
4. [Update Strapi guide.](update-version.md)
:::

## v3 stable guides

- [Migration guide from 3.4.x to 3.4.4](migration-guides/migration-guide-3.4.x-to-3.4.4.md)
- [Migration guide from 3.3.x to 3.4.0](migration-guides/migration-guide-3.3.x-to-3.4.0.md)
- [Migration guide from 3.2.5 to 3.3.0](migration-guides/migration-guide-3.2.5-to-3.3.0.md)
- [Migration guide from 3.2.3 to 3.2.4](migration-guides/migration-guide-3.2.3-to-3.2.4.md)
- [Migration guide from 3.1.x to 3.2.3](migration-guides/migration-guide-3.1.x-to-3.2.x.md)
- [Migration guide from 3.0.x to 3.1.x](migration-guides/migration-guide-3.0.x-to-3.1.x.md)

## v3 early stage guides

::: warning

The Strapi alpha ands beta versions are no longer supported, and users should upgrade to v3 stable or v4.
If there are issues upgrading, it is generally recommended to create a new project.

:::
::::details v3 beta migration guides

- [Migration guide from beta.20+ to stable](migration-guides/migration-guide-beta.20-to-3.0.0.md)
- [Migration guide from beta.19.4+ to beta.20](migration-guides/migration-guide-beta.19-to-beta.20.md)
- [Migration guide from beta.19+ to beta.19.4](migration-guides/migration-guide-beta.19-to-beta.19.4.md)
- [Migration guide from beta.18 to beta.19](migration-guides/migration-guide-beta.18-to-beta.19.md)
- [Migration guide from beta.17+ to beta.18](migration-guides/migration-guide-beta.17-to-beta.18.md)
- [Migration guide from beta.16+ to beta.17.4](migration-guides/migration-guide-beta.16-to-beta.17.4.md)
- [Migration guide from beta.15 to beta.16](migration-guides/migration-guide-beta.15-to-beta.16.md)

::::

:::details v3 alpha migration guides

- [Migrating from v1 to v3](migration-guides/migration-guide-1-to-3.md)
- [Migration guide from alpha.7.4 to alpha.8](migration-guides/migration-guide-alpha.7.4-to-alpha.8.md)
- [Migration guide from alpha.8 to alpha.9](migration-guides/migration-guide-alpha.8-to-alpha.9.md)
- [Migration guide from alpha.9 to alpha.10](migration-guides/migration-guide-alpha.9-to-alpha.10.md)
- [Migration guide from alpha.10 to alpha.11](migration-guides/migration-guide-alpha.10-to-alpha.11.md)
- [Migration guide from alpha.11 to alpha.12](migration-guides/migration-guide-alpha.11-to-alpha.12.md)
- [Migration guide from alpha.12.1 to alpha.12.2](migration-guides/migration-guide-alpha.12.1-to-alpha.12.2.md)
- [Migration guide from alpha.12.2 to alpha.12.3](migration-guides/migration-guide-alpha.12.2-to-alpha.12.3.md)
- [Migration guide from alpha.12.3 to alpha.12.4](migration-guides/migration-guide-alpha.12.3-to-alpha.12.4.md)
- [Migration guide from alpha.12.4 to alpha.12.5](migration-guides/migration-guide-alpha.12.4-to-alpha.12.5.md)
- [Migration guide from alpha.12.5 to alpha.12.6](migration-guides/migration-guide-alpha.12.5-to-alpha.12.6.md)
- [Migration guide from alpha.12.6 to alpha.12.7](migration-guides/migration-guide-alpha.12.6-to-alpha.12.7.md)
- [Migration guide from alpha.12.7 to alpha.13](migration-guides/migration-guide-alpha.12.7-to-alpha.13.md)
- [Migration guide from alpha.13 to alpha.13.1](migration-guides/migration-guide-alpha.13-to-alpha.13.1.md)
- [Migration guide from alpha.13.1 to alpha.14](migration-guides/migration-guide-alpha.13.1-to-alpha.14.md)
- [Migration guide from alpha.14 to alpha.14.1](migration-guides/migration-guide-alpha.14-to-alpha.14.1.md)
- [Migration guide from alpha.14.1 to alpha.14.2](migration-guides/migration-guide-alpha.14.1-to-alpha.14.2.md)
- [Migration guide from alpha.14.2 to alpha.14.3](migration-guides/migration-guide-alpha.14.2-to-alpha.14.3.md)
- [Migration guide from alpha.14.3 to alpha.14.4](migration-guides/migration-guide-alpha.14.3-to-alpha.14.4.md)
- [Migration guide from alpha.14.4 to alpha.14.5](migration-guides/migration-guide-alpha.14.4-to-alpha.14.5.md)
- [Migration guide from alpha.14.5 to alpha.15](migration-guides/migration-guide-alpha.14.5-to-alpha.15.md)
- [Migration guide from alpha.15 to alpha.16](migration-guides/migration-guide-alpha.15-to-alpha.16.md)
- [Migration guide from alpha.16 to alpha.17](migration-guides/migration-guide-alpha.16-to-alpha.17.md)
- [Migration guide from alpha.17 to alpha.18](migration-guides/migration-guide-alpha.17-to-alpha.18.md)
- [Migration guide from alpha.18 to alpha.19](migration-guides/migration-guide-alpha.18-to-alpha.19.md)
- [Migration guide from alpha.19 to alpha.20](migration-guides/migration-guide-alpha.19-to-alpha.20.md)
- [Migration guide from alpha.20 to alpha.21](migration-guides/migration-guide-alpha.20-to-alpha.21.md)
- [Migration guide from alpha.21 to alpha.22](migration-guides/migration-guide-alpha.21-to-alpha.22.md)
- [Migration guide from alpha.22 to alpha.23](migration-guides/migration-guide-alpha.22-to-alpha.23.md)
- [Migration guide from alpha.23 to alpha.24](migration-guides/migration-guide-alpha.23-to-alpha.24.md)
- [Migration guide from alpha.24 to alpha.25](migration-guides/migration-guide-alpha.24-to-alpha.25.md)
- [Migration guide from alpha.25 to alpha.26](migration-guides/migration-guide-alpha.25-to-alpha.26.md)
- [Migration guide from alpha.26 to beta](migration-guides/migration-guide-alpha.26-to-beta.md)
:::
