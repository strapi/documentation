---
title: Upload a file at entry creation no longer supported 
description: In Strapi 5, it is not possible to upload a file while creating an entry, so users must upload the file first, and then create the entry with the created file id.
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - upload
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import NoPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import YesCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Upload a file at entry creation is no longer supported

In Strapi 5, it is not possible to upload a file while creating an entry, so this should be done in 2 steps.

<Intro />
<NoPlugins />
<YesCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

<!-- TODO v5: update this link for Strapi v4 once moved to the new URL -->
It was possible to upload a file while creating an entry, as [documented for Strapi v4](https://docs.strapi.io/dev-docs/plugins/upload#upload-files-at-entry-creation).

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

You must upload the file first, and then create the entry with the created file id.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Migration procedure

Users must update their custom code, first sending a [POST call to the Upload API at `/api/upload/`](/dev-docs/plugins/upload#upload-files), then creating an entry with a [POST call to the REST API at `/api`](/dev-docs/api/rest#create-a-document) with the created file id.
