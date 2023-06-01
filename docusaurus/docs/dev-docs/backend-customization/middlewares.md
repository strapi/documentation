---
title: Middlewares
---

import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'
const imgStyle = {width: '100%', margin: '0'}
const captionStyle = {fontSize: '12px'}

# Middlewares customization

<FeedbackCallout components={props.components}/>

:::strapi Different types of middlewares

In Strapi, 2 middleware concepts coexist:

- **Global middlewares** are [configured and enabled](/dev-docs/configurations/middlewares) for the entire Strapi server application. These middlewares can be applied at the application level or at the API level. <br/>The present documentation describes how to implement them.<br/>Plugins can also add global middlewares (see [Server API documentation](/dev-docs/api/plugins/server-api)).

- **Route middlewares** have a more limited scope and are configured and used as middlewares at the route level. They are described in the [routes documentation](/dev-docs/backend-customization/routes#middlewares).

:::

<figure style={imgStyle}>
  <img src="/img/assets/backend-customization/diagram-global-middlewares.png" alt="Simplified Strapi backend diagram with global middlewares highlighted" />
  <em><figcaption style={captionStyle}>The diagram represents a simplified version of how a request travels throught the Strapi back end, with global middlewares highlighted. The backend customization introduction page includes a complete, <a href="/dev-docs/backend-customization#interactive-diagram">interactive diagram</a>.</figcaption></em>
</figure>

## Implementation

A new application-level or API-level middleware can be implemented:

- with the [interactive CLI command `strapi generate`](/dev-docs/cli#strapi-generate)
- or manually by creating a JavaScript file in the appropriate folder (see [project structure](/dev-docs/project-structure)):
  - `./src/middlewares/` for application-level middlewares
  - `./src/api/[api-name]/middlewares/` for API-level middlewares
  - `./src/plugins/[plugin-name]/middlewares/` for [plugin middlewares](/dev-docs/api/plugins/server-api#middlewares)

Middlewares working with the REST API are functions like the following:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./src/middlewares/my-middleware.js or ./src/api/[api-name]/middlewares/my-middleware.js"

module.exports = (config, { strapi })=> {
  return (context, next) => {};
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/middlewares/my-middleware.js or ./src/api/[api-name]/middlewares/my-middleware.ts"

export default (config, { strapi })=> {
  return (context, next) => {};
};
```

</TabItem>
</Tabs>

Once created, custom middlewares should be added to the [middlewares configuration file](/dev-docs/configurations/middlewares#loading-order) or Strapi won't load them.

<details>
<summary>Example of a custom timer middleware</summary>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="path: /config/middlewares.js"
module.exports = () => {
  return async (ctx, next) => {
    const start = Date.now();

    await next();

    const delta = Math.ceil(Date.now() - start);
    ctx.set('X-Response-Time', delta + 'ms');
  };
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/config/middlewares.ts"

export default () => {
  return async (ctx, next) => {
    const start = Date.now();

    await next();

    const delta = Math.ceil(Date.now() - start);
    ctx.set('X-Response-Time', delta + 'ms');
  };
};
```

</TabItem>
</Tabs>

</details>

The GraphQL plugin also allows [implementing custom middlewares](/dev-docs/plugins/graphql#middlewares), with a different syntax.

## Usage

Middlewares are called different ways depending on their scope:

- use `global::middleware-name` for application-level middlewares
- use `api::api-name.middleware-name` for API-level middlewares
- use `plugin::plugin-name.middleware-name` for plugin middlewares

:::tip
To list all the registered middlewares, run `yarn strapi middlewares:list`.
:::
