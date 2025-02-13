---
title: Components and dynamic zones do not return an id 
description: In Strapi 5, components and dynamic zones do not return an `id` with REST API requests so it's not possible to partially update them.
sidebar_label: Components and dynamic zones do not return an id
displayed_sidebar: cmsSidebar
unlisted: true
tags:
 - breaking changes
 - content API
 - components
 - dynamic zones
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'

# Components and dynamic zones do not return an `id`

In Strapi 5, components and dynamic zones do not return an `id` with REST API requests so it's not possible to partially update them.

<Intro />

<YesPlugins/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

In Strapi v4, you can partially update a component by passing its component `id`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The response of components and dynamic zones in the REST API does not contain an `id`, and partial updates on them is not possible.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

* In Strapi v4, you could do the following send requests that would return a component's `id`:

  ```tsx
  // 1. GET /category/:id
  category = fetch(...)

  // 2. PUT /category/:id
  {
  data: {
    name: 'category-name',
    // Update component by its id
    component: {
      id: category.component.id // Use the id received in 1.
      value: 'value' 
    }
  }
  }
  ```

  So you could specify the component `id` to update the `value` field.
  
* In Strapi 5:

  * The [Draft & Publish](/cms/features/draft-and-publish) feature has been reworked and documents <DocumentDefinition/> can have both a draft and a published version.
  * The default behaviour of the Content API is to return published data, for instance `PUT /category/:id` can be used to update the draft version of a document and publish it.
  * The REST API response returns the published version, so using the `id` would resort to trying to update the draft version of a component or dynamic zone with the unique identifier of its published version, which is not possible.
  * Trying to partially update a component will result in the following error: `Some of the provided components in component are not related to the entity`.

* This breaking change only affects the REST API, not the [Document Service API](/cms/api/document-service), because the Document Service API returns the draft version of a document by default. This also makes it possible to partially update a component or dynamic zone in the Content Manager.

### Manual procedure

Update your custom code to send the full component to update when using the REST API.
