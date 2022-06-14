---
title: Middlewares configuration - Strapi Developer Docs
description: Strapi offers a single entry point file for its middlewares configurations.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html
---

# Middlewares configuration

::: strapi Different types of middlewares

In Strapi, 2 middleware concepts coexist:

- **Strapi middlewares** are configured and enabled as global middlewares for the entire Strapi server application. The present documentation describes how to configure Strapi middlewares.<br/>Strapi also offers the ability to implement your own custom middlewares (see [middlewares customization documentation](/developer-docs/latest/development/backend-customization/middlewares.md)).

- **Route middlewares** have a more limited scope and are configured and used as middlewares at the route level. They are described in the [route middlewares documentation](/developer-docs/latest/development/backend-customization/routes.md#middlewares).

:::

The `./config/middlewares.js` file is used to define all the Strapi middlewares that should be applied by the Strapi server.

Only the middlewares present in `./config/middlewares.js` are applied. Loading middlewares happens in a specific [loading order](#loading-order), with some [naming conventions](#naming-conventions) and an [optional configuration](#optional-configuration) for each middleware.

Strapi prepopulates the `./config/middlewares.js` file with built-in, internal middlewares that all have their own [configuration options](#internal-middlewares-configuration-reference).

## Loading order

The `./config/middlewares.js` file exports an array, where order matters and controls the execution order of the middleware stack:

```js
// path: ./config/middlewares.js

module.exports = [
  // The array is pre-populated with internal, built-in middlewares, prefixed by `strapi::`
  'strapi::cors',
  'strapi::body',
  'strapi::errors',
  // ...
  'my-custom-node-module', // custom middleware that does not require any configuration
  {
    // custom name to find a package or a path
    name: 'my-custom-node-module',
    config: {
      foo: 'bar',
    },
  },
  {
    // custom resolve to find a package or a path
    resolve: '../some-dir/custom-middleware',
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

| Middleware type   | Origin                                                                                                                                                                                                                                  | Naming convention                                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Internal          | Built-in middlewares (i.e. included with Strapi), automatically loaded                                                                                                                                                                  | `strapi::middleware-name`                                                                                            |
| Application-level | Loaded from the `./src/middlewares` folder                                                                                                                                                                                              | `global::middleware-name`                                                                                            |
| API-level         | Loaded from the `./src/api/[api-name]/middlewares` folder                                                                                                                                                                               | `api::api-name.middleware-name`                                                                                      |
| Plugin            | Exported from `strapi-server.js` in the [`middlewares` property of the plugin interface](/developer-docs/latest/developer-resources/plugin-api-reference/server.md#middlewares)                                                         | `plugin::plugin-name.middleware-name`                                                                                |
| External          | Can be:<ul><li>either node modules installed with [npm](https://www.npmjs.com/search?q=strapi-middleware)</li><li>or local middlewares (i.e. custom middlewares created locally and configured in `./config/middlewares.js`.)</li></ul> | -<br/><br/>As they are directly configured and resolved from the configuration file, they have no naming convention. |

## Optional configuration

Middlewares can have an optional configuration with the following parameters:

| Parameter | Description                                                       | Type     |
|-----------|-------------------------------------------------------------------|----------|
| `config`  | Used to define or override the middleware configuration           | `Object` |
| `resolve` | Path to the middleware's folder (useful for external middlewares) | `String` |

## Internal middlewares configuration reference

Strapi's core includes the following internal middlewares, mostly used for performances, security and error handling:

| Middleware                                                                                  | Added by Default | Required |
|---------------------------------------------------------------------------------------------|------------------|----------|
| [body](#body)                                                                               | `true`           | `true`   |
| [compression](#compression)                                                                 | `false`          | `false`  |
| [cors](#cors)                                                                               | `true`           | `true`   |
| [errors](#errors)                                                                           | `true`           | `true`   |
| [favicon](#favicon)                                                                         | `true`           | `true`   |
| [ip](#ip)                                                                                   | `false`          | `false`  |
| [logger](#logger)                                                                           | `true`           | `false`  |
| [poweredBy](#poweredby)                                                                     | `true`           | `false`  |
| [query](#query)                                                                             | `true`           | `true`   |
| [response-time](#response-time)                                                             | `false`          | `false`  |
| [responses](/developer-docs/latest/development/backend-customization/requests-responses.md) | -                | `true`   |
| [public](#public)                                                                           | `true`           | `true`   |
| [security](#security)                                                                       | `true`           | `true`   |
| [session](#session)                                                                         | `true`           | `false`  |

### `body`

The `body` middleware is based on [koa-body](https://github.com/koajs/koa-body). It accepts the following options:

| Option      | Description                               | Type      | Default |
|-------------|-------------------------------------------|-----------|---------|
| `multipart` | Parse multipart bodies                    | `Boolean` | `true`  |
| `patchKoa`  | Patch request body to Koa's `ctx.request` | `Boolean` | `true`  |

For a full list of available options, check the [koa-body documentation](https://github.com/koajs/koa-body#options).

### `compression`

The `compression` middleware is based on [koa-compress](https://github.com/koajs/compress) and offers the same [options](https://github.com/koajs/compress#options).

### `cors`

This security middleware is about cross-origin resource sharing (CORS) and is based on [@koa/cors](https://github.com/koajs/cors). It accepts the following options:

<!-- we definitely need to add multimarkdown support 😅  -->

| Option   | Type                                                                                                                                                                                                                                            | Description         | Default value |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|---------------|
| `origin` | Allowed URLs.<br/><br/>The value(s) can be:<ul><li>strings (e.g. `http://example1.com, http://example2.com`)</li><li>an array of strings (e.g. `['http://www.example1.com', 'http://example1.com']`)</li><li>or `*` to allow all URLs</li></ul> | `String` or `Array` | `'*'`         |
| `maxAge`            | Configure the `Access-Control-Max-Age` CORS header parameter, in seconds                                                                                                                                                                        | `String` or `Number` | `31536000`                                                     |  |
| `credentials`       | Configure the `Access-Control-Allow-Credentials` CORS header                                                                                                                                                                                    | `Boolean`            | `true`                                                         |
| `methods`           | Configure the `Access-Control-Allow-Methods` CORS header                                                                                                                                                                                        | `Array` or `String`  | `['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']` |
| `headers`           | Configure the `Access-Control-Allow-Headers` CORS header<br/><br/>If not specified, defaults to reflecting the headers specified in the request's `Access-Control-Request-Headers` header                                                       | `Array` or `String`  | `['Content-Type', 'Authorization', 'Origin', 'Accept']`        |
| `keepHeaderOnError` | Add set headers to `err.header` if an error is thrown                                                                                                                                                                                           | `Boolean`            | `false`                                                        |  |

### `errors`

The errors middleware handles [errors](/developer-docs/latest/developer-resources/error-handling.md) thrown by the code. Based on the type of error it sets the appropriate HTTP status to the response. By default, any error not supposed to be exposed to the end user will result in a 500 HTTP response.

The middleware doesn't have any configuration option.

### `favicon`

The `favicon` middleware serves the favicon and is based on [koa-favicon](https://github.com/koajs/favicon). It accepts the following options:

| Option   | Description                                      | Type      | Default value   |
|----------|--------------------------------------------------|-----------|-----------------|
| `path`   | Path to the favicon file                         | `String`  | `'favicon.ico'` |
| `maxAge` | Cache-control max-age directive, in milliseconds | `Integer` | `86400000`      |

#### `ip`

The `ip` middleware is an IP filter middleware based on [koa-ip](https://github.com/nswbmw/koa-ip). It accepts the following options:

| Option      | Description     | Type    | Default value |
|-------------|-----------------|---------|---------------|
| `whitelist` | Whitelisted IPs | `Array` | `[]`          |
| `blacklist` | Blacklisted IPs | `Array` | `[]`          |

### `logger`

The `logger` middleware is used to log requests.

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

The `poweredBy` middleware adds a `X-Powered-By` parameter to the response header. It accepts the following options:

| Option      | Description                        | Type     | Default value          |
|-------------|------------------------------------|----------|------------------------|
| `poweredBy` | Value of the `X-Powered-By` header | `String` | `'Strapi <strapi.io>'` |

### `query`

The `query` middleware is a query parser based on [qs](https://github.com/ljharb/qs). It accepts the following options:

| Option               | Description                                                                                                                      | Type      | Default value |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------|-----------|---------------|
| `strictNullHandling` | Distinguish between null values and empty strings (see [qs documentation](https://github.com/ljharb/qs#handling-of-null-values)) | `Boolean` | `true`        |
| `arrayLimit`         | Maximum index limit when parsing arrays (see [qs documentation](https://github.com/ljharb/qs#parsing-arrays))                    | `Number`  | `100`         |
| `depth`              | Maximum depth of nested objects when parsing objects (see [qs documentation](https://github.com/ljharb/qs#parsing-objects))      | `Number`  | `20`          |

### `response-time`

The `response-time` middleware enables the `X-Response-Time` (in milliseconds) for the response header.

The middleware doesn't have any configuration options.

### `public`

The `public` middleware is a static file serving middleware, based on [koa-static](https://github.com/koajs/static). It accepts the following options:

| Option         | Description                                         | Type      | Default value |
|----------------|-----------------------------------------------------|-----------|---------------|
| `maxAge`       | Cache-control max-age directive, in milliseconds    | `Integer` | `60000`       |
| `defaultIndex` | Display default index page at `/` and `/index.html` | `Boolean` | `true`        |

:::tip
You can customize the path of the public folder by editing the [server configuration file](/developer-docs/latest/setup-deployment-guides/configurations/required/server.html#available-options).
:::

### `security`

The security middleware is based on [koa-helmet](https://helmetjs.github.io/). It accepts the following options:

| Option                      | Description                                                                                                                                                                                                                                         | Type                                                                         | Default value                                                              |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| `crossOriginEmbedderPolicy` | Set the `Cross-Origin-Embedder-Policy` header to `require-corp`                                                                                                                                                                                     | `Boolean`                                                                    | `false`                                                                    |
| `crossOriginOpenerPolicy`   | Set the `Cross-Origin-Opener-Policy` header                                                                                                                                                                                                         | `Boolean`                                                                    | `false`                                                                    |
| `crossOriginOpenerPolicy`   | Set the `Cross-Origin-Resource-Policy` header                                                                                                                                                                                                       | `Boolean`                                                                    | `false`                                                                    |
| `originAgentCluster`        | Set the `Origin-Agent-Cluster` header                                                                                                                                                                                                               | `Boolean`                                                                    | `false`                                                                    |
| `contentSecurityPolicy`     | Set the `Content-Security-Policy` header                                                                                                                                                                                                            | `Boolean`                                                                    | `false`                                                                    |
| `xssFilter`                 | Disable browsers' cross-site scripting filter by setting the `X-XSS-Protection` header to `0`                                                                                                                                                       | `Boolean`                                                                    | `false`                                                                    |
| `hsts`                      | Set options for the HTTP Strict Transport Security (HSTS) policy.<br/><br/>Accepts the following parameters:<ul><li>`maxAge`: Number of seconds HSTS is in effect</li><li>`includeSubDomains`: Applies HSTS to all subdomains of the host</li></ul> | <ul><li>`maxAge`: `Integer`</li><li>`includeSubDomains`: `Boolean`</li></ul> | <ul><li>`maxAge`: `31536000`</li><li>`includeSubDomains`: `true`</li></ul> |
| `frameguard`                | Set `X-Frame-Options` header to help mitigate clickjacking attacks<br/><br />Accepts the `action` parameter that specifies which directive to use.                                                                                                  | `String`                                                                     | `'sameorigin'`                                                             |

### `session`

The `session` middleware allows the use of cookie-based sessions, based on [koa-session](https://github.com/koajs/session). It accepts the following options:

| Option       | Description                                                                                                                                                                                                                                                 | Type                     | Default value                           |
|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|-----------------------------------------|
| `key`        | Cookie key                                                                                                                                                                                                                                                  | `String`                 | `'koa.sess'`                            |
| `maxAge`     | Maximum lifetime of the cookies, in milliseconds. `'session'` will result in a cookie that expires when the session or browser is closed.                                                                                                                   | `Integer` or `'session'` | `86400000`                              |
| `autoCommit` | Automatically commit headers                                                                                                                                                                                                                                | `Boolean`                | `true`                                  |
| `overwrite`  | Can overwrite or not                                                                                                                                                                                                                                        | `Boolean`                | `true`                                  |
| `httpOnly`   | Is httpOnly or not. A cookie with the `HttpOnly` attribute is inaccessible to the JavaScript [`Document.cookie API`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie). Using `httpOnly` helps mitigate cross-site scripting (XSS) attacks. | `Boolean`                | `true`                                  |
| `signed`     | Sign the cookies                                                                                                                                                                                                                                            | `Boolean`                | `true`                                  |
| `rolling`    | Force a session identifier cookie to be set on every response. The expiration is reset to the original `maxAge` value, resetting the expiration countdown.                                                                                                  | `Boolean`                | `false`                                 |
| `renew`      | Renew the session when the session is nearly expired, so the user keeps being logged in.                                                                                                                                                                    | `Boolean`                | `false`                                 |
| `secure`     | Force the use of HTTPS                                                                                                                                                                                                                                      | `Boolean`                | `true` in production, `false` otherwise |
| `sameSite`   | Restrict the cookies to a first-party or same-site context                                                                                                                                                                                                  | `String`                 | `null`                                  |
