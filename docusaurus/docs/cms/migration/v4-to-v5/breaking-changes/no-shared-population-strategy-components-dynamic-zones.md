---
title: No shared population strategy for components & dynamic zones
description: In Strapi 5, the shared population strategy is not supported anymore, so components and dynamic zones must be explicitly populated using `on` fragments.
sidebar_label: No shared population strategy
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - content API
 - population
 - REST API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Components and dynamic zones should be populated using the detailed population strategy (`on` fragments)

In Strapi 5, components and dynamic zones should be populated using the detailed population strategy, with `on` fragments. The shared population strategy possible in Strapi v4 is no longer supported.

<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

You could use either [the shared or the detailed population strategy](https://docs-v4.strapi.io/cms/api/rest/guides/understanding-populate#populate-dynamic-zones) to populate components and dynamic zones in a REST API call.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

You must use `on` fragments to explicitly detail which components and dynamic zones to [populate](/cms/api/rest/populate-select#population).

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Additional information on population is available in the [REST API documentation](/cms/api/rest/populate-select#population).

### Manual procedure

Users should ensure that components and dynamic zones are explicitly populated using `on` fragments, such as in the following example syntax and URL:

- example generic syntax:
  
    `populate[dynamic-zone-name][on][component-category.component-name]=true`

- example URL:

  `/api/articles?populate[dynamic-zone-name][on][component-category.component-name]=true`
