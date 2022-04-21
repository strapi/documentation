---
title: Migrate from 4.1.7 to 4.1.8 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.1.7 to 4.1.8.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.0.x-to-4.1.8.html
---

# v4.0.x to v4.1.8 migration guide

The Strapi v4.0.x to v4.1.8 migration guide upgrades versions of v4.0.6 through v4.1.7 to v4.1.8. The minimum configuration for `config/admin` now includes the API token `API_TOKEN_SALT`. Strapi no longer populates default values for the admin JWT in `config/admin`. Initial values are generated and stored in the .env file during project creation. Strapi no longer passes secrets to non-development environments, requiring users to set the secrets purposefully. The migration to v4.1.8 consists of 4 steps:

- adding the API token to `config/admin`,
- removing the default `ADMIN_JWT_SECRET` (recommended for improved security),
- configuring `JWT_SECRET` in `config/plugins` (recommended),
- setting secrets for non-development environments.

## Modifying the `config/admin` file

Strapi, by default, creates the environmental variable `API_TOKEN_SALT` and populates a unique value, stored in `/.env` at project creation. In order to update `config/admin`:

- add the apiToken object,
- remove the comma and default value from the `ADMIN_JWT_SECRET` parenthetical.

<code-group>

<code-block title="JAVASCRIPT">

```jsx

//path: config/admin.js

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
});

```

</code-block>

<code-block title="TYPESCRIPT">

```jsx
//path: config/admin.ts

export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
});


```

</code-block>

</code-group>

## Configuring `JWT_SECRET`

`JWT_SECRET` is used by the Users and Permissions plugin, and populated in `/.env`. The property should be stored in `config/plugins.js` (or `config/plugins.ts` for a TypeScript project). The `plugins` file is not created by default in a Strapi application. If the file does not exist, users should create the file and add the follow code snippet.

<code-group>

<code-block title="JAVASCRIPT">

```jsx
//  path: config/plugins.js

module.exports = ({ env }) => ({
  // ...
  'users-permissions': {
    config: {
    jwtSecret: env('JWT_SECRET')
  },
  // ...
});

```

</code-block>

<code-block title="TYPESCRIPT">

```jsx
//  path: config/plugins.ts

export default ({ env }) => ({
  // ...
  'users-permissions': {
    config: {
    jwtSecret: env('JWT_SECRET')
  },
  // ...
});

```

</code-block>

</code-group>

## Setting secrets for non-development environments

Users are required to set secrets for each unique environment, such as a prodcution environment deployment on a platform. Strapi no longer passes the following secrets to non-development environments:

- APP_KEYS
- JWT_SECRET
- API_TOKEN_SALT
- ADMIN_JWT_SECRET

There are multiple methods to generate secrets, such as running `openssl rand -base64 32` in the terminal (Mac and Linux OS). Generating unique secrets for each environment is recommended for increased security.

::: caution

The [Hosting Provider Guides](/developer-docs/latest/setup-deployment-guides/deployment.html#hosting-provider-guides.md) are being updated to reflect these changes. Community contributions updating the hosting guides are encouraged.

:::
