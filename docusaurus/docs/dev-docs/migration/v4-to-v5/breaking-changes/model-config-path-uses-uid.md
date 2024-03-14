---
title: Model config path uses uid instead of dot notation
description: Modules like `api::myapi` and `plugin::upload` should no longer be accessed in the Strapi config using `api.myapi` and `plugin.upload`, but instead using `api::myapi` and `plugin::upload`.
sidebar_label: Model config path uses uid
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - configuration
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'

# Model config path uses uid instead of dot notation

In Strapi 5, to retrieve config values you will need to use `config.get('plugin::upload.myconfigval')` or `config.get('api::myapi.myconfigval')`

<Intro />

<YesPlugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Models are added to the configuration using `.` notation as follows:

```jsx
strapi.config.get('plugin.upload.somesetting');
if ( strapi.config.has('plugin.upload.somesetting') ) {
  strapi.config.set('plugin.upload.somesetting', false);
}
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Models are added to the configuration using `::` replacing `.` notation as follows:
```jsx
strapi.config.get('plugin::upload.somesetting');
if ( strapi.config.has('plugin::upload.somesetting') ) {
  strapi.config.set('plugin::upload.somesetting', false);
}
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- If an API has a configuration, it should also be accessed using `strapi.config.get(’api::myapi.myconfigval’)`.

- The 'plugin' namespace has temporary support with a deprecation warning. This means that referencing `plugin.upload.somesetting` will emit a warning in the server log and check `plugin::upload.somesetting` instead.

- A codemod has been created to assist in refactoring the strings in user code, replacing `plugin.` or `api.` with `plugin::` and `api::`.



### Manual procedure

A codemod will automatically handle the change in most cases.

In cases were the codemod does not automatically handle the change, users will need to manually replace all their strings to target the new config paths.

