---
title: Strapi 5 uses React Router DOM 6
description: Database identifiers are shortened in Strapi v5 and can't be longer than 53 characters to avoid issues with identifiers that are too long.
sidebar_label: Database identifiers shortened
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - react-router
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Database identifiers shortened in v5

Strapi 5 uses react-router-dom v6. This impacts the links added to [settings](/dev-docs/plugins/admin-panel-api#settings-api) or to the [menu](/dev-docs/plugins/admin-panel-api#menu-api) using the Admin Panel API.

 <Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

- Strapi v4 uses react-router-dom v5.
- When adding settings or menu links, the `to` property is an absolute path.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi v5**

- Strapi v5 uses react-router-dom v6.
- When adding settings or menu links, the `to` property should now be a **relative path**.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- The official React Router documentation explains [how to upgrade from v5](https://reactrouter.com/en/main/upgrading/v5).
- Absolute paths for menu or settings links are still supported but should yield a warning.

### Manual procedure

Ensure that links added to [settings](/dev-docs/plugins/admin-panel-api#settings-api) or to the [menu](/dev-docs/plugins/admin-panel-api#menu-api) links using the Admin Panel API use relative paths.
