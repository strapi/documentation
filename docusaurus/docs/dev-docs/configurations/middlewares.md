---
title: Middlewares configuration
sidebar_label: Middlewares
displayed_sidebar: cmsSidebar
description: Strapi offers a single entry point file for its middlewares configurations.
tags:
- base configuration
- body middleware
- configuration
- global middlewares
- internal middleware
- middlewares
- middlewares customization
- middleware type
- route middlewares
---

import MiddlewareTypes from '/docs/snippets/middleware-types.md'

# Middlewares configuration

<MiddlewareTypes />

The `./config/middlewares.js` file is used to define all the global middlewares that should be applied by the Strapi server.

Only the middlewares present in `./config/middlewares.js` are applied. Loading middlewares happens in a specific [loading order](#loading-order), with some [naming conventions](#naming-conventions) and an [optional configuration](#optional-configuration) for each middleware.

Strapi pre-populates the `./config/middlewares.js` file with built-in, internal middlewares that all have their own [configuration options](#internal-middlewares-configuration-reference).

## Loading order

The `./config/middlewares.js` file exports an array, where order matters and controls the execution order of the middleware stack:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // The array is pre-populated with internal, built-in middlewares, prefixed by `strapi::`
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',

  // custom middleware that does not require any configuration
  'global::my-custom-node-module', 

  // custom name to find a package or a path
  {
    name: 'my-custom-node-module',
    config: {
      foo: 'bar',
    },
  },

  // custom resolve to find a package or a path
  {
    resolve: '../some-dir/custom-middleware',
    config: {
      foo: 'bar',
    },
  },

  // custom configuration for internal middleware
  {
    name: 'strapi::poweredBy',
    config: {
      poweredBy: 'Some awesome company',
    },
  },

  // remaining internal & built-in middlewares
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // The array is pre-populated with internal, built-in middlewares, prefixed by `strapi::`
  'strapi::logger',
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

</TabItem>

</Tabs>

:::tip
If you aren't sure where to place a middleware in the stack, add it to the end of the list.
:::

## Naming conventions

Global middlewares can be classified into different types depending on their origin, which defines the following naming conventions:

| Middleware type   | Origin                                                                                                                                                                                                                                  | Naming convention                                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Internal          | Built-in middlewares (i.e. included with Strapi), automatically loaded                                                                                                                                                                  | `strapi::middleware-name`                                                                                            |
| Application-level | Loaded from the `./src/middlewares` folder                                                                                                                                                                                              | `global::middleware-name`                                                                                            |
| API-level         | Loaded from the `./src/api/[api-name]/middlewares` folder                                                                                                                                                                               | `api::api-name.middleware-name`                                                                                      |
| Plugin            | Exported from `strapi-server.js` in the [`middlewares` property of the plugin interface](/dev-docs/plugins/server-api#middlewares)                                                                                               | `plugin::plugin-name.middleware-name`                                                                                |
| External          | Can be:<ul><li>either node modules installed with [npm](https://www.npmjs.com/search?q=strapi-middleware)</li><li>or local middlewares (i.e. custom middlewares created locally and configured in `./config/middlewares.js`.)</li></ul> | -<br/><br/>As they are directly configured and resolved from the configuration file, they have no naming convention. |

## Optional configuration

Middlewares can have an optional configuration with the following parameters:

| Parameter | Description                                                       | Type     |
|-----------|-------------------------------------------------------------------|----------|
| `config`  | Used to define or override the middleware configuration           | `Object` |
| `resolve` | Path to the middleware's folder (useful for external middlewares) | `String` |

## Internal middlewares configuration reference

Strapi's core includes the following internal middlewares, mostly used for performances, security and error handling:

| Middleware                                                         | Added by Default | Required |
|--------------------------------------------------------------------|------------------|----------|
| [body](#body)                                                      | Yes              | Yes      |
| [compression](#compression)                                        | No               | No       |
| [cors](#cors)                                                      | Yes              | Yes      |
| [errors](#errors)                                                  | Yes              | Yes      |
| [favicon](#favicon)                                                | Yes              | Yes      |
| [ip](#ip)                                                          | No               | No       |
| [logger](#logger)                                                  | Yes              | No       |
| [poweredBy](#poweredby)                                            | Yes              | No       |
| [query](#query)                                                    | Yes              | Yes      |
| [response-time](#response-time)                                    | No               | No       |
| [responses](/dev-docs/backend-customization/requests-responses.md) | Yes              | Yes      |
| [public](#public)                                                  | Yes              | Yes      |
| [security](#security)                                              | Yes              | Yes      |
| [session](#session)                                                | Yes              | No       |

### `body`

The `body` middleware is based on [koa-body](https://github.com/koajs/koa-body). Tt uses the [`node-formidable`](https://github.com/felixge/node-formidable) library to process files. `body` accepts the following options:

| Option       | Description                                                                                                                             | Type                  | Default     |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------|-----------------------|-------------|
| `multipart`  | Parse multipart bodies                                                                                                                  | `Boolean`             | `true`      |
| `patchKoa`   | Patch request body to Koa's `ctx.request`                                                                                               | `Boolean`             | `true`      |
| `jsonLimit`  | The byte (if integer) limit of the JSON body                                                                                            | `String` or `Integer` | `1mb`       |
| `formLimit`  | The byte (if integer) limit of the form body                                                                                            | `String` or `Integer` | `56kb`      |
| `textLimit`  | The byte (if integer) limit of the text body                                                                                            | `String` or `Integer` | `56kb`      |
| `encoding`   | Sets encoding for incoming form fields                                                                                                  | `String`              | `utf-8`     |
| `formidable` | Options to pass to the `formidable` multipart parser (see [node-formidable documentation](https://github.com/felixge/node-formidable)). | `Object`              | `undefined` |

For a full list of available options for `koa-body`, check the [koa-body documentation](https://github.com/koajs/koa-body#options).

<details>
<summary> Example: Custom configuration for the body middleware </summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '3mb',
      formLimit: '10mb',
      textLimit: '256kb',
      encoding: 'gbk',
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '3mb',
      formLimit: '10mb',
      textLimit: '256kb',
      encoding: 'gbk',
    },
  },
  // ...
]
```

</TabItem>

</Tabs>

</details>

### `compression`

The `compression` middleware is based on [koa-compress](https://github.com/koajs/compress). It accepts the following options:

| Option            | Description                                                                | Type                  | Default    |
|-------------------|----------------------------------------------------------------------------|-----------------------|------------|
| `threshold`       | Minimum response size in bytes to compress                                 | `String` or `Integer` | `1kb`      |
| `br`              | Toggle Brotli compression                                                  | `Boolean`             | `true`     |
| `gzip`            | Toggle gzip compression                                                    | `Boolean`             | `false`    |
| `deflate`         | Toggle deflate compression                                                 | `Boolean`             | `false`    |
| `defaultEncoding` | Specifies what encoders to use for requests without Accept-Encoding header | `String`              | `identity` |

<details> 
<summary>Example: Custom configuration for the compression middleware</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::compression',
    config: {
      br: false
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::compression',
    config: {
      br: false
    },
  },
  // ...
]
```

</TabItem>

</Tabs>

</details>

### `cors`

This security middleware is about cross-origin resource sharing (CORS) and is based on [@koa/cors](https://github.com/koajs/cors). It accepts the following options:

| Option              | Type                                                      | Description          | Default value                                              |
|---------------------|-----------------------------------------------------------|----------------------|------------------------------------------------------------|
| `origin`            | Configure the `Access-Control-Allow-Origin` header        | `String` or `Array`  | `'*'`                                                      |
| `maxAge`            | Configure the `Access-Control-Max-Age` header, in seconds | `String` or `Number` | `31536000`                                                 |
| `credentials`       | Configure the `Access-Control-Allow-Credentials` header   | `Boolean`            | `true`                                                     |
| `methods`           | Configure the `Access-Control-Allow-Methods` header       | `Array` or `String`  | `['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']`      |
| `headers`           | Configure the `Access-Control-Allow-Headers` header       | `Array` or `String`  | Request headers passed in `Access-Control-Request-Headers` |
| `keepHeaderOnError` | Add set headers to `err.header` if an error is thrown     | `Boolean`            | `false`                                                    |

<details>
<summary> Example: Custom configuration for the cors middleware</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::cors',
    config: {
      origin: ['https://example.com', 'https://subdomain.example.com', 'https://someotherwebsite.org'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::cors',
    config: {
      origin: ['example.com', 'subdomain.example.com', 'someotherwebsite.org'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  // ...
]
```

</TabItem>

</Tabs>



</details>

### `errors`

The errors middleware handles [errors](/dev-docs/error-handling.md) thrown by the code. Based on the type of error it sets the appropriate HTTP status to the response. By default, any error not supposed to be exposed to the end user will result in a 500 HTTP response.

The middleware doesn't have any configuration options.

### `favicon`

The `favicon` middleware serves the favicon and is based on [koa-favicon](https://github.com/koajs/favicon). It accepts the following options:

| Option   | Description                                      | Type      | Default value   |
|----------|--------------------------------------------------|-----------|-----------------|
| `path`   | Path to the favicon file                         | `String`  | `'favicon.ico'` |
| `maxAge` | Cache-control max-age directive, in milliseconds | `Integer` | `86400000`      |

<details>
<summary> Example: Custom configuration for the favicon middleware</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::favicon',
    config: {
      path: './public/uploads/custom-fav-abc123.ico'
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::favicon',
    config: {
      path: './public/uploads/custom-fav-abc123.ico'
    },
  },
  // ...
]
```

</TabItem>

</Tabs>

</details>

#### `ip`

The `ip` middleware is an IP filter middleware based on [koa-ip](https://github.com/nswbmw/koa-ip). It accepts the following options:

| Option      | Description     | Type    | Default value |
|-------------|-----------------|---------|---------------|
| `whitelist` | Whitelisted IPs | `Array` | `[]`          |
| `blacklist` | Blacklisted IPs | `Array` | `[]`          |

:::tip
The `whitelist` and `blacklist` options support wildcards (e.g. `whitelist: ['192.168.0.*', '127.0.0.*']`) and spreads (e.g. `whitelist: ['192.168.*.[3-10]']`).
:::

 <details>
 <summary> Example: Custom configuration for the ip middleware</summary>

 <Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::ip',
    config: {
      whitelist: ['192.168.0.*', '192.168.1.*', '123.123.123.123'],
      blacklist: ['1.116.*.*', '103.54.*.*'],
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::ip',
    config: {
      whitelist: ['192.168.0.*', '192.168.1.*', '123.123.123.123'],
      blacklist: ['1.116.*.*', '103.54.*.*'],
    },
  },
  // ...
]
```

</TabItem>

</Tabs>

</details>

### `logger`

The `logger` middleware is used to log requests.

To define a custom configuration for the `logger` middleware, create a dedicated configuration file (`./config/logger.js`). It should export an object that must be a complete or partial [winstonjs](https://github.com/winstonjs/winston) logger configuration. The object will be merged with Strapi's default logger configuration on server start.

<details>
<summary> Example: Custom configuration for the logger middleware</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/logger.js"

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/logger.ts"

'use strict';

const {
  winston,
  formats: { prettyPrint, levelFilter },
} = require('@strapi/logger');

export default {
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

</TabItem>

</Tabs>

</details>

### `poweredBy`

The `poweredBy` middleware adds a `X-Powered-By` parameter to the response header. It accepts the following options:

| Option      | Description                        | Type     | Default value          |
|-------------|------------------------------------|----------|------------------------|
| `poweredBy` | Value of the `X-Powered-By` header | `String` | `'Strapi <strapi.io>'` |

<details>
<summary> details Example: Custom configuration for the poweredBy middleware</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::poweredBy',
    config: {
      poweredBy: 'Some Awesome Company <example.com>'
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::poweredBy',
    config: {
      poweredBy: 'Some Awesome Company <example.com>'
    },
  },
  // ...
]
```

</TabItem>

</Tabs>

</details>

### `query`

The `query` middleware is a query parser based on [qs](https://github.com/ljharb/qs). It accepts the following options:

| Option               | Description                                                                                                                      | Type      | Default value |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------|-----------|---------------|
| `strictNullHandling` | Distinguish between null values and empty strings (see [qs documentation](https://github.com/ljharb/qs#handling-of-null-values)) | `Boolean` | `true`        |
| `arrayLimit`         | Maximum index limit when parsing arrays (see [qs documentation](https://github.com/ljharb/qs#parsing-arrays))                    | `Number`  | `100`         |
| `depth`              | Maximum depth of nested objects when parsing objects (see [qs documentation](https://github.com/ljharb/qs#parsing-objects))      | `Number`  | `20`          |

<details>
<summary> Example: Custom configuration for the query middleware </summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::query',
    config: {
      arrayLimit: 50,
      depth: 10,
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::query',
    config: {
      arrayLimit: 50,
      depth: 10,
    },
  },
  // ...
]
```

</TabItem>

</Tabs>

</details>

### `response-time`

The `response-time` middleware enables the `X-Response-Time` (in milliseconds) for the response header.

The middleware doesn't have any configuration options.

### `public`

The `public` middleware is a static file serving middleware, based on [koa-static](https://github.com/koajs/static). It accepts the following options:

| Option         | Description                                         | Type      | Default value |
|----------------|-----------------------------------------------------|-----------|---------------|
| `maxAge`       | Cache-control max-age directive, in milliseconds    | `Integer` | `60000`       |

:::tip
You can customize the path of the public folder by editing the [server configuration file](/dev-docs/configurations/server.md#available-options).
:::

<details>
<summary>Example: Custom configuration for the public middleware</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::public',
    config: {
      defer: true,
      index: env('INDEX_PATH', 'index-dev.html')
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::public',
    config: {
      defer: true,
      index: env('INDEX_PATH', 'index-dev.html')
    },
  },
  // ...
]
```

</TabItem>

</Tabs>

</details>

### `security`

The security middleware is based on [koa-helmet](https://helmetjs.github.io/). It accepts the following options:

| Option                      | Description                                                                                   | Type                  | Default value |
|-----------------------------|-----------------------------------------------------------------------------------------------|-----------------------|---------------|
| `crossOriginEmbedderPolicy` | Set the `Cross-Origin-Embedder-Policy` header to `require-corp`                               | `Boolean`             | `false`       |
| `crossOriginOpenerPolicy`   | Set the `Cross-Origin-Opener-Policy` header                                                   | `Boolean`             | `false`       |
| `crossOriginResourcePolicy` | Set the `Cross-Origin-Resource-Policy` header                                                 | `Boolean`             | `false`       |
| `originAgentCluster`        | Set the `Origin-Agent-Cluster` header                                                         | `Boolean`             | `false`       |
| `contentSecurityPolicy`     | Set the `Content-Security-Policy` header                                                      | `Object`              | `-`           |
| `xssFilter`                 | Disable browsers' cross-site scripting filter by setting the `X-XSS-Protection` header to `0` | `Boolean`             | `false`       |
| `hsts`                      | Set options for the HTTP Strict Transport Security (HSTS) policy.                             | `Object`              | -             |
| `hsts.maxAge`               | Number of seconds HSTS is in effect                                                           | `Integer`             | `31536000`    |
| `hsts.includeSubDomains`    | Applies HSTS to all subdomains of the host                                                    | `Boolean`             | `true`        |
| `frameguard`                | Set `X-Frame-Options` header to help mitigate clickjacking attacks, set to `false` to disable | `Boolean` or `Object` | -             |
| `frameguard.action`         | Value must be either `deny` or `sameorigin`                                                   | `String`              | `sameorigin`  |

:::tip
When using any 3rd party upload provider, generally it's required to set a custom configuration here. Please see the provider documentation for which configuration options are required.
:::

:::note
The default directives include a `market-assets.strapi.io` value. This value is set for the [in-app market](/user-docs/plugins/installing-plugins-via-marketplace) and is safe to keep.
:::

<details>
<summary> Example: Custom configuration for the security middleware for using the AWS-S3 provider</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'yourBucketName.s3.yourRegion.amazonaws.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'yourBucketName.s3.yourRegion.amazonaws.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'yourBucketName.s3.yourRegion.amazonaws.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'yourBucketName.s3.yourRegion.amazonaws.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```

</TabItem>

</Tabs>


</details>

### `session`

The `session` middleware allows the use of cookie-based sessions, based on [koa-session](https://github.com/koajs/session). It accepts the following options:

| Option       | Description                                                                                                            | Type                     | Default value                           |
|--------------|------------------------------------------------------------------------------------------------------------------------|--------------------------|-----------------------------------------|
| `key`        | Cookie key                                                                                                             | `String`                 | `'koa.sess'`                            |
| `maxAge`     | Maximum lifetime of the cookies, in milliseconds. Using `'session'` will expire the cookie when the session is closed. | `Integer` or `'session'` | `86400000`                              |
| `autoCommit` | Automatically commit headers                                                                                           | `Boolean`                | `true`                                  |
| `overwrite`  | Can overwrite or not                                                                                                   | `Boolean`                | `true`                                  |
| `httpOnly`   | Is httpOnly or not. Using `httpOnly` helps mitigate cross-site scripting (XSS) attacks.                                | `Boolean`                | `true`                                  |
| `signed`     | Sign the cookies                                                                                                       | `Boolean`                | `true`                                  |
| `rolling`    | Force a session identifier cookie to be set on every response.                                                         | `Boolean`                | `false`                                 |
| `renew`      | Renew the session when the session is nearly expired, so the user keeps being logged in.                               | `Boolean`                | `false`                                 |
| `secure`     | Force the use of HTTPS                                                                                                 | `Boolean`                | `true` in production, `false` otherwise |
| `sameSite`   | Restrict the cookies to a first-party or same-site context                                                             | `String`                 | `null`                                  |

<details>
<summary> Example: Custom configuration for the session middleware </summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/middlewares.js"

module.exports = [
  // ...
  {
    name: 'strapi::session',
    config: {
      rolling: true,
      renew: true
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/middlewares.ts"

export default [
  // ...
  {
    name: 'strapi::session',
    config: {
      rolling: true,
      renew: true
    },
  },
  // ...
]
```

</TabItem>

</Tabs>



</details>
