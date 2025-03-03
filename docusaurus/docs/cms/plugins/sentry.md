---
title: Sentry plugin
displayed_sidebar: cmsSidebar
description: Track errors in your Strapi application.
tags:
- environment
- global Sentry service
- Sentry 
---

# Sentry plugin

This plugin enables you to track errors in your Strapi application using Sentry.

:::prerequisites Identity Card of the Plugin
<Icon name="navigation-arrow"/> **Location:** Only usable and configurable via server code.<br/>
<Icon name="package"/> **Package name:** `@strapi/plugin-sentry`  <br/>
<Icon name="plus-square"/> **Additional resources:** <ExternalLink to="https://market.strapi.io/plugins/@strapi-plugin-sentry" text="Strapi Marketplace page"/>, <ExternalLink to="https://sentry.io/" text="Sentry page"/> <br/>
:::

By using the Sentry plugin you can:

* Initialize a Sentry instance upon startup of a Strapi application
* Send Strapi application errors as events to Sentry
* Include additional metadata in Sentry events to assist in debugging
* Expose a global Sentry service usable by the Strapi server

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

Create or edit your `/config/plugins` file to configure the Sentry plugin. The following properties are available:

| Property | Type | Default Value | Description |
| -------- | ---- | ------------- |------------ |
| `dsn` | string | `null` | Your Sentry <ExternalLink to="https://docs.sentry.io/product/sentry-basics/dsn-explainer/" text="data source name"/>. |
| `sendMetadata` | boolean | `true` | Whether the plugin should attach additional information (e.g., OS, browser, etc.) to the events sent to Sentry. |
| `init` | object | `{}` | A config object that is passed directly to Sentry during initialization (see official <ExternalLink to="https://docs.sentry.io/platforms/node/configuration/options/" text="Sentry documentation"/> for available options). |

The following is an example basic configuration:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"

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

```ts title="/config/plugins.ts"

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

### Disabling for non-production environments

If the `dsn` property is set to a nil value (`null` or `undefined`) while `sentry.enabled` is true, the Sentry plugin will be available to use in the running Strapi instance, but the service will not actually send errors to Sentry. That allows you to write code that runs on every environment without additional checks, but only send errors to Sentry in production.

When you start Strapi with a nil `dsn` config property, the plugin will print the following warning:<br/>`info: @strapi/plugin-sentry is disabled because no Sentry DSN was provided`

You can make use of that by using the [`env` utility](/cms/configurations/guides/access-cast-environment-variables) to set the `dsn` configuration property depending on the environment.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  // …
  sentry: {
    enabled: true,
    config: {
      // Only set `dsn` property in production
      dsn: env('NODE_ENV') === 'production' ? env('SENTRY_DSN') : null,
    },
  },
  // …
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  // …
  sentry: {
    enabled: true,
    config: {
      // Only set `dsn` property in production
      dsn: env('NODE_ENV') === 'production' ? env('SENTRY_DSN') : null,
    },
  },
  // …
});
```

</TabItem>

</Tabs>

### Disabling the plugin completely

Like every other Strapi plugin, you can also disable this plugin in the plugins configuration file. This will cause `strapi.plugins('sentry')` to return `undefined`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  // …
  sentry: {
    enabled: false,
  },
  // …
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  // …
  sentry: {
    enabled: false,
  },
  // …
});
```

</TabItem>
</Tabs>

## Usage

After installing and configuring the plugin, you can access a Sentry service in your Strapi application as follows:

```js
const sentryService = strapi.plugin('sentry').service('sentry');
```

This service exposes the following methods:

| Method | Description | Parameters |
| ------ | ----------- | ---------- |
| `sendError()` | Manually send errors to Sentry. | <ul><li><code>error</code>: The error to be sent.</li><li><code>configureScope</code>: Optional. Enables you to customize the error event.</li></ul> See the official <ExternalLink to="https://docs.sentry.io/platforms/node/enriching-events/scopes/#configuring-the-scope" text="Sentry documentation"/> for more details. |
| `getInstance()` | Used for direct access to the Sentry instance. | - |

The `sendError()` method can be used as follows:

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

The `getInstance()` method is accessible as follows:

```js
const sentryInstance = strapi
  .plugin('sentry')
  .service('sentry')
  .getInstance();
```
