---
title: Migrate from 4.11.3 to 4.11.4
displayed_sidebar: devDocsSidebar
description: Learn how you can migrate your Strapi application from 4.11.3 to 4.11.4.
---

import PluginsCaution from '/docs/snippets/migrate-plugins-extension-caution.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'
import InstallCommand from '/docs/snippets/install-npm-yarn.md'

# v4.11.3 to v4.11.4 migration guide

This migration guide outlines changes made to the
`review-workflows.updateEntryStage` webhook payload. The payload was modified in
v4.11.4 to be more extensible and provide maximum utility for Strapi users.

:::caution
External integrations using the `review-workflows.updateEntryStage` webhook will need to be modified to expect the new payload format.
:::

:::note
<EnterpriseBadge /> Review Workflows is an enterprise edition feature. This
migration guide has no impact on community edition users.
:::

## Webhook payload changes

In versions v4.11.3 the webhook payload has the following structure:

```json
{
  "event": "review-workflows.updateEntryStage",
  "createdAt": "2023-06-30T11:40:00.658Z",
  "model": "model",
  "uid": "uid",
  "entry": {
    "entityId": 2,
    "workflow": {
      "id": 1,
      "stages": {
        "from": 1,
        "to": 2
      }
    }
  }
}
```

In version v4.11.4 the webhook payload has the following structure:

```json
{
  "event": "review-workflows.updateEntryStage",
  "createdAt": "2023-06-26T15:46:35.664Z",
  "model": "model",
  "uid": "uid",
  "entity": {
    "id": 2
  },
  "workflow": {
    "id": 1,
    "stages": {
      "from": {
        "id": 1,
        "name": "Stage 1"
      },
      "to": {
        "id": 2,
        "name": "Stage 2"
      }
    }
  }
}
```
