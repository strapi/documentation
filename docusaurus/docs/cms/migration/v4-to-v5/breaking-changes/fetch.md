---
title: strapi.fetch uses native fetch() API
description: In Strapi 5, the `strapi.fetch` object is now wrapping node Fetch API instead of node-fetch.
sidebar_label: strapi.fetch uses native fetch()
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - fetch
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# `strapi.fetch` uses the native `fetch()` API

In Strapi 5, the `strapi.fetch` object is now wrapping node Fetch API instead of node-fetch.

<Intro />
<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Strapi.fetch wrapped node-fetch’s `fetch()` and accepted the same parameters.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The `node-fetch` module is not used anymore. `strapi.fetch` calls the native `fetch()` method.

</SideBySideColumn>

</SideBySideContainer>

## Migration

### Notes

* The parameters are mostly compatible but there are some differences.

### Manual procedure

If your Strapi v4 code passed the `timeout` parameter to `strapi.fetch`, replace it with a signal property as follows:

<SideBySideContainer>
<SideBySideColumn>

**In Strapi v4**

```tsx
strapi.fetch(url, {
  method: 'POST',
  body,
  headers,
  timeout: 1000,
}); // accepts the type RequestInit from node-fetch
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

```tsx
strapi.fetch(url, {
  method: 'POST',
  body,
  headers,
  signal: AbortSignal.timeout(1000)
}); // accepts the type RequestInit native to Node
```

</SideBySideColumn>
</SideBySideContainer>
