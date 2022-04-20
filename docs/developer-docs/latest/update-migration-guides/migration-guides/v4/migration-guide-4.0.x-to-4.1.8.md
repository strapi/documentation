---
title: Migrate from 4.1.7 to 4.1.8 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.1.7 to 4.1.8.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/migration-guide-4.0.x-to-4.1.8.html
---

# v4.0.x to v4.1.8 migration guide

<!-- 
We need to let everyone know they need to set all 4 of these for non-development environment usage (eg Heroku, aws, ect)
- APP_KEYS
- JWT_SECRET
- API_TOKEN_SALT
- ADMIN_JWT_SECRET
 -->

The Strapi v4.0.x to v4.1.8 migration guide upgrades versions of v4.0.6 through v4.1.7 to v4.1.8. The minimum configuration for `config/admin` now includes the API token `API_TOKEN_SALT`. Additionally, Strapi no long populates default values for the admin JSON web token in `config/admin`. Initial values are generated and stored in the .env file during project creation. The migration to v4.1.8 consists of 2 steps:

- adding the API token to `config/admin`,
- removing the default `ADMIN_JWT_SECRET`.

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

<!-- 
If we want to put the U&P JWT_SECRET example in here, this is what it will look like:
```jsx
// path: config/plugins.js

module.exports = ({ env }) => ({
  // ...
  'users-permissions': {
    config: {
    jwtSecret: env('JWT_SECRET')
  },
  // ...
});
``` -->

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

::: caution

`JWT_SECRET` is not auto-generated in production mode. Secrets must be set for production mode independent of the development .env file. The [Hosting Provider Guides](/developer-docs/latest/setup-deployment-guides/deployment.html#hosting-provider-guides.md) are being updated to reflect these changes.

:::

<!--update this guide once all of the provider guides are updated.-->
