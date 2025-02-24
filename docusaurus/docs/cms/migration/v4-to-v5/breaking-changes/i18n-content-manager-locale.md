---
title: Internationalization (i18n)  is now part of the strapi core
description: Internationalization (i18n) is now part of the Strapi core and no longer a plugin, and this impacts how the locale parameter is sent and accessed.
sidebar_label: i18n part of strapi core
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - Internationalization (i18n)
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

Internationalization (i18n) is now part of the Strapi core and no longer a plugin, and this impacts how some parameters are sent and accessed. This also means you should not use or depend on the old `@strapi/plugin-i18n` package in your project, it is now natively included.

 <Intro />

<BreakingChangeIdCard
  plugins
  codemodLink="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/dependency-remove-strapi-plugin-i18n.json.ts"
  codemodName="dependency-remove-strapi-plugin-i18n"
/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Content Manager sends the following parameter when accessing a locale: `plugins[i18n][locale]`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The parameter sent to the Content Manager is now just `locale`.

</SideBySideColumn>

</SideBySideContainer>
