---
title: Strapi 5 uses React Router DOM 6
description: Strapi 5 uses react-router-dom v6. This impacts the links added to Global Settings or to the Menu using the Admin Panel API.
sidebar_label: React Router DOM 6
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - react-router
 - dependencies
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Strapi users `react-router-dom` v6

Strapi 5 uses <ExternalLink to="https://www.npmjs.com/package/react-router-dom" text="`react-router-dom`"/> v6. This impacts the links added to [settings](/cms/plugins-development/admin-panel-api#settings-api) or to the [menu](/cms/plugins-development/admin-panel-api#menu-api) using the Admin Panel API.

 <Intro />

<BreakingChangeIdCard
  plugins
  codemodLink="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/dependency-upgrade-react-router-dom.json.ts"
  codemodName="dependency-upgrade-react-router-dom"
/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

- Strapi v4 uses react-router-dom v5.
- When adding settings or menu links, the `to` property is an absolute path.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

- Strapi v5 uses react-router-dom v6.
- When adding settings or menu links, the `to` property should now be a **relative path**.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- The official React Router documentation explains <ExternalLink to="https://reactrouter.com/en/main/upgrading/v5" text="how to upgrade from v5"/>.
- Absolute paths for menu or settings links are still supported but should yield a warning.

### Manual procedure

This breaking change should be handled by a codemod (see the <ExternalLink to="https://github.com/strapi/strapi/tree/develop/packages/utils/upgrade/resources/codemods/5.0.0" text="full list of 5.0.0 codemods"/>).
Ensure that links added to [settings](/cms/plugins-development/admin-panel-api#settings-api) or to the [menu](/cms/plugins-development/admin-panel-api#menu-api) links using the Admin Panel API use relative paths.
