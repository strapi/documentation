---
title: Proxying Strapi with Traefik
sidebar_label: Traefik
displayed_sidebar: cmsSidebar
description: Configure Strapi and Traefik so that a containerized Strapi application is served through Traefik over HTTPS.
pagination_prev: cms/deployment
pagination_next: cms/deployment/guides
tags:
- containers
- deployment
- deployment guide
- Docker
- guides
- proxy
- server configuration
- Traefik
---

import ProxyServerUrl from '/docs/snippets/proxy-server-url.md'
import ProxyTrustHeaders from '/docs/snippets/proxy-trust-headers.md'
import StrapiUploadBodyLimits from '/docs/snippets/strapi-upload-body-limits.md'

# Proxying Strapi with Traefik

<Tldr>
Tell Strapi its public address and that a proxy sits in front of it, using the `server.url` and `server.proxy` options. Then add Traefik labels to the Strapi container so Traefik discovers it, routes to port 1337, and requests a certificate for your domain.
</Tldr>

Strapi listens on a plain HTTP port and does not terminate TLS itself. A reverse proxy such as Traefik sits in front of it to handle HTTPS, serve your application on port 443, and forward requests to the Strapi process. Traefik differs from the other proxies in this section: instead of a configuration file describing your routes, it watches the Docker API and reads routing rules from labels on each container. That suits deployments where containers come and go. This guide covers the Strapi configuration that makes your application proxy-aware, then the Traefik setup that routes traffic to it.

