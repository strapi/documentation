---
title: publishedAt can't be used anymore to define the status
description: In Strapi 5, 'publishedAt' can no longer be used in Content API calls to set the status. The new status parameter can be used and accepts 2 different values, draft and published.
sidebar_label: status instead of publishedAt
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - Content API
 - GraphQL API
 - Document Service API
 - Draft & Publish
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import YesCodemods from '/docs/snippets/breaking-change-handled-by-codemod.md'

# `publishedAt` is removed and replaced by `status`

In Strapi 5, the [Draft & Publish feature](/user-docs/content-manager/saving-and-publishing-content) has been reworked, and the Content API, including REST, GraphQL, and Document Service APIs accept a new `status` parameter.

<Intro />

<YesPlugins />
<YesCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

`publishedAt` is used in the request body and accepts the following values:

- `null` sets an entry in draft,
- A date string (e.g., `2021-10-28T16:57:26.352Z`) sets the entry to published status.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

`status` is used as a query parameter and accepts the following values:

- `draft` sets a in the draft version,
- `published` sets a in the published version.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

* Additional information about how to use the new `status` parameter can be found in the [REST API](/dev-docs/api/rest/filters-locale-publication#status), [GraphQL API](/dev-docs/api/graphql#status), and [Document Service API](/dev-docs/api/document-service/status) documentation.

### Migration procedure

* API calls initiated from the front end (REST API, GraphQL API) that used `publishedAt` need to be manually updated.
