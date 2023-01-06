---
title: Sentry - Strapi Developer Docs
description: Track errors in your Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/sentry.html
---

# Sentry

This plugin enables you to track errors in your Strapi application using [Sentry](https://sentry.io/welcome/).

By using the Sentry plugin you can:

* Initialize a Sentry instance upon startup of a Strapi application
* Send Strapi application errors as events to Sentry
* Include additional metadata in Sentry events to assist in debugging
* Expose a [global Sentry service](#global-sentry-service-access)

Begin by first [installing](#installation) the Sentry plugin, and then [configuring](#configuration) the plugin to enable your Strapi application to send events to the Sentry instance.

## Installation

Install the Sentry plugin by adding the dependency to your Strapi application as follows:

<code-group>

<code-block title="NPM">
```sh
npm install @strapi/plugin-sentry
```
</code-block>

<code-block title="YARN">
```sh
yarn add @strapi/plugin-sentry
```
</code-block>

</code-group>

## Configuration

Create or edit your `./config/plugins.js` file to configure the Sentry plugin. The following properties are available:

| Property | Type | Default Value | Description |
| -------- | ---- | ------------- |------------ |
| `dsn` | string | `null` | Your Sentry [data source name](https://docs.sentry.io/product/sentry-basics/dsn-explainer/). |
| `sendMetadata` | boolean | `true` | Whether the plugin should attach additional information (e.g. OS, browser, etc.) to the events sent to Sentry. |
| `init` | object | `{}` | A config object that is passed directly to Sentry during initialization. See the official [Sentry documentation](https://docs.sentry.io/platforms/node/configuration/options/) for all available options. |

An example configuration:

```js
// path: ./config/plugins.js

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

### Environment configuration

Using the [`env` utility](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md#configuration-using-environment-variables), you can enable or disable the Sentry plugin based on the environment. For example, to only enable the plugin in your `production` environment:

```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  // ...
  sentry: {
    enabled: env('NODE_ENV') === 'production',
  },
  // ...
});
```

## Global Sentry service access

After installing and configuring the plugin, you can access a Sentry service in your Strapi application as follows:

```js
const sentryService = strapi.plugin('sentry').service('sentry');
```

This service exposes the following methods:

| Method | Description | Parameters |
| ------ | ----------- | ---------- |
| `sendError()` | Manually send errors to Sentry. | <ul><li><code>error</code>: The error to be sent.</li><li><code>configureScope</code>: Optional. Enables you to customize the error event.</li></ul><br>See the official [Sentry documentation](https://docs.sentry.io/platforms/node/enriching-events/scopes/#configuring-the-scope) for more details. |
| `getInstance()` | Used for direct access to the Sentry instance. | |

Below are examples for each method.

:::: tabs card

::: tab sendError

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

:::

::: tab getInstance

```js
const sentryInstance = strapi
  .plugin('sentry')
  .service('sentry')
  .getInstance();
```

:::

::::