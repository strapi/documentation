---
title: Only the mysql2 package is supported for the MySQL client
description: In Strapi 5, only the mysql2 package is supported for MySQL databases.
sidebar_label: Only mysql2 for MySQL 
displayed_sidebar: cmsSidebar
unlisted: true
tags:
 - breaking changes
 - database
 - MySQL
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import NoPlugins from '/docs/snippets/breaking-change-not-affecting-plugins.md'
import YesCodemods from '/docs/snippets/breaking-change-handled-by-codemod.md'

# Only the `mysql2` package is supported for the MySQL client

Strapi 5 can only use the `mysql2` package for MySQL databases, and the `client` value for it must be set to `mysql`.

<Intro />
<BreakingChangeIdCard
  codemod
/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The database configuration `client` option for MySQL databases accepts several values such as `mysql` and `mysql2`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The database configuration `client` option for MySQL database only accepts `mysql`.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

* Strapi 5 uses the `mysql2` package for SQLite databases under the hood and rewrites the `mysql` option as `mysql2` for Knex.
* Additional information about database clients and configuration can be found in the [database configuration](/cms/configurations/database) documentation.
* Please also consider that MySQL v8 is the minimum required version for Strapi 5 (see the [related breaking change entry](/cms/migration/v4-to-v5/breaking-changes/mysql5-unsupported)).

### Manual procedure

No manual migration should be required as codemods from the [upgrade tool](/cms/upgrade-tool) will handle this change.
