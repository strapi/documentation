---
title: Proxying Strapi with HAProxy
sidebar_label: HAProxy
displayed_sidebar: cmsSidebar
description: Configure Strapi and HAProxy so that a Strapi application is served through an HAProxy load balancer over HTTPS.
tags:
- deployment
- deployment guide
- guides
- HAProxy
- load balancing
- proxy
- server configuration
---

import ProxyServerUrl from '/docs/snippets/proxy-server-url.md'
import ProxyTrustHeaders from '/docs/snippets/proxy-trust-headers.md'
import StrapiUploadBodyLimits from '/docs/snippets/strapi-upload-body-limits.md'
import MultiInstanceCaveats from '/docs/snippets/multi-instance-strapi-caveats.md'

# Proxying Strapi with HAProxy

<Tldr>
Tell Strapi its public address and that a proxy sits in front of it, using the `server.url` and `server.proxy` options. Then define an HAProxy frontend that terminates TLS and a backend that health checks Strapi on `/_health`.
</Tldr>

Strapi listens on a plain HTTP port and does not terminate TLS itself. A reverse proxy such as HAProxy sits in front of it to handle HTTPS, serve your application on port 443, and forward requests to the Strapi process. HAProxy is a good fit when you also want health checking and load balancing across more than one Strapi instance. This guide covers the Strapi configuration that makes your application proxy-aware, then the HAProxy configuration that routes traffic to it. The Strapi changes belong in your project, so make them before you deploy. The HAProxy changes are made on the machine or in the container that runs HAProxy.

