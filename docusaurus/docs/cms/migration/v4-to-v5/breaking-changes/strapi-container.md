---
title: Strapi is a subclass of Container
description: In Strapi 5, container methods can be accessed directly from the strapi class.
sidebar_label: Strapi subclass of Container
displayed_sidebar: cmsSidebar
unlisted: true
tags:
 - breaking changes
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# `Strapi` is a subclass of `Container`

In Strapi 5, `Strapi` is a subclass of the `Container` class to make it simpler to access services and unify the service access with one method.

<Intro />
<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Container methods are accessed like follows:

```js
strapi.container.register(....)
strapi.container.get(...)
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Container methods are accessed like follows:

```js
strapi.add(....)
strapi.get(...)
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

Ensure you update your method calls to `container`.
