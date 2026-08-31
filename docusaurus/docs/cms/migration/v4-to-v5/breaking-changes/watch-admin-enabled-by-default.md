---
title: The watch-admin mode is enabled by default
description: In Strapi 5, the strapi develop command starts in watch-admin mode by default, while it was opt-in in Strapi v4.
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - CLI
 - admin panel
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# The watch-admin mode is enabled by default

<Tldr>

In Strapi 5, `strapi develop` starts in watch-admin mode by default, so the admin panel hot reloads without any additional flag. Use `--no-watch-admin` to disable it.

</Tldr>

Watch-admin mode reloads the admin panel automatically while you edit its source files. In Strapi v4 you had to ask for this behavior explicitly, while in Strapi 5 you get it by default and opt out instead.

<Intro />
<BreakingChangeIdCard plugins={false} codemod={false} />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Watch-admin mode is disabled by default. You start it with the `--watch-admin` flag:

```bash
strapi develop --watch-admin
```

A separate `strapi watch-admin` command is also available.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Watch-admin mode is enabled by default, so `strapi develop` alone hot reloads the admin panel. The `--no-watch-admin` flag disables it:

```bash
strapi develop --no-watch-admin
```

The standalone `strapi watch-admin` command is removed.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Passing `--watch-admin` in Strapi 5 is not an error, since the flag still exists and already defaults to `true`. Scripts that use it keep working, but the flag is redundant.

If watch-admin mode is disabled, you can also use `--no-build-admin` to prevent the admin panel from being built.

### Manual migration

To migrate to Strapi 5:

1. Search your `package.json` scripts, Dockerfiles, and CI configuration files for `--watch-admin` and `strapi watch-admin`.
2. Replace any `strapi watch-admin` command with `strapi develop`.
3. Remove the now-redundant `--watch-admin` flags, or keep them if you prefer being explicit.
4. Add `--no-watch-admin` to the commands that must *not* hot reload the admin panel, such as scripts that previously relied on watch-admin mode being off by default.

:::note
See the [CLI reference](/cms/cli#strapi-develop) for the full list of options accepted by the `strapi develop` command.
:::
