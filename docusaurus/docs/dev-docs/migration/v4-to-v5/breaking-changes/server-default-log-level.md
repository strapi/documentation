---
title: Server log level is `http`
description: The default log level of the middleware logger in Strapi 5 is 'http'.
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - configuration
 - middlewares
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import NoPlugins from '/docs/snippets/breaking-change-not-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Server log level is `http`

You can adjust the server log level in the configuration to control how much detail you see in your server logs. If you want to see more or less verbose logs in your server logs, this feature allows you to customize it according to your needs.

<Intro />
<NoPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The log level defaults to `silly`, which means that every log is shown, providing the most detailed information.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The log level defaults to `http`. This means that `silly`and `debug` level logs are hidden by default, offering a less verbose log output.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

The log level can be configured either in the `server.js` file as described in the following Manual migration section, or as described in the [middlewares configuration](/dev-docs/configurations/middlewares#logger) documentation.

[See the list of Winston log levels](https://www.npmjs.com/package/winston#logging-levels).

### Manual migration

To migrate to Strapi 5:

1. Open your server configuration file (`config/server`).
2. Locate the `{ logger: { config: { level: 'debug' } }` section.
3. Modify the level value to your preferred log level, such as `silly`, `debug`, `info`, `warn`, or `error`.
