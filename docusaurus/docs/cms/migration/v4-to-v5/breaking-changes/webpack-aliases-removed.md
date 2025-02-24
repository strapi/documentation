---
title: Webpack Aliases are removed
description: A simplified approach of aliasing in Strapi v5. 
sidebar_label: Webpack Aliases removed
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - dependencies
 - webpack
 - bundlers
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Webpack Aliases are removed

In Strapi v5, webpack aliases are removed ensuring better compatibility and reduced dependency conflicts.

<Intro />
<BreakingChangeIdCard plugins />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Strapi maintains a specific list of dependencies that are aliased in webpack configuration. This ensures that plugins consistently use Strapi versions of certain libraries like the design-system.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The aliasing process is simplified. Only essential dependencies like `react`, `react-dom`, `react-router-dom`, and `styled-components` are aliased.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- If you encounter issues with 3rd-party plugins, it's recommended you open an issue on the respective plugin's repository. Encourage the plugin maintainers to add their dependencies to their `package.json` file to resolve compatibility issues.

- If you encounter issues with local plugins, you can fix them by amending the `resolve` option in your chosen bundler.

### Manual procedure

To migrate to Strapi 5:

- Identify any configuration files (e.g., webpack configuration) that referenced the now-removed Webpack aliases in Strapi v4.
- Ensure that any references to Webpack aliases in the code are replaced with appropriate imports or paths.
- If third-party plugins are used in the project, verify that they do not rely on Webpack aliases that are no longer present in Strapi v5.
- If necessary, communicate with the plugin authors to update their dependencies or configurations accordingly.
