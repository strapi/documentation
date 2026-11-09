---
title: Webhooks
displayed_sidebar: cmsSidebar
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

<Tldr>
Webhooks let Strapi notify external systems when content changes, while omitting the Users type for privacy. Configuration in `config/server` sets default headers and endpoints to trigger third-party processing. Optional destination checks, also set in `config/server`, can restrict where webhooks are sent.
</Tldr>

Webhook is a construct used by an application to notify other applications that an event occurred. More precisely, webhook is a user-defined HTTP callback. Using a webhook is a good way to tell third-party providers to start some processing (CI, build, deployment ...).

The way a webhook works is by delivering information to a receiving application through HTTP requests (typically POST requests).

## User content-type webhooks

To prevent from unintentionally sending any user's information to other applications, Webhooks will not work for the User content-type.
If you need to notify other applications about changes in the Users collection, you can do so by creating [Lifecycle hooks](/cms/backend-customization/models#lifecycle-hooks) using the `./src/index.js` example.

## Available configurations

You can set webhook configurations inside the file `./config/server`.

- `webhooks`
  - `defaultHeaders`: You can set default headers to use for your webhook requests. This option is overwritten by the headers set in the webhook itself.
  - `destinationChecks`: Optional checks on the addresses webhooks are sent to. See [Webhook destinations](#webhook-destinations).

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

## Webhook destinations
<VersionBadge version="5.62.0+" noTooltip />

A webhook can point at any URL the Strapi server can reach. This includes `localhost` and services on a private network, such as a Kubernetes service or a container on the same Docker network.

Anyone with the webhook permissions in the admin panel decides where webhooks are sent. Give those permissions only to administrators you trust with outbound requests from the server. To limit what webhooks can reach, use egress controls on the network Strapi runs in.

:::caution Change in Strapi 5.62.0
Before Strapi 5.62.0, Strapi rejected webhook URLs that pointed to a local or private network address when a webhook was saved and `NODE_ENV` was `production`. These URLs are now accepted in every environment. To reject them again when a webhook is saved, set the `blockLoopback`, `blockPrivateNetworks` and `blockLinkLocal` [destination checks](#destination-checks) to `true`. These checks also cover some ranges that the previous check did not.
:::

### Destination checks

Destination checks are an optional restriction on the URLs that webhooks can use. These checks are all off by default. Turn them on in the `webhooks.destinationChecks` object of `/config/server`:

| Option | Description | Type | Required | Default |
|--------|-------------|------|----------|---------|
| `blockLoopback` | Blocks loopback and unspecified addresses, and the addresses of the server's own network interfaces. | Boolean | No | `false` |
| `blockPrivateNetworks` | Blocks private and other non-public network ranges. | Boolean | No | `false` |
| `blockLinkLocal` | Blocks link-local addresses and some cloud metadata addresses. | Boolean | No | `false` |
| `checkOnSend` | Also applies the enabled checks when a webhook is sent, to the address Strapi connects to. | Boolean | No | `false` |
| `redirects` | How redirects are handled when a webhook is sent:<ul><li>`'follow'` follows them.</li><li>`'check'` follows up to 5 redirects and applies the enabled checks to each target before following it. A sixth redirect fails the webhook.</li><li>`'none'` doesn't follow them. The redirect response is the result of the webhook.</li></ul> | String | No | `'follow'` |

`checkOnSend` and `redirects: 'check'` apply the blocks that `blockLoopback`, `blockPrivateNetworks` and `blockLinkLocal` turn on. Without one of these three options set to `true`, they have no effect, and Strapi logs a warning at startup. Strapi doesn't start if `destinationChecks` contains an unknown option or an invalid value.

The following example turns on every check:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/config/server.js"
module.exports = {
  webhooks: {
    destinationChecks: {
      blockLoopback: true,
      blockPrivateNetworks: true,
      blockLinkLocal: true,
      checkOnSend: true,
      redirects: 'check',
    },
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="/config/server.ts"
export default {
  webhooks: {
    destinationChecks: {
      blockLoopback: true,
      blockPrivateNetworks: true,
      blockLinkLocal: true,
      checkOnSend: true,
      redirects: 'check',
    },
  },
};
```

</TabItem>
</Tabs>

To block only link-local addresses and the cloud metadata addresses listed below, and leave internal services reachable, set `blockLinkLocal` and `checkOnSend` to `true`.

#### Blocked addresses

The following table lists the ranges that each option blocks:

| Option | IPv4 | IPv6 |
|--------|------|------|
| `blockLoopback` | `127.0.0.0/8`, `0.0.0.0/8`, and the server's own addresses | `::1`, `::`, and the server's own addresses |
| `blockPrivateNetworks` | `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `100.64.0.0/10`, `192.0.0.0/24`, `198.18.0.0/15`, `240.0.0.0/4` | `fc00::/7`, `fec0::/10`, `64:ff9b:1::/48` |
| `blockLinkLocal` | `169.254.0.0/16`, `168.63.129.16` (Azure), `100.100.100.200` (Alibaba Cloud), `192.0.0.192` (Oracle Cloud Classic) | `fe80::/10`, `fd00:ec2::254` (AWS) |

Strapi checks only the ranges listed in this table. An address can be in more than one row. For example, `100.100.100.200` and `fd00:ec2::254` are blocked by `blockLinkLocal` and by `blockPrivateNetworks`.

IPv4-mapped (`::ffff:10.0.0.5`), IPv4-translated, IPv4-compatible, NAT64 (`64:ff9b::/96`) and 6to4 (`2002::/16`) IPv6 addresses are checked as the IPv4 address they carry.

#### When the checks apply

- Strapi checks a webhook URL when the webhook is created, or when its URL changes, from the admin panel or the admin API. Strapi resolves the URL's hostname and rejects the URL if any of its addresses is blocked. The admin panel explains why the URL was rejected, and the error returned by the API names the option that blocks the address.
- A hostname that doesn't resolve from the server is accepted, since there is no address to check.
- A webhook saved before a check was turned on keeps its URL. It can still be edited or disabled, and it is still sent unless `checkOnSend` is on.
- With `checkOnSend`, the checks also apply when the webhook is sent, to the address Strapi connects to. A DNS record that changed since the webhook was saved is checked too. A blocked webhook isn't sent, and Strapi logs a warning that names the option.
- Webhooks created in code with `strapi.get('webhookStore')` aren't checked when they are saved. `checkOnSend` still applies to them.

:::note Using a proxy
When `server.proxy.fetch` or `server.proxy.global` is set, or when Node's own proxy support is on (`NODE_USE_ENV_PROXY=1` with `HTTP_PROXY` or `HTTPS_PROXY`), the proxy resolves hostnames and opens the connections. With `checkOnSend`, Strapi checks the addresses it resolves for the hostname before it hands each request to the proxy, redirects included. The proxy may connect to a different address. In this setup, the proxy controls where webhooks can go.
:::

## Webhooks security

Most of the time, webhooks make requests to public URLs, therefore it is possible that someone may find that URL and send it wrong information.

To prevent this from happening you can send a header with an authentication token. Using the Admin panel you would have to do it for every webhook.


Another way is to define `defaultHeaders` to add to every webhook request.

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

```js title="./config/server.ts"
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

### Verifying signatures

In addition to auth headers, it's recommended to sign webhook payloads and verify signatures server‑side to prevent tampering and replay attacks. To do so, you can use the following guidelines:

- Generate a shared secret and store it in environment variables
- Have the sender compute an HMAC (e.g., SHA‑256) over the raw request body plus a timestamp
- Send the signature (and timestamp) in headers (e.g., `X‑Webhook‑Signature`, `X‑Webhook‑Timestamp`)
- On receipt, recompute the HMAC and compare using a constant‑time check
- Reject if the signature is invalid or the timestamp is too old to mitigate replay

<details>
<summary>Example: Verify HMAC signatures (Node.js)</summary>

Here is a minimal Node.js middleware example (pseudo‑code) showing <ExternalLink text="HMAC" to="https://nodejs.org/api/crypto.html#class-hmac" /> verification:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/src/middlewares/verify-webhook.js"
const crypto = require("crypto");

module.exports = (config, { strapi }) => {
  const secret = process.env.WEBHOOK_SECRET;

  return async (ctx, next) => {
    const signature = ctx.get("X-Webhook-Signature");
    const timestamp = ctx.get("X-Webhook-Timestamp");
    if (!signature || !timestamp) return ctx.unauthorized("Missing signature");

    // Compute HMAC over raw body + timestamp
    const raw = ctx.request.rawBody || (ctx.request.body and JSON.stringify(ctx.request.body)) || "";
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(timestamp + "." + raw);
    const expected = "sha256=" + hmac.digest("hex");

    // Constant-time compare + basic replay protection
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    const skew = Math.abs(Date.now() - Number(timestamp));
    if (!ok or skew > 5 * 60 * 1000) {
      return ctx.unauthorized("Invalid or expired signature");
    }

    await next();
  };
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/src/middlewares/verify-webhook.ts"
import crypto from "node:crypto"

export default (config: unknown, { strapi }: any) => {
  const secret = process.env.WEBHOOK_SECRET as string;

  return async (ctx: any, next: any) => {
    const signature = ctx.get("X-Webhook-Signature") as string;
    const timestamp = ctx.get("X-Webhook-Timestamp") as string;
    if (!signature || !timestamp) return ctx.unauthorized("Missing signature");

    // Compute HMAC over raw body + timestamp
    const raw: string = ctx.request.rawBody || (ctx.request.body && JSON.stringify(ctx.request.body)) || "";
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${timestamp}.${raw}`);
    const expected = `sha256=${hmac.digest("hex")}`;

    // Constant-time compare + basic replay protection
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    const skew = Math.abs(Date.now() - Number(timestamp));
    if (!ok || skew > 5 * 60 * 1000) {
      return ctx.unauthorized("Invalid or expired signature");
    }

    await next();
  };
};
```

</TabItem>
</Tabs>

Here are a few additional external examples:
- <ExternalLink to="https://docs.github.com/webhooks/using-webhooks/validating-webhook-deliveries" text="GitHub — Validating webhook deliveries" />
- <ExternalLink to="https://stripe.com/docs/webhooks/signatures" text="Stripe — Verify webhook signatures" />
<br />
</details>

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
| [`entry.draft-discard`](#entry-draft-discard) | Triggered when the draft version of a Content Type entry is discarded.\*<br />This event is not listed in the **Webhooks** form of the admin panel, so subscribing to it requires creating the webhook programmatically. |
| [`media.create`](#mediacreate)    | Triggered when a media is created.                    |
| [`media.update`](#mediaupdate)    | Triggered when a media is updated.                    |
| [`media.delete`](#mediadelete)    | Triggered when a media is deleted.                    |
| [`review-workflows.updateEntryStage`](#review-workflowsupdateentrystage) | Triggered when content is moved between review stages (see [review workflows](/cms/features/review-workflows#configuration)).<br />This event is only available with the <EnterpriseBadge /> edition of Strapi. |
| [`releases.publish`](#releases-publish) | Triggered when a Release is published (see [Releases](/cms/features/releases)).<br />This event is only available with the <GrowthBadge /> or <EnterpriseBadge /> plan of Strapi CMS. |

\*only when `draftAndPublish` is enabled on this Content Type.

### Entry events per content type
<VersionBadge version="5.60.0+" noTooltip />

The entry events above are triggered for every content type by default. In the **Settings > Webhooks** form, the events table also lists each collection type and single type below the **Entry** row, so an event can be selected for one content type only, for example `Create` on articles and `Publish` on pages in the same webhook.

An event checked on the **Entry** row still applies to every content type: it is displayed as checked and locked on each content type row and can't be unchecked from there. An event can't be selected for `entry.publish` or `entry.unpublish` on a content type that doesn't have [Draft & Publish](/cms/features/draft-and-publish) enabled, since those events never occur for it.

This selection is saved in the webhook's `contentTypeEvents` attribute, which maps a content type UID to the entry events selected for it as in the following example:

```json
{
  "api::article.article": ["entry.create"]
}
```

Only events not already selected on the **Entry** row are kept in `contentTypeEvents`. Changes to `contentTypeEvents` are recorded in the [Audit Logs](/cms/features/audit-logs) along with the webhook's other fields.

## Payloads

:::info
Private fields are not sent in the payload.
:::

### Entry payload content

Inside `entry`, `documentId` identifies the document while `id` identifies the version the event is about. A draft and its published version share the same `documentId` and have different `id` values, and discarding a draft creates a new version, so the `id` changes again.

For all entry events except `entry.delete` and `entry.unpublish`, the entry is read again before the payload is sent, so it contains the whole entry, with all its relations, media, components, and dynamic zones populated. Repeatable components and dynamic zone items are sent in their stored order, which is the order defined in the Content Manager, and each of them carries its own `id`.

This population is not configurable: there is no option to choose which fields are populated, nor to change how they are sorted. The `webhooks.populateRelations` option of Strapi 4 was [removed in Strapi 5](/cms/migration/v4-to-v5/breaking-changes/remove-webhook-populate-relations).

The `entry.delete` and `entry.unpublish` events are not read again: their `entry` object is the one the deleting or unpublishing request itself returned. Deleting and unpublishing from the admin panel show what this means in practice: the `entry.unpublish` payload carries the fully populated entry, while the `entry.delete` payload carries only the fields of the entry itself.

:::note
A single action in the admin panel can trigger more than one event. Publishing an entry saves its draft first, so `entry.update` is sent just before `entry.publish`.
:::

:::tip
If you need a payload with a different content or structure, send the request yourself from a [lifecycle hook](/cms/backend-customization/models#lifecycle-hooks).
:::

### Media payload content

Media events send a different envelope from entry events: `event`, `createdAt` and `media`, with no `model` and no `uid`. The `media` object is the file entry itself, including the `formats` generated for an image, and it does not carry the entries the file is attached to.

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
  "createdAt": "2026-09-09T08:49:26.158Z",
  "model": "address",
  "uid": "api::address.address",
  "entry": {
    "id": 1,
    "documentId": "w7vfs319acmaxnurjk5vaaza",
    "city": "Paris",
    "postalCode": "75001",
    "createdAt": "2026-09-09T08:49:26.150Z",
    "updatedAt": "2026-09-09T08:49:26.150Z",
    "publishedAt": null,
    "openingHours": [
      {
        "id": 1,
        "day": "monday",
        "from": "09:00",
        "to": "18:00"
      },
      {
        "id": 2,
        "day": "tuesday",
        "from": "10:00",
        "to": "19:00"
      }
    ],
    "blocks": [
      {
        "id": 1,
        "body": "Ring the bell twice.",
        "__component": "address.note"
      },
      {
        "id": 1,
        "email": "paris@example.com",
        "phone": "0102030405",
        "__component": "address.contact"
      }
    ]
  }
}
```

### `entry.update`

This event is triggered when an entry is updated.

**Example payload**

```json
{
  "event": "entry.update",
  "createdAt": "2026-09-09T08:49:27.382Z",
  "model": "address",
  "uid": "api::address.address",
  "entry": {
    "id": 1,
    "documentId": "w7vfs319acmaxnurjk5vaaza",
    "city": "Paris 1er",
    "postalCode": "75001",
    "createdAt": "2026-09-09T08:49:26.150Z",
    "updatedAt": "2026-09-09T08:49:27.377Z",
    "publishedAt": null,
    "openingHours": [
      {
        "id": 1,
        "day": "monday",
        "from": "09:00",
        "to": "18:00"
      },
      {
        "id": 2,
        "day": "tuesday",
        "from": "10:00",
        "to": "19:00"
      }
    ],
    "blocks": [
      {
        "id": 1,
        "body": "Ring the bell twice.",
        "__component": "address.note"
      },
      {
        "id": 1,
        "email": "paris@example.com",
        "phone": "0102030405",
        "__component": "address.contact"
      }
    ]
  }
}
```

### `entry.delete`

This event is triggered when an entry is deleted.

**Example payload**

```json
{
  "event": "entry.delete",
  "createdAt": "2026-09-09T08:49:33.501Z",
  "model": "address",
  "uid": "api::address.address",
  "entry": {
    "id": 3,
    "documentId": "w7vfs319acmaxnurjk5vaaza",
    "city": "Paris 1er",
    "postalCode": "75001",
    "createdAt": "2026-09-09T08:49:26.150Z",
    "updatedAt": "2026-09-09T08:49:28.603Z",
    "publishedAt": null
  }
}
```

### `entry.publish`

This event is triggered when an entry is published.

**Example payload**

```json
{
  "event": "entry.publish",
  "createdAt": "2026-09-09T08:49:28.619Z",
  "model": "address",
  "uid": "api::address.address",
  "entry": {
    "id": 2,
    "documentId": "w7vfs319acmaxnurjk5vaaza",
    "city": "Paris 1er",
    "postalCode": "75001",
    "createdAt": "2026-09-09T08:49:26.150Z",
    "updatedAt": "2026-09-09T08:49:28.603Z",
    "publishedAt": "2026-09-09T08:49:28.607Z",
    "openingHours": [
      {
        "id": 3,
        "day": "monday",
        "from": "09:00",
        "to": "18:00"
      },
      {
        "id": 4,
        "day": "tuesday",
        "from": "10:00",
        "to": "19:00"
      }
    ],
    "blocks": [
      {
        "id": 2,
        "body": "Ring the bell twice.",
        "__component": "address.note"
      },
      {
        "id": 2,
        "email": "paris@example.com",
        "phone": "0102030405",
        "__component": "address.contact"
      }
    ]
  }
}
```

### `entry.unpublish`

This event is triggered when an entry is unpublished.

**Example payload**

```json
{
  "event": "entry.unpublish",
  "createdAt": "2026-09-09T08:49:32.287Z",
  "model": "address",
  "uid": "api::address.address",
  "entry": {
    "id": 2,
    "documentId": "w7vfs319acmaxnurjk5vaaza",
    "city": "Paris 1er",
    "postalCode": "75001",
    "createdAt": "2026-09-09T08:49:26.150Z",
    "updatedAt": "2026-09-09T08:49:28.603Z",
    "publishedAt": "2026-09-09T08:49:28.607Z",
    "openingHours": [
      {
        "id": 3,
        "day": "monday",
        "from": "09:00",
        "to": "18:00"
      },
      {
        "id": 4,
        "day": "tuesday",
        "from": "10:00",
        "to": "19:00"
      }
    ],
    "blocks": [
      {
        "id": 2,
        "body": "Ring the bell twice.",
        "__component": "address.note"
      },
      {
        "id": 2,
        "email": "paris@example.com",
        "phone": "0102030405",
        "__component": "address.contact"
      }
    ]
  }
}
```

### `entry.draft-discard`  {#entry-draft-discard}

This event is triggered when the draft version of an entry is discarded, which restores the draft from the published version.

**Example payload**

```json
{
  "event": "entry.draft-discard",
  "createdAt": "2026-09-09T08:49:31.065Z",
  "model": "address",
  "uid": "api::address.address",
  "entry": {
    "id": 3,
    "documentId": "w7vfs319acmaxnurjk5vaaza",
    "city": "Paris 1er",
    "postalCode": "75001",
    "createdAt": "2026-09-09T08:49:26.150Z",
    "updatedAt": "2026-09-09T08:49:28.603Z",
    "publishedAt": null,
    "openingHours": [
      {
        "id": 5,
        "day": "monday",
        "from": "09:00",
        "to": "18:00"
      },
      {
        "id": 6,
        "day": "tuesday",
        "from": "10:00",
        "to": "19:00"
      }
    ],
    "blocks": [
      {
        "id": 3,
        "body": "Ring the bell twice.",
        "__component": "address.note"
      },
      {
        "id": 3,
        "email": "paris@example.com",
        "phone": "0102030405",
        "__component": "address.contact"
      }
    ]
  }
}
```

### `media.create`

This event is triggered when you upload a file on entry creation or through the media interface.

**Example payload**

```json
{
  "event": "media.create",
  "createdAt": "2026-09-09T09:03:55.238Z",
  "media": {
    "id": 1,
    "documentId": "af1tfhdljtcm8076utj20ury",
    "name": "photo.png",
    "alternativeText": null,
    "caption": null,
    "focalPoint": null,
    "width": 3024,
    "height": 1646,
    "formats": {
      "thumbnail": {
        "name": "thumbnail_photo.png",
        "hash": "thumbnail_photo_27421e3364",
        "ext": ".png",
        "mime": "image/png",
        "path": null,
        "width": 245,
        "height": 133,
        "size": 35.61,
        "sizeInBytes": 35614,
        "url": "/uploads/thumbnail_photo_27421e3364.png"
      },
      "small": {
        "name": "small_photo.png",
        "hash": "small_photo_27421e3364",
        "ext": ".png",
        "mime": "image/png",
        "path": null,
        "width": 500,
        "height": 272,
        "size": 117.45,
        "sizeInBytes": 117447,
        "url": "/uploads/small_photo_27421e3364.png"
      },
      "medium": {
        "name": "medium_photo.png",
        "hash": "medium_photo_27421e3364",
        "ext": ".png",
        "mime": "image/png",
        "path": null,
        "width": 750,
        "height": 408,
        "size": 233.53,
        "sizeInBytes": 233529,
        "url": "/uploads/medium_photo_27421e3364.png"
      },
      "large": {
        "name": "large_photo.png",
        "hash": "large_photo_27421e3364",
        "ext": ".png",
        "mime": "image/png",
        "path": null,
        "width": 1000,
        "height": 544,
        "size": 387.81,
        "sizeInBytes": 387809,
        "url": "/uploads/large_photo_27421e3364.png"
      }
    },
    "hash": "photo_27421e3364",
    "ext": ".png",
    "mime": "image/png",
    "size": 497.97,
    "url": "/uploads/photo_27421e3364.png",
    "previewUrl": null,
    "provider": "local",
    "provider_metadata": null,
    "createdAt": "2026-09-09T09:03:55.235Z",
    "updatedAt": "2026-09-09T09:03:55.235Z",
    "publishedAt": "2026-09-09T09:03:55.235Z"
  }
}
```

### `media.update`

This event is triggered when you replace a media or update the metadata of a media through the media interface.

**Example payload**

```json
{
  "event": "media.update",
  "createdAt": "2026-09-09T09:03:57.075Z",
  "media": {
    "id": 1,
    "documentId": "af1tfhdljtcm8076utj20ury",
    "name": "Overview of the Media Library",
    "alternativeText": "The Media Library overview, in dark mode",
    "caption": "Media Library",
    "focalPoint": null,
    "width": 3024,
    "height": 1646,
    "formats": {
      // the four generated formats, as in the media.create payload above
    },
    "hash": "photo_27421e3364",
    "ext": ".png",
    "mime": "image/png",
    "size": 497.97,
    "url": "/uploads/photo_27421e3364.png",
    "previewUrl": null,
    "provider": "local",
    "provider_metadata": null,
    "createdAt": "2026-09-09T09:03:55.235Z",
    "updatedAt": "2026-09-09T09:03:57.073Z",
    "publishedAt": "2026-09-09T09:03:55.235Z"
  }
}
```

### `media.delete`

This event is triggered only when you delete a media through the media interface.

**Example payload**

```json
{
  "event": "media.delete",
  "createdAt": "2026-09-09T09:03:58.588Z",
  "media": {
    "id": 1,
    "documentId": "af1tfhdljtcm8076utj20ury",
    "name": "Overview of the Media Library",
    "alternativeText": "The Media Library overview, in dark mode",
    "caption": "Media Library",
    "focalPoint": null,
    "width": 3024,
    "height": 1646,
    "formats": {
      // the four generated formats, as in the media.create payload above
    },
    "hash": "photo_27421e3364",
    "ext": ".png",
    "mime": "image/png",
    "size": 497.97,
    "url": "/uploads/photo_27421e3364.png",
    "previewUrl": null,
    "provider": "local",
    "provider_metadata": null,
    "createdAt": "2026-09-09T09:03:55.235Z",
    "updatedAt": "2026-09-09T09:03:57.073Z",
    "publishedAt": "2026-09-09T09:03:55.235Z"
  }
}
```

### `review-workflows.updateEntryStage`
<EnterpriseBadge/>

This event is only available with the <EnterpriseBadge/> plan of Strapi.<br />The event is triggered when content is moved to a new review stage (see [Review Workflows](/cms/features/review-workflows#configuration)).

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

### `releases.publish`  {#releases-publish}
<GrowthBadge/><EnterpriseBadge/>

The event is triggered when a [release](/cms/features/releases) is published.

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
```

## Best practices for webhook handling

- Validate incoming requests by checking headers and payload signatures.
- Implement retries for failed webhook requests to handle transient errors.
- Log webhook events for debugging and monitoring.
- Use secure, HTTPS endpoints for receiving webhooks.
- Set up rate limiting to avoid being overwhelmed by multiple webhook requests.

:::tip
If you want to learn more about how to use webhooks with Next.js, please have a look at the [dedicated blog article](https://strapi.io/blog/how-to-create-an-ssg-static-site-generation-application-with-strapi-webhooks-and-nextjs).
:::
