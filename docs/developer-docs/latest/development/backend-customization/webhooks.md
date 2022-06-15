---
title: Webhooks - Strapi Developer Docs
description: Strapi webhooks are user-defined HTTP callbacks used by an application to notify other applications that an event occurred.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/webhooks.html
---

# Webhooks

Webhook is a construct used by an application to notify other applications that an event occurred. More precisely, webhook is a user-defined HTTP callback. Using a webhook is a good way to tell third party providers to start some processing (CI, build, deployment ...).

The way a webhook works is by delivering information to a receiving application through HTTP requests (typically POST requests).

## User content-type webhooks

To prevent from unintentionally sending any user's information to other applications, Webhooks will not work for the User content-type.
If you need to notify other applications about changes in the Users collection, you can do so by creating [Lifecycle hooks](/developer-docs/latest/development/backend-customization/models.md#lifecycle-hooks) inside the file `./extensions/users-permissions/models/User.js`.

## Available configurations

You can set webhook configurations inside the file `./config/server`.

- `webhooks`
  - `defaultHeaders`: You can set default headers to use for your webhook requests. This option is overwritten by the headers set in the webhook itself.

**Example configuration**

<code-group>
<code-block title=JAVASCRIPT>

```js
//path: ./config/server.js

module.exports = {
  webhooks: {
    defaultHeaders: {
      'Custom-Header': 'my-custom-header',
    },
  },
};
```

</code-block>

<code-block title=TYPESCRIPT>

```js
//path: ./config/server.ts

export default {
  webhooks: {
    defaultHeaders: {
      'Custom-Header': 'my-custom-header',
    },
  },
};
```

</code-block>
</code-group>

## Securing your webhooks

Most of the time, webhooks make requests to public URLs, therefore it is possible that someone may find that URL and send it wrong information.

To prevent this from happening you can send a header with an authentication token. Using the Admin panel you would have to do it for every webhook.
Another way is to define `defaultHeaders` to add to every webhook requests.

You can configure these global headers by updating the file at `./config/server`:

:::: tabs card

::: tab Simple token

<code-group>
<code-block title=JAVASCRIPT>

```js
//path: ./config.server.js

module.exports = {
  webhooks: {
    defaultHeaders: {
      Authorization: 'Bearer my-very-secured-token',
    },
  },
};
```

</code-block>

<code-block title=TYPESCRIPT>

```js
// path: ./config.server.ts

 export default {
  webhooks: {
    defaultHeaders: {
      Authorization: 'Bearer my-very-secured-token',
    },
  },
};
```

</code-block>
</code-group>

:::

::: tab Environment variable

<code-group>
<code-block title=JAVASCRIPT>

```js
//path: ./config.server.js

module.exports = {
  webhooks: {
    defaultHeaders: {
      Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}`,
    },
  },
};
```

</code-block>

<code-block title=TYPESCRIPT>

```js
//path: ./config.server.ts

export default {
  webhooks: {
    defaultHeaders: {
      Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}`,
    },
  },
};
```

</code-block>
</code-group>

::::

If you are developing the webhook handler yourself you can now verify the token by reading the headers.

<!--- ### Usage

To access the webhook configuration panel, go to `Settings` > `Webhooks`.

![Webhooks home](../assets/concepts/webhooks/home.png)

#### Create a webhook

Click on `Add new webhook` and fill in the form.

![create](../assets/concepts/webhooks/create.png)

#### Trigger a webhook

You can test out a webhook with a test event: `trigger-test`. Open the webhook you want to trigger.

![Trigger ](../assets/concepts/webhooks/trigger_start.png)

Click on the `Trigger` button.

![Trigger pending](../assets/concepts/webhooks/trigger.png)

You will see the trigger request appear and get the result.

![Trigger result](../assets/concepts/webhooks/trigger_result.png)

#### Enable or disable a webhook

You can enable or disable a webhook from the list view directly.

![Disable webhook](../assets/concepts/webhooks/disable.png)

#### Update a webhook

You can edit any webhook by clicking on the `pen` icon in the webhook list view.

![Update webhook](../assets/concepts/webhooks/list.png)

#### Delete a webhook

You can delete a webhook by clicking on the `trash` icon.

![Delete webhook](../assets/concepts/webhooks/disable.png) --->

## Available events

By default Strapi webhooks can be triggered by the following events:

| Name              | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `entry.create`    | Triggered when a Content Type entry is created.       |
| `entry.update`    | Triggered when a Content Type entry is updated.       |
| `entry.delete`    | Triggered when a Content Type entry is deleted.       |
| `entry.publish`   | Triggered when a Content Type entry is published.\*   |
| `entry.unpublish` | Triggered when a Content Type entry is unpublished.\* |
| `media.create`    | Triggered when a media is created.                    |
| `media.update`    | Triggered when a media is updated.                    |
| `media.delete`    | Triggered when a media is deleted.                    |

\*only when `draftAndPublish` is enabled on this Content Type.

## Payloads

:::tip NOTE
Private fields and passwords are not sent in the payload.
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
