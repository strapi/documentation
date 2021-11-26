---
title: HAProxy Proxying - Strapi Developer Docs
description: Learn how you can use a proxy application like HAProxy to secure your Strapi application.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/optional-software/haproxy-proxy.html
---

# HAProxy Proxying

As Strapi does not handle SSL directly and hosting a Node.js service on the "edge" network is not a secure solution it is recommended that you use some sort of proxy application such as Nginx, Apache, HAProxy, Traefik, or others. Below you will find some sample configurations for HAProxy, naturally these configs may not suit all environments and you will likely need to adjust them to fit your needs.

## Configuration

The below examples are acting as an "SSL termination" proxy, meaning that HAProxy is only accepting the requests on SSL and proxying to other backend services such as Strapi or other web servers. HAProxy cannot serve static content and as such it is usually used to handle multi-server deployments in a failover or load-balance situation. The examples provided below are based around everything existing on the same server, but could easily be tweaked for multi-server deployments.

!!!include(developer-docs/latest/setup-deployment-guides/deployment/optional-software/snippets/strapi-server.md)!!!

### HAProxy

The following examples are either proxying all requests directly to Strapi or are splitting requests between Strapi and some other backend web server such as Nginx, Apache, or others.

Below are 3 example HAProxy configurations:

- Sub-domain based such as `api.example.com`
- subfolder based with both the API and Admin on the same subfolder such as `example.com/test/api` and `example.com/test/admin`
- subfolder based with split API and Admin such as `example.com/api` and `example.com/dashboard`

:::caution HAProxy SSL Support
If you are not familiar with HAProxy and using SSL certificates on the bind directive, you should combine your SSL cert, key, and any CA files into a single `.pem` package and use it's path in the bind directive. For more information see [HAProxy's bind documentation](https://www.haproxy.com/documentation/hapee/latest/onepage/#5.1). Most Let's Encrypt clients do not generate a file like this so you may need custom "after issue" scripts to do this for you.
:::

::::: tabs card

:::: tab Subdomain

#### Subdomain

This configuration is using a subdomain dedicated to Strapi only. It will redirect normal HTTP traffic over to SSL and proxies all requests (both API and admin) to the Strapi server running on the server.

---

- Example domain: `api.example.com`
- Example admin panel: `api.example.com/admin`
- Example API: `api.example.com/api`
- Example uploaded Files (local provider): `api.example.com/uploads`

```sh
# path: /etc/haproxy/haproxy.cfg

global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
        stats timeout 30s
        user haproxy
        group haproxy
        daemon

        # Default SSL material locations
        ca-base /etc/ssl/certs
        crt-base /etc/ssl/private

        # See: https://ssl-config.mozilla.org/#server=haproxy&server-version=2.0.3&config=intermediate
        ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA3$
        ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
        ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
        log     global
        mode    http
        option  httplog
        option  dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
        errorfile 400 /etc/haproxy/errors/400.http
        errorfile 403 /etc/haproxy/errors/403.http
        errorfile 408 /etc/haproxy/errors/408.http
        errorfile 500 /etc/haproxy/errors/500.http
        errorfile 502 /etc/haproxy/errors/502.http
        errorfile 503 /etc/haproxy/errors/503.http
        errorfile 504 /etc/haproxy/errors/504.http

# Everything above this line is HAProxy defaults

frontend api.example.com
        bind *:80
        bind *:443 ssl crt /path/to/your/cert+key+ca.pem
        http-request redirect scheme https unless { ssl_fc }
        default_backend strapi-backend

backend strapi-backend
        server local 127.0.0.1:1337
```

::::

:::: tab Subfolder unified

#### Subfolder unified

This configuration is using a subfolder dedicated to Strapi only. It will redirect normal HTTP traffic over to SSL and proxies the front end to `localhost:8080`, but proxies all Strapi requests on the `example.com/test` sub-path to the locally running Strapi application.

:::caution
HAProxy cannot serve static content, the below example is proxying front-end traffic to some other web server running on the localhost port 8080.
:::

---

- Example domain: `example.com/test`
- Example admin panel: `example.com/test/admin`
- Example API: `example.com/test/api`
- Example uploaded Files (local provider): `example.com/test/uploads`

```sh
# path: /etc/haproxy/haproxy.cfg

global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
        stats timeout 30s
        user haproxy
        group haproxy
        daemon

        # Default SSL material locations
        ca-base /etc/ssl/certs
        crt-base /etc/ssl/private

        # See: https://ssl-config.mozilla.org/#server=haproxy&server-version=2.0.3&config=intermediate
        ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA3$
        ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
        ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
        log     global
        mode    http
        option  httplog
        option  dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
        errorfile 400 /etc/haproxy/errors/400.http
        errorfile 403 /etc/haproxy/errors/403.http
        errorfile 408 /etc/haproxy/errors/408.http
        errorfile 500 /etc/haproxy/errors/500.http
        errorfile 502 /etc/haproxy/errors/502.http
        errorfile 503 /etc/haproxy/errors/503.http
        errorfile 504 /etc/haproxy/errors/504.http

# Everything above this line is HAProxy defaults

frontend example.com
        bind *:80
        bind *:443 ssl crt /path/to/your/cert+key+ca.pem
        http-request redirect scheme https unless { ssl_fc }
        acl test path_beg /test
        use_backend strapi-backend if test
        default_backend default-backend

backend default-backend
        # HAProxy -cannot- serve static content on it's own
        # This example is relaying traffic to some other backend webserver
        server somewebserver 127.0.0.1:8080

backend strapi-backend
        http-request set-path "%[path,regsub(^/test/?,/)]"
        server local 127.0.0.1:1337

```

::::

:::: tab Subfolder split

#### Subfolder split

This config is using a subfolder dedicated to Strapi only. It will redirect normal HTTP traffic over to SSL and proxies the front end to `localhost:8080`, but proxies all Strapi API requests on the `example.com/api` subpath to the locally running Strapi application and all admin requests on the `example.com/dashboard` subpath.

:::note
This example configuration is not focused on the front end hosting and should be adjusted to your front-end software requirements.
:::

---

- Example domain: `example.com`
- Example admin panel: `example.com/dashboard`
- Example API: `example.com/api`
- Example uploaded Files (local provider): `example.com/uploads`

```sh
# path: /etc/haproxy/haproxy.cfg

global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
        stats timeout 30s
        user haproxy
        group haproxy
        daemon

        # Default SSL material locations
        ca-base /etc/ssl/certs
        crt-base /etc/ssl/private

        # See: https://ssl-config.mozilla.org/#server=haproxy&server-version=2.0.3&config=intermediate
        ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA3$
        ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
        ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
        log     global
        mode    http
        option  httplog
        option  dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
        errorfile 400 /etc/haproxy/errors/400.http
        errorfile 403 /etc/haproxy/errors/403.http
        errorfile 408 /etc/haproxy/errors/408.http
        errorfile 500 /etc/haproxy/errors/500.http
        errorfile 502 /etc/haproxy/errors/502.http
        errorfile 503 /etc/haproxy/errors/503.http
        errorfile 504 /etc/haproxy/errors/504.http

# Everything above this line is HAProxy defaults

frontend example.com
        bind *:80
        bind *:443 ssl crt /path/to/your/cert+key+ca.pem
        http-request redirect scheme https unless { ssl_fc }
        default_backend strapi-backend

backend strapi-backend
        server local 127.0.0.1:1337
```

::::

:::::

!!!include(developer-docs/latest/setup-deployment-guides/deployment/optional-software/snippets/admin-redirect.md)!!!
