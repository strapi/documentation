---
title: Breaking change title
description: Breaking change description
sidebar_label: Sidebar label
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'

# Title

short description <Intro />

<YesPlugin />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The `helper-plugin` could be used for Strapi plugins development.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The `helper-plugin` is deprecated.

</SideBySideColumn>

</SideBySideContainer>

## Migration

Users should follow information found in the  extensive [migration guide](/dev-docs/migration/v4-to-v5/guides/helper-plugin).
