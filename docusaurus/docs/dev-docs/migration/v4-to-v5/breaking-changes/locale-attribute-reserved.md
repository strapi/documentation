---
title: Locale attribute name reserved
description: In Strapi 5, the 'locale' attribute name is reserved, and all custom fields also named 'locale' should be renamed before migrating to prevent data loss.
sidebar_label: locale attribute name reserved
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - locale
 - content API
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# The `locale` attribute name is reserved in Strapi 5

In Strapi 5, the `locale` attribute name is reserved, and all custom fields also named `locale` should be renamed before migrating to prevent data loss.<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

There is an edge case where Strapi v4 users could create an attribute called `locale` only if the content-type does not have i18n enabled.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

i18n is enabled by default for all content types, and the `locale` name is reserved by Strapi's APIs.

</SideBySideColumn>

</SideBySideContainer>

## Migration

### Manual procedure

Rename any custom field called `locale` on your content-types *before* any migration to prevent data loss or other unexpected issues.
