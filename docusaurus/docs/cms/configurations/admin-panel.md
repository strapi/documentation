---
title: Admin panel configuration
sidebar_label: Admin panel
displayed_sidebar: cmsSidebar
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

## Available options

The `/config/admin` file can include the following parameters:

| Parameter                         | Description                                                                                                                                                                                        | Type          | Default                                                                                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `apiToken.salt`                   | Salt used to generate [API tokens](/cms/features/api-tokens)                                                                                                                            | string        | Random string                                                                                                                       |
| `auditLogs.enabled`               | Enable or disable the [Audit Logs](/cms/features/audit-logs) feature                                                                                                                         | boolean       | `true`                                                                                                                              |
| `auditLogs.retentionDays`         | How long [Audit Logs](/cms/features/audit-logs) are kept, in days.<br /><br />_The behavior differs for self-hosted vs. Strapi Cloud customers, see the note under the table._               | integer       | 90                                                                                                                                  |
| `auth`                            | Authentication configuration                                                                                                                                                                       | object        | -                                                                                                                                   |
| `auth.secret`                     | Secret used to encode JWT tokens                                                                                                                                                                   | string        | `undefined`                                                                                                                         |
| `auth.domain`                     | Domain used within the cookie for SSO authentication <EnterpriseBadge /> <SsoBadge />)                                                                                                                             | string        | `undefined`                                                                                                                         |
| `auth.providers`                  | List of authentication providers used for [SSO](/cms/configurations/guides/configure-sso)                                                                                           | array(object) | -                                                                                                                                   |
| `auth.options`                    | Options object passed to <ExternalLink to="https://www.npmjs.com/package/jsonwebtoken" text="jsonwebtoken"/>                                                                                                                | object        | -                                                                                                                                   |
| `auth.options.expiresIn`          | JWT expire time used in <ExternalLink to="https://www.npmjs.com/package/jsonwebtoken" text="jsonwebtoken"/>                                                                                                                 | object        | `30d`                                                                                                                               |
| `auth.events`                     | Record of all the events subscribers registered for the authentication                                                                                                                             | object        | `{}`                                                                                                                                |
| `auth.events.onConnectionSuccess` | Function called when an admin user log in successfully to the administration panel                                                                                                                 | function      | `undefined`                                                                                                                         |
| `auth.events.onConnectionError`   | Function called when an admin user fails to log in to the administration panel                                                                                                                     | function      | `undefined`                                                                                                                         |
| `url`                             | Url of your admin panel. Default value: `/admin`. Note: If the url is relative, it will be concatenated with `url`.                                                                                | string        | `/admin`                                                                                                                            |
| `autoOpen`                        | Enable or disable administration opening on start.                                                                                                                                                 | boolean       | `true`                                                                                                                              |
| `watchIgnoreFiles`                | Add custom files that should not be watched during development. See more <ExternalLink to="https://github.com/paulmillr/chokidar#path-filtering" text="here"/> (property `ignored`).                                        | array(string) | `[]`                                                                                                                                |
| `host`                            | Use a different host for the admin panel. | string        | `localhost`                                                                                                                         |
| `port`                            | Use a different port for the admin panel.                                                                                                       | string        | `8000`                                                                                                                              |
| `serveAdminPanel`                 | If false, the admin panel won't be served. Note: the `index.html` will still be served                                            | boolean       | `true`                                                                                                                              |
| `flags`                           | Settings to turn certain features or elements of the admin on or off                                                                                                                               | object        | {}                                                                                                                                  |
| `flags.nps`                       | Enable/Disable the Net Promoter Score popup                                                                                                                                                        | boolean       | `true`                                                                                                                              |
| `flags.promoteEE`                 | Enable/Disable the promotion of Strapi Enterprise features                                                                                                                                         | boolean       | `true`                                                                                                                              |
| `forgotPassword`                  | Settings to customize the forgot password email (see [Forgot Password Email](/cms/features/users-permissions#templating-emails))                                                        | object        | {}                                                                                                                                  |
| `forgotPassword.emailTemplate`    | Email template as defined in [email plugin](/cms/features/email#using-the-sendtemplatedemail-function)                                                                                         | object        | <ExternalLink to="https://github.com/strapi/strapi/blob/main/packages/core/admin/server/config/email-templates/forgot-password.js" text="Default template"/> |
| `forgotPassword.from`             | Sender mail address                                                                                                                                                                                | string        | Default value defined in <br />your [provider configuration](/cms/providers#configuring-providers)                             |
| `forgotPassword.replyTo`          | Default address or addresses the receiver is asked to reply to                                                                                                                                     | string        | Default value defined in <br />your [provider configuration](/cms/providers#configuring-providers)                             |
| `rateLimit`                       | Settings to customize the rate limiting of the admin panel's authentication endpoints, additional configuration options come from <ExternalLink to="https://www.npmjs.com/package/koa2-ratelimit" text="`koa2-ratelimit`"/> | object        | {}                                                                                                                                  |
| `rateLimit.enabled`               | Enable or disable the rate limiter                                                                                                                                                                 | boolean       | `true`                                                                                                                              |
| `rateLimit.interval`              | Time window for requests to be considered as part of the same rate limiting bucket                                                                                                                 | object        | `{ min: 5 }`                                                                                                                        |
| `rateLimit.max`                   | Maximum number of requests allowed in the time window                                                                                                                                              | integer       | `5`                                                                                                                                 |
| `rateLimit.delayAfter`            | Number of requests allowed before delaying responses                                                                                                                                               | integer       | `1`                                                                                                                                 |
| `rateLimit.timeWait`              | Time to wait before responding to a request (in milliseconds)                                                                                                                                      | integer       | `3000`                                                                                                                              |
| `rateLimit.prefixKey`             | Prefix for the rate limiting key                                                                                                                                                                   | string        | `${userEmail}:${ctx.request.path}:${ctx.request.ip}`                                                                                |
| `rateLimit.whitelist`             | Array of IP addresses to whitelist from rate limiting                                                                                                                                              | array(string) | `[]`                                                                                                                                |
| `rateLimit.store`                 | Rate limiting storage location (Memory, Sequelize,  or Redis) and for more information please see the <ExternalLink to="https://www.npmjs.com/package/koa2-ratelimit" text="`koa2-ratelimit documentation`"/>               | object        | `MemoryStore`                                                                                                                       |
| `transfer.token.salt`             | Salt used to generate [Transfer tokens](/cms/data-management/transfer#generate-a-transfer-token).<br/>If no transfer token salt is defined, transfer features will be disabled.               | string        | Random string                                                                                                                       |

:::note Retention days for self-hosted vs. Strapi Cloud users
For Strapi Cloud customers, the `auditLogs.retentionDays` value stored in the license information is used, unless a _smaller_ `retentionDays` value is defined in the `config/admin.js|ts` configuration file.
:::

## Configuration examples {#configurations}

The `/config/admin` file should at least include a minimal configuration with required parameters for authentication and [API tokens](/cms/features/api-tokens.md). Additional parameters can be included for a full configuration.

:::note
[Environmental configurations](/cms/configurations/environment.md) (i.e. using the `env()` helper) do not need to contain all the values so long as they exist in the default `/config/server`.
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

```ts title="./config/admin.ts"

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

```js title="./config/admin.js"

module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
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

```ts title="./config/admin.ts"

export default ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someRandomLongString'),
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
