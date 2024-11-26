---
title: Strapi factories import have been updated
description: In Strapi 5, the way import are done, through the application init function or through factories, has been updated.
sidebar_label: Use strapiFactory in imports
displayed_sidebar: cmsSidebar
unlisted: true
tags:
 - breaking changes
 - strapiFactory
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import PartialCodemods from '/docs/snippets/breaking-change-partially-handled-by-codemod.md'

# Strapi factories import have been updated

In Strapi 5, strapi factories import have been updated.

<Intro />
<YesPlugins />
<PartialCodemods />

## Breaking change description

**In Strapi v4**

Imports are done as follows:

* using the application init function:

  ```js
  import strapi from '@strapi/strapi'; 
  // or
  const strapi = require('@strapi/strapi');

  strapi();
  ```

* using the factories:
  
  ```js
  import strapiDefault from '@strapi/strapi';
  // or
  import { factories } from '@strapi/strapi';
  // or
  const { factories } = require('@strapi/strapi');
  // or
  const { createCoreService } = require('@strapi/strapi').factories;
  // or
  const strapi = require('@strapi/strapi');

  strapiDefault.factories.createCoreService(); // this is not possible anymore in v5
  strapi.factories.createCoreService();
  factories.createCoreService();
  createCoreService();
  ```

**In Strapi 5**

Imports are done as follows:

* using the application init function

  ```js
  import { createStrapi } from '@strapi/strapi'; 
  const { createStrapi } = require('@strapi/strapi');
  const strapi = require('@strapi/strapi');

  strapi.createStrapi();
  ```

* using the factories:
  
  ```js
  // Using the factories
  import { factories } from '@strapi/strapi';
  // or
  const { factories } = require('@strapi/strapi');
  // or
  const { createCoreService } = require('@strapi/strapi').factories;
  // or
  const strapi = require('@strapi/strapi');

  strapi.factories.createCoreService();
  factories.createCoreService();
  createCoreService();

  // The recommended way is
  const { factories } = require('@strapi/strapi');
  import { factories } from '@strapi/strapi';

  factories.createCoreService();
  ```

## Migration

- The [upgrade tool](/dev-docs/upgrade-tool) converts the application instantiation with a codemod.
- The factories pattern that were removed will not be converted automatically.
