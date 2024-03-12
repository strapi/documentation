---
title: Strapi Server log level configuration
description: Strapi 5 allows users greater control over the level of detail in of their server logs
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - configuration
 - middlewares
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Strict requirements for configuration files

You can adjust the server log level in the configuration to control how much detail you see in your server logs. If you want to see more or less verbose logs in your server logs, this feature allows you to customize it according to your needs.

<Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The log level defaults to `silly`, which meant that every log was shown, providing the most detailed information.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The log level defaults to `info`. This means that `silly`and `debug` level logs are hidden by default, offering a less verbose log output.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- Open your `server.js` file.
- Locate the `{ logger: { config: { level: 'debug' } }` section.
- Modify the level value to your preferred log level, such as `silly`, `debug`, `info`, `warn`, or `error`.
- Alternatively, you can use the already-documented method provided in [configurations](/dev-docs/configurations/middlewares#logger).


### Manual migration

No manual procedure should be required

