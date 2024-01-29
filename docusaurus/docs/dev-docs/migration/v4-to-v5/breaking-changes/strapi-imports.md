---
title: Strapi 5  React Router DOM 6
description: .
sidebar_label: strapiFactory
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - strapiFactory
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# `strapiFactory` should be used in imports instead of the whole `strapi` object

<!-- TODO: update intro once I know more -->

 <Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

<!-- TODO: update description -->
Factory functions are directly included in the `strapi` object.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi v5**

<!-- TODO: update description -->
The core object handling factory functions is `strapiFactory` from the `@strapi/strapi` package.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

Replace `import strapi from '@strapi/strapi'` code with `import { strapiFactory } from '@strapi/strapi';`.
