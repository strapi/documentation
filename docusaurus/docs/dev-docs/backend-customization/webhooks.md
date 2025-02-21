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

# Webhooks

Webhook is a construct used by an application to notify other applications that an event occurred. More precisely, a webhook is a user-defined HTTP callback. Using a webhook is a good way to tell third-party providers to start some processing (CI, build, deployment, etc.).

The way a webhook works is by delivering information to a receiving application through HTTP requests (typically POST requests).

## User Content-Type Webhooks

To prevent unintentionally sending any user's information to other applications, webhooks will not work for the User content-type. If you need to notify other applications about changes in the Users collection, you can do so by creating [Lifecycle hooks](/dev-docs/backend-customization/models#lifecycle-hooks) using the `./src/index.js` example.

## Available Configurations

You can set webhook configurations inside the file `./config/server`.

- `webhooks`
  - `defaultHeaders`: Set default headers for webhook requests. This option is overridden by headers set in the webhook itself.

### Example Configuration

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

```ts title="./config/server.ts"
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

## Securing Your Webhooks

Since webhooks make requests to public URLs, unauthorized parties may discover the URL and send incorrect information. To prevent this, use authentication tokens in the request headers.

### Example Security Configuration

<Tabs>

<TabItem value="simple-token" label="Simple Token">

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

```ts title="./config/server.ts"
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

<TabItem value="environment-variable" label="Environment Variable">

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

```ts title="./config/server.ts"
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

If you develop the webhook handler yourself, you can verify the token by reading the headers.

## Testing Webhooks

To test webhooks, you can use tools like:

- **[Beeceptor](https://beeceptor.com/)** - A free online tool to inspect and debug webhook requests.
- **[ngrok](https://ngrok.com/)** - Exposes your local development server to the internet, allowing you to test webhooks from external services.

## Available Events

Strapi webhooks can be triggered by the following events:

| Event Name | Description |
|------------|-------------|
| `entry.create` | Triggered when a Content Type entry is created. |
| `entry.update` | Triggered when a Content Type entry is updated. |
| `entry.delete` | Triggered when a Content Type entry is deleted. |
| `entry.publish` | Triggered when a Content Type entry is published. |
| `entry.unpublish` | Triggered when a Content Type entry is unpublished. |
| `media.create` | Triggered when media is created. |
| `media.update` | Triggered when media is updated. |
| `media.delete` | Triggered when media is deleted. |
| `review-workflows.updateEntryStage` | Triggered when content moves between review stages. (Enterprise only) |
| `releases.publish` | Triggered when a Release is published. |

## Webhook Payloads

### Headers

When a payload is delivered to your webhook's URL, it contains specific headers:

| Header | Description |
|--------|-------------|
| `X-Strapi-Event` | Name of the event type that was triggered. |

### Example Payloads

#### `entry.create`

```json
{
  "event": "entry.create",
  "createdAt": "2020-01-10T08:47:36.649Z",
  "model": "address",
  "entry": {
    "id": 1,
    "city": "Paris",
    "createdAt": "2020-01-10T08:47:36.264Z",
    "updatedAt": "2020-01-10T08:47:36.264Z"
  }
}
```

#### `entry.update`

```json
{
  "event": "entry.update",
  "createdAt": "2020-01-10T08:58:26.563Z",
  "model": "address",
  "entry": {
    "id": 1,
    "city": "Paris",
    "updatedAt": "2020-01-10T08:58:26.210Z"
  }
}
```

#### `entry.delete`

```json
{
  "event": "entry.delete",
  "createdAt": "2020-01-10T08:59:35.796Z",
  "model": "address",
  "entry": {
    "id": 1,
    "city": "Paris",
    "updatedAt": "2020-01-10T08:58:26.210Z"
  }
}
```
