---
title: The ContentManagerAppState redux is modified
description: In Strapi 5, the redux store for the Content Manager has been changed and some redux actions were removed.
sidebar_label: ContentManagerAppState redux modified
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - Content Manager
 - redux
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# The ContentManagerAppState redux is modified

In Strapi 5, the redux store for the Content Manager has been changed and some redux actions were removed. Notably, the `useContentManagerInitData` redux state for the Content Manager has been refactored to remove `ModelsContext`. Users might be relying on the original structure in a middleware or subscriber; doing so this will break their application.

<Intro />
<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The redux store can fire the following actions:

- `'ContentManager/App/RESET_INIT_DATA’`
- `'ContentManager/App/GET_INIT_DATA’`
- `'ContentManager/App/SET_INIT_DATA’`

The payload nests attributes inside the `data` object. For instance, for the `SET_INIT_DATA` action, the payload is of the following format:

```json
  data: {
    authorizedCollectionTypeLinks: ContentManagerAppState['collectionTypeLinks'];
    authorizedSingleTypeLinks: ContentManagerAppState['singleTypeLinks'];
    components: ContentManagerAppState['components'];
    contentTypeSchemas: ContentManagerAppState['models'];
    fieldSizes: ContentManagerAppState['fieldSizes'];
  };
```

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The redux store no longer fires the following actions:

- `'ContentManager/App/RESET_INIT_DATA’`
- `'ContentManager/App/GET_INIT_DATA’`

The payload data does not nest attributes within a `data` object anymore. For instance, for the `SET_INIT_DATA` action, the payload is of the following format:

```json
{
  authorizedCollectionTypeLinks: ContentManagerAppState['collectionTypeLinks'];
  authorizedSingleTypeLinks: ContentManagerAppState['singleTypeLinks'];
  components: ContentManagerAppState['components'];
  contentTypeSchemas: ContentManagerAppState['models'];
  fieldSizes: ContentManagerAppState['fieldSizes'];
}
```

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

The redux store in Strapi 5 continues to fire `'ContentManager/App/SET_INIT_DATA’`, so users should instead listen for this action in their middlewares only.

Additionally, adjustments to your custom code might need to be done based on the new payload format.
