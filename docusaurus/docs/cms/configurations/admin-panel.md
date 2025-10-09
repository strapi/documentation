---
title: Admin panel configuration
sidebar_label: Admin panel
displayed_sidebar: cmsSidebar
toc_max_heading_level: 3
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

<Tldr>
Options in `/config/admin` let you tweak admin panel behavior and server settings, including custom URLs, host, and port.
</Tldr>

The `/config/admin` file is used to define the [admin panel](/cms/features/admin-panel) configuration for the Strapi application.

The present page acts as a reference for all the configuration parameters and values that you can find in the `/config/admin` file, grouped by topic. For additional information on how each feature works, please refer to links given in the introduction of each sub-section.

## Admin panel behavior

The admin panel behavior can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `autoOpen`                        | Enable or disable administration opening on start.                                                                                                                                                 | boolean       | `true`                                                                                                                              |
| `watchIgnoreFiles`                | Add custom files that should not be watched during development.<br/><br/> See more <ExternalLink to="https://github.com/paulmillr/chokidar#path-filtering" text="here" /> (property `ignored`).                                        | array(string) | `[]`                                                                                                                                |
| `serveAdminPanel`                 | If false, the admin panel won't be served.<br/><br/>Note: the `index.html` will still be served                                            | boolean       | `true`                                                                                                                              |

:::note config/admin vs. src/admin/app configurations
Some UI elements of the admin panel must be configured in the `src/admin/app` file:

**Tutorial videos**  
To disable the information box containing the tutorial videos, set the `config.tutorials` key to `false`.

**Releases notifications**  
To disable notifications about new Strapi releases, set the `config.notifications.releases` key to `false`.

```js title="/src/admin/app.js"
const config = {
  // … other customization options go here
  tutorials: false,
  notifications: { releases: false },
};

export default {
  config,
};
```

:::

## Admin panel server

By default, Strapi's admin panel is exposed via `http://localhost:1337/admin`. For security reasons, the host, port, and path can be updated.


The server configuration for the admin panel can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `url`                             | Path to access the admin panel. If the URL is relative, it will be concatenated with the server URL.<br/><br/>Example: `/dashboard` makes the admin panel accessible at `http://localhost:1337/dashboard`.                                                                                | string        | `/admin`                                                                                                                            |
| `host`                            | Host for the admin panel server. | string        | `localhost`                                                                                                                         |
| `port`                            | Port for the admin panel server. | string        | `8000`                                                                                                                              |

:::note
If you add a path to the `url` option, it won't prefix your application. To do so, use a proxy server like Nginx (see [optional software deployment guides](/cms/deployment#additional-resources)).
:::

### Update the admin panel's path only

To make the admin panel accessible at another path, for instance at `http://localhost:1337/dashboard`, define or update the `url` property:

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  // … other configuration properties
  url: "/dashboard",
});
```

Since by default the back-end server and the admin panel server run on the same host and port, only updating the `config/admin` file should work if you left the `host` and `port` property values untouched in the back-end [server configuration](/cms/configurations/server) file.

### Update the admin panel's host and port

If the admin panel server and the back-end server are not hosted on the same server, you will need to update the host and port of the admin panel. For example, to host the admin panel on `my-host.com:3000`:

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

### Deploy on different servers {#deploy-on-different-servers}

Unless you chose to deploy Strapi's back-end server and admin panel server on different servers, by default:
- The back-end server and the admin panel server both run on the same host and port (`http://localhost:1337/`)
- The admin panel is accessible at the `/admin` path while the back-end server is accessible at the `/api` path

To deploy the admin panel and the back-end on completely different servers, you need to configure both the server (`/config/server`) and admin panel (`/config/admin-panel`) configurations.

The following example setup allows you to serve the admin panel from one domain while the API runs on another:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/server.js"
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: "http://yourbackend.com",
});
```

```js title="/config/admin.js"
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

```js title="/config/server.ts"
export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: "http://yourbackend.com",
});
```

```js title="/config/admin.ts"
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

With this configuration:
- The admin panel will be accessible at `http://yourfrontend.com` 
- All API requests from the panel will be sent to `http://yourbackend.com`
- The backend server will not serve any static admin files due to `serveAdminPanel: false`

## API tokens

The [API tokens](/cms/features/api-tokens) feature can be configured with the following parameters:

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

