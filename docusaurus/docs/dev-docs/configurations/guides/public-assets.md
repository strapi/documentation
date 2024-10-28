---
title: Use public assets
displayed_sidebar: devDocsSidebar
description: The public folder of Strapi is used for static files that you want to make accessible to the outside world.
tags:
- company logo
- configuration
- configuration guide
- guides
- public assets
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# How to use public assets with Strapi

<NotV5 />

Public assets are static files (e.g. images, video, CSS files, etc.) that you want to make accessible to the outside world.

Because an API may need to serve static assets, every new Strapi project includes by default a folder named `/public`. Any file located in this directory is accessible if the request's path doesn't match any other defined route and if it matches a public file name (e.g. an image named `company-logo.png` in `./public/` is accessible through `/company-logo.png` URL).

:::tip
`index.html` files are served if the request corresponds to a folder name (`/pictures` url will try to serve `public/pictures/index.html` file).
:::

:::caution
The dotfiles are not exposed. It means that every file name that starts with `.`, such as `.htaccess` or `.gitignore`, are not served.
:::