:::prerequisites
- A Strapi 5 application that starts and runs locally (see [deployment guidelines](/cms/deployment#general-guidelines)).
- HAProxy 2.2 or later, running either on the same host as Strapi or as a container that can reach it (see the <ExternalLink to="https://github.com/haproxy/haproxy/blob/master/INSTALL" text="HAProxy installation instructions"/>). The health check syntax in this guide requires 2.2 or later.
- A domain name whose DNS `A` record points at the HAProxy host.
- A TLS certificate and private key, concatenated into a single PEM file.
- Shell access with `sudo` privileges.
:::

## Configure Strapi for a reverse proxy

Strapi needs to know the public address it is served from, and it needs to trust the headers the proxy adds. Without these 2 settings, Strapi builds URLs from `localhost:1337` and reads the proxy's IP address as the client IP.

### Set the public URL

<ProxyServerUrl />

:::caution
Changing `/config/server.js` requires rebuilding the admin panel. Run `yarn build` or `npm run build` after saving the file.
:::

### Trust the proxy headers

HAProxy adds an `X-Forwarded-For` header carrying the original client IP address. Strapi ignores that header until you turn proxy support on.

<ProxyTrustHeaders />

:::warning IP spoofing
Setting `proxy.koa` to `true` without `proxy.maxIpsCount` leaves the count at its default of `0`, which means unlimited. A client can then send `X-Forwarded-For: 203.0.113.9` and, once HAProxy appends the real address, Strapi reads the spoofed value from the front of the chain instead of the real one at the end. Always set `maxIpsCount` to the real number of proxies in front of Strapi.
:::

Strapi reads the header named by `proxy.ipHeader`, which defaults to `X-Forwarded-For`. The `option forwardfor` directive in the configuration below sets that same header, so you do not need to change it.

### Raise the body size limits for uploads

HAProxy does not cap request body size by default, so the Strapi limits are the ones that apply. If you upload files through the Media Library, raise them.

<StrapiUploadBodyLimits />

Large uploads also need room in the HAProxy timeouts, which the configuration below sets to 60 seconds. Raise `timeout client` and `timeout server` if uploads take longer than that to complete.

## Configure HAProxy

With Strapi aware of the proxy, the next step is the HAProxy frontend and backend that carry traffic to it.

### Write the configuration

HAProxy reads its configuration from `/etc/haproxy/haproxy.cfg`. The following defines a frontend that accepts public traffic and a backend that forwards it to Strapi:

```
global
    log /dev/log local0

    # Needed by the `show stat` command used when verifying the setup
    stats socket /var/run/haproxy.sock mode 660 level admin

defaults
    mode http
    log global
    option httplog
    option forwardfor
    timeout connect 5s
    timeout client 60s
    timeout server 60s

frontend strapi_front
    bind :80
    bind :443 ssl crt /etc/haproxy/certs/api.example.com.pem

    # Send every plain HTTP request to HTTPS
    http-request redirect scheme https unless { ssl_fc }

    # Tell Strapi the original request arrived over HTTPS
    http-request set-header X-Forwarded-Proto https if { ssl_fc }

    default_backend strapi_back

backend strapi_back
    option httpchk
    http-check send meth GET uri /_health
    http-check expect status 204

    server strapi1 127.0.0.1:1337 check
```

3 directives in that file do the work Strapi depends on.

`option forwardfor` adds the `X-Forwarded-For` header carrying the client address. Without it, Strapi sees only the HAProxy address.

`http-request set-header X-Forwarded-Proto https if { ssl_fc }` is set by hand, because HAProxy does not add it for you. Strapi uses this header to mark the admin panel refresh-token cookie as `Secure`. Absolute URLs for password resets, login provider callbacks, and media assets are built from the `url` option instead, not from this header.

`bind :443 ssl crt` expects the certificate and private key concatenated into one PEM file. This differs from Nginx, which takes them as 2 separate paths.

Validate the file and reload HAProxy:

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
sudo systemctl reload haproxy
```

The `haproxy -c` command checks the configuration without applying it. Reloading a broken configuration takes the site down, so do not skip it.

### Proxy to Strapi running in a container

When HAProxy and Strapi both run as containers, the `server` line targets the Strapi service by name. Inside the HAProxy container, `127.0.0.1` refers to that container itself, not to Strapi:

```
backend strapi_back
    option httpchk
    http-check send meth GET uri /_health
    http-check expect status 204

    server strapi1 strapi:1337 check
```

Strapi must also bind to `0.0.0.0`. Bound to `localhost`, it accepts connections only from inside its own container and HAProxy cannot reach it. The `host` value set under [Set the public URL](#set-the-public-url) already uses `0.0.0.0`.

The following Compose file puts both services on one network and publishes only HAProxy:

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

  haproxy:
    image: haproxy:2.8-alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./haproxy/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
      - ./haproxy/certs:/etc/haproxy/certs:ro
    depends_on:
      - strapi
    networks:
      - web

networks:
  web:
```

HAProxy resolves `strapi` once at startup. If the Strapi container is recreated with a new address, reload HAProxy, or declare a `resolvers` section so it re-resolves the name on its own.

### Health check Strapi

Strapi exposes a health check route at `/_health` that responds with HTTP `204 No Content`. The backend above uses it to decide whether an instance should receive traffic:

```
backend strapi_back
    option httpchk
    http-check send meth GET uri /_health
    http-check expect status 204

    server strapi1 127.0.0.1:1337 check
```

The `http-check send` line matters. Left to its default, `option httpchk` sends an `OPTIONS` request over HTTP/1.0, so naming the method and URI explicitly is what makes the check hit `/_health` as a `GET`. The `http-check expect status 204` line then requires exactly the status Strapi returns. Without it, HAProxy accepts any 2xx or 3xx response, which would treat an unrelated redirect as healthy.

### Run several Strapi instances

Add a `server` line per instance and a balancing algorithm to spread traffic across them:

```
backend strapi_back
    balance roundrobin
    option httpchk
    http-check send meth GET uri /_health
    http-check expect status 204

    server strapi1 10.0.0.11:1337 check
    server strapi2 10.0.0.12:1337 check
```

Because the instances share one database, a few Strapi behaviors need attention before you scale out.

<MultiInstanceCaveats />

## Verify the proxy setup

Requesting the health check route through the proxy confirms that HAProxy reaches Strapi:

```bash
curl -I https://api.example.com/_health
```

A working setup returns the status line and the header:

```
HTTP/2 204
strapi: You are so French!
```

Then confirm the rest of the chain:

1. Open `https://api.example.com/admin` in a browser and log in. The admin panel loads over HTTPS with no mixed-content warnings.
2. Upload an image in the Media Library. Its URL uses your domain rather than `localhost:1337`.
3. Check the Strapi output for the real client IP address rather than the HAProxy address.
4. Confirm HAProxy considers the backend healthy. The `show stat` command reports each server's state:

```bash
echo "show stat" | sudo socat stdio /var/run/haproxy.sock
```

## <Icon name="bug" /> Troubleshooting

Each of the following symptoms points at one side of the setup. The symptom is in bold, followed by what causes it and what to change:

- **HAProxy returns `503 Service Unavailable`.** No backend server is passing its health check. Confirm the Strapi process is running and that `curl -i http://127.0.0.1:1337/_health` returns `204` from the HAProxy host.

- **The health check fails even though Strapi responds.** The `http-check expect status 204` line requires exactly `204`. If a proxy or middleware in front of the route changes the status, adjust the expected value to match what Strapi actually returns.

- **Uploads fail or time out.** Raise `formidable.maxFileSize` in the Strapi `body` middleware, and raise `timeout client` and `timeout server` in HAProxy so the transfer has time to finish.

- **Strapi logs the HAProxy address as the client IP.** Either `option forwardfor` is missing from the HAProxy configuration, or `proxy.koa` is not set to `true` in Strapi.

- **The admin panel refresh cookie is not marked `Secure`.** The `X-Forwarded-Proto` header is not being set, so Strapi treats the request as plain HTTP. The cookie still reaches the browser over HTTPS, because it defaults to `SameSite=Lax`, but it loses the `Secure` flag that keeps it off plain HTTP. Add the `http-request set-header` line to the frontend.

- **Password reset emails link to `localhost:1337`.** The `url` option is unset or still points at the local address. Set it to the public URL and rebuild the admin panel.

## Next steps

<NextSteps title="">
  <NextSteps.Step
    title="Run Strapi under a process manager"
    description="PM2 restarts Strapi on failure and starts it again after a reboot."
  />
  <NextSteps.Step
    title="Review the server configuration options"
    description="The full list of options available in the server config file."
    link="/cms/configurations/server"
  />
  <NextSteps.Step
    title="Read the deployment guidelines"
    description="Build requirements and environment variables a production deployment needs."
    link="/cms/deployment"
  />
</NextSteps>
