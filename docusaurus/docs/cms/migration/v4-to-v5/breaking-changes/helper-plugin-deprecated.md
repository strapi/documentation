---
title: helper-plugin removed
description: In Strapi 5, the `helper-plugin` is removed. A whole migration reference is available for plugin developers, and codemods will automatically handle some changes.
sidebar_label: helper-plugin removed
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - plugins development
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import PartialCodemods from '/docs/snippets/breaking-change-partially-handled-by-codemod.md'

# `helper-plugin` deprecated

In Strapi 5, the `helper-plugin` is removed. A whole migration reference is available for plugin developers, and codemods will automatically handle some changes.

 <Intro />

<YesPlugins />
<PartialCodemods />

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

Codemods handles some but not all of the changes. The following changes are handled:

| Action                                      | Now handled in Strapi 5 by…                    |
|---------------------------------------------|-------------------------------|
| Change `AnErrorOccurred` import             | @strapi/strapi/admin           |
| Replace `AnErrorOccurred` with `Page.Error` | @strapi/strapi/admin           |
| Change `ConfirmDialog` import               | @strapi/strapi/admin           |
| Change `getFetchClient` import              | @strapi/strapi/admin           |
| Change `LoadingIndicatorPage` import        | @strapi/strapi/admin           |
| Replace `LoadingIndicatorPage` with `Page.Loading` | @strapi/strapi/admin     |
| Change `NoPermissions` import               | @strapi/strapi/admin           |
| Replace `NoPermissions` with `Page.NoPermissions` | @strapi/strapi/admin    |
| Change `translatedErrors` import            | @strapi/strapi/admin           |
| Change `useFetchClient` import              | @strapi/strapi/admin           |
| Change `useQueryParams` import              | @strapi/strapi/admin           |
| Change `SearchURLQuery` import              | @strapi/strapi/admin           |
| Change `DateTimePicker` import              | @strapi/design-system          |
| Change `Status` import                      | @strapi/design-system          |
| Change `useCallbackRef` import              | @strapi/design-system          |
| Change `useCollator` import                 | @strapi/design-system          |
| Change `useFilter` import                   | @strapi/design-system          |

Users should refer to additional information found in the extensive [migration guide](/cms/migration/v4-to-v5/additional-resources/helper-plugin) to ensure a smooth migration.