The authentication system, including [SSO configuration](/cms/configurations/guides/configure-sso) and [session management](#session-management), can be configured with the following parameters:

### Basic authentication

To configure basic authentication, use the following parameters:

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

Additional configuration parameters are available for [session management](#session-management).

### Session management

Admin authentication uses session management by default for enhanced security.

Session management provides enhanced security for authentication in Strapi applications by using short-lived access tokens paired with longer-lived refresh tokens. This approach reduces the risk of token theft and allows for more granular control over user sessions.

Strapi's session management system supports both admin panel authentication and Content API authentication through the [Users & Permissions feature](/cms/features/users-permissions). The system provides:

- Short-lived access tokens (typically 30 minutes) for API requests
- Refresh tokens for obtaining new access tokens
- Device-specific sessions for targeted logout
- Configurable token lifespans for different security requirements

To configure session lifespans and behavior, use the following parameters:

| Parameter                                 | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `auth.sessions`                           | Session management configuration                                                                                                                                                                   | object        | `{}`                                                                                                                                |
| `auth.sessions.accessTokenLifespan`       | Access token lifespan in seconds                                                                                                                                                                   | number        | `1800` (30 minutes)                                                                                                                 |
| `auth.sessions.maxRefreshTokenLifespan`   | Maximum refresh token lifespan in seconds                                                                                                                                                          | number        | `2592000` (30 days, or legacy `expiresIn` value)                                                                                   |
| `auth.sessions.idleRefreshTokenLifespan`  | Idle refresh token timeout in seconds                                                                                                                                                              | number        | `604800` (7 days)                                                                                                                   |
| `auth.sessions.maxSessionLifespan`        | Maximum session duration in seconds                                                                                                                                                                | number        | `2592000` (30 days, or legacy `expiresIn` value)                                                                                   |
| `auth.sessions.idleSessionLifespan`       | Session idle timeout in seconds                                                                                                                                                                    | number        | `3600` (1 hour)                                                                                                                     |

### Cookie configuration

To configure HTTP cookies for admin authentication, use the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `auth.cookie`                     | Cookie configuration for admin authentication                                                                                                                                                      | object        | `{}`                                                                                                                                |
| `auth.cookie.domain`              | Cookie domain (inherits from server if not set)                                                                                                                                                   | string        | `undefined`                                                                                                                         |
| `auth.cookie.path`                | Cookie path                                                                                                                                                                                        | string        | `'/admin'`                                                                                                                          |
| `auth.cookie.sameSite`            | <ExternalLink to="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value" text="SameSite cookie attribute"/>                                                                                                                                                                          | string        | `'lax'`                                                                                                                             |

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

The rate limiting for the admin panel's authentication endpoints can be configured with the following parameters. Additional configuration options come from the <ExternalLink text="koa2-ratelimit" to="https://www.npmjs.com/package/koa2-ratelimit"/> package:

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

## Strapi AI <NewBadge /> {#strapi-ai}

Strapi AI, adding features to the [Content-Type Builder](/cms/features/content-type-builder#strapi-ai) and [Media Library](/cms/features/media-library#ai-powered-metadata-generation) with <GrowthBadge /> plans, can be enabled or disabled:

| Parameter    | Description                              | Type     | Default         |
| ------------ | ---------------------------------------- | -------- | --------------- |
| `ai.enabled` | Whether Strapi AI is enabled or not      |  boolean | `true`          |

## Transfer tokens

Transfer tokens for the [Data transfer](/cms/data-management/transfer) feature can be configured with the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `transfer.token.salt`             | Salt used to generate Transfer tokens.<br/><br/>If no transfer token salt is defined, transfer features will be disabled.               | string        | a random string                                                                                                                       |

:::note Retention days for self-hosted vs. Strapi Cloud users
For Strapi Cloud customers, the `auditLogs.retentionDays` value stored in the license information is used, unless a _smaller_ `retentionDays` value is defined in the `config/admin.js|ts` configuration file.
:::

## Configuration examples

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
  ai: {
    enabled: false, // use this to disable Strapi AI
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
    sessions: {
      accessTokenLifespan: 1800, // 30 minutes
      maxRefreshTokenLifespan: 2592000, // 30 days
      idleRefreshTokenLifespan: 604800, // 7 days
      maxSessionLifespan: 604800, // 7 days
      idleSessionLifespan: 3600, // 1 hour
    },
    cookie: {
      domain: env('ADMIN_COOKIE_DOMAIN'),
      path: '/admin',
      sameSite: 'lax',
    },
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
  ai: {
    enabled: false, // use this to disable Strapi AI
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
    sessions: {
      accessTokenLifespan: 1800, // 30 minutes
      maxRefreshTokenLifespan: 2592000, // 30 days
      idleRefreshTokenLifespan: 604800, // 7 days
      maxSessionLifespan: 604800, // 7 days
      idleSessionLifespan: 3600, // 1 hour
    },
    cookie: {
      domain: env('ADMIN_COOKIE_DOMAIN'),
      path: '/admin',
      sameSite: 'lax',
    },
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