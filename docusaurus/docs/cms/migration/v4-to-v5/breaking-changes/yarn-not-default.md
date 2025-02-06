---
title: The CLI default package manager is not yarn anymore
description: Strapi 5 detects what package manager you are using to run the CLI, and uses this package manager to install dependencies.
sidebar_label: yarn not the default package manager
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - dependencies
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'
import NoPlugins from '/docs/snippets/breaking-change-not-affecting-plugins.md'

# The CLI default package manager is not yarn anymore

In Strapi v5, the command used to run dependencies installation is the one used to actually install them.

<Intro />
<NoPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

All the following commands try to use `yarn` to install the application dependencies:

- `npx create-strapi-app`
- `npm create strapi-app`
- `yarn create strapi-app`
- `yarn dlx …`

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Strapi detects what package manager you are using to run the CLI, and uses this package manager to install dependencies.

</SideBySideColumn>

</SideBySideContainer>

## Migration

### Notes

* Since Strapi detects the package manager used to run the command and uses it to install dependencies, this means the following example use cases will happen:

  - `npx create-strapi-app`  installs the dependencies with `npm`
  - `npm create …` installs the dependencies with `npm`
  - `yarn create …` installs the dependencies with `yarn`
  - `yarn dlx …` installs the dependencies with `yarn`
  - `pnpm create …` installs the dependencies with `pnpm`
  - `pnpm dlx …` installs the dependencies with `pnpm`

### Manual procedure

Users with existing projects are not impacted. Only users doing specific automation and scripts or plugin developers that are used to running a `create-strapi-app` command and expect yarn to be used by default will be impacted.

If, for instance, you want to use npx but still enforce using yarn to install dependencies, add a `--use-yarn` flag. Additional information about the possible flags is available in the [CLI installation reference](/cms/installation/cli#cli-installation-options).
