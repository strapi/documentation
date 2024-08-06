---
title: Access configuration values from the code
# description: todo
displayed_sidebar: devDocsConfigSidebar
tags:
- configuration
- configuration guide
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# How to access to configuration values from the code

<NotV5 />

All the [configuration files](/dev-docs/configurations) are loaded on startup and can be accessed through the `strapi.config` configuration provider.

If the `/config/server.js` file has the following configuration:

  ```js
  module.exports = {
    host: '0.0.0.0',
  };
  ```

then the `server.host` key can be accessed as:

  ```js
  strapi.config.get('server.host', 'defaultValueIfUndefined');
  ```

Nested keys are accessible with the [dot notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#dot_notation).

:::note
The filename is used as a prefix to access the configurations.
:::

Configuration files can either be `.js` or `.json` files.

When using a `.js` file, the configuration can be exported:

- either as an object:

  ```js
  module.exports = {
    mySecret: 'someValue',
  };
  ```

- or as a function returning a configuration object (recommended usage). The function will get access to the [`env` utility](/dev-docs/configurations/guides/access-cast-environment-variables#casting-environment-variables):

  ```js
  module.exports = ({ env }) => {
    return {
      mySecret: 'someValue',
    };
  };
  ```
