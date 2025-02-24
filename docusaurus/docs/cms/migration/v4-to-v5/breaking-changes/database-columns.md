---
title: Database columns
description: Content types always have feature columns
displayed_sidebar: cmsSidebar
tags:
  - breaking changes
  - database
  - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Content types always have feature columns

In Strapi 5, Content types always have document, publication and internationalization columns created in database.

<Intro />
<BreakingChangeIdCard plugins />

## Breaking change description

**In Strapi 5**

* All the Content Types have a new `document_id` column.
* The `published_at` column is now always added.
* The `locale` column is now always added.

<br />
