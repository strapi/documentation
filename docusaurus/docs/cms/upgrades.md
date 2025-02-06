---
title: Upgrades
description: Learn more about Strapi 5's upgrade process
displayed_sidebar: cmsSidebar
pagination_prev: cms/plugins-development/developing-plugins
pagination_next: cms/upgrade-tool
tags:
- migration
- upgrades
- upgrade tool
- Strapi version 
---

import InstallCommand from '/docs/snippets/install-npm-yarn.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'

# Upgrades

Strapi periodically releases code improvements through new versions. New Strapi versions are announced in both the terminal and in the administration panel, and [GitHub release notes](https://github.com/strapi/strapi/releases) list what is new with each new version.

The latest version number of Strapi that was released by the Strapi core team can be found on [npm](https://www.npmjs.com/package/@strapi/strapi) or on [GitHub](https://github.com/strapi/strapi/releases).

When a new version of Strapi is released, you might want to upgrade, and the present page serves as an entry point for information about upgrading.

<details>
<summary>How can I find my current Strapi version number?</summary>

You can find the current version number of your Strapi application:

- either in the admin panel, by going to _Settings > Global Settings > Overview_ and looking at the Strapi version number printed in the Details section:

  <ThemedImage
    alt="Finding your Strapi version number in the admin panel"
    sources={{
      light: '/img/assets/migration/strapi-version-number.png',
      dark: '/img/assets/migration/strapi-version-number_DARK.png'
    }}
  />

- or by running `yarn strapi version` or `npm run strapi version` in the terminal, from the folder where your Strapi project is located.

</details>

Click on one of the 2 following cards depending on your use case:

<CustomDocCard emoji="4️⃣" title="I'm running Strapi v4 and want to upgrade to Strapi 5." description="All you need to know to upgrade to Strapi 5, the latest major version of Strapi." link="/cms/migration/v4-to-v5/introduction-and-faq" />
<CustomDocCard emoji="5️⃣" title="I'm already running Strapi 5 and want to upgrade to the latest version." description="All you need to know to use the automatic upgrade tool, which upgrades both from Strapi v4 to Strapi 5 or to an existing Strapi 5.x.x version to a more recent one." link="/cms/upgrade-tool" />
