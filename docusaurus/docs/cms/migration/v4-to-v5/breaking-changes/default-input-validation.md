---
title: REST API input is validated by default in controllers
description: In Strapi 5, REST API input is validated by default in controllers, instead of accepting invalid data and sanitizing it silently.
sidebar_label: Default input validation
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - controllers
 - validation
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# REST API input is validated by default in controllers

Sanitization means that the object is “cleaned” and returned.

Validation means an assertion is made that the data is already clean and throws an error if something is found that shouldn't be there.

Strapi methods exist both for [sanitization and validation in controllers](/cms/backend-customization/controllers#sanitization-and-validation-in-controllers) and they can target input body data, query parameters, and output (only for sanitization).

In Strapi 5, REST API input is validated by default in controllers, instead of accepting invalid data and sanitizing it silently.

<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

In v4, query parameters are validated, but input data (create and update body data) is only sanitized.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

In v5, both query parameters and input data are validated.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

* A `400 Bad Request` error will be thrown if the request has invalid values such as in in the following cases:

  - relations the user do not have permission to create
  - unrecognized values that are not present on a schema
  - attempt to writing non-writable fields and internal timestamps like `createdAt` and `createdBy` fields
  - usage of the `id` field (other than for connecting relations) to set or update the `id` of an object

### Manual procedure

Users should ensure that parameters and input data are valid to avoid `400` errors being thrown. Additional information can be found in the [sanitization and validation in controllers](/cms/backend-customization/controllers#sanitization-and-validation-in-controllers) documentation.
