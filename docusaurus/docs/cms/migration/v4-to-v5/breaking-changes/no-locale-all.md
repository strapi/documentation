---
title: locale=all can not be used to query all locales
description: In Strapi 5, it's no longer possible to get all localized versions with the '?locale=all' parameter.
sidebar_label: No locale=all support
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - locale
 - Internationalization (i18n)
 - content API
 - REST API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# `locale=all` can not be used to get all entries in all locales

In Strapi 5, it's no longer possible to get all localized versions of a content type with the `locale=all` parameter.

<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Users could get all of the locales of a single type by passing the `locale=all` parameter to Content API calls. This is not possible on collection types.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Getting documents (collection types or single types) in all locales at the same time is not possible anymore. A specific locale value must be passed.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Additional information on what is possible to do with `locale` in Strapi 5 is available in the [REST API](/cms/api/rest/locale), [GraphQL API](/cms/api/graphql#locale), and [Document Service API](/cms/api/document-service/locale) reference documentations.

### Manual procedure

Users having custom code sending queries with the `locale=all` parameter should manually update their code to list all available locales then request data for each of these locales one by one.
