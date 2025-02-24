---
title: strapi-utils is refactored
description: In Strapi 5, the 'strapi-utils' core package has been refactored. This page lists the additions, removals, and other updates.
sidebar_label: strapi-utils refactored
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - strapi-utils
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# `strapi-utils` refactored

In Strapi 5, the `strapi-utils` core package has been refactored. This page lists the additions, removals, and other updates.

<Intro />

<BreakingChangeIdCard
  plugins
  codemodLink="https://github.com/strapi/strapi/blob/develop/packages/utils/upgrade/resources/codemods/5.0.0/utils-public-interface.code.ts"
  codemodName="utils-public-interface"
/>

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
| `convertQueryParams`       | Replaced (see [additional notes](#additional-notes)). |
| `validate` and `sanitize`  | Updated  (see [additional notes](#additional-notes)). |
| `getCommonBeginning`       | Removed |
| <ul><li>`getConfigUrls`</li><li>`getAbsoluteAdminUrl`</li><li>`getAbsoluteServerUrl`</li></ul> | Removed |
| `forEachAsync`             | Removed |
| `removeUndefined`          | Removed |
| `templateConfiguration`    | Removed (see [additional notes](#additional-notes)). |

## Additional Notes

- `templateConfiguration`: This was used when loading the old v3 configuration files in JSON to allow for templates. Plugin developers still using the function should replace its usage by a real template library if they really need to.

- `arrays` utils: To use these new utils:
  1. Import them in your code with `import { arrays, dates, strings, objects } from '@strapi/utils';`.
  2. Use them, for instance as `arrays.includesString` or `strings.isEqual`.

- `convertQueryParams` is replaced:

  ```js
  // Strapi v4
  import { convertQueryParams } from '@strapi/utils';

  convertQueryParams.convertSortQueryParams(...); // now private function to simplify the api
  convertQueryParams.convertStartQueryParams(...); // now private function to simplify the api
  convertQueryParams.convertLimitQueryParams(...); // now private function to simplify the api
  convertQueryParams.convertPopulateQueryParams(...); // now private function to simplify the api
  convertQueryParams.convertFiltersQueryParams(...); // now private function to simplify the api
  convertQueryParams.convertFieldsQueryParams(...); // now private function to simplify the api
  convertQueryParams.convertPublicationStateParams(...); // now private function to simplify the api

  convertQueryParams.transformParamsToQuery(...); // becomes the example below

  // Strapi 5 
  // Those utils required the strapi app context, so we decided to expose a strapi service for it
  strapi.get('query-params').transform();
  ```

- `validate` and `sanitize` are now part of the `strapi.contentAPI` functions:

  ```js
  // Strapi v4
  import { validate, sanitize } from '@strapi/utils';

  validate.contentAPI.xxx();
  sanitize.contentAPI.xxx();

  // Strapi 5
  // Those methods require the strapi app context
  strapi.contentAPI.sanitize.xxx();
  strapi.contentAPI.validate.xxx();
  ```
