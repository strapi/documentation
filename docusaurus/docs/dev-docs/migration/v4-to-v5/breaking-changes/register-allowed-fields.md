---
title: The Users & Permissions plugin's register.allowedFields configuration option defaults to []
description: In Strapi 5, The Users & Permissions plugin's `register.allowedFields` configuration option defaults to [].
sidebar_label: register.allowedFields defaults to []
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - users & permissions
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import NoPlugins from '/docs/snippets/breaking-change-not-affecting-plugins.md'
import YesCodemods from '/docs/snippets/breaking-change-handled-by-codemod.md'


# The Users & Permissions plugin's `register.allowedFields` configuration option defaults to `[]`

In Strapi 5, the Users & Permissions plugin's `register.allowedFields` configuration option defaults to `[]`.

<Intro />
<NoPlugins />
<YesCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Any new fields added to the User content type would be accepted by the registration form by default, and Strapi would warn about each field on startup.

The users have the option to set `users-permissions.register.allowedFields` in the `config/plugins.js` file to an array of the fields they wanted to accept on their registration endpoint. For example, `[’picture’]` to accept a picture attribute on registration. Or an empty array `[]` if they do not want to accept anything else.

However, if users did not set any value, that is, when `allowedFields` is undefined, all user fields are accepted.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

An undefined `allowedFields` is treated as an empty array, and no fields are accepted by default. Users must explicitly choose to allow extra fields on registration.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

A codemod should handle this migration. If not, please refer to the documentation on how to [register allowed fields for the Users & Permissions plugin](/user-docs/features/users-permissions#registration-configuration).