:::prerequisites
- A Strapi 5 application that starts and runs locally (see [deployment guidelines](/cms/deployment#general-guidelines)).
- Strapi packaged as a container image (see [Docker installation](/cms/installation/docker)).
- <ExternalLink to="https://docs.docker.com/compose/" text="Docker Compose"/> installed on the host.
- A domain name whose DNS `A` record points at that host.
- Ports 80 and 443 open to the public internet. Traefik needs one of them to complete the certificate challenge.
:::

## Configure Strapi for a reverse proxy

Strapi needs to know the public address it is served from, and it needs to trust the headers the proxy adds. Without these 2 settings, Strapi builds URLs from `localhost:1337` and reads the proxy's IP address as the client IP.

### Set the public URL

<ProxyServerUrl />

The `host` value must stay `0.0.0.0`. Bound to `localhost`, Strapi accepts connections only from inside its own container and Traefik cannot reach it.

:::caution
Changing `/config/server.js` requires rebuilding the admin panel. Run `yarn build` or `npm run build` after saving the file, then rebuild your image.
:::

### Trust the proxy headers

Traefik adds an `X-Forwarded-For` header carrying the original client IP address. Strapi ignores that header until you turn proxy support on.

<ProxyTrustHeaders />

:::warning IP spoofing
Setting `proxy.koa` to `true` without `proxy.maxIpsCount` leaves the count at its default of `0`, which means unlimited. Set `maxIpsCount` to the real number of proxies in front of Strapi so that only addresses added by your own infrastructure are read.
:::

Strapi reads the header named by `proxy.ipHeader`, which defaults to `X-Forwarded-For`, and Traefik sets that same header. Traefik also sets `X-Forwarded-Proto`, which Strapi uses to mark the admin panel refresh-token cookie as `Secure`. Absolute URLs for password resets, login provider callbacks, and media assets are built from the `url` option instead, not from that header.

Traefik helps here in a way that not every proxy does. By default it sanitizes the `X-Forwarded-*` headers a client sends and writes its own, so a client cannot inject a fake address into the chain. That protection depends on Traefik being the first proxy to see the request. If a CDN or load balancer sits in front of Traefik, list its addresses in the entry point's `forwardedHeaders.trustedIPs` so Traefik preserves what that upstream added, then count every proxy in the chain when you set `proxy.maxIpsCount`:

```yml title="./traefik/traefik.yml"
entryPoints:
  websecure:
    address: ':443'
    forwardedHeaders:
      trustedIPs:
        - '203.0.113.0/24'
```

### Raise the body size limits for uploads

Traefik streams request bodies through to the backend without a size cap unless you add one, so the Strapi limits are the ones that apply by default. If you upload files through the Media Library, raise them.

<StrapiUploadBodyLimits />

## Configure Traefik

Traefik reads 2 kinds of configuration. Static configuration, which defines entry points and certificate resolvers, is set once when Traefik starts. Dynamic configuration, which defines routes, comes from container labels and is picked up as containers appear.

### Write the static configuration

The following file defines an entry point on each public port, redirects HTTP to HTTPS, and registers a Let's Encrypt certificate resolver:

```yml title="./traefik/traefik.yml"
entryPoints:
  web:
    address: ':80'
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true
  websecure:
    address: ':443'

providers:
  docker:
    # Only route to containers that opt in with traefik.enable=true
    exposedByDefault: false

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /acme/acme.json
      tlsChallenge: {}
```

Setting `exposedByDefault` to `false` matters. Left at its default, Traefik publishes every container it can see, including ones you never meant to expose.

### Route traffic to Strapi with labels

With the static configuration in place, the Strapi container declares its own route through labels:

```yml title="./docker-compose.yml"
services:
  traefik:
    image: traefik:v3.7
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_acme:/acme
    networks:
      - web

  strapi:
    image: my-strapi-app
    environment:
      HOST: 0.0.0.0
      PORT: 1337
      PUBLIC_URL: https://api.example.com
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.strapi.rule=Host(`api.example.com`)'
      - 'traefik.http.routers.strapi.entrypoints=websecure'
      - 'traefik.http.routers.strapi.tls.certresolver=letsencrypt'
      - 'traefik.http.services.strapi.loadbalancer.server.port=1337'
    networks:
      - web

volumes:
  traefik_acme:

networks:
  web:
```

The `loadbalancer.server.port` label is the one people miss. Traefik routes to a port inside the container network, so the Strapi container needs no `ports` mapping of its own. Only Traefik publishes ports to the host, which keeps Strapi off the public interface.

:::warning
2 parts of this file carry consequences beyond Traefik itself:

- **Mount a persistent volume for the certificate storage path**, as shown above with `traefik_acme`. Traefik stores issued certificates in `acme.json`. Without it, every container restart requests new certificates, which reaches the <ExternalLink to="https://letsencrypt.org/docs/rate-limits/" text="Let's Encrypt rate limits"/> and leaves the site without a valid certificate until the limit resets.

- **Mounting the Docker socket gives Traefik full access to the Docker API**, which is equivalent to root on the host. The `:ro` flag shown above applies to the socket file rather than to the API, so it does not limit what Traefik can do through the socket. Treat it as a convention, not a boundary. Do not expose the Traefik dashboard publicly, and for a hardened deployment put the socket behind a proxy that exposes only the endpoints Traefik needs.
:::

### Cap the request body size

Traefik applies no request size limit by default. To reject oversized uploads at the proxy instead of at Strapi, add the `buffering` middleware to the Strapi container's labels:

```yml title="./docker-compose.yml"
    labels:
      # ...
      - 'traefik.http.middlewares.strapi-limit.buffering.maxRequestBodyBytes=104857600'
      - 'traefik.http.routers.strapi.middlewares=strapi-limit'
```

A request over the limit receives a `413` response.

:::note
The `buffering` middleware reads the entire request body before forwarding it, spilling to disk beyond a threshold. That adds latency and disk usage on every upload, which is a poor trade for a Media Library that accepts large files. If your uploads are large, leave this middleware off and let `formidable.maxFileSize` in Strapi enforce the limit instead.
:::

## Verify the proxy setup

Bring up the stack and check that Traefik reaches Strapi. Strapi exposes a health check route at `/_health` that responds with HTTP `204 No Content` and a `strapi` header:

```bash
docker compose up -d
curl -I https://api.example.com/_health
```

A working setup returns the status line and the header:

```
HTTP/2 204
strapi: You are so French!
```

Then confirm the rest of the chain:

1. Open `https://api.example.com/admin` in a browser and log in. The admin panel loads over HTTPS with a valid certificate.
2. Upload an image in the Media Library. Its URL uses your domain rather than `localhost:1337`.
3. Check the Strapi container logs with `docker compose logs strapi` for the real client IP address rather than the Traefik container address.

## <Icon name="bug" /> Troubleshooting

Each of the following symptoms points at one side of the setup. The symptom is in bold, followed by what causes it and what to change:

- **Traefik returns `404 page not found`.** No router matched the request. Confirm the container carries `traefik.enable=true`, that the `Host()` rule matches the domain you requested, and that both containers share the same Docker network.

- **Traefik returns `502 Bad Gateway`.** Traefik matched a route but could not reach Strapi. Confirm `loadbalancer.server.port` is `1337` and that Strapi is bound to `0.0.0.0` rather than `localhost`.

- **No certificate is issued.** The certificate challenge needs port 443 reachable from the public internet for `tlsChallenge`, and the domain's DNS `A` record must already resolve to this host. Check the Traefik logs with `docker compose logs traefik`.

- **Certificates are reissued on every restart.** The certificate storage path is not on a persistent volume, so `acme.json` is lost with the container.

- **Uploads fail with a `413` response.** The `buffering` middleware limit is lower than the file size. Raise `maxRequestBodyBytes`, or remove the middleware and let `formidable.maxFileSize` in Strapi enforce the limit.

- **Strapi logs the Traefik container address as the client IP.** `proxy.koa` is not set to `true`, so Strapi reads the socket address instead of the forwarded header.

- **Password reset emails link to `localhost:1337`.** The `url` option is unset or still points at the local address. Set it to the public URL, rebuild the admin panel, and rebuild the image.

## Next steps

<NextSteps title="">
  <NextSteps.Step
    title="Review the server configuration options"
    description="The full list of options available in the server config file."
    link="/cms/configurations/server"
  />
  <NextSteps.Step
    title="Build the Strapi image"
    description="The Docker installation guide covers the image this guide routes to."
    link="/cms/installation/docker"
  />
  <NextSteps.Step
    title="Read the deployment guidelines"
    description="Build requirements and environment variables a production deployment needs."
    link="/cms/deployment"
  />
</NextSteps>
