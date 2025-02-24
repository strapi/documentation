---
title: Some env-only configuration options are handled by the server configuration
description: In Strapi 5, some env-only configuration options are handled by the server configuration
displayed_sidebar: cmsSidebar
sidebar_label: Env options moved to server configuration
tags:
 - breaking changes
 - configuration
 - environment 
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Some `env`-only configuration options are handled by the server configuration

In Strapi 5, some configuration options that were only handled by environment variables in Strapi v4 are now handled in the [server configuration](/cms/configurations/server) file.
<Intro />
<BreakingChangeIdCard />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The following list of configurations are only available from the environment:

- `STRAPI_DISABLE_REMOTE_DATA_TRANSFER`
- `STRAPI_DISABLE_UPDATE_NOTIFICATION`
- `STRAPI_HIDE_STARTUP_MESSAGE`

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

These configuration options have been moved to the [server configuration](/cms/configurations/server) file (see table in the notes for details).

</SideBySideColumn>

</SideBySideContainer>

<br />

## Migration

<MigrationIntro />

### Notes

The following environment variable names in Strapi v4 should now be defined in the [`/config/server.js` configuration file](/cms/configurations/server):

| Environment variable name in Strapi v4 | Server configuration option in Strapi 5 |
|----------------------------------------|-----------------------------------------|
| `STRAPI_DISABLE_REMOTE_DATA_TRANSFER`  | `transfer.remote.enabled`               |
| `STRAPI_HIDE_STARTUP_MESSAGE`          | `logger.startup.enabled`                |
| `STRAPI_DISABLE_UPDATE_NOTIFICATION`   | `logger.updates.enabled`                |

### Migration steps

If you previously disabled one of the listed environment variables in your environment, update the `/config/server.js` by adding the appropriate values:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/server.js"
module.exports = ({ env }) => ({
  // … other configuration options
  transfer: {
    remote: {
      enabled: false, // disable remote data transfers instead of STRAPI_DISABLE_REMOTE_DATA_TRANSFER
    },
  },
  logger: {
    updates: {
      enabled: false, // disable update notification logging instead of STRAPI_DISABLE_UPDATE_NOTIFICATION
    },
    startup: {
      enabled: false, // disable startup message instead of STRAPI_HIDE_STARTUP_MESSAGE
    },
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```js title="/config/server.ts"
export default ({ env }) => ({
  // … other configuration options
  transfer: {
    remote: {
      enabled: false, // disable remote data transfers instead of STRAPI_DISABLE_REMOTE_DATA_TRANSFER
    },
  },
  logger: {
    updates: {
      enabled: false, // disable update notification logging instead of STRAPI_DISABLE_UPDATE_NOTIFICATION
    },
    startup: {
      enabled: false, // disable startup message instead of STRAPI_HIDE_STARTUP_MESSAGE
    },
  },
});
```

</TabItem>
</Tabs>
