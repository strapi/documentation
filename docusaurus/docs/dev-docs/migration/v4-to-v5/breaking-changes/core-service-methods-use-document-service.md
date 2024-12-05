---
title: Core service methods use the Document Service API
description: In Strapi 5, core service methods use the Document Service API instead of the Entity Service API.
sidebar_label: Core service methods use Document Service API
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - document service API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Core service methods use the Document Service API

In Strapi 5, core service methods use the Document Service API instead of the Entity Service API.

<Intro/>
<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The core controllers and the `createCoreService` factory by default use the Entity Service API.<br/>Methods such as, for instance, `find`, `update`, and `delete` receive an `entityId`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The core controllers and the `createCoreService` factory use the [Document Service API](/dev-docs/api/document-service).<br/>Methods such as, for instance, `find`, `update`, and `delete` receive a `documentId`.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Some core methods are calling `super.find(ctx)` which internally calls entity service methods in Strapi v4, while they call Document Service API methods in Strapi 5. This may result in some queries no longer working, or returning slightly different results from expecting.

The following examples show how the code should be updated:

  **In Strapi v4:**

  ```js title="/src/api/my-api-name/services/my-service.js"
  const { createCoreService } = require('@strapi/strapi').factories;

  module.exports = createCoreService('api::address.address', {

    findOne(entityId, params) {
      // customization
      super.findOne(entityId, params);
      
      // or to show a bit more context
      strapi.entityService.findOne(uid, entityId, params);
    },
    
    update(entityId, params) {
      // customization
      super.update(entityId, params);
    },
    
    delete(entityId, params) {
      // customization
      super.delete(entityId, params)
    }

  });
  ```

  **In Strapi 5:**

  ```js title="/src/api/my-api-name/services/my-service.js"
  const { createCoreService } = require('@strapi/strapi').factories;

  module.exports = createCoreService('api::address.address', {

    findOne(documentId, params) {
      // customization
      super.findOne(documentId, params);
      
      // or to show a bit more context
      strapi.documents(uid).findOne(documentId, params);
    },

    update(documentId, params) {
      // customization
      super.update(documentId, params);
    },

    delete(documentId, params) {
      // customization
      super.delete(documentId, params)
    }
  });
  ```

### Manual procedure

To update your custom code:

1. Find all calls to `createCoreService` with customization.
2. If any of `findOne, delete, update` function for a collection type are extending core methods, update them as explained in the [notes](#notes).

Additionally, please refer to the [Entity Service API to Document Service API migration](/dev-docs/migration/v4-to-v5/additional-resources/from-entity-service-to-document-service) documentation.
