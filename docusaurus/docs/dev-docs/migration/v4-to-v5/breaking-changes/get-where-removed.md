---
title: The getWhere() method for permission provider instances has been removed
description: In Strapi 5, the getWhere() for permission provider instances has been removed, and users should use provider.values().filter() to replace it.
sidebar_label: getWhere removed from permission provider
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - providers
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# The `getWhere()` method for permission provider instances has been removed

In Strapi 5, the `getWhere()` method for permission provider instances has been removed, and users should first get the provider values, then filter them.

<Intro />
<YesPlugins />
<NoCodemods />

## Breaking change description

**In Strapi v4**

Provider instances (action provider, condition provider, etc…) are built using a provider factory.

Those providers have a `getWhere` method allowing you to query provider’s items that match certain conditions and return them.

The query was an object where keys and values were matched with the provider entries:

```js
const values = provider.getWhere({ foo: 42, bar: 'baz' });
```

<br/>

**In Strapi 5**

You need to adopt a more conventional approach by first getting the provider values, then filtering them using a custom predicate:

```js
const values = provider.values().filter(value => value.foo === 42 && value.bar === 'baz');
```

## Migration

### Manual procedure

Users need to manually update their code if using the `getWhere()` method, using the following example as a guide:

**In Strapi v4**

```tsx
const values = provider.getWhere({ foo: 42, bar: 'baz' });
```

<br/>

**In Strapi 5**

```tsx
const values = provider.values().filter(
  value => value.foo === 42 && value.bar === 'baz'
);
```
