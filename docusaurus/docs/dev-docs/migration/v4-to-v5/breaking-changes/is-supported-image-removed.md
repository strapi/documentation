---
title: The isSupportedImage method is removed in Strapi 5
description: The `isSupportedImage` method is removed in Strapi 5. Users should use `isImage` or `isOptimizableImage` instead.
sidebar_label: isSupportedImage removed
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - upload plugin
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# The `isSupportedImage` method is removed

The `isSupportedImage` method has been issuing a deprecation warning ever since v4, and is finally being removed in Strapi 5.

 <Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The `isSupportedImage` method is supported, but deprecated.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The `isSupportedImage` method is removed.

Developers must use either `isImage` to check if a file is an image, or `isOptimizableImage` to check if the file is an image that can be optimized. 
</SideBySideColumn>

</SideBySideContainer>

## Manual migration

Replace occurences of the `isSupportedImage` method in your code by the appropriate method, `isImage` or `isOptimizableImage`, depending on your needs. Note that the behavior in Strapi v4 was equivalent to `isOptimizableImage`.

