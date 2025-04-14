---
title: Upload a file at entry creation no longer supported 
description: In Strapi 5, it is not possible to upload a file while creating an entry, so users must upload the file first, and then create the entry with the created file id.
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - upload
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Upload a file at entry creation is no longer supported

In Strapi 5, it is not possible to upload a file while creating an entry, so this should be done in 2 steps.

<Intro />
<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

It was possible to upload a file while creating an entry, as <ExternalLink to="https://docs-v4.strapi.io/cms/plugins/upload#upload-files-at-entry-creation" text="documented for Strapi v4"/>.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

You must upload the file first, and then create the entry with the created file id.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Migration procedure

Users must update their custom code, first sending a [POST call to the Upload API at `/api/upload/`](/cms/api/rest/upload), then creating an entry with a [POST call to the REST API at `/api`](/cms/api/rest#create) with the created file id.
