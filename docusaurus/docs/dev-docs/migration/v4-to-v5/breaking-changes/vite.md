---
title: Vite is the default bundler
description: In Strapi 5, Vite is the default bundler and replaces webpack.
sidebar_label: Vite bundling
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - vite
 - front end
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Vite is the default bundler

In Strapi 5, Vite is the default bundler.

<Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Webpack is the default bundler.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

[Vite](https://vitejs.dev/) is the default bundler.


</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Manual procedure

Users with custom webpack configurations need to convert to [Vite](https://vitejs.dev/) configurations, or alternatively set `--bundler=webpack` when starting the development server to keep the Strapi v4 behaviour; in the latter case, the terminal will issue a warning. Please refer to the [bundlers](/dev-docs/admin-panel-customization#bundlers-experimental) documentation for additional details.
