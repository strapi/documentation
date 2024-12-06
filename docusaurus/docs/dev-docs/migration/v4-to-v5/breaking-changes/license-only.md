---
title: lockIcon replaced by licenseOnly
description: In Strapi 5, the lockIcon property is replaced by licenseOnly, which affects how the addMenuLink(), addSettingsLink(), and addSettingsLinks() methods from the Admin Panel API work.
sidebar_label: lockIcon replaced by licenseOnly
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - plugins development
 - admin panel API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# `lockIcon` property replaced by `licenseOnly`

Strapi 5 adds a new `licenseOnly` boolean property to pass in the `addMenuLink`, in the `addSettingsLink` and in the `addSettingsLinks` actions. Adding this property shows a lightning ⚡️ icon near the link, and indicates paid features.

A similar result can be achieved in Strapi v4 by adding the `lockIcon` property.

<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

* The `lockIcon` property is used in the `addMenuLink()`, `addSettingsLink`, and `addSettingsLinks()` methods of the Admin Panel API.
* The property adds a lock icon.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

* The `licenseOnly` property is used in the `addMenuLink()`, `addSettingsLink`, and `addSettingsLinks()` methods of the Admin Panel API.
* The property adds a lightning icon ⚡️.

</SideBySideColumn>

</SideBySideContainer>

## Migration

### Notes

* Passing `licenseOnly: true` will add a lightning icon ⚡️, so that:

  - a menu icon will look like the following: ![](/img/assets/plugins/lightning-icon-menu.png)

  - a settings menu item will look like the following: ![](/img/assets/plugins/lightning-icon-settings.png)

* Additional information and examples on how to use the `licenseOnly` property can be found in the [`addMenuLink()`](/dev-docs/plugins/admin-panel-api#menu-api), [`addSettingsLink()`](/dev-docs/plugins/admin-panel-api#addsettingslink), and [`addSettingsLinks()`](/dev-docs/plugins/admin-panel-api#addsettingslinks) methods sections of the Admin Panel API documentation.

### Manual migration

If your custom Strapi v4 code uses the `lockIcon` property to highlight a paid feature that requires an <EnterpriseBadge /> license, search and replace `lockIcon: true` by `licenseOnly: true`.
