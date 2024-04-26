---
title: MySQL v5 unsupported
description: MySQL v5 is not supported in Strapi v5 anymore.
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - database
 - MySQL
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import NoPlugins from '/docs/snippets/breaking-change-not-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# MySQL v5 is not supported in Strapi v5 anymore

In Strapi 5, MySQL version 5 is not supported.
<Intro />
<NoPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

MySQL v5 was supported.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

MySQL v5 is not supported anymore.<br />
MySQL v8 is the minimum required version (see [CLI installation guide](/dev-docs/installation/cli)).

</SideBySideColumn>

</SideBySideContainer>

<br />

## Migration

<!-- TODO: update this sentence -->
No manual migration is required for the codebase of your Strapi application.
Connection information will probably stay the same as in Strapi v4.

However, to use Strapi v5, you must upgrade your MySQL database to version 8.0 (see additional information in the official [MySQL documentation](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/)).
