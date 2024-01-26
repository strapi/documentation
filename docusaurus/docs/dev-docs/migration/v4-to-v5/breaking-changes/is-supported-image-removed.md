---
title: The isSupportedImage method is removed in Strapi 5
description: The `isSupportedImage` method is removed in Strapi 5. Users should use `isImage` or `isOptimizableImage` instead.
sidebar_label: isSupportedImage removed
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - upload plugin
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# The `isSupportedImage` method is removed

The `isSupportedImage` method has been issuing a deprecation warning ever since v4, and is finally being removed in Strapi 5.

 <Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The `isSupportedImage` method is supported, but deprecated.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi v5**

The `isSupportedImage` method is removed.

Developers must use either `isImage` to check if a file is an image, or `isOptimizableImage` to check if the file is an image that can be optimized.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

Replace occurences of the `isSupportedImage` method in your code by the appropriate method, `isImage` or `isOptimizableImage`, depending on your needs.
