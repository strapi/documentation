---
title: Proxying Strapi with Nginx
sidebar_label: Nginx
displayed_sidebar: cmsSidebar
description: Configure Strapi and Nginx so that a Strapi application is served through an Nginx reverse proxy over HTTPS.
tags:
- deployment
- deployment guide
- guides
- Nginx
- proxy
- server configuration
---

import ProxyServerUrl from '/docs/snippets/proxy-server-url.md'
import ProxyTrustHeaders from '/docs/snippets/proxy-trust-headers.md'
import StrapiUploadBodyLimits from '/docs/snippets/strapi-upload-body-limits.md'

# Proxying Strapi with Nginx

<Tldr>
Tell Strapi its public address and that a proxy sits in front of it, using the `server.url` and `server.proxy` options. Then add an Nginx `server` block that forwards requests to Strapi along with the original client details.
</Tldr>

Strapi listens on a plain HTTP port and does not terminate TLS itself. A reverse proxy such as Nginx sits in front of it to handle HTTPS, serve your application on port 443, and forward requests to the Strapi process. This guide covers both halves of the setup: the Strapi configuration that makes your application proxy-aware, and the Nginx configuration that routes traffic to it. The Strapi changes belong in your project, so make them before you deploy. The Nginx changes are made on the machine or in the container that runs Nginx.

