---
title: Migrate from 4.0.6+ to 4.1.8
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.0.6+ to 4.1.8.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.0.x-to-4.1.8.html
---

import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.0.6+ to v4.1.8 migration guide

The Strapi v4.0.6+ to v4.1.8 migration guide upgrades versions of v4.0.6 and above to v4.1.8. The minimum configuration for `config/admin` now includes the API token `API_TOKEN_SALT`. Strapi no longer populates default values for the admin JWT in `config/admin`. Initial values are generated and stored in the .env file during project creation. Strapi no longer passes secrets to non-development environments, requiring users to set the secrets purposefully. The migration to v4.1.8 consists of 4 steps:

- Upgrading the application dependencies
- Fixing the breaking changes
- Setting secrets for non-development environments
- Reinitializing the application

<PluginsCaution components={props.components} />

## Upgrading the application dependencies to 4.1.8

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in the `package.json` to `4.1.8`:

```jsx title="path: ./package.json"

{
  // ...
  "dependencies": {
    "@strapi/strapi": "4.1.8",
    "@strapi/plugin-users-permissions": "4.1.8",
    "@strapi/plugin-i18n": "4.1.8",
    "better-sqlite3": "7.4.6"
    // ...
  }
}

```

2. Save the edited `package.json` file.

3. <InstallCommand components={props.components} />


## Fixing the breaking changes

1. Modify the `config/admin` file. Strapi, by default, creates the environmental variable `API_TOKEN_SALT` and populates a unique value, stored in `/.env` at project creation. In order to update `config/admin`:

- add the apiToken object,
- remove the comma and default value from the `ADMIN_JWT_SECRET` parenthetical.

```jsx title="path: config/admin.js"

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
});

```

2. Configure`JWT_SECRET`. `JWT_SECRET` is used by the Users and Permissions plugin, and populated in `/.env`. The property should be stored in `config/plugins.js` (or `config/plugins.ts` for a TypeScript project). The `plugins` file is not created by default in a Strapi application. If the file does not exist, users should create the file and add the following code snippet.

```jsx title="path: ./config/plugins.js"

module.exports = ({ env }) => ({
  // ...
  'users-permissions': {
    config: {
    jwtSecret: env('JWT_SECRET')
  },
  },
  // ...
});

```

## Setting secrets for non-development environments

Users are required to set secrets for each unique environment, such as a production environment deployment on a platform. Strapi no longer passes the following secrets to non-development environments:

- APP_KEYS
- JWT_SECRET
- API_TOKEN_SALT
- ADMIN_JWT_SECRET

There are multiple methods to generate secrets, for example running `openssl rand -base64 32` in the terminal (Mac and Linux OS). Generating unique secrets for each environment is recommended for increased security.

:::caution

The [Hosting Provider Guides](/dev-docs/deployment/hosting-guides) are being updated to reflect these changes. Community contributions updating the hosting guides are encouraged.

:::

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
