---
title: Reserved attributes and content-types names
description: In Strapi 5, some attributes and content types names are reserved, and all fields or content types using the reserved names should be renamed before migrating to prevent data loss.
sidebar_label: Reserved names
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - models
 - content API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Some attributes and content types names are reserved

In Strapi 5, some attributes and content types names are reserved, and all fields or content types in Strapi v4 using these reserved names should be renamed before migrating to Strapi 5 to prevent data loss. The reserved names should not be used in the database either.

<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The following attribute names can be created on a content type:

- `meta`
- `status`
- `entryId`
- `strapi`
- `locale` (only for non-localized content types)
- `localizations`
- `strapi_assignee`
- `strapi_stage`
- `then`
- `document`
- anything with the prefix `strapi`, `_strapi`, or `__strapi`

Any model name can be prefixed with `strapi`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The following attribute names can **not** be created on a content type or in databases:

- `meta`
- `status`
- `entryId`
- `strapi`
- `locale`
- `localizations`
- `strapi_assignee`
- `strapi_stage`
- `then`
- `document`
- anything with the prefix `strapi`, `_strapi`, or `__strapi`

Model names can **not** be prefixed with `strapi`, `_strapi`, or `__strapi`.

</SideBySideColumn>

</SideBySideContainer>

## Migration

### Manual procedure

Rename any custom field or content-type that falls under the restriction list *before* any migration to prevent data loss or other unexpected issues.
