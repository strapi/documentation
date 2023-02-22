---
title: Nginx Proxying
displayed_sidebar: devDocsSidebar
description: Learn how you can use a proxy application like Nginx to secure your Strapi application.

---

import AdminRedirect from './snippets-proxy/admin-redirect.md'
import StrapiServer from './snippets-proxy/strapi-server.md'
import SubfolderSplitWarning from './snippets-proxy/subfolder-split-warning.md'

# Nginx Proxying

As Strapi does not handle SSL directly and hosting a Node.js service on the "edge" network is not a secure solution it is recommended that you use some sort of proxy application such as Nginx, Apache, HAProxy, Traefik, or others. The following documentation provides some sample configurations for Nginx, naturally these configs may not suit all environments and you will likely need to adjust them to fit your needs.

## Configuration

The following configuration is based on Nginx virtual hosts, this means that you create configurations for each domain to allow serving multiple domains on the same port such as 80 (HTTP) or 443 (HTTPS). It also uses a central upstream file to store an alias to allow for easier management, load balancing, and failover in the case of clustering multiple Strapi deployments.

<StrapiServer components={props.components} />

### Nginx Upstream

Upstream blocks are used to map an alias such as `strapi` to a specific URL such as `localhost:1337`. While it would be useful to define these in each virtual host file, Nginx currently doesn't support loading these within the virtual host if you have multiple virtual host files. Instead, configure these within the `conf.d` directory as this is loaded before any virtual host files.

In the following configuration the `localhost:1337` is mapped to the Nginx alias `strapi`:

```sh
# path: /etc/nginx/conf.d/upstream.conf

# Strapi server
upstream strapi {
    server 127.0.0.1:1337;
}
```

### Nginx Virtual Host

Virtual host files are what store the configuration for a specific app, service, or proxied service. For usage with Strapi this virtual host file is handling HTTPS connections and proxying them to Strapi running locally on the server. This configuration also redirects all HTTP requests to HTTPs using a 301 redirect.

In the following examples you will need to replace your domain and likewise your paths to SSL certificates will need to be changed based on where you place them or, if you are using Let's Encrypt, where your script places them. Please also note that while the following path shows `sites-available` you will need to symlink the file to `sites-enabled` in order for Nginx to enable the config.

The following are 2 example Nginx configurations:

- subdomain based such as `api.example.com`
- subfolder based with both the API and Admin on the same subfolder such as `example.com/test/api` and `example.com/test/admin`

<SubfolderSplitWarning components={props.components} />

<Tabs>

<TabItem value="Subdomain" label="Subdomain">

#### Subdomain

This configuration is using the subdomain that is dedicated to Strapi only. It will redirect normal HTTP traffic over to SSL and proxies all requests (both API and admin) to the Strapi server running on the upstream alias configured above.

---

- Example domain: `api.example.com`
- Example admin panel: `api.example.com/admin`
- Example API: `api.example.com/api`
- Example uploaded Files (local provider): `api.example.com/uploads`

```sh
# path: /etc/nginx/sites-available/strapi.conf

server {
    # Listen HTTP
    listen 80;
    server_name api.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    # Listen HTTPS
    listen 443 ssl;
    server_name api.example.com;

    # SSL config
    ssl_certificate /path/to/your/certificate/file;
    ssl_certificate_key /path/to/your/certificate/key;

    # Proxy Config
    location / {
        proxy_pass http://strapi;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass_request_headers on;
    }
}
```

</TabItem>

<TabItem value="Subfolder unified" label="Subfolder unified">

#### Subfolder unified

This configuration is using a subfolder dedicated to Strapi only. It will redirect normal HTTP traffic over to SSL and hosts the front-end files on `/var/www/html` like a normal web server, but proxies all strapi requests on the `example.com/test` sub-path.

:::note
This example configuration is not focused on the front end hosting and should be adjusted to your front-end software requirements.
:::

---

- Example domain: `example.com/test`
- Example admin: `example.com/test/admin`
- Example API: `example.com/test/api`
- Example uploaded files (local provider): `example.com/test/uploads`

```sh
# path: /etc/nginx/sites-available/strapi.conf

server {
    # Listen HTTP
    listen 80;
    server_name example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    # Listen HTTPS
    listen 443 ssl;
    server_name example.com;

    # SSL config
    ssl_certificate /path/to/your/certificate/file;
    ssl_certificate_key /path/to/your/certificate/key;

    # Static Root
    location / {
        root /var/www/html;
    }

    # Strapi API and Admin
    location /test/ {
        rewrite ^/test/?(.*)$ /$1 break;
        proxy_pass http://strapi;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass_request_headers on;
    }
}
```

</TabItem>

</Tabs>

<AdminRedirect components={props.components} />
