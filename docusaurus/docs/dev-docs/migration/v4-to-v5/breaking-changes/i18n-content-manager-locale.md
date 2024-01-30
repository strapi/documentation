---
title: Internationalization (i18n)  is now part of the strapi core
description: Internationalization (i18n) is now part of the Strapi core and no longer a plugin, and this impacts how some the locale parameter is sent and accessed.
sidebar_label: i18n part of strapi core
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - i18n
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

<!-- ! This breaking change is more "internal" and should only affect users that deeply customize Strapi. -->

# Internationalization (i18n) is now part of the strapi core 

Internationalization (i18n) is now part of the Strapi core and no longer a plugin, and this impacts how some parameters are sent and accessed.

 <Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Content Manager sends the following parameter when accessing a locale: `plugins[i18n][locale]`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi v5**

The parameter sent to the Content Manager is now just `locale`.

</SideBySideColumn>

</SideBySideContainer>
