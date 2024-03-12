---
title: publicationState is removed and replaced by status
description: The publicationState can no longer be used in Content API calls. The new status parameter can be used and accepts 2 different values, draft and published.
sidebar_label: status instead of publicationState
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - Content API
 - Entity Service API
 - Draft & Publish
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'

# `publicationState` is removed and replaced by `status`

In Strapi 5, the [Draft & Publish feature](/user-docs/content-manager/saving-and-publishing-content) has been reworked, and the [REST API](/dev-docs/api/rest/filters-locale-publication#status) accepts a new `status` parameter.

<Intro />

<YesPlugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

`publicationState` is used and accepts the following values:

- `live` returns only published entries,
- `preview` returns both draft entries & published entries.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

`status` is used and accepts the following values:

- `draft` returns the draft version of a document,
- `published` returns the published version of a document.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

There are no fallbacks to return by default the published version, and return the draft version if no published version is found.

### Migration procedure 

<!-- TODO: to be confirmed -->
A codemod will automatically handle the change.
