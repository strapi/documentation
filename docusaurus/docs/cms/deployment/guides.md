---
title: Deployment guides
description: Guides for serving Strapi behind a reverse proxy and running it under a process manager.
pagination_prev: cms/deployment
pagination_next: cms/deployment/guides/caddy
displayed_sidebar: cmsSidebar
tags:
- deployment
- deployment guide
- guides
---

# Deployment guides

The following guides cover serving Strapi behind a reverse proxy and running it under a process manager. They all assume a Strapi project that is [created](/cms/installation) and that you have read the [general deployment guidelines](/cms/deployment#general-guidelines).

<CustomDocCardsWrapper>
<CustomDocCard icon="gear-fine" title="Proxying with Caddy" description="Serve Strapi through a Caddy reverse proxy, with automatic HTTPS." link="/cms/deployment/guides/caddy" />
<CustomDocCard icon="gear-fine" title="Proxying with HAProxy" description="Serve Strapi through an HAProxy load balancer over HTTPS." link="/cms/deployment/guides/haproxy" />
<CustomDocCard icon="gear-fine" title="Proxying with Nginx" description="Serve Strapi through an Nginx reverse proxy over HTTPS." link="/cms/deployment/guides/nginx" />
<CustomDocCard icon="gear-fine" title="Proxying with Traefik" description="Serve a containerized Strapi application through Traefik over HTTPS." link="/cms/deployment/guides/traefik" />
<CustomDocCard icon="gear-fine" title="Using the PM2 process manager" description="Keep Strapi running with PM2, and start it again after a reboot." link="/cms/deployment/guides/pm2" />
</CustomDocCardsWrapper>

<br/>

For hosting on a 3rd-party platform, and for the general requirements a production deployment has to meet, see the [deployment](/cms/deployment) page.
