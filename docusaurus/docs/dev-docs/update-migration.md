---
title: Updates and Migrations
# description: todo
displayed_sidebar: devDocsSidebar
pagination_prev: dev-docs/plugins
---

import InstallCommand from '/docs/snippets/install-npm-yarn.md'
import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'

# Updates and Migrations

Strapi periodically releases code improvements through new versions. New Strapi versions are announced in both the terminal and in the administration panel, and [GitHub release notes](https://github.com/strapi/strapi/releases) list what is new with each new version.

Whenever a new Strapi version is available, there are 2 possible cases:

| Does the new Strapi version include breaking changes? | The upgrade process is a/an… | You should read the…                               | Can you use the `upgrade` tool? |
| ----------------------------------------------------- | -----------------------------|--------------------------------------------------- | --------------------------------|
| No                                                    | Update                       | Generic [update guide](/dev-docs/update-version)   | Yes                             |
| Yes                                                   | Migration                    | Specific migration guides (see below)              | Yes                             |

There are 2 types of migrations:
- migrating from a minor version to another minor version (e.g., from v5.x to v5.y)
- migrating from a major version to another major version (e.g., from v4.x to v5.0)

Depending on your use case, click on any of the following cards to read detailed instructions to upgrade to the desired version:

<CustomDocCardsWrapper>
<CustomDocCard emoji="⟳" title="Updates guide" description="Read a generic update guide. Useful when there is no breaking change." link="/dev-docs/update-version" />
<CustomDocCard emoji="🤖" title="Upgrade tool" description="Learn how to use Strapi's CLI upgrade tool to automatically handle updates & migrations." link="/dev-docs/upgrade-tool" />
<CustomDocCard emoji="⬆️" title="v5.x migration guides" description="Read specific guides to handle breaking changes while migrating from Strapi v5.x to Strapi v5.y." link="/dev-docs/migration-guides" />
<CustomDocCard emoji="⤴️" title="v4 to v5 migration guides" description="Read specific guides to handle breaking changes while migrating from Strapi v4 to Strapi v5." link="/dev-docs/migration/v4-to-v5/introduction" />
</CustomDocCardsWrapper>
