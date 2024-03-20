---
title: strapi-utils is refactored
description: In Strapi 5, the 'strapi-utils' core package has been refactored. This page lists the additions, removals, and other updates.
sidebar_label: strapi-utils refactored
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - strapi-utils
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'

# `strapi-utils` refactored

In Strapi 5, the `strapi-utils` core package has been refactored. This page lists the additions, removals, and other updates.

<Intro />

<YesPlugin />

## List of changes

| Element                   |  Description of the change |
|---------------------------|-----------------------------------------------------------------------------------------------------|
| `arrays` utils            | Added, and moved the `stringIncludes` method inside it (see [additional notes](#additional-notes)). |
| <ul><li>`dates` utils</li><li>`objects` utils</li><li>`async` utils</li><li>`strings` utils</li></ul> | Added (see [additional notes](#additional-notes)).| Added (see [additional notes](#additional-notes)). |
| `strings.getCommonPath`    | Added |
| `nameToSlug`               | Moved to `strings.nameToSlug` |
| `nameToCollectionName`     | Moved to `strings.nameToCollectionName` |
| `stringIncludes`           | Moved to `arrays.includesString` |
| `stringEquals`             | Moved to `strings.isEqual` |
| `isCamelCase`              | Moved to `strings.isCamelCase` |
| `isKebabCase`              | Moved to `strings.isKebabCase` |
| `toKebabCase`              | Moved to `strings.toKebabCase` |
| `toRegressedEnumValue`     | Moved to `strings.toRegressedEnumValue` |
| `startsWithANumber`        | Moved to `strings.startsWithANumber` |
| `joinBy`                   | Moved to `strings.joinBy` |
| `keysDeep` | Moved to `objects.keysDeep` |
| `generateTimestampCode`    | Moved to `dates.timestampCode` |
|  `pipeAsync`               | Moved to  `async.pipe` |
|  `mapAsync`                | Moved to  `async.map` |
|  `reduceAsync`             | Moved to  `async.reduce` |
| `getCommonBeginning`       | Removed |
| <ul><li>`getConfigUrls`</li><li>`getAbsoluteAdminUrl`</li><li>`getAbsoluteServerUrl`</li></ul> | Removed |
| `forEachAsync`             | Removed |
| `removeUndefined`          | Removed |
| `templateConfiguration`    | Removed (see [additional notes](#additional-notes)). |

## Additional Notes

- `templateConfiguration`: This was used when loading the old v3 configuration files in JSON to allow for templates. Plugin developers still using the function should replace its usage by a real template library if they really need to.

- `arrays` utils: To use these new utils:
  1. Import them in your code with `import { arrays, dates, strings, objects } from '@strapi/utils';`.
  2.  Use them, for instance as `arrays.includesString` or `strings.isEqual`.
