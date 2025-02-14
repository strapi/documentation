---
title: The 'webhooks.populateRelations' server configuration is removed
description: In Strapi 5, webhooks have been refactored and the `webhook.populateRelations` option will become redundant. This might affect lifecycles expecting the returned relations of create, update and delete to be populated.
sidebar_label: No webhooks.populateRelations configuration
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - webhooks
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# The `webhooks.populateRelations` server configuration is removed

In Strapi 5, webhooks have been refactored and the `webhook.populateRelations` option will become redundant. This might affect lifecycles expecting the returned relations of create, update and delete to be populated.

<Intro />
<YesPlugins />
<NoCodemods />

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

When an entry is created, updated, or modified in any way, the response payload of the Content Manager backend returns the total count of relations for every relational field.

You can see the count being used at the top of the relation in the Content Manager Edit view:

![Content-Manager screenshot that shows populated relations count](/img/assets/migration/webhooks-populated-relations.png)

The actual relational values are fetched using another endpoint. This was made to enhance the performance of the Content Manager requests.

To simplify webhook consumption, you can enable the  (see [server configuration](/cms/configurations/server#available-options)). When enabled, all relations values are populated and sent to the webhook consumers, resulting in performance decrease.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

Webhooks will be refactored, so the `webhooks.populateRelations` configuration is not necessary, but changing how things are populated might impact other things like database lifecycles expecting the returned relations of create, update and delete to be populated.

</SideBySideColumn>

</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

Additional information will be given once the webhooks are refactored.

### Manual procedure

Relying on any input populate values on database layer is not reliable, so if necessary in your custom code base, the lifecycle should always fetch the necessary data.
