---
title: Templates are now regular, standalone Strapi applications
description: Templates have been fully rewritten in Strapi 5 and now are standalone, regular Strapi applications, making it easier to create, distribute, and re-use them.
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - templates
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# Templates are now standalone, regular Strapi applications

Templates have been fully rewritten in Strapi 5 and now are standalone, regular Strapi applications, making it easier to create, distribute, and reuse them.
<Intro />
<BreakingChangeIdCard />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

Templates were npm packages with strict requirements (see <ExternalLink to="https://docs-v4.strapi.io/cms/templates" text="v4 documentation"/>).

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Templates are now just regular Strapi 5 applications, which can be run on their own.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

* For additional information about creating a new Strapi application based on an existing template, see the [templates documentation](/cms/templates).
* Creating a Strapi template is now as simple as creating a new Strapi 5 application and adjusting its codebase to your needs.

### Manual migration

Templates in Strapi v4 were only useful if applied on top of a default Strapi application. Strapi 5 templates are now standalone Strapi 5 applications. 

To convert your Strapi v4 template into a usable Strapi 5 template, ensure the template includes all files required for Strapi to work. Your folder containing the v4 template applied on top of a full-blown Strapi application should be enough to be a Strapi 5 template.
