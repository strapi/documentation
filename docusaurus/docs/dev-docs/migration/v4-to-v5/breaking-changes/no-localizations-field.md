---
title: The localizations field does not exist anymore
description: In Strapi 5, the localizations field does not exist anymore, and queries should use the locale parameter instead. Not all Strapi v4 use cases might be directly achievable.
sidebar_label: No localizations field
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - Content API
 - Internationalization (i18n)
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# The `localizations` field does not exist anymore

In Strapi 5, the `localizations` field does not exist anymore, and this might restrict the possible use cases. <Intro />

<YesPlugins/>
<NoCodemods/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

* A `localizations` field was introduced as the only way to link related locales together when the Internationalization (i18n) plugin is enabled.
* Getting all or some specific locales is possible using the `localizations` field with API calls.<br/>

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

* The `localizations` field does not exist anymore.
* It's not possible anymore to get all versions of a document in all locales with a unique query.
* Other edge use cases might not be possible any more either (see [notes](#notes)).

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

* It's not possible anymore to populate all localizations such as in the following Strapi v4 code example:

  ```tsx
  // Populate all locales of each document
  strapi.entityService.findMany('api::articles.articles', {
    populate: { localizations: true }
  })
  ```

* It's not possible anymore to use a `localizations` filter such as in the following Strapi v4 code example:

  ```tsx
  // Find entries that have a french locale
  strapi.entityService.findMany(articles, {
    filters: {
      localizations: {
        locale: 'fr'
      }
    }
  })
  ```

* It's not possible anymore to create a complex filter based on `localizations`. For instance, in the following Strapi v4 use case, you could return English-localized versions only for entries who had a French-localized version:

  ```jsx
  await strapi.entityService.findMany({
    filters: {
      locale: 'en' // Get entries that are in English
      localizations: {
        locale: 'fr' // Make sure the entry has another related French one
      }
    }
  })
  ```

* Similarly, it's not possible anymore to get entries in a specific locale by filtering out entries who have another locale, such as with the following Strapi v4 code:

  ```jsx
  await strapi.entityService.findMany({
    filters: {
      locale: 'en' // Get entries that are in english
      $not: {
        localizations: {
          locale: 'fr' // Make sure the entry does not have another related French one
        }
      }
    }
  })
  ```

### Manual procedure

Based on your custom code, you might need to use workarounds in Strapi 5 to get feature parity with Strapi v4.

<!-- For instance, an alternative approach to using Strapi v4 `populate: { localizations: true }` in Strapi 5 is to use the `getAvailableLocales()` method as in the following example:

```tsx
strapi.documents('api::articles.articles').getAvailableLocales(documentId, {})
```

This will return the locales of a document. -->

The Document Service API now returns only a given locale version of document(s), such as in the following example code:

```ts
strapi.documents('api::articles.articles').findMany({ locale: 'en' })
```

If you need to get all locales of a single document, or multiple locales of many documents, you should resort to using the [Query Engine API](/dev-docs/api/query-engine), because the `locale` attribute exists in the database.

Additional information about how to use the `locale` parameter can be found in the [Document Service API reference](/dev-docs/api/document-service) documentation.
