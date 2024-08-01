---
title: Admin panel extension
# description: todo
sidebar_label: Extension
toc_max_heading_level: 4
tags:
- admin panel 
- admin panel customization

---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'
import FeedbackCallout from '/docs/snippets/backend-customization-feedback-cta.md'
const captionStyle = {fontSize: '12px'}
const imgStyle = {width: '100%', margin: '0' }

<NotV5 />

The admin panel is a React-based single-page application. It encapsulates all the installed plugins of a Strapi application. Some of its aspects can be [customized](#customization-options), and plugins can also [extend](#extension) it.

To start your strapi instance with hot reloading while developing, run the following command:

```bash
cd my-app # cd into the root directory of the Strapi application project
strapi develop
```

:::note
In Strapi 5, the server runs in `watch-admin` mode by default, so the admin panel auto-reloads whenever you change its code. This simplifies admin panel and front-end plugins development. To disable this, run `strapi develop --no-watch-admin` (see [CLI reference](/dev-docs/cli#strapi-develop)).
:::

## Extension

There are 2 use cases to extend the admin panel:

- A plugin developer wants to develop a Strapi plugin that extends the admin panel everytime it's installed in any Strapi application. This can be done by taking advantage of the [Admin Panel API](/dev-docs/plugins/admin-panel-api).

- A Strapi user only needs to extend a specific instance of a Strapi application. This can be done by directly updating the `./src/admin/app.js` file, which can import any file located in `./src/admin/extensions`.
