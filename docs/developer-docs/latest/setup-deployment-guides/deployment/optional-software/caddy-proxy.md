---
title: Caddy Proxying - Strapi Developer Docs
description: Learn how you can use a proxy application like Caddy to secure your Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/optional-software/caddy-proxy.html
---

# Caddy Proxying

As Strapi does not handle SSL directly and hosting a Node.js service on the "edge" network is not a secure solution it is recommended that you use some sort of proxy application such as Nginx, Apache, HAProxy, Traefik, or others. Below you will find some sample configurations for Caddy, naturally these configs may not suit all environments and you will likely need to adjust them to fit your needs.

Caddy has some very easy to use options relating to Let's encrypt and automated SSL certificate issuing/renewing, while it is certainly the "newer" web server market, it is quickly becoming a great "non-technical" user application for proxying. **Please do note that Caddy is still very much in development** and as such is evolving often, this guide is based on Caddy v2.0.0.

## Configuration

The below configuration is based on "Caddy File" type, this is a single file configuration that Caddy will use to run the web server. There are multiple other options such as the Caddy REST API that this guide will not cover, you should review the [Caddy documentation](https://caddyserver.com/docs/) for further information on alternatives. You can also visit the [Caddy Community](https://caddy.community/) to speak with others relating to configuration questions.

!!!include(developer-docs/latest/setup-deployment-guides/deployment/optional-software/snippets/strapi-server.md)!!!

### Caddy file

The Caddyfile is a convenient Caddy configuration format for humans. It is most people's favorite way to use Caddy because it is easy to write, easy to understand, and expressive enough for most use cases.

In the below examples you will need to replace your domain, and should you wish to use SSL you will need to tweak these Caddy file configs to suit your needs, SSL is not covered in this guide and you should review the Caddy documentation.

Below are 3 example Caddy configurations:

- Subdomain-based such as `api.example.com`
- Subfolder-based with both the API and Admin on the same subfolder (e.g. `example.com/test/api` and `example.com/test/admin`)
- Subfolder-based with split API and admin panel (e.g. `example.com/api` and `example.com/dashboard`)

::::: tabs card

:::: tab Subdomain

#### Subdomain

This configuration is using a subdomain dedicated to Strapi only. It will bind to port 80 HTTP and proxies all requests (both API and admin) to the Strapi server running locally on the address specified. If you have configured Caddy properly to handle automated SSL, you can remove the `http://` and Caddy will automatically convert all HTTP to HTTPS traffic.

---

- Example domain: `api.example.com`
- Example admin panel: `api.example.com/admin`
- Example API: `api.example.com/api`
- Example uploaded Files (local provider): `api.example.com/uploads`

```sh
# path: /etc/caddy/Caddyfile

http://api.example.com {
  reverse_proxy 127.0.0.1:1337
}

```

::::

:::: tab Subfolder unified

#### Subfolder unified

This configuration is using a subfolder dedicated to Strapi only. It will bind to port 80 HTTP and hosts the front-end files on `/var/www` like a normal web server, but proxies all Strapi requests on the `example.com/test` sub-path.

:::note
This example configuration is not focused on the front end hosting and should be adjusted to your front-end software requirements.
:::

---

- Example domain: `example.com/test`
- Example admin panel: `example.com/test/admin`
- Example API: `example.com/test/api`
- Example uploaded Files (local provider): `example.com/test/uploads`

```sh
# path: /etc/caddy/Caddyfile

http://example.com {
  root * /var/www
  file_server
  route /test* {
    uri strip_prefix /test
    reverse_proxy 127.0.0.1:1337
  }
}
```

::::

:::: tab Subfolder split

#### Subfolder split

This configuration is using 2 subfolders dedicated to Strapi. It will bind to port 80 HTTP and hosts the front end files on `/var/www` like a normal web server, but proxies all Strapi API requests on the `example.com/api` subpath and all admin requests on the `example.com/dashboard` subpath.

Alternatively, for the admin panel, you can replace the proxy instead with serving the admin `build` folder directly from Caddy, such centralizing the admin but load balancing the backend APIs. The example for this is not shown, but it would likely be something you would build into your CI/CD platform.

:::caution
This example configuration is not focused on the front end hosting and should be adjusted to your front-end software requirements.
:::

---

- Example domain: `example.com`
- Example admin: `example.com/dashboard`
- Example API: `example.com/api`
- Example uploaded Files (local provider): `example.com/uploads`

**Path —** `/etc/caddy/Caddyfile`

```sh
# path: /etc/caddy/Caddyfile

http://example.com {
  reverse_proxy 127.0.0.1:1337
}
```

::::

:::::

!!!include(developer-docs/latest/setup-deployment-guides/deployment/optional-software/snippets/admin-redirect.md)!!!
