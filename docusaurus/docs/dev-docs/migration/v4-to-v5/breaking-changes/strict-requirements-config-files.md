---
title: Strict requirements for configuration filenames
description: Strapi 5 has strict requirements on the configuration filenames allowed to be loaded.
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - configuration
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import NoPlugins from '/docs/snippets/breaking-change-not-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# Strict requirements for configuration files

Strapi 5 has strict requirements on the configuration filenames allowed to be loaded.
<Intro />
<NoPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Every `.js`, `.ts`, and `.json` file in the `/config/` folder of a Strapi project is loaded into `strapi.config`.

For example if there is a file called `/config/my-custom-config.js` it is loaded and accessible from `strapi.config.get('my-custom-config.someProperty')`.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Strapi 5 has strict requirements on the filenames allowed to be loaded (see notes for details).

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

In Strapi 5 filenames for configuration files should comply to these requirements:

- There should be no case-insensitive duplicate filenames. If both `CUSTOM.js` and `custom.js` exist, only one will be loaded.
- There should be no duplicate base filenames without extension. If both `custom.json` and `custom.js` exist, only one will be loaded.
- The following filenames are restricted and not loaded:
    - `uuid`
    - `hosting`
    - `license`
    - `enforce`
    - `disable`
    - `enable`
    - `plugin`
    - `strapi`
    - `middleware`
    - `telemetry`
    - `launchedAt`
    - `serveAdminPanel`
    - `autoReload`
    - `environment`
    - `packageJsonStrapi`
    - `info`
    - `autoReload`
- It is advised to use only alphanumeric characters (`a-zA-Z0-9`).
- All internal Strapi configurations (see the list of files in [configurations](/dev-docs/configurations)) must conform to the known structure of those configuration files (i.e., no custom fields should be added to the existing files).

### Manual migration

Rename any of configuration files that are now invalid to a new name, and update the code to look in that path.

If you added custom fields to the internal Strapi configuration files, you should instead create a new file to store the custom configuration, and ensure the new filename matches the requirements for Strapi 5.
