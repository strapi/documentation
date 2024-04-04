---
title: Core service methods use the Document Service API
description: In Strapi 5, core service methods use the Document Service API instead of the Entity Service API.
sidebar_label: Core service methods use Document Service API
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - document service API
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Core service methods use the Document Service API

In Strapi 5, core service methods use the Document Service API instead of the Entity Service API.

<Intro/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

For instance, the core controllers by default use the Entity Service API for methods such as `find`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

For instance, the core controllers by default use the [Document Service API](/dev-docs/api/document-service) for methods such as `find`.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Some core methods are calling `super.find(ctx)` which internally calls entity service methods in Strapi v4, while they call Document Service API methods in Strapi 5. This may result in some queries no longer working, or returning slightly different results from expecting.

### Manual procedure

Please refer to the [Entity Service API to Document Service API migration](/dev-docs/migration/v4-to-v5/guides/from-entity-service-to-document-service) documentation.
