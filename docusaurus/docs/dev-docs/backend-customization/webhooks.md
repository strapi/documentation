---
title: Webhooks
displayed_sidebar: devDocsSidebar
description: Strapi webhooks are user-defined HTTP callbacks used by an application to notify other applications that an event occurred.
tags:
- backend customization
- backend server
- defaultHeaders
- Headers
- lifecycle hooks
- payload
- REST API 
- webhooks
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Webhooks

<NotV5 />

Webhook is a construct used by an application to notify other applications that an event occurred. More precisely, webhook is a user-defined HTTP callback. Using a webhook is a good way to tell third party providers to start some processing (CI, build, deployment ...).

The way a webhook works is by delivering information to a receiving application through HTTP requests (typically POST requests).

## User content-type webhooks

To prevent from unintentionally sending any user's information to other applications, Webhooks will not work for the User content-type.
If you need to notify other applications about changes in the Users collection, you can do so by creating [Lifecycle hooks](/dev-docs/backend-customization/models#lifecycle-hooks) using the `./src/index.js` example.

## Available configurations

You can set webhook configurations inside the file `./config/server`.

- `webhooks`
  - `defaultHeaders`: You can set default headers to use for your webhook requests. This option is overwritten by the headers set in the webhook itself.

**Example configuration**

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = {
  webhooks: {
    defaultHeaders: {
      "Custom-Header": "my-custom-header",
    },
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default {
  webhooks: {
    defaultHeaders: {
      "Custom-Header": "my-custom-header",
    },
  },
};
```

</TabItem>
</Tabs>

## Securing your webhooks

Most of the time, webhooks make requests to public URLs, therefore it is possible that someone may find that URL and send it wrong information.

To prevent this from happening you can send a header with an authentication token. Using the Admin panel you would have to do it for every webhook.
Another way is to define `defaultHeaders` to add to every webhook requests.

You can configure these global headers by updating the file at `./config/server`:

<Tabs>

<TabItem value="simple-token" label="Simple token">

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = {
  webhooks: {
    defaultHeaders: {
      Authorization: "Bearer my-very-secured-token",
    },
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config.server.ts"
export default {
  webhooks: {
    defaultHeaders: {
      Authorization: "Bearer my-very-secured-token",
    },
  },
};
```

</TabItem>
</Tabs>

</TabItem>

<TabItem value="environment-variable" label="Environment variable">

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/server.js"
module.exports = {
  webhooks: {
    defaultHeaders: {
      Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}`,
    },
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/server.ts"
export default {
  webhooks: {
    defaultHeaders: {
      Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}`,
    },
  },
};
```

</TabItem>
</Tabs>

</TabItem>

</Tabs>

If you are developing the webhook handler yourself you can now verify the token by reading the headers.

<!--- ### Usage

To access the webhook configuration panel, go to `Settings` > `Webhooks`.

![Webhooks home](/img/assets/concepts/webhooks/home.png)

#### Create a webhook

Click on `Add new webhook` and fill in the form.

![create](/img/assets/concepts/webhooks/create.png)

#### Trigger a webhook

You can test out a webhook with a test event: `trigger-test`. Open the webhook you want to trigger.

![Trigger ](/img/assets/concepts/webhooks/trigger_start.png)

Click on the `Trigger` button.

![Trigger pending](/img/assets/concepts/webhooks/trigger.png)

You will see the trigger request appear and get the result.

![Trigger result](/img/assets/concepts/webhooks/trigger_result.png)

#### Enable or disable a webhook

You can enable or disable a webhook from the list view directly.

![Disable webhook](/img/assets/concepts/webhooks/disable.png)

#### Update a webhook

You can edit any webhook by clicking on the `pen` icon in the webhook list view.

![Update webhook](/img/assets/concepts/webhooks/list.png)

#### Delete a webhook

You can delete a webhook by clicking on the `trash` icon.

![Delete webhook](/img/assets/concepts/webhooks/disable.png) --->

## Available events

By default Strapi webhooks can be triggered by the following events:

| Name              | Description                                           |
| ----------------- | ----------------------------------------------------- |
| [`entry.create`](#entrycreate)   | Triggered when a Content Type entry is created.       |
| [`entry.update`](#entryupdate)    | Triggered when a Content Type entry is updated.       |
| [`entry.delete`](#entrydelete)    | Triggered when a Content Type entry is deleted.       |
| [`entry.publish`](#entrypublish)   | Triggered when a Content Type entry is published.\*   |
| [`entry.unpublish`](#entryunpublish) | Triggered when a Content Type entry is unpublished.\* |
| [`media.create`](#mediacreate)    | Triggered when a media is created.                    |
| [`media.update`](#mediaupdate)    | Triggered when a media is updated.                    |
| [`media.delete`](#mediadelete)    | Triggered when a media is deleted.                    |
| [`review-workflows.updateEntryStage`](#review-workflowsupdateentrystage-) | Triggered when content is moved between review stages (see [review workflows](/user-docs/settings/review-workflows)).<br />This event is only available with the <EnterpriseBadge /> edition of Strapi. |
| [`releases.publish`](#releases-publish) | Triggered when a Release is published (see [Releases](/user-docs/releases/introduction)).<br />This event is only available with the <EnterpriseBadge /> edition of Strapi and the <CloudTeamBadge /> plan for Strapi Cloud. |

\*only when `draftAndPublish` is enabled on this Content Type.

## Payloads

:::tip NOTE
Private fields and s are not sent in the payload.
:::

### Headers

When a payload is delivered to your webhook's URL, it will contain specific headers:

| Header           | Description                                |
| ---------------- | ------------------------------------------ |
| `X-Strapi-Event` | Name of the event type that was triggered. |

### `entry.create`

This event is triggered when a new entry is created.

**Example payload**

```json
{
  "event": "entry.create",
  "createdAt": "2020-01-10T08:47:36.649Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "createdAt": "2020-01-10T08:47:36.264Z",
    "updatedAt": "2020-01-10T08:47:36.264Z",
    "cover": null,
    "images": []
  }
}
```

### `entry.update`

This event is triggered when an entry is updated.

**Example payload**

```json
{
  "event": "entry.update",
  "createdAt": "2020-01-10T08:58:26.563Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "createdAt": "2020-01-10T08:47:36.264Z",
    "updatedAt": "2020-01-10T08:58:26.210Z",
    "cover": null,
    "images": []
  }
}
```

### `entry.delete`

This event is triggered when an entry is deleted.

**Example payload**

```json
{
  "event": "entry.delete",
  "createdAt": "2020-01-10T08:59:35.796Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "createdAt": "2020-01-10T08:47:36.264Z",
    "updatedAt": "2020-01-10T08:58:26.210Z",
    "cover": null,
    "images": []
  }
}
```

### `entry.publish`

This event is triggered when an entry is published.

**Example payload**

```json
{
  "event": "entry.publish",
  "createdAt": "2020-01-10T08:59:35.796Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "createdAt": "2020-01-10T08:47:36.264Z",
    "updatedAt": "2020-01-10T08:58:26.210Z",
    "publishedAt": "2020-08-29T14:20:12.134Z",
    "cover": null,
    "images": []
  }
}
```

### `entry.unpublish`

This event is triggered when an entry is unpublished.

**Example payload**

```json
{
  "event": "entry.unpublish",
  "createdAt": "2020-01-10T08:59:35.796Z",
  "model": "address",
  "entry": {
    "id": 1,
    "geolocation": {},
    "city": "Paris",
    "postal_code": null,
    "category": null,
    "full_name": "Paris",
    "createdAt": "2020-01-10T08:47:36.264Z",
    "updatedAt": "2020-01-10T08:58:26.210Z",
    "publishedAt": null,
    "cover": null,
    "images": []
  }
}
```

### `media.create`

This event is triggered when you upload a file on entry creation or through the media interface.

**Example payload**

```json
{
  "event": "media.create",
  "createdAt": "2020-01-10T10:58:41.115Z",
  "media": {
    "id": 1,
    "name": "image.png",
    "hash": "353fc98a19e44da9acf61d71b11895f9",
    "sha256": "huGUaFJhmcZRHLcxeQNKblh53vtSUXYaB16WSOe0Bdc",
    "ext": ".png",
    "mime": "image/png",
    "size": 228.19,
    "url": "/uploads/353fc98a19e44da9acf61d71b11895f9.png",
    "provider": "local",
    "provider_metadata": null,
    "createdAt": "2020-01-10T10:58:41.095Z",
    "updatedAt": "2020-01-10T10:58:41.095Z",
    "related": []
  }
}
```

### `media.update`

This event is triggered when you replace a media or update the metadata of a media through the media interface.

**Example payload**

```json
{
  "event": "media.update",
  "createdAt": "2020-01-10T10:58:41.115Z",
  "media": {
    "id": 1,
    "name": "image.png",
    "hash": "353fc98a19e44da9acf61d71b11895f9",
    "sha256": "huGUaFJhmcZRHLcxeQNKblh53vtSUXYaB16WSOe0Bdc",
    "ext": ".png",
    "mime": "image/png",
    "size": 228.19,
    "url": "/uploads/353fc98a19e44da9acf61d71b11895f9.png",
    "provider": "local",
    "provider_metadata": null,
    "createdAt": "2020-01-10T10:58:41.095Z",
    "updatedAt": "2020-01-10T10:58:41.095Z",
    "related": []
  }
}
```

### `media.delete`

This event is triggered only when you delete a media through the media interface.

**Example payload**

```json
{
  "event": "media.delete",
  "createdAt": "2020-01-10T11:02:46.232Z",
  "media": {
    "id": 11,
    "name": "photo.png",
    "hash": "43761478513a4c47a5fd4a03178cfccb",
    "sha256": "HrpDOKLFoSocilA6B0_icA9XXTSPR9heekt2SsHTZZE",
    "ext": ".png",
    "mime": "image/png",
    "size": 4947.76,
    "url": "/uploads/43761478513a4c47a5fd4a03178cfccb.png",
    "provider": "local",
    "provider_metadata": null,
    "createdAt": "2020-01-07T19:34:32.168Z",
    "updatedAt": "2020-01-07T19:34:32.168Z",
    "related": []
  }
}
```

### `review-workflows.updateEntryStage` <EnterpriseBadge/>

This event is only available with the <EnterpriseBadge/> edition of Strapi.<br />The event is triggered when content is moved to a new review stage (see [Review Workflows](/user-docs/settings/review-workflows)).

**Example payload**

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

### `releases.publish` <EnterpriseBadge/><CloudTeamBadge/> {#releases-publish}

The event is triggered when a [release](/user-docs/releases/introduction) is published.

**Example payload**

```json

{
  "event": "releases.publish",
  "createdAt": "2024-02-21T16:45:36.877Z",
  "isPublished": true,
  "release": {
    "id": 2,
    "name": "Fall Winter highlights",
    "releasedAt": "2024-02-21T16:45:36.873Z",
    "scheduledAt": null,
    "timezone": null,
    "createdAt": "2024-02-21T15:16:22.555Z",
    "updatedAt": "2024-02-21T16:45:36.875Z",
    "actions": {
      "count": 1
    }
  }
}
