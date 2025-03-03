---
title: MySQL v5 unsupported
description: MySQL v5 is not supported in Strapi v5 anymore.
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - database
 - MySQL
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# MySQL v5 is not supported in Strapi v5 anymore

In Strapi 5, MySQL version 5 is not supported.
<Intro />

<BreakingChangeIdCard />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

MySQL v5 is supported.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

MySQL v5 is not supported anymore.<br />
MySQL v8 is the minimum required version.

</SideBySideColumn>

</SideBySideContainer>

<br />

## Migration

<MigrationIntro />

### Notes

* The [CLI installation guide](/cms/installation/cli) lists the databases supported by Strapi 5.
* Please also consider that only the `mysql2` package can be used with Strapi 5 for MySQL databases (see the [related breaking change entry](/cms/migration/v4-to-v5/breaking-changes/only-mysql2-package-for-mysql)).

### Migration procedure

No manual migration is required for the codebase of your Strapi application.
Connection information will probably stay the same as in Strapi v4.

However, to use Strapi v5, you must upgrade your MySQL database to version 8.0 (see additional information in the official <ExternalLink to="https://dev.mysql.com/doc/relnotes/mysql/8.0/en/" text="MySQL documentation"/>).
