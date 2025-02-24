---
title: defaultIndex removed
description: In Strapi 5, the 'defaultIndex' option is removed from the 'public' middleware.
sidebar_label: defaultIndex removed
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - middlewares
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# `defaultIndex` is removed from the `public` middleware configuration

In Strapi 5, the 'defaultIndex' option does not exist anymore and the root `/` URL automatically redirects to the admin panel login or homepage if already connected.

 <Intro />

<BreakingChangeIdCard />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

There is a `defaultIndex` option in the `public` middleware to add a custom page on the root `/`   URL of the admin panel.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The `defaultIndex` option does not exist anymore and the root `/` URL automatically redirects to the admin panel login or homepage if already connected.

</SideBySideColumn>

</SideBySideContainer>

## Migration

No manual migration is required, but please be aware of the new behavior for the root `/` URL.
