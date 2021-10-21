---
title: Middlewares configuration - Strapi Developer Documentation
description:
---

<!-- TODO: update SEO -->

# Middlewares configuration

In Strapi, 2 middleware concepts coexist:

- **Strapi middlewares** are configured and enabled as global middlewares for the entire Strapi server application. The present configuration documentation describes them. Strapi also offers the ability to implement your own custom middlewares (see [middlewares customization documentation](/developer-docs/latest/development/backend-customization/middlewares.md)).
- **Route middlewares** have a more limited scope and are configured and used as middlewares at the route level. They are described in the [route middlewares documentation](/developer-docs/latest/development/backend-customization/routes.md#middlewares).

The `./config/middlewares.js` file is used to define all the Strapi middlewares that should be applied by the Strapi server.

Only the middlewares present in this file are applied in a specific [loading order](#loading-order), with some [naming conventions](#naming-conventions) and an [optional configuration](#optional-configuration) for each middleware.
<!-- TODO: remove this comment — the link to middlewares above won't work until merged with PR #446 -->

## Loading order

The `./config/middlewares.js` file exports an array, where order matters and controls the execution order of the middleware stack:

<!-- ? What is "enabled: we could make enabling dynamic" for (see comments in code)? These were in the RFC. Could we use `enabled: false` just like we can disable plugins in ./config/plugins.js? What's the status on this (just an idea, decided but not implemented, etc.)? -->

```js
// path: ./config/middlewares.js

module.exports = [
  // The array is pre-populated with internal, built-in middlewares, prefixed by `strapi::`
  {
    name: 'strapi::router',
    config: {
      foo: 'bar',
    },
  },
  'strapi::cors',
  'strapi::parser',
  'strapi::error',
  'my-custom-node-module', // custom middleware that does not require any configuration
  {
    // custom resolve to find a package or a path
    resolve: 'my-custom-node-module',
    // enabled: we could make enabling dynamic
    config: {
      foo: 'bar',
    },
  },
  {
    // custom resolve to find a package or a path
    resolve: '../some-dir/custom-middleware',
    // enabled: we could make enabling dynamic
    config: {
      foo: 'bar',
    },
  },
];
```

:::tip
If you aren't sure where to place a middleware in the stack, add it to the end of the list.
:::

## Naming conventions

Strapi middlewares can be classified into different types depending on their origin, which defines the following naming conventions:

<!-- ? is it `app::` or `global::` for 'global' (i.e. application-level) middlewares? Or are these 2 different things? Wondering because I can find `app::` in [this part of the RFC](https://github.com/strapi/strapi-v4-rfc/blob/master/docs/strapi/api/middlewares.md#loading-middlwares) and `global::` in [this other part](https://github.com/strapi/strapi-v4-rfc/blob/master/docs/strapi/api/middlewares.md#implementation) 🤔 -->

| Middleware type | Origin                                                                       | Naming convention                                                                                       |
| --------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Internal        | Built-in middlewares (i.e. included with Strapi), automatically loaded       | `strapi::middleware-name`                                                                                |
| Application-level       | Loaded from the `./src/middlewares` folder                                   | `app::middleware-name`                                                                                   |
| API-level       | Loaded from the `./src/api/[api-name]/middlewares` folder                      | `api::api-name.middleware-name`                                                                           |
| Plugin          | Exported from `strapi-server.js` in the [`middlewares` property of the plugin interface](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#middlewares) | `plugin::plugin-name.middleware-name`                                                                     |
| External        | Can be:<ul><li>either node modules installed with [npm](https://www.npmjs.com/search?q=strapi-middleware)</li><li>or local middlewares (i.e. custom middlewares created locally and configured in `./config/middlewares.js`.)</li></ul>                   | -<br/><br/>As they are directly configured and resolved from the configuration file, they have no naming convention. |

## Optional configuration

Middlewares can have an optional configuration with the following parameters:

| Parameter | Description                                                       | Type    |
| --------- | ----------------------------------------------------------------- | ------- |
| `enabled` | Enable (`true`) or disable (`false`) a loaded middleware          | Boolean |
| `config`  | Used to define or override the middleware configuration           | Object  |
| `resolve` | Path to the middleware's folder (useful for external middlewares) | String  |

## Internal middlewares configuration reference

The core of Strapi embraces a small list of middlewares for performances, security and error handling:

- [body](#body),
- [compression](#compression),
- [cors](#cors),
- [errors](#errors),
- [favicon](#favicon),
- [ip](#ip),
- [logger](#logger),
- [poweredBy](#poweredBy),
- [query](#query),
- [response-time](#response-time),
- responses, which handle the [responses](/developer-docs/latest/development/backend-customization.html#responses),
- [security](#security),
- public,
- [session](#session)

::: caution
The following middlewares cannot be disabled: `responses`, `router`, `logger` and `error`.
:::

### `body`

The `body` middleware is based on [koa-body](https://github.com/koajs/koa-body) and uses these sensible defaults:

| Option      | Description                               | Type      | Default |
| ----------- | ----------------------------------------- | --------- | ------- |
| `multipart` | Parse multipart bodies                    | `Boolean` | `true`  |
| `patchKoa`  | Patch request body to Koa's `ctx.request` | `Boolean` | `true`  |

For a full list of available options, check the [koa-body documentation](https://github.com/koajs/koa-body#options).

### `compression`

The `compression` middleware is based on [koa-compress](https://github.com/koajs/compress) and offers the same [options](https://github.com/koajs/compress#options).

### `cors`

This security middleware is about [cross-origin resource sharing (CORS)](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) and is based on [@koa/cors](https://github.com/koajs/cors). It accepts the following options:

| Option     | Type            | Description                                                                                                                                                                      | Default value                                                                                                            |
| ------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `origin`      | String or Array | Allowed URLs.<br/><br/>The value(s) can be:<ul><li>strings (e.g. `http://example1.com, http://example2.com`)</li><li>an array of strings (e.g. `['http://www.example1.com', 'http://example1.com']`)</li><li>or `*` to allow all URLs</li></ul> | `*`                                                            |
| `maxAge`      | String or Number         | Configure the `Access-Control-Max-Age` CORS header parameter, in seconds                                                                                                                             | `31536000`                                                                                                              |                                                                 |
| `credentials` | Boolean         | Configure the `Access-Control-Allow-Credentials` CORS header                                                                                                                    | `true`                                                                                                                  |                                                                 |
| `methods`     | Array or String                                                                                                                                                                           | Configures the `Access-Control-Allow-Methods` CORS header                                                                | `['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']` |
| `headers`     | Array           | Configure the `Access-Control-Allow-Headers` CORS header<br/><br/>If not specified, defaults to reflecting the headers specified in the request's Access-Control-Request-Headers header | `['Content-Type', 'Authorization', 'Origin', 'Accept']`                                                                  |   
| `keepHeaderOnError`      | Array           | Add set headers to `err.header` if an error is thrown                                                                      | `false`.                                                                          |                                                                 |

### `errors`

The `errors` middleware is a wrapper of [@hapi/boom](https://hapi.dev/module/boom).

### `favicon`

The `favicon` middleware is based on [koa-favicon](https://github.com/koajs/favicon) and has these sensible defaults:

| Option   | Description                                      | Type    | Default value |
| -------- | ------------------------------------------------ | ------- | ------------- |
| `path`   | Path to the favicon file                         | String  | `favicon.ico` |
| `maxAge` | Cache-control max-age directive, in milliseconds | Integer | `86400000`    |

#### `ip`

The `ip` middleware is an IP filter middleware based on [koa-ip](https://github.com/nswbmw/koa-ip) and accepts the following options:

| Option      | Description     | Type  | Default value |
| ----------- | --------------- | ----- | ------------- |
| `whitelist` | Whitelisted IPs | Array | `[]`          |
| `blacklist` | Blacklisted IPs | Array | `[]`          |

### `logger`

| Option    | Description          | Type    | Default value |
| --------- | -------------------- | ------- | ------------- |
| `enabled` | Enable requests logs | Boolean | `false`       |

To define a custom configuration for the `logger` middleware, create a dedicated configuration file (`./config/logger.js`). It should export an object that must be a complete or partial [winstonjs](https://github.com/winstonjs/winston) logger configuration. The object will be merged with Strapi's default logger configuration on server start.

::: details Example: Custom configuration for the logger middleware

```js
'use strict';

const {
  winston,
  formats: { prettyPrint, levelFilter },
} = require('@strapi/logger');

module.exports = {
  transports: [
    new winston.transports.Console({
      level: 'http',
      format: winston.format.combine(
        levelFilter('http'),
        prettyPrint({ timestamps: 'YYYY-MM-DD hh:mm:ss.SSS' })
      ),
    }),
  ],
};
```
:::

### `poweredBy`

The `poweredBy` middleware adds a `X-Powered-By` parameter to the response header, with a default value of `Strapi <strapi.io>`.

### `query`

The `query` middleware is a query parser based on [qs](https://github.com/ljharb/qs) and has the following sensible defaults:

| Option               | Description                                                                                                                      | Type    | Default value |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| `strictNullHandling` | Distinguish between null values and empty strings (see [qs documentation](https://github.com/ljharb/qs#handling-of-null-values)) | Boolean | `true`        |
| `arrayLimit`         | Maximum index limit when parsing arrays (see [qs documentation](https://github.com/ljharb/qs#parsing-arrays))                    | Number  | 100           |
| `depth`              | Maximum depth of nested objects when parsing objects (see [qs documentation](https://github.com/ljharb/qs#parsing-objects))      | Number  | 20            |

### `response-time`

The `response-time` middleware enables the `X-Response-Time` (in milliseconds) for the response header.

### public

### `security`

The security middleware is based on [koa-helmet](https://helmetjs.github.io/) and has the following sensible defaults:

| Option                      | Description                                                                                                                                                                                                                                      | Type                                                   | Default value                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| `crossOriginEmbedderPolicy` | Sets the `Cross-Origin-Embedder-Policy` header to `require-corp`                                                                                                                                                                                 | `Boolean`                                              | `false`                                              |
| `crossOriginOpenerPolicy`   | Sets the `Cross-Origin-Opener-Policy` header                                                                                                                                                                                                     | `Boolean`                                              | `false`                                              |
| `crossOriginOpenerPolicy`   | Sets the `Cross-Origin-Resource-Policy` header                                                                                                                                                                                                   | `Boolean`                                              | `false`                                              |
| `originAgentCluster`        | Sets the `Origin-Agent-Cluster` header                                                                                                                                                                                                           | `Boolean`                                              | `false`                                              |
| `contentSecurityPolicy`     | Sets the `Content-Security-Policy` header                                                                                                                                                                                                        | `Boolean`                                              | `false`                                              |
| `xssFilter`                 | Disables browsers' cross-site scripting filter by setting the `X-XSS-Protection` header to `0`                                                                                                                                                   | `false`                                                |                                                      |
| `hsts`                      | Sets  options for the HTTP Strict Transport Security (HSTS) policy.<br/><br/>Accepts the following parameters:<ul><li>`maxAge`: Number of seconds HSTS is in effect</li><li>`includeSubDomains`: Applies HSTS to all subdomains of the host</li></ul> | <ul><li>`maxAge`: `Integer`</li><li>`includeSubDomains`: `Boolean`</li></ul> | <ul><li>`maxAge`: `31536000`</li><li>`includeSubDomains`: `true`</li></ul> |
| `frameguard`                | Sets `X-Frame-Options` header to help mitigate clickjacking attacks<br/><br />Accepts the `action` parameter that specifies which directive to use.                                                                                                    | `String`                                               | `sameorigin`                                         |

### `session`

The `session` middleware is a session middleware based on [koa-session](https://github.com/koajs/session). It accepts the following options:

<!-- | Option | Description | Type | Default value |
| --- | --- | --- | --- |
  "session": {
    "enabled": true,
    "client": "cookie",
    "key" | Cookie key | `String` | 'strapi.sid' |
    "prefix": "strapi:sess:",
    |ttl|  in seconds. | `Integer` | `864000000` |
    |`rolling`| Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. | `Boolean` | `false` |
    "secretKeys": ["mySecretKey1", "mySecretKey2"],
    "cookie": {
      "path": "/",
      "httpOnly": httpOnly or not
      "maxAge" | Maximum duration to keep the session cookie, in seconds | 864000000,
      "rewrite": true,
      "signed": false
    }
  }

  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean)  (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  secure: true, /** (boolean) secure cookie*/
  sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */ -->

