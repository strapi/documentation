---
title: Proxying Strapi with Caddy
sidebar_label: Caddy
displayed_sidebar: cmsSidebar
description: Configure Strapi and Caddy so that a Strapi application is served through a Caddy reverse proxy with automatic HTTPS.
tags:
- Caddy
- deployment
- deployment guide
- guides
- proxy
- server configuration
---

# Proxying Strapi with Caddy

<Tldr>
Point `server.url` at your public domain and set `server.proxy.koa` to `true` so Strapi trusts the forwarded headers. Then write a 3-line Caddyfile, which obtains and renews the TLS certificate for you.
</Tldr>

Strapi listens on a plain HTTP port and does not terminate TLS itself. A reverse proxy such as Caddy sits in front of it to handle HTTPS, serve your application on port 443, and forward requests to the Strapi process. Caddy fills that role by provisioning and renewing TLS certificates for you. This guide covers the Strapi configuration that makes your application proxy-aware, then the Caddyfile that routes traffic to it. The Strapi changes belong in your project, so make them before you deploy. The Caddy changes are made on the machine or in the container that runs Caddy.

:::prerequisites
- A Strapi 5 application that starts and runs locally (see [deployment guidelines](/cms/deployment#general-guidelines)).
- Caddy running either on the same host as Strapi or as a container on the same Docker network (see the <ExternalLink to="https://caddyserver.com/docs/install" text="Caddy installation documentation"/>).
- A domain name whose DNS `A` record points at that server.
- Ports 80 and 443 open to the public internet. Caddy needs port 80 to complete the certificate challenge.
- Shell access with `sudo` privileges.
:::

## Configure Strapi for a reverse proxy

Strapi needs to know the public address it is served from, and it needs to trust the headers the proxy adds. Without these two settings, Strapi builds URLs from `localhost:1337` and reads the proxy's IP address as the client IP.

### Set the public URL

The `url` option in the server configuration defines the public address of your application. Strapi uses it to build absolute URLs for password reset emails, third-party login providers, and media asset paths.

Set it to the address readers use in their browser:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://api.example.com'),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/server.ts"
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://api.example.com'),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>
</Tabs>

:::caution
Changing `/config/server.js` requires rebuilding the admin panel. Run `yarn build` or `npm run build` after saving the file.
:::

### Trust the proxy headers

Caddy adds an `X-Forwarded-For` header carrying the original client IP address. Strapi ignores that header until you enable proxy support through the `proxy` options:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://api.example.com'),
  // highlight-start
  proxy: {
    koa: true,
    maxIpsCount: 1,
  },
  // highlight-end
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/server.ts"
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://api.example.com'),
  // highlight-start
  proxy: {
    koa: true,
    maxIpsCount: 1,
  },
  // highlight-end
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>
</Tabs>

The 2 options play different roles:

| Option | Effect |
|--------|--------|
| `proxy.koa` | When `true`, Strapi trusts the `X-Forwarded-*` headers. Client IP, protocol, and host are read from the proxy instead of the socket. |
| `proxy.maxIpsCount` | Number of addresses to read from the end of the forwarded header chain. Set it to `1` for a single Caddy proxy, or to the number of proxies when requests pass through several. |

:::caution
Setting `proxy.koa` to `true` without `proxy.maxIpsCount` leaves the count at its default of `0`, which means unlimited. Set `maxIpsCount` to the real number of proxies in front of Strapi so that only addresses added by your own infrastructure are read. Caddy discards client-supplied `X-Forwarded-*` values by default, so this matters most when a proxy or CDN sits in front of Caddy.
:::

Strapi reads the header named by `proxy.ipHeader`, which defaults to `X-Forwarded-For`. Caddy sets that same header, so you do not need to change it.

Caddy helps here in a way that not every proxy does. It discards any `X-Forwarded-*` values a client sends and writes its own, so a client cannot inject a fake address into the chain. That protection depends on Caddy being the first proxy to see the request. If a CDN or load balancer sits in front of Caddy, declare it as a trusted proxy so Caddy preserves the addresses that upstream added:

```
{
    servers {
        trusted_proxies static private_ranges
    }
}

api.example.com {
    reverse_proxy 127.0.0.1:1337
}
```

Count every proxy in that chain when you set `proxy.maxIpsCount` on the Strapi side.

### Raise the body size limits for uploads

Caddy does not cap request bodies by default, so the Strapi limits are the ones that apply. If you upload files through the Media Library, raise them.

On the Strapi side, the `body` middleware parses incoming requests. Uploaded files arrive as multipart data, so `formidable.maxFileSize` is the option that caps them. The `formLimit` and `jsonLimit` options cover ordinary form fields and JSON payloads, not the file itself:

```js title="/config/middlewares.js"
module.exports = [
  // ...
  {
    name: 'strapi::body',
    config: {
      formLimit: '100mb', // form body
      jsonLimit: '100mb', // JSON body
      textLimit: '100mb', // text body
      formidable: {
        maxFileSize: 100 * 1024 * 1024, // uploaded file size, in bytes
      },
    },
  },
  // ...
];
```

The Media Library provider enforces a separate `sizeLimit`, which defaults to 1 GB (see [local upload provider configuration](/cms/configurations/media-library-providers/local-upload) and [max file size](/cms/features/media-library#max-file-size) to change it).

## Configure Caddy

With Strapi aware of the proxy, the next step is the Caddyfile that forwards traffic to it.

### Write the Caddyfile

Caddy reads its configuration from a single file, by default at `/etc/caddy/Caddyfile`. A working Strapi proxy takes 3 lines:

```
api.example.com {
    reverse_proxy 127.0.0.1:1337
}
```

Naming a public domain at the top of the block is what triggers automatic HTTPS. Caddy obtains a Let's Encrypt certificate for `api.example.com` on first start, redirects HTTP to HTTPS, and renews the certificate before it expires. No certificate paths appear in the configuration.

The `reverse_proxy` directive sets `X-Forwarded-For`, `X-Forwarded-Proto`, and `X-Forwarded-Host` on its own, which is why the block stays short. Those are the headers the Strapi `proxy` options above rely on. WebSocket connections are also proxied without extra configuration, which the [remote data transfer](/cms/features/data-management/transfer) feature relies on.

:::note
The Caddyfile is the format most deployments use, but it is not the only one. Caddy's native configuration format is JSON, and config adapters translate YAML, TOML, HCL, CUE, and even an existing Nginx configuration into it. Select a format with the `--adapter` flag, as in `caddy run --config caddy.yaml --adapter yaml`. See the <ExternalLink to="https://caddyserver.com/docs/config-adapters" text="Caddy config adapters documentation"/> for the full list. The Strapi options in this guide are the same whichever format you choose.
:::

Reload Caddy to apply the file:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

The `caddy validate` command checks the configuration before you reload. Reloading a broken configuration takes the site down, so do not skip it.

### Set an upload size cap

Caddy accepts request bodies of any size unless you tell it otherwise. Setting an explicit cap in `/etc/caddy/Caddyfile` rejects oversized uploads at the proxy rather than after Strapi has buffered them:

```
api.example.com {
    request_body {
        max_size 100MB
    }

    reverse_proxy 127.0.0.1:1337
}
```

Keep this value at or above the Strapi `formLimit`, otherwise Caddy rejects uploads that Strapi would have accepted.

### Proxy to Strapi running in a container

When Caddy and Strapi both run as containers, `reverse_proxy` targets the Strapi service by name. Inside the Caddy container, `127.0.0.1` refers to that container itself, not to Strapi. The Caddyfile below is mounted into the container by the Compose file that follows:

```
api.example.com {
    request_body {
        max_size 100MB
    }

    reverse_proxy strapi:1337
}
```

Strapi must also bind to `0.0.0.0`. Bound to `localhost`, it accepts connections only from inside its own container and Caddy cannot reach it. The `host` value shown earlier in this guide already uses `0.0.0.0`.

The following Compose file puts both services on one network and publishes only Caddy:

```yml title="./docker-compose.yml"
services:
  strapi:
    image: my-strapi-app
    environment:
      HOST: 0.0.0.0
      PORT: 1337
      PUBLIC_URL: https://api.example.com
    # expose keeps the port reachable inside the network only
    expose:
      - '1337'
    networks:
      - web

  caddy:
    image: caddy:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    depends_on:
      - strapi
    networks:
      - web

volumes:
  caddy_data:

networks:
  web:
```

:::warning
Mount a persistent volume at `/data`, as shown above. Caddy stores issued certificates there. Without it, every container restart requests new certificates, which reaches the <ExternalLink to="https://letsencrypt.org/docs/rate-limits/" text="Let's Encrypt rate limits"/> and leaves the site without a valid certificate until the limit resets.
:::

## Validation

Strapi exposes a health check route at `/_health` that responds with HTTP `204 No Content` and a `strapi` header. Requesting it through the proxy confirms that Caddy reaches Strapi:

```bash
curl -I https://api.example.com/_health
```

A working setup returns the status line and the header:

```
HTTP/2 204
strapi: You are so French!
```

Then confirm the rest of the chain:

1. Open `https://api.example.com/admin` in a browser and log in. The admin panel loads over HTTPS with no certificate warning.
2. Upload an image in the Media Library. Its URL uses your domain rather than `localhost:1337`.
3. Check the Strapi output for the real client IP address rather than `127.0.0.1`. If Strapi runs in the foreground, the addresses appear in that terminal.

## Troubleshooting

**Caddy fails to obtain a certificate.** The certificate challenge needs port 80 reachable from the public internet, and the domain's DNS `A` record must already resolve to this server. Check both, then read the Caddy logs with `journalctl -u caddy --no-pager | tail -50`.

**Caddy returns `502 Bad Gateway`.** Caddy cannot reach Strapi. Confirm the Strapi process is running and listening on the port used in `reverse_proxy`, then check that `host` in `/config/server.js` is not bound to an interface Caddy cannot reach.

**Uploads are rejected as too large.** The request exceeded a size limit. Raise `max_size` in the Caddyfile `request_body` block and `formidable.maxFileSize` in the Strapi `body` middleware, and raise the provider `sizeLimit` if the file is larger than 1 GB.

**Strapi logs `127.0.0.1` as the client IP.** `proxy.koa` is not set to `true`, so Strapi reads the socket address instead of the forwarded header.

**Password reset emails link to `localhost:1337`.** The `url` option is unset or still points at the local address. Set it to the public URL and rebuild the admin panel.

## Next steps

- Run Strapi under a process manager such as PM2, so it restarts on failure and survives a reboot.
- Review the full list of [server configuration options](/cms/configurations/server).
- Read the [deployment guidelines](/cms/deployment) for build and environment variable requirements.
