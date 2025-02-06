---
title: Server proxy configuration
description:  In Strapi 5, all proxy configuration options are now configured through the 'server.proxy' object in the '/config/server.js|ts' instead of having various option names such as 'globalProxy' and 'proxy' in Strapi v4.
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - configuration
 - server
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import NoPlugins from '/docs/snippets/breaking-change-not-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

#  Server proxy configurations are grouped under the `server.proxy` object

In Strapi 5, all proxy configuration options are now configured through the `server.proxy` object in `/config/server.js|ts`, whether they are for requests made within `strapi.fetch` or for the global proxy agent for the [koa](https://koajs.com/) server.

<Intro />
<NoPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

* `server.globalProxy` is used to configure all requests through `strapi.fetch`.
* `server.proxy` is used to set the value of koa server’s `proxy` option.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

All configuration options are grouped under the `server.proxy` object.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Additional information about how the `server.proxy` configuration works in Strapi 5 is available in the [server configuration](/cms/configurations/server) documentation.

### Manual migration

Users will need to manually update the code:

- If `server.proxy` is used, it needs to move to `server.proxy.koa`.

- If `server.globalProxy` is used, you have 2 choices:

  - move it to `server.proxy.global` and be aware that it will now work for HTTP/HTTPS requests in addition to `strapi.fetch` requests,
  - or move it to `server.proxy.fetch` to keep the exact same functionality as in Strapi v4, where only fetch was proxied.
