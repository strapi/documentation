---
title: Content types with Draft & Publish disabled always have the publishedAt value set to a date
description: In Strapi 5, content-types with Draft & Publish disabled always have the publishedAt value set to a date.
sidebar_label: publishedAt always exists
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - draft & publish
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Content types with Draft & Publish disabled always have the publishedAt value set to a date

In Strapi 5, content-types with Draft & Publish disabled always have the publishedAt value set to a date.
<Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

In Strapi v4, a content-type with Draft & Publish disabled does not even have a `publishedAt` attribute.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

In Strapi 5, the `publishedAt` attribute always exist even if Draft & Publish is disabled for a content-types.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

* If Draft & Publish is enabled, `publishedAt` is:
  * `null` for drafts versions of documents
  * and set to the publication date for published versions of documents.
* If Draft & Publish is disabled, `publishedAt` is set to the latest creation or edition date of the document.