:::prerequisites
- A Strapi 5 application that starts and runs locally (see [deployment guidelines](/cms/deployment#general-guidelines)).
- Nginx running either on the same host as Strapi or as a container on the same Docker network (see the <ExternalLink to="https://nginx.org/en/docs/install.html" text="Nginx installation documentation"/>).
- A domain name whose DNS `A` record points at that server.
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

Nginx adds an `X-Forwarded-For` header carrying the original client IP address. Strapi ignores that header until you turn proxy support on.

<ProxyTrustHeaders />

:::warning IP spoofing
Setting `proxy.koa` to `true` without `proxy.maxIpsCount` leaves the count at its default of `0`, which means unlimited. A client can then send `X-Forwarded-For: 203.0.113.9` and, once Nginx appends the real address, Strapi reads the spoofed value from the front of the chain instead of the real one at the end. Always set `maxIpsCount` to the real number of proxies in front of Strapi.
:::

Strapi reads the header named by `proxy.ipHeader`, which defaults to `X-Forwarded-For`. The Nginx configuration below sets that same header, so you do not need to change it. Override it only when a proxy further upstream uses a different name, such as `CF-Connecting-IP` behind Cloudflare.

### Raise the body size limits for uploads

Nginx and Strapi each enforce their own request size limit, and the smaller of the 2 wins. If you upload files through the Media Library, raise both.

<StrapiUploadBodyLimits />

## Configure Nginx

With Strapi aware of the proxy, the next step is the Nginx `server` block that forwards traffic to it.

### Create the server block

Create a configuration file for your site:

```nginx title="/etc/nginx/sites-available/strapi.conf"
# Send the upgrade hint only on requests that actually ask for it
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name api.example.com;

    # Raise this to match the largest upload you accept
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

The `X-Forwarded-Proto` header tells Strapi that the original request arrived over HTTPS. Strapi uses it to mark the admin panel refresh-token cookie as `Secure`. Absolute URLs for password resets, login provider callbacks, and media assets are built from the `url` option instead, not from this header.

Enable the site and reload Nginx. The `sites-available` and `sites-enabled` layout below is the Debian and Ubuntu convention. On RHEL-based distributions, place the file in `/etc/nginx/conf.d/` instead and skip the symlink:

```bash
sudo ln -s /etc/nginx/sites-available/strapi.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

The `nginx -t` command validates the configuration before you reload. Reloading a broken configuration takes the site down, so do not skip it.

The `map` block above forwards the connection upgrade only on requests that request one, rather than attaching an upgrade hint to every proxied request. Strapi needs it for the [remote data transfer](/cms/features/data-management/transfer) feature, which opens a WebSocket connection when you run `strapi transfer` against a remote instance.

### Proxy to Strapi running in a container

When Nginx and Strapi both run as containers, 2 details change.

First, `proxy_pass` targets the Strapi service by name rather than by loopback address. Inside the Nginx container, `127.0.0.1` refers to that container itself, not to Strapi. Docker resolves service names on a shared network, so the service name is what reaches Strapi:

```nginx title="./nginx/strapi.conf"
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name api.example.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://strapi:1337;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

Second, Strapi must bind to `0.0.0.0`. Bound to `localhost`, it accepts connections only from inside its own container and Nginx cannot reach it. The `host` value shown earlier in this guide already uses `0.0.0.0`, which is what makes the container reachable.

The following Compose file puts both services on one network and publishes only Nginx:

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

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/strapi.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - strapi
    networks:
      - web

networks:
  web:
```

Using `expose` rather than `ports` for the Strapi service keeps it off the public interface, so traffic can only arrive through Nginx.

### Terminate TLS

The server block shown so far listens on port 80. A production deployment needs a certificate and a listener on port 443. Nginx does not obtain certificates itself, so pair it with a tool that issues and renews them, or terminate TLS before traffic reaches Nginx at all.

The following options are all in common use:

| Option | Suited to |
|--------|-----------|
| <ExternalLink to="https://certbot.eff.org/" text="Certbot"/> | The Let's Encrypt reference client. Its Nginx plugin can rewrite the server block and set up renewal for you. |
| <ExternalLink to="https://github.com/acmesh-official/acme.sh" text="acme.sh"/> | A shell client with no Python dependency and broad DNS provider support, which matters when you need a wildcard certificate through a DNS-01 challenge. |
| <ExternalLink to="https://go-acme.github.io/lego/" text="lego"/> | A single Go binary, useful in minimal images and container builds. |
| <ExternalLink to="https://github.com/nginx-proxy/acme-companion" text="nginx-proxy and acme-companion"/> | Container deployments, where certificates are issued per container without editing configuration by hand. |
| A cloud load balancer or CDN | Setups where TLS is terminated upstream, for example by AWS Certificate Manager, Cloudflare, or your hosting provider's load balancer. |

Whichever you choose, the Nginx server block ends up listening on 443 and pointing at the certificate files:

```nginx title="/etc/nginx/sites-available/strapi.conf"
server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    client_max_body_size 100M;

    location / {
        # the same proxy_pass and proxy_set_header directives shown above
    }
}
```

Keep a second block on port 80 that redirects to HTTPS, so plain HTTP requests do not reach Strapi.

:::caution
If TLS is terminated upstream by a load balancer or CDN, Nginx can keep listening on port 80. That upstream must still send `X-Forwarded-Proto: https`, otherwise Strapi treats the request as plain HTTP and generates `http://` URLs. Count every proxy in the chain when setting `proxy.maxIpsCount`.
:::

## Validation

Strapi exposes a health check route at `/_health` that responds with HTTP `204 No Content` and a `strapi` header. Requesting it through the proxy confirms that Nginx reaches Strapi:

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
3. Check the Strapi output for the real client IP address rather than `127.0.0.1`. If Strapi runs in the foreground, the addresses appear in that terminal.

## Troubleshooting

Each of the following symptoms points at one side of the setup. The symptom is in bold, followed by what causes it and what to change:

- **Nginx returns `502 Bad Gateway`.** Nginx cannot reach Strapi. Confirm the Strapi process is running and listening on the port used in `proxy_pass`. Then check that `host` in `/config/server.js` is not bound to an interface Nginx cannot reach.

- **Uploads fail with `413 Request Entity Too Large`.** The request exceeded a size limit. Raise `client_max_body_size` in Nginx and `formidable.maxFileSize` in the Strapi `body` middleware, and raise the provider `sizeLimit` if the file is larger than 1 GB. All 3 must allow the file.

- **Strapi logs `127.0.0.1` as the client IP.** `proxy.koa` is not set to `true`, so Strapi reads the socket address instead of the forwarded header.

- **Password reset emails link to `localhost:1337`.** The `url` option is unset or still points at the local address. Set it to the public URL and rebuild the admin panel.

- **Admin panel sessions do not persist over HTTPS.** Nginx is not forwarding `X-Forwarded-Proto`, so Strapi treats the request as plain HTTP and does not mark the refresh-token cookie as `Secure`. Add the header to the `location` block.

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
