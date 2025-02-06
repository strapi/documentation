---
title: Vite is the default bundler
description: In Strapi 5, Vite is the default bundler and replaces webpack.
sidebar_label: Vite as default bundler
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - dependencies
 - bundlers
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Vite is the default bundler in Strapi 5

In Strapi 5, Vite is the default bundler.

<Intro />
<YesPlugins />
<NoCodemods />

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

Users with custom webpack configurations need to convert to [Vite](https://vitejs.dev/) configurations, or alternatively set `--bundler=webpack` when starting the development server to keep the Strapi v4 behaviour; in the latter case, the terminal will issue a warning. Please refer to the [bundlers](/cms/admin-panel-customization/bundlers) documentation for additional details.
