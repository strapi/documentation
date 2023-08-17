---
title: Updates
displayed_sidebar: devDocsSidebar
description: The following documentation covers how to update your application to the latest version of Strapi.

---
import InstallCommand from '/docs/snippets/install-npm-yarn.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'

# Update to a newer Strapi version

Strapi periodically releases code improvements through new versions. Updates contain no breaking changes. The present documentation is a generic update guide. The [Updates and Migration introduction](/dev-docs/update-migration) explains the differences between an update and a migration.

:::caution
 [Plugins extension](/dev-docs/plugins/users-permissions) that create custom code or modify existing code will need to be updated and compared to the changes in the repository. Not updating the plugin extensions could break the application.
:::

## Upgrade the dependencies

:::prerequisites

- Stop the server before starting the upgrade.
- Confirm there are no [migrations](/dev-docs/migration-guides) between the current and ultimate Strapi versions.
:::

1. Upgrade all of the Strapi packages version numbers in `package.json` to the latest stable Strapi version (Strapi stable versions are listed on the [GitHub releases page](https://github.com/strapi/strapi/releases)):

    ```jsx
    // path: package.json

    {
      // ...
      "dependencies": {
        "@strapi/strapi": "4.7.0", 
        "@strapi/plugin-users-permissions": "4.7.0",
        "@strapi/plugin-i18n": "4.7.0",
        "better-sqlite3": "7.4.6"
        // ...
      }
    }

    ```

2. Save the edited `package.json` file.

3. <InstallCommand components={props.components} />

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
