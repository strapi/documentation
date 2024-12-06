---
title: The admin panel RBAC system has been updated
description: In Strapi 5, there is no `content-manager_rbacManager` anymore, and the regular permissions system is used instead.
sidebar_label: content-manager_rbacManager removed
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - content manager
 - RBAC
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# The admin panel RBAC system has been updated

In Strapi 5, the `content-manager_rbacManager`, which is a section of Strapi's redux store for the admin panel, is removed and the regular permissions system is used instead. Additionally, the `useRBAC` hook is updated.

<Intro/>
<YesPlugins/>
<NoCodemods />

## Breaking change description

**In Strapi v4**

Permissions are handled with the `content-manager_rbacManager` section of the redux store, like in the following generic example:

```tsx
const cmPermissions useSelector(state => state['content-manager_rbacManager'])
```

```tsx
const { allowedActions } = useRBAC({
	main: [{ action: 'admin::something.main', subject: null }]
})

const canMain = allowedActions.canMain
```

**In Strapi 5**

`content-manager_rbacManager` is removed and the regular permissions system is used instead, which implies the `useRBAC` hook is used differently, as in the following generic example:

```tsx
const { allowedActions } = useRBAC([
  { action: 'admin::something.main', subject: null }
])

const canMain = allowedActions.canMain
```

## Migration

<MigrationIntro />

### Notes

<!-- TODO v5: update links when v5.contributor.strapi.io is hosted at contributor.strapi.io -->
* A new RBAC API is available and users can utilise a middleware system to interact with calls (see [contributors documentation](https://contributor.strapi.io/exports/classes/StrapiApp#addrbacmiddleware)).
* Additional information can be found in the Contributors Documentation, in the [Fetching permissions](https://contributor.strapi.io/docs/core/admin/permissions/frontend/fetching-permissions) and [Authentication](https://contributor.strapi.io/docs/core/admin/features/authentication) sections.

### Manual migration

Plugin developers that are hooking into the redux store to tweak RBAC permissions in Strapi v4 need to update their code according to the described changes.
