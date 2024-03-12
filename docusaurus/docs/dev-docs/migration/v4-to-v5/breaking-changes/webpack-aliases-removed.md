---
title: Webpack Aliases are removed
description: A simplified approach of aliasing in Strapi v5. 
sidebar_label: Webpack Aliases removed
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
 - breaking changes
 - dependencies
 - webpack
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Webpack Aliases are removed

In Strapi v5, webpack aliases are removed ensuring better compatibility and reduced dependency conflicts. 

<Intro />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

- We maintained a specific list of dependencies that were aliased in webpack configuration. This ensured that plugins consistently used our versions of certain libraries like the design-system. <br/> <br/> However, this approach led to many bugs.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

- In Strapi v5, we have simplified the aliasing process. Now, we only alias essential dependencies like `react`, `react-dom`, `react-router-dom`, and `styled-components`.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- If you encounter issues with third-party plugins, we recommend opening an issue on the respective plugin's repository. Encourage them to add their dependencies to their `package.json` file to resolve compatibility issues.

- If you encounter issues with local plugins, you can fix them by amending the `resolve` option in your chosen bundler.


### Manual procedure

To migrate to Strapi 5:

- Identify any configuration files (e.g., webpack configuration) that referenced the now-removed Webpack aliases in Strapi v4.
- Ensure that any references to Webpack aliases in the code are replaced with appropriate imports or paths.
- If third-party plugins are used in the project, verify that they do not rely on Webpack aliases that are no longer present in Strapi v5.
- If necessary, communicate with the plugin authors to update their dependencies or configurations accordingly.