---
title: Lifecycle hooks are triggered differently with the Document Service API methods
description: In Strapi 5, database lifecycle hooks are triggered differently with the various Document Service API methods, mainly due to the new way the Draft & Publish feature works.
sidebar_label: Lifecycle hooks
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - Document Service API
 - lifecycle hooks
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Lifecycle hooks are triggered differently with the Document Service API methods

In Strapi 5, database lifecycle hooks are triggered differently with the various [Document Service API](/dev-docs/api/document-service) methods, mainly due to the new way the [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) feature works.

<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

<!-- TODO: update this link to start with docs-v4 once stable is out -->
In Strapi v4, lifecycle hooks work as documented in the [Strapi v4 documentation](https://docs.strapi.io/dev-docs/backend-customization/models#lifecycle-hooks).

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Lifecycle hooks work the same way as in Strapi v4 but are triggered differently, based on which Document Service API methods are triggered. A complete reference is available (see [notes](#notes)).

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

The [Document Service API: Lifecycle hooks](/dev-docs/api/document-service/lifecycle-hooks) documentation lists how database lifecycle hooks are triggered based on which Document Service API methods are called.

### Manual procedure

Users might need to adapt their custom code to how lifecycle hooks are triggered by Document Service API methods in Strapi 5.

