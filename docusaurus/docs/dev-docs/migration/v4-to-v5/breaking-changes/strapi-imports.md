---
title: Strapi imports
description: In Strapi 5, strapiFactory should be used in imports.
sidebar_label: Use strapiFactory in imports
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - strapiFactory
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# `strapiFactory` should be used in imports

In Strapi 5, import `strapiFactory` instead of `strapi`.

<Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Imports are done as follows:

```js
import strapi from '@strapi/strapi';
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Imports are done as follows:

```js
import { strapiFactory } from '@strapi/strapi'; 
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

Replace `import strapi from '@strapi/strapi'` code with `import { strapiFactory } from '@strapi/strapi';`.
