---
title: Access configuration values
description: Learn how to access Strapi 5 configuration values from the code.
displayed_sidebar: cmsSidebar
tags:
- configuration
- configuration guide
---

# How to access to configuration values from the code

All the [configuration files](/cms/configurations) are loaded on startup and can be accessed through the `strapi.config` configuration provider.

If the `/config/server.ts|js` file has the following configuration:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

  ```js
  module.exports = {
    host: '0.0.0.0',
  };
  ```

</TabItem>

<TabItem value="ts" label="TypeScript">

  ```ts
  export default {
    host: '0.0.0.0',
  };
  ```

</TabItem>

</Tabs>

then the `server.host` key can be accessed as:

  ```js
  strapi.config.get('server.host', 'defaultValueIfUndefined');
  ```

Nested keys are accessible with the <ExternalLink to="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#dot_notation" text="dot notation"/>.

:::note
The filename is used as a prefix to access the configurations.
:::

Configuration files can either be `.js`, `.ts`, or `.json` files.

When using a `.js` or `.ts` file, the configuration can be exported:

- either as an object:

  <Tabs groupId="js-ts">

  <TabItem value="js" label="JavaScript">

  ```js
  module.exports = {
    mySecret: 'someValue',
  };
  ```

  </TabItem>

  <TabItem value="ts" label="TypeScript">

  ```ts
  export default {
    mySecret: 'someValue',
  };
  ```

  </TabItem>

  </Tabs>

- or as a function returning a configuration object (recommended usage). The function will get access to the [`env` utility](/cms/configurations/guides/access-cast-environment-variables):

  <Tabs groupId="js-ts">

  <TabItem value="js" label="JavaScript">

  ```js
  module.exports = ({ env }) => {
    return {
      mySecret: env('MY_SECRET_KEY', 'defaultSecretValue'),
    };
  };
  ```

  </TabItem>

  <TabItem value="ts" label="TypeScript">

  ```ts
  export default ({ env }) => {
    return {
      mySecret: env('MY_SECRET_KEY', 'defaultSecretValue'),
    };
  };
  ```

  </TabItem>

  </Tabs>
