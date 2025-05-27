---
title: Admin panel configuration
sidebar_label: Admin panel
displayed_sidebar: cmsSidebar
toc_max_heading_level: 2
description: Strapi's admin panel offers a single entry point file for its configuration.
tags:
- admin panel
- API token
- authentication
- base configuration
- configuration
- minimal configuration
- password
---

# Admin panel configuration

The `/config/admin` file is used to define admin panel configuration for the Strapi application.

The present page acts as a reference for all the configuration parameters and values that you can find in the `/config/admin` file, grouped by topic. For additional information on how each feature works, please refer to links given in the introduction of each sub-section.

## Admin panel behavior

The admin panel behavior can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `autoOpen`                        | Enable or disable administration opening on start.                                                                                                                                                 | boolean       | `true`                                                                                                                              |
| `watchIgnoreFiles`                | Add custom files that should not be watched during development.<br/><br/> See more <ExternalLink to="https://github.com/paulmillr/chokidar#path-filtering" text="here" /> (property `ignored`).                                        | array(string) | `[]`                                                                                                                                |
| `serveAdminPanel`                 | If false, the admin panel won't be served.<br/><br/>Note: the `index.html` will still be served                                            | boolean       | `true`                                                                                                                              |

Some UI elements of the admin panel can also be configured in the `src/admin/app.[tsx|js]` file:

**Tutorial videos**  
To disable the information box containing the tutorial videos, set the `config.tutorials` key of the `src/admin/app.[tsx|js]` file to `false`.

**Releases notifications**  
To disable notifications about new Strapi releases, set the `config.notifications.releases` key of the `src/admin/app.[tsx|js]` file to `false`.


## API tokens

The [API tokens](/cms/features/api-tokens) can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `apiToken.salt`                   | Salt used to generate API tokens                                                                                                                            | string        | Random string                                                                                                                       |
| `apiToken.secrets.encryptionKey`   | Encryption key used to set API tokens visibility in the admin panel | string | Random string |

## Audit logs

The [Audit Logs](/cms/features/audit-logs) feature can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `auditLogs.enabled`               | Enable or disable the Audit Logs feature                                                                                                                         | boolean       | `true`                                                                                                                              |
| `auditLogs.retentionDays`         | How long Audit Logs are kept, in days.<br /><br />_The behavior differs for self-hosted vs. Strapi Cloud customers, see the note under the table._               | integer       | 90                                                                                                                                  |

:::note Retention days for self-hosted vs. Strapi Cloud users
For Strapi Cloud customers, the `auditLogs.retentionDays` value stored in the license information is used, unless a _smaller_ `retentionDays` value is defined in the `config/admin.js|ts` configuration file.
:::

## Authentication

The authentication system, including [SSO configuration](/cms/configurations/guides/configure-sso), can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `auth`                            | Authentication configuration                                                                                                                                                                       | object        | -                                                                                                                                   |
| `auth.secret`                     | Secret used to encode JWT tokens                                                                                                                                                                   | string        | `undefined`                                                                                                                         |
| `auth.domain`                     | Domain used within the cookie for SSO authentication <EnterpriseBadge /> <SsoBadge />)                                                                                                                             | string        | `undefined`                                                                                                                         |
| `auth.providers`                  | List of authentication providers used for SSO                                                                                           | array(object) | -                                                                                                                                   |
| `auth.options`                    | Options object passed to jsonwebtoken                                                                                                                | object        | -                                                                                                                                   |
| `auth.options.expiresIn`          | JWT expire time used in jsonwebtoken                                                                                                                 | object        | `30d`                                                                                                                               |
| `auth.events`                     | Record of all the events subscribers registered for the authentication                                                                                                                             | object        | `{}`                                                                                                                                |
| `auth.events.onConnectionSuccess` | Function called when an admin user log in successfully to the administration panel                                                                                                                 | function      | `undefined`                                                                                                                         |
| `auth.events.onConnectionError`   | Function called when an admin user fails to log in to the administration panel                                                                                                                     | function      | `undefined`                                                                                                                         |

## Server configuration

By default, Strapi's admin panel is exposed via `http://localhost:1337/admin`. For security reasons, the host, port, and path can be updated.

Unless you chose to deploy Strapi's back-end server and admin panel server on different servers (see [deployment](/cms/configurations/admin-panel#deployment)), by default:
- The back-end server and the admin panel server both run on the same host and port (`http://localhost:1337/`)
- The admin panel is accessible at the `/admin` path while the back-end server is accessible at the `/api` path

The server configuration for the admin panel can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `url`                             | Path to access the admin panel. If the URL is relative, it will be concatenated with the server URL.<br/><br/>Example: `/dashboard` makes the admin panel accessible at `http://localhost:1337/dashboard`.                                                                                | string        | `/admin`                                                                                                                            |
| `host`                            | Host for the admin panel server. | string        | `localhost`                                                                                                                         |
| `port`                            | Port for the admin panel server. | string        | `8000`                                                                                                                              |

