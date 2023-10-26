---
title: Database identifiers shortened in v5
description: Database identifiers are shortened in Strapi v5 and can't be longer than 53 characters to avoid issues with identifiers that are too long.
sidebar_label: Database identifiers shortened
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - database
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Database identifiers shortened in v5

In Strapi v5, database identifiers can't be longer than 53 characters. <Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Database identifiers could be longer than 53 characters, potentially causing issues with some databases.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi v5**

Database identifiers can't be longer than 53 characters and will be shortened.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- A hashing key will be added when shortening database identifiers to avoid conflicts. It will consist in the first 6 characters of SHA-256. For example, `my_very_very_very_very_very_very_very_too_long_identifier_unique` will be shortened to `my_very_very_very_very_very_very_very_very_a2d3x3_unq` in Strapi v5.
- Some suffixes will be used:

  | Suffix                 | Short version |
  | ---------------------- | ------------- |
  | `fk`                   | `fk`          |
  | `unique`               | `unq`         |
  | `primary`              | `pk`          |
  | `index`                | `idx`         |
  | `component`            | `cmp`         |
  | `components`           | `cmps`        |
  | `component_type_index` | `cmpix`       |
  | `entity_fk`            | `etfk`        |
  | `field_index`          | `flix`        |
  | `order`                | `ord`         |
  | `order_fk`             | `ofk`         |
  | `order_inv_fk`         | `oifk`        |
  | `order_index`          | `oidx`        |
  | `inv_fk`               | `ifk`         |
  | `morphs`               | `mph`         |
  | `links`                | `lnk`         |
  | `id_column_index`      | `idix`        |

### Manual procedure

No manual migration is required. Strapi will handle everything when starting the application in Strapi v5.
