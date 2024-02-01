---
title: The ContentManagerAppState redux is modified
description: In Strapi 5, the redux store for the Content Manager has been changed and some redux actions were removed.
sidebar_label: ContentManagerAppState redux modified
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - Content Manager
 - redux
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# The ContentManagerAppState redux is modified

In Strapi 5, the redux store for the Content Manager has been changed and some redux actions were removed. Notably, the `useContentManagerInitData` redux state for the Content Manager has been refactored to remove `ModelsContext`. Users might be relying on the original structure in a middleware or subscriber; doing so this will break their application.

<Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The redux store can fire the following actions:

- `'ContentManager/App/RESET_INIT_DATA’`
- `'ContentManager/App/GET_INIT_DATA’`
- `'ContentManager/App/SET_INIT_DATA’`

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The redux store no longer fires the following actions:

- `'ContentManager/App/RESET_INIT_DATA’`
- `'ContentManager/App/GET_INIT_DATA’`

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

The redux store in Strapi 5 continues to fire `'ContentManager/App/SET_INIT_DATA’`, so users should instead listen for this action in their middlewares only.