### Update the admin panel's path only

To make the admin panel accessible at another path, for instance at `http://localhost:1337/dashboard`, define or update the `url` property:

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  // … other configuration properties
  url: "/dashboard",
});
```

Since by default the back-end server and the admin panel server run on the same host and port, only updating the `config/admin.[ts|js]` file should work if you left the `host` and `port` property values untouched in the [server configuration](/cms/configurations/server) file.

### Update the admin panel's host and port

If the admin panel and the back-end server are not hosted on the same server, you will need to update the host and port of the admin panel. For example, to host the admin panel on `my-host.com:3000`:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  host: "my-host.com",
  port: 3000,
  // Additionally you can define another path instead of the default /admin one 👇
  // url: '/dashboard' 
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```js title="/config/admin.ts"
export default ({ env }) => ({
  host: "my-host.com",
  port: 3000,
  // Additionally you can define another path instead of the default /admin one 👇
  // url: '/dashboard'
});
```

</TabItem>
</Tabs>

## Deployment

The front-end part of Strapi is called the admin panel. The admin panel presents a graphical user interface to help you structure and manage the content that will be accessible to your application's own front-end through Strapi's Content API.

The admin panel is a React-based single-page application that encapsulates all the features and installed plugins of a Strapi application.

The [back-end server](/cms/backend-customization) of Strapi serves the Content API which provides endpoints to your content.

By default, the back-end server and the admin panel server are deployed on the same server. But the admin panel and the back-end server are independent and can be deployed on different servers, which brings us to different scenarios:

- Deploy the entire project on the same server.
- Deploy the administration panel on a server (AWS S3, Azure, etc) different from the API server.

Build configurations differ for each case.

Before deployment, the admin panel needs to be built, by running the following command from the project's root directory:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn build
```

</TabItem>

<TabItem value="npm" label="npm">

```sh
npm run build
```

</TabItem>

</Tabs>

This will replace the folder's content located at `./build`. Visit <ExternalLink to="http://localhost:1337/admin" text="http://localhost:1337/admin"/> to make sure customizations have been taken into account.

### Same server

Deploying the admin panel and the back end (API) of Strapi on the same server is the default behavior. The build configuration will be automatically set. The server will start on the defined port and the administration panel will be accessible through `http://yourdomain.com:1337/admin`.

:::tip
You might want to [change the path to access the administration panel](#server-configuration).
:::

### Different servers

To deploy the admin panel and the back end (API) of Strapi on different servers, use the following configuration:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: "http://yourbackend.com",
});
```

```js title="./config/admin.js"
module.exports = ({ env }) => ({
  /**
   * Note: The administration will be accessible from the root of the domain
   * (ex: http://yourfrontend.com/)
   */
  url: "/",
  serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
});
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: "http://yourbackend.com",
});
```

```js title="./config/admin.ts"
export default ({ env }) => ({
  /**
   * Note: The administration will be accessible from the root of the domain
   * (ex: http://yourfrontend.com/)
   */
  url: "/",
  serveAdminPanel: false, // http://yourbackend.com will not serve any static admin files
});
```

</TabItem>
</Tabs>

After running `yarn build` with this configuration, the `build` folder will be created/overwritten. Use this folder to serve it from another server with the domain of your choice (e.g. `http://yourfrontend.com`).

The administration URL will then be `http://yourfrontend.com` and every request from the panel will hit the backend at `http://yourbackend.com`.

:::note
If you add a path to the `url` option, it won't prefix your application. To do so, use a proxy server like Nginx (see [optional software deployment guides](/cms/deployment#additional-resources)).
:::

## Feature flags

The feature flags can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `flags`                           | Settings to turn certain features or elements of the admin on or off                                                                                                                               | object        | {}                                                                                                                                  |
| `flags.nps`                       | Enable/Disable the Net Promoter Score popup                                                                                                                                                        | boolean       | `true`                                                                                                                              |
| `flags.promoteEE`                 | Enable/Disable the promotion of Strapi Enterprise features                                                                                                                                         | boolean       | `true`                                                                                                                              |

## Forgot password

