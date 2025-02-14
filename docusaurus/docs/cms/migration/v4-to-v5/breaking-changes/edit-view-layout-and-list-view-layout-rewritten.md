---
title: The `EditViewLayout` and `ListViewLayout` have been rewritten
description: In Strapi 5, some admin panel hooks have been removed from the Redux store and a new `useDocumentLayout` hook is introduced.
sidebar_label: EditViewLayout and ListViewLayout refactored
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - content manager
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# The `EditViewLayout` and `ListViewLayout` have been rewritten

In Strapi 5, some admin panel hooks have been removed from the Redux store and a new `useDocumentLayout` hook is introduced.

<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The `content-manager_editViewLayoutManager` and `content-manager_listViewLayoutManager` hooks can be used.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

- The `content-manager_editViewLayoutManager` and `content-manager_listViewLayoutManager` have been removed from the Redux store.
- A new `useDocumentLayout` hook is available.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Additional information about hooks can be found in the [Admin Panel API for plugins](/cms/plugins-development/admin-panel-api#hooks-api) documentation.

### Manual procedure

Plugins developers taking advantage of the `content-manager_editViewLayoutManager` and `content-manager_listViewLayoutManager` hooks in their plugins need to refactor their code.
