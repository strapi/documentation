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

## Internal middlewares configurations reference

_[ TODO: Add full list with parameter tables, based on middleware code available in packages/core/strapi/lib/middlewares ]_


<!-- Middleware files are functions that return an object. This object accepts an `initialize` function that is called during the server boot:

```js
module.exports = strapi => {
  return {
    // can also be async
    initialize() {
      strapi.app.use(async (ctx, next) => {
        // await someAsyncCode()

        await next();

        // await someAsyncCode()
      });
    },
  };
};
```

Once exported, middlewares are accessible through the [`strapi.middleware` global variable](/developer-docs/latest/developer-resources/global-strapi/api-reference.md#strapi-middleware).

### Node modules

Every folder that follows this name pattern `strapi-middleware-*` in the `./node_modules` folder will be loaded as a middleware.

A middleware needs to follow the structure below:

```
/middleware
└─── lib
     - index.js
- LICENSE.md
- package.json
- README.md
```

The `index.js` is the entry point to the middleware. It should look like the example above.

### Custom middlewares

The framework allows the application to override the default middlewares and [add new ones](#custom-middlewares-usage). To do so, create a `./middlewares` folder at the root of the project and put the middlewares into it.

```
/project
└─── api
└─── config
└─── middlewares
│   └─── responseTime // It will override the core default responseTime middleware.
│        - index.js
│   └─── views // New custom middleware, will be added to the stack of middlewares.
│        - index.js
└─── public
- favicon.ico
- package.json
- server.js
```

Every middleware will be injected into the Koa stack, and the [load order](#load-order) can be managed.

## Configuration and activation

To configure the middlewares of an application, create or edit the `./config/middleware.js` file.

This configuration file can accept the following parameters:

| Parameter     | Type    | Description                                                                                                                                                                |
| ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `timeout`  | integer | Maximum allowed time (in milliseconds) to load a middleware                                                                                                              |
| `load`     | Object  | [Load order](#load-order)                                                                                                                      |
| `settings` | Object  | Configuration of each middleware<br/><br/>Accepts a list of middlewares with their options, with the format:<br/>`middleware-name`: `{ option1: value, option2: value, … }` |

::: details Example of settings definition:

```js
// path: ./config/middleware.js

module.exports = {
  //...
  settings: {
    cors: {
      origin: ['http://localhost', 'https://mysite.com', 'https://www.mysite.com'],
    },
  },
};
```

:::

## Core middleware configurations reference

The core of Strapi embraces a small list of middlewares for performances, security and error handling:

- boom
- [cors](#cors-configuration)
- cron
- [csp](#csp-configuration)
- [favicon](#favicon-configuration)
- [gzip](#gzip-configuration)
- [hsts](#hsts-configuration)
- [ip](#ip-configuration)
- language
- [logger](#logger-configuration)
- [p3p](#p3p-configuration)
- [parser](#parser-configuration)
- [public](#public-configuration)
- responses
- responseTime
- router
- [session](#session-configuration)
- [xframe](#xframe-configuration)
- [xss](#xss-configuration)

::: caution
The following middlewares cannot be disabled: `responses`, `router`, `logger` and `boom`.
:::

<!-- ? If `logger` can't be disabled, why do we have an `enabled` parameter in its config? -->
<!-- ### Global middlewares

#### favicon configuration

| Parameter | Type    | Description                                      | Default value |
| --------- | ------- | ------------------------------------------------ | ------------- |
| `path`    | String  | Path to the favicon file                         | `favicon.ico` |
| `maxAge`  | Integer | Cache-control max-age directive, in milliseconds | `86400000`    |

#### public configuration

| Parameter      | Type    | Description                                         | Default value |
| -------------- | ------- | --------------------------------------------------- | ------------- |
| `path`         | String  | Path to the public folder                           | `./public`    |
| `maxAge`       | Integer | Cache-control max-age directive, in milliseconds    | `60000`       |
| `defaultIndex` | Boolean | Display default index page at `/` and `/index.html` | `true`        |

### Request middlewares

#### `session` configuration

| Parameter | Type    | Description     | Default value |
| --------- | ------- | --------------- | ------------- |
| `enabled` | Boolean | Enable sessions | `false`      |

#### `logger` configuration

| Parameter | Type    | Description          | Default value |
| --------- | ------- | -------------------- | ------------- |
| `enabled` | Boolean | Enable requests logs | `false`       |

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

#### `parser` configuration
  
| Parameter | Type    | Description                 | Default value |
| --------- | ------- | --------------------------- | ------------- |
| `enabled`           | Boolean           | Enable requests logs                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `false`      |
| `multipart`         | Boolean           | Enable multipart bodies parsing                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `true`        |
| `jsonLimit`         | String or Integer | The byte (if integer) limit of the JSON body                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `1mb`         |
| `formLimit`         | String or Integer | The byte (if integer) limit of the form body                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `56k`         |
| `queryStringParser` | Object            | QueryString parser options<br /><br/>Might contain the following keys (see [qs](https://github.com/ljharb/qs) for a full list of options):<ul><li>`arrayLimit` (integer): the maximum length of an array in the query string. Any array members with an index of greater than the limit will instead be converted to an object with the index as the key. Default value: `100`</li><li>`depth` (integer): maximum parsing depth of nested query string objects. Default value: `20`</li></ul> | -             |

::: tip
See [koa-body](https://github.com/dlau/koa-body#options) for more information.
:::

### Response middlewares

#### `gzip` configuration

| Parameter | Type    | Description                                                                             |
| --------- | ------- | --------------------------------------------------------------------------------------- |
| `enabled` | Boolean | Enable GZIP response compression                                                 |
| `options` | Object  | Allow passing of options from [koa-compress](https://github.com/koajs/compress#options) |

::: tip
`gzip` compression via `koa-compress` uses [Brotli](https://en.wikipedia.org/wiki/Brotli) by default, but is not configured with sensible defaults for most cases. If you experience slow response times with `gzip` enabled, consider disabling Brotli by passing `{br: false}` as an option. You may also pass more sensible params with `{br: { params: { // YOUR PARAMS HERE } }}`
:::

#### `responseTime` configuration

| Parameter | Type    | Description                                 | Default value |
| --------- | ------- | ------------------------------------------- | ------------- |
| `enabled` | Boolean | Enable `X-Response-Time header` to response | `false`       |

#### `poweredBy` configuration

| Parameter | Type    | Description                              | Default value        |
| --------- | ------- | ---------------------------------------- | -------------------- |
| `enabled` | Boolean | Enable `X-Powered-By` header to response | `true`               |
| `value`   | String  | Value of the header                      | `Strapi <strapi.io>` |

### Security middlewares

#### `csp` configuration

This security middleware is about [Content Security Policy (CSP)](https://en.wikipedia.org/wiki/Content_Security_Policy).

| Parameter | Type    | Description                                                                         | Default value |
| --------- | ------- | ----------------------------------------------------------------------------------- | ------------- |
| `enabled` | Boolean | Enable to avoid Cross Site Scripting (XSS) and data injection attacks               |               |
| `policy`  | String  | Configure the `Content-Security-Policy` header. If not specified uses default value | `undefined`   |

#### `p3p` configuration

This security middleware is about [Platform for Privacy Preferences (P3P)](https://en.wikipedia.org/wiki/P3P).

| Parameter | Type    | Description | Default value |
| --------- | ------- | ----------- | ------------- |
| `enabled` | Boolean | Enable p3p  |               |

#### `hsts` configuration

This security middleware is about [HTTP Strict Transport Security (HSTS)](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security).

| Parameter           | Type    | Description                                | Default value |
| ------------------- | ------- | ------------------------------------------ | ------------- |
| `enabled`           | Boolean | Enable HSTS.                               | -             |
| `maxAge`            | Integer | Number of seconds HSTS is in effect        | `31536000`    |
| `includeSubDomains` | Boolean | Applies HSTS to all subdomains of the host | `true`        |
#### `xframe` configuration

This security middleware is about [clickjacking](https://en.wikipedia.org/wiki/Clickjacking).

| Parameter | Type    | Description                                                       | Default value |
| --------- | ------- | ----------------------------------------------------------------- | ------------- |
| `enabled` | Boolean | Enable `X-FRAME-OPTIONS` headers in response.                     |               |
| `value`   | String  | The value for the header, e.g. DENY, SAMEORIGIN or ALLOW-FROM uri | `SAMEORIGIN` |

#### `xss` configuration

This security middleware is about [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting).

| Parameter | Type    | Description                                                                          | Default value |
| --------- | ------- | ------------------------------------------------------------------------------------ | ------------- |
| `enabled` | Boolean | Enable XSS to prevent Cross Site Scripting (XSS) attacks in older IE browsers (IE8). |               |

#### `cors` configuration

This security middleware is about [cross-origin resource sharing (CORS)](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

| Parameter     | Type            | Description                                                                                                                                                                      | Default value                                                                                                            |
| ------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `enabled`     | Boolean         | Enable CORS to prevent the server to be requested from another domain                                                                                               |                                                                                                                          |                                                                 |
| `origin`      | String or Array | Allowed URLs.<br/><br/>The value(s) can be:<ul><li>strings (e.g. `http://example1.com, http://example2.com`)</li><li>an array of strings (e.g. `['http://www.example1.com', 'http://example1.com']`)</li><li>or `*` to allow all URLs</li></ul> | `*`                                                            |
| `expose`      | Array           | Configure the `Access-Control-Expose-Headers` CORS header. <br/><br/>If not specified, no custom headers are exposed                                                                      | `["WWW-Authenticate", "Server-Authorization"]`.                                                                          |                                                                 |
| `maxAge`      | Integer         | Configure the `Access-Control-Max-Age` CORS header                                                                                                                              | `31536000`                                                                                                              |                                                                 |
| `credentials` | Boolean         | Configure the `Access-Control-Allow-Credentials` CORS header                                                                                                                    | `true`                                                                                                                  |                                                                 |
| `methods`     | Array or String                                                                                                                                                                           | Configures the `Access-Control-Allow-Methods` CORS header                                                                | `["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]` |
| `headers`     | Array           | Configure the `Access-Control-Allow-Headers` CORS header<br/><br/>If not specified, defaults to reflecting the headers specified in the request's Access-Control-Request-Headers header | `["Content-Type", "Authorization", "X-Frame-Options"]`                                                                  |                                                                 |

#### `ip` configuration

| Parameter   | Type    | Description       | Default value |
| ----------- | ------- | ----------------- | ------------- |
| `enabled`   | Boolean | Enable IP blocker | `false`      |
| `whiteList` | Array   | Whitelisted IPs   | `[]`         |
| `blackList` | Array   | Blacklisted IPs   | `[]`         |

## Custom middlewares usage

To add a custom middleware to the stack:

1. Create a `./middlewares/your-middleware-name/index.js` file
2. Enable it and define the loading order, using the `settings` and `load` keys respectively, in the configuration object exported from the `./config/middlewares.js` file

<!-- Load a middleware at the very first place -->

<!-- 
::: details Example: Create and set up a custom "timer" middleware:

```js

// path: ./middlewares/timer/index.js

module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        const start = Date.now();

        await next();

        const delta = Math.ceil(Date.now() - start);

        ctx.set('X-Response-Time', delta + 'ms');
      });
    },
  };
};

// path: ./config/middleware.js

module.exports = {
  load: {
    before: ['timer', 'responseTime', 'logger', 'cors', 'responses', 'gzip'],
    order: [
      "Define the middlewares' load order by putting their name in this array is the right order",
    ],
    after: ['parser', 'router'],
  },
  settings: {
    timer: {
      enabled: true,
    },
  },
};

```

::: -->
