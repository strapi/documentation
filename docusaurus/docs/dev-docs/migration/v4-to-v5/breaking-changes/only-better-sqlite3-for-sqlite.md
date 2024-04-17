---
title: Only the `better-sqlite3` package is supported for the sqlite client
description: In Strapi 5, 
sidebar_label: Only better-sqlite3 for sqlite 
displayed_sidebar: devDocsMigrationV5Sidebar
unlisted: true
tags:
 - breaking changes
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import NoPlugins from '/docs/snippets/breaking-change-not-affecting-plugins.md'

# Only the `better-sqlite3` package is supported for the sqlite client

Strapi 5 can only use the `better-sqlite3` package for SQLite databases, and the `client` value for it must be set to `sqlite`

<Intro />

<NoPlugins/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The database configuration `client` option for SQLite databases accepts several values such as `sqlite3`, `vscode/sqlite3`, `sqlite-legacy`, and `better-sqlite3`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The database configuration `client` option for SQLite database only accepts `sqlite`.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Strapi 5 uses the `better-sqlite3` package for SQLite databases under the hood. Knex rewrites the `sqlite` option as `better-sqlite3`.

### Manual procedure

No manual migration should be required as codemods from the [upgrade tool](/dev-docs/upgrade-tool) will handle this change.

In case you want to manually migrate, run the following commands in the terminal:

1. Run `yarn remove sqlite3` to remove the sqlite 3 package.
2. Run `yarn add better-sqlite3` to install the `better-sqlite3` package.
