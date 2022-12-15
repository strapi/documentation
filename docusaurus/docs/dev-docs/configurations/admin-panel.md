---
title: Admin panel configuration
displayed_sidebar: devDocsSidebar
description: Strapi's admin panel offers a single entry point file for its configuration.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.html
---

# Admin panel configuration

The `./config/admin.js` is used to define admin panel configuration for the Strapi application.

## Available options

The `./config/admin.js` file can include the following parameters:

| Parameter                         | Description                                                                                                                                                                                              | Type          | Default                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apiToken.salt`                   | Salt used to generate [API tokens](/dev-docs/configurations/api-tokens.md)                                                                                 | string        | Random string                                                                                    |
| `auth`                            | Authentication configuration                                                                                                                                                                             | object        | -                                                                                                                                |
| `auth.secret`                     | Secret used to encode JWT tokens                                                                                                                                                                         | string        | `undefined`                                                                                                                      |
| `auth.options`                    | Options object passed to [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)                                                                                                                      | object        | -                                                                                                                      |
| `auth.options.expiresIn`          | JWT expire time used in [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)                                                                                                                       | object        | `30d`                                                                                                                            |
| `auth.events`                     | Record of all the events subscribers registered for the authentication                                                                                                                                   | object        | `{}`                                                                                                                             |
| `auth.events.onConnectionSuccess` | Function called when an admin user log in successfully to the administration panel                                                                                                                       | function      | `undefined`                                                                                                                      |
| `auth.events.onConnectionError`   | Function called when an admin user fails to log in to the administration panel                                                                                                                           | function      | `undefined`                                                                                                                      |
| `url`                             | Url of your admin panel. Default value: `/admin`. Note: If the url is relative, it will be concatenated with `url`.                                                                                      | string        | `/admin`                                                                                                                         |
| `autoOpen`                        | Enable or disabled administration opening on start.                                                                                                                                                      | boolean       | `true`                                                                                                                           |
| `watchIgnoreFiles`                | Add custom files that should not be watched during development. See the [Chokidar GitHub repository](https://github.com/paulmillr/chokidar#path-filtering) (property `ignored`).                                              | array(string) | `[]`                                                                                                                             |
| `host`                            | Use a different host for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                            | string        | `localhost`                                                                                                                      |
| `port`                            | Use a different port for the admin panel. Only used along with `strapi develop --watch-admin`                                                                                                            | string        | `8000`                                                                                                                           |
| `serveAdminPanel`                 | If false, the admin panel won't be served. Note: the `index.html` will still be served, see [defaultIndex option](/dev-docs/configurations/middlewares.md) | boolean       | `true`                                                                                                                           |
| `forgotPassword`                  | Settings to customize the forgot password email (see [Forgot Password Email](/dev-docs/plugins/users-permissions.md#templating-emails))                            | object        | {}                                                                                                                               |
| `forgotPassword.emailTemplate`    | Email template as defined in [email plugin](/dev-docs/plugins/email.md#using-the-sendtemplatedemail-function)                                                                                                  | object        | [Default template](https://github.com/strapi/strapi/blob/main/packages/core/admin/server/config/email-templates/forgot-password.js) |
| `forgotPassword.from`             | Sender mail address                                                                                                                                                                                      | string        | Default value defined in your [provider configuration](/dev-docs/providers.md#configuring-providers)             |
| `forgotPassword.replyTo`          | Default address or addresses the receiver is asked to reply to                                                                                                                                           | string        | Default value defined in your [provider configuration](/dev-docs/providers.md#configuring-providers)             |

## Configurations

The `./config/admin.js` file should at least include a minimal configuration with required parameters for authentication and [API tokens](/dev-docs/configurations/api-tokens.md). Additional parameters can be included for a full configuration.

:::note
[Environmental configurations](/dev-docs/configurations/environment.md) (i.e. using the `env()` helper) do not need to contain all the values so long as they exist in the default `./config/server.js`.
:::

<Tabs>
<TabItem value="minimal config" label="Minimal configuration">

The default configuration created with any new project should at least include the following:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
});

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

export default ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
});
```

</TabItem>

</Tabs>
</TabItem>

<TabItem value="full config" label="Full configuration">

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auth: {
    events: {
      onConnectionSuccess(e) {
        console.log(e.user, e.provider);
      },
      onConnectionError(e) {
        console.error(e.error, e.provider);
      },
    },
    options: {
      expiresIn: '7d',
    },
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
  url: env('PUBLIC_ADMIN_URL', '/dashboard'),
  autoOpen: false,
  watchIgnoreFiles: [
    './my-custom-folder', // Folder
    './scripts/someScript.sh', // File
  ],
  host: 'localhost', // Only used for --watch-admin
  port: 8003, // Only used for --watch-admin
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  forgotPassword: {
    from: 'no-reply@example.com',
    replyTo: 'no-reply@example.com',
  },
});

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

export default ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auth: {
    events: {
      onConnectionSuccess(e) {
        console.log(e.user, e.provider);
      },
      onConnectionError(e) {
        console.error(e.error, e.provider);
      },
    },
    options: {
      expiresIn: '7d',
    },
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
  url: env('PUBLIC_ADMIN_URL', '/dashboard'),
  autoOpen: false,
  watchIgnoreFiles: [
    './my-custom-folder', // Folder
    './scripts/someScript.sh', // File
  ],
  host: 'localhost', // Only used for --watch-admin
  port: 8003, // Only used for --watch-admin
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  forgotPassword: {
    from: 'no-reply@example.com',
    replyTo: 'no-reply@example.com',
  },
});
```

</TabItem>

</Tabs>
</TabItem>
</Tabs>
