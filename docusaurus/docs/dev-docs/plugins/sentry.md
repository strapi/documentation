---
title: Sentry plugin
displayed_sidebar: devDocsSidebar
description: Track errors in your Strapi application.
tags:
- environment
- global Sentry service
- Sentry 
---

# Sentry plugin

This plugin enables you to track errors in your Strapi application using [Sentry](https://sentry.io/welcome/).

By using the Sentry plugin you can:

* Initialize a Sentry instance upon startup of a Strapi application
* Send Strapi application errors as events to Sentry
* Include additional metadata in Sentry events to assist in debugging
* Expose a [global Sentry service](#global-sentry-service-access)

Begin by first [installing](#installation) the Sentry plugin, and then [configuring](#configuration) the plugin to enable your Strapi application to send events to the Sentry instance.

## Installation

Install the Sentry plugin by adding the dependency to your Strapi application as follows:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add @strapi/plugin-sentry
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install @strapi/plugin-sentry
```

</TabItem>

</Tabs>

## Configuration

Create or edit your `./config/plugins.js` file to configure the Sentry plugin. The following properties are available:

| Property | Type | Default Value | Description |
| -------- | ---- | ------------- |------------ |
| `dsn` | string | `null` | Your Sentry [data source name](https://docs.sentry.io/product/sentry-basics/dsn-explainer/). |
| `sendMetadata` | boolean | `true` | Whether the plugin should attach additional information (e.g. OS, browser, etc.) to the events sent to Sentry. |
| `init` | object | `{}` | A config object that is passed directly to Sentry during initialization. See the official [Sentry documentation](https://docs.sentry.io/platforms/node/configuration/options/) for all available options. |

An example configuration:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/plugins.js"

module.exports = ({ env }) => ({
  // ...
  sentry: {
    enabled: true,
    config: {
      dsn: env('SENTRY_DSN'),
      sendMetadata: true,
    },
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/plugins.ts"

export default ({ env }) => ({
  // ...
  sentry: {
    enabled: true,
    config: {
      dsn: env('SENTRY_DSN'),
      sendMetadata: true,
    },
  },
  // ...
});
```

</TabItem>

</Tabs>

### Environment configuration

Using the [`env` utility](/dev-docs/configurations/guides/access-cast-environment-variables), you can enable or disable the Sentry plugin based on the environment. For example, to only enable the plugin in your `production` environment:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="config/plugins.js"

module.exports = ({ env }) => ({
  // ...
  sentry: {
    enabled: env('NODE_ENV') === 'production',
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/plugins.ts"

export default ({ env }) => ({
  // ...
  sentry: {
    enabled: env('NODE_ENV') === 'production',
  },
  // ...
});
```

</TabItem>

</Tabs>

## Global Sentry service access

After installing and configuring the plugin, you can access a Sentry service in your Strapi application as follows:

```js
const sentryService = strapi.plugin('sentry').service('sentry');
```

This service exposes the following methods:

| Method | Description | Parameters |
| ------ | ----------- | ---------- |
| `sendError()` | Manually send errors to Sentry. | <ul><li><code>error</code>: The error to be sent.</li><li><code>configureScope</code>: Optional. Enables you to customize the error event.</li></ul> See the official [Sentry documentation](https://docs.sentry.io/platforms/node/enriching-events/scopes/#configuring-the-scope) for more details. |
| `getInstance()` | Used for direct access to the Sentry instance. | |


Below are examples for each method.

<Tabs>

<TabItem title="sendError" value="sendError">

```js
try {
  // Your code here
} catch (error) {
  // Either send a simple error
  strapi
    .plugin('sentry')
    .service('sentry')
    .sendError(error);

  // Or send an error with a customized Sentry scope
  strapi
    .plugin('sentry')
    .service('sentry')
    .sendError(error, (scope, sentryInstance) => {
      // Customize the scope here
      scope.setTag('my_custom_tag', 'Tag value');
    });
  throw error;
}
```

</TabItem>

<TabItem title="getInstance" value="getInstance">

```js
const sentryInstance = strapi
  .plugin('sentry')
  .service('sentry')
  .getInstance();
```

</TabItem>
</Tabs>