The forgot password functionality, including [email templating](/cms/features/users-permissions#templating-emails), can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `forgotPassword`                  | Settings to customize the forgot password email                                                        | object        | {}                                                                                                                                  |
| `forgotPassword.emailTemplate`    | Email template as defined in email plugin                                                                                         | object        | Default template |
| `forgotPassword.from`             | Sender mail address                                                                                                                                                                                | string        | Default value defined in <br />your provider configuration                             |
| `forgotPassword.replyTo`          | Default address or addresses the receiver is asked to reply to                                                                                                                                     | string        | Default value defined in <br />your provider configuration                             |

## Rate limiting

The rate limiting for the admin panel's authentication endpoints can be configured with the following parameters. Additional configuration options come from the [koa2-ratelimit](https://www.npmjs.com/package/koa2-ratelimit) package:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `rateLimit`                       | Settings to customize the rate limiting of the admin panel's authentication endpoints | object        | {}                                                                                                                                  |
| `rateLimit.enabled`               | Enable or disable the rate limiter                                                                                                                                                                 | boolean       | `true`                                                                                                                              |
| `rateLimit.interval`              | Time window for requests to be considered as part of the same rate limiting bucket                                                                                                                 | object        | `{ min: 5 }`                                                                                                                        |
| `rateLimit.max`                   | Maximum number of requests allowed in the time window                                                                                                                                              | integer       | `5`                                                                                                                                 |
| `rateLimit.delayAfter`            | Number of requests allowed before delaying responses                                                                                                                                               | integer       | `1`                                                                                                                                 |
| `rateLimit.timeWait`              | Time to wait before responding to a request (in milliseconds)                                                                                                                                      | integer       | `3000`                                                                                                                              |
| `rateLimit.prefixKey`             | Prefix for the rate limiting key                                                                                                                                                                   | string        | `${userEmail}:${ctx.request.path}:${ctx.request.ip}`                                                                                |
| `rateLimit.whitelist`             | Array of IP addresses to whitelist from rate limiting                                                                                                                                              | array(string) | `[]`                                                                                                                                |
| `rateLimit.store`                 | Rate limiting storage location (Memory, Sequelize, or Redis). For more information see the koa2-ratelimit documentation               | object        | `MemoryStore`                                                                                                                       |

## Transfer tokens

Transfer tokens for the [Data transfer](/cms/data-management/transfer) feature can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `transfer.token.salt`             | Salt used to generate Transfer tokens.<br/><br/>If no transfer token salt is defined, transfer features will be disabled.               | string        | a random string                                                                                                                       |

:::note Retention days for self-hosted vs. Strapi Cloud users
For Strapi Cloud customers, the `auditLogs.retentionDays` value stored in the license information is used, unless a _smaller_ `retentionDays` value is defined in the `config/admin.js|ts` configuration file.
:::

## Configuration examples {#configurations}

The `/config/admin` file should at least include a minimal configuration with required parameters for [authentication](#authentication) and [API tokens](#api-tokens). Additional parameters can be included for a full configuration.

:::note
[Environmental configurations](/cms/configurations/environment.md) (i.e. using the `env()` helper) do not need to contain all the values so long as they exist in the default `/config/server`.
:::

<Tabs>
<TabItem value="minimal config" label="Minimal configuration">

The default configuration created with any new project should at least include the following:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
  auditLogs: { // only accessible with an Enterprise plan
    enabled: env.bool('AUDIT_LOGS_ENABLED', true),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
  transfer: { 
    token: { 
      salt: env('TRANSFER_TOKEN_SALT', 'anotherRandomLongString'),
    } 
  },
});

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/admin.ts"

export default ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  },
   auditLogs: { // only accessible with an Enterprise plan
    enabled: env.bool('AUDIT_LOGS_ENABLED', true),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
  transfer: { 
    token: { 
      salt: env('TRANSFER_TOKEN_SALT', 'anotherRandomLongString'),
    } 
  },
});
```

</TabItem>

</Tabs>
</TabItem>

<TabItem value="full config" label="Full configuration">

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/admin.js"

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
  },
  auditLogs: { // only accessible with an Enterprise plan
    enabled: env.bool('AUDIT_LOGS_ENABLED', true),
    retentionDays: 120,
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
  host: 'localhost',
  port: 8003,
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  forgotPassword: {
    from: 'no-reply@example.com',
    replyTo: 'no-reply@example.com',
  },
  rateLimit: {
    interval: { hour: 1, min: 30 },
    timeWait: 3*1000,
    max: 10,
  },
  transfer: { 
    token: { 
      salt: env('TRANSFER_TOKEN_SALT', 'anotherRandomLongString'),
    } 
  },
});

```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/admin.ts"

export default ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
  },
  auditLogs: { // only accessible with an Enterprise plan
    enabled: env.bool('AUDIT_LOGS_ENABLED', true),
    retentionDays: 120,
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
  host: 'localhost',
  port: 8003,
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  forgotPassword: {
    from: 'no-reply@example.com',
    replyTo: 'no-reply@example.com',
  },
  rateLimit: {
    interval: { hour: 1, min: 30 },
    timeWait: 3*1000,
    max: 10,
  },
  transfer: { 
    token: { 
      salt: env('TRANSFER_TOKEN_SALT', 'anotherRandomLongString'),
    } 
  },
});
```

</TabItem>

</Tabs>
</TabItem>
</Tabs>