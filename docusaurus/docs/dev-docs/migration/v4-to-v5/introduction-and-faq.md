---
title: Upgrading to Strapi 5 - Introduction and FAQ
description: Learn more about how to upgrade to Strapi 5
pagination_prev: dev-docs/upgrades
pagination_next: dev-docs/migration/v4-to-v5/step-by-step
tags:
- upgrade to Strapi 5
---

import DoNotMigrateYet from '/docs/snippets/_do-not-migrate-to-v5-yet.md'
import TempUpgradeRCtag from '/docs/snippets/temp-upgrade-rc.md'
const detailsStyle = {backgroundColor: 'transparent', border: 'solid 1px #4945ff' }
const summaryStyle = {fontSize: '18px'}
const codeStyle = {color: 'rgb(73, 69, 255)', backgroundColor: 'rgb(240, 240, 255)'}

# Upgrading to Strapi 5: Introduction and FAQ

The latest major version of Strapi is Strapi 5, which is currently provided as a Release Candidate (RC) version, not as a stable version yet.

The present page lists all available resources for upgrading from Strapi 4 to Strapi 5 and answers general questions you might have.

<DoNotMigrateYet />


## Available resources

All of the following available resources will help you upgrade your application and plugins to Strapi 5, from the most common to the most specific use cases:

<CustomDocCard emoji="1️⃣" title="Step-by-step guide" description="Read this guide first to get an overview of the upgrade process." link="/dev-docs/migration/v4-to-v5/step-by-step" />
<CustomDocCard emoji="2️⃣" title="Upgrade tool reference" description="Learn more about how the upgrade tool can automatically migrate some parts of your Strapi v4 application to Strapi 5." link="/dev-docs/upgrade-tool" />
<CustomDocCard emoji="3️⃣" title="Breaking changes list" description="Read more about the differences between Strapi v4 and v5, the resulting breaking changes, and how to handle them manually or with the help of the codemods provided with the upgrade tool." link="/dev-docs/migration/v4-to-v5/breaking-changes" />
<CustomDocCard emoji="4️⃣" title="Specific resources" description="Handle specific use cases such as the deprecation of the Entity Service API in favor of the new Document Service API, the plugins migration, and the deprecation of the helper-plugin." link="/dev-docs/migration/v4-to-v5/additional-resources/introduction" />

## Frequently asked questions

The following questions and their answers should help you cover the most common use cases:

<details style={detailsStyle}>
<summary style={summaryStyle}>How can I handle the upgrade and the installation of the latest dependencies? How can I handle the breaking changes in the code and adapt my code to Strapi 5?</summary>

Strapi provides a tool, the [upgrade tool](/dev-docs/upgrade-tool). The upgrade tool is a command line tool with some commands that handle the upgrade of the dependencies and the execution of **codemods** <Codemods/>.

Follow the <a href="/dev-docs/migration/v4-to-v5/step-by-step">step-by-step guide</a> to learn how to use this tool in the context of upgrading to Strapi 5.

Strapi 5 docs also provide a [complete breaking changes database](/dev-docs/migration/v4-to-v5/breaking-changes) and [dedicated resources](/dev-docs/migration/v4-to-v5/additional-resources/introduction) to cover specific use cases.

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>How can I handle the data migration, ensuring that in Strapi 5 the application will still be working?</summary>
<p>Strapi 5 integrates a data migration script that is run once the application starts for the first time in Strapi 5.</p>
<p>However, please <strong>always backup your database file</strong> (found at <code style={codeStyle}>.tmp/data.db</code> by default if using a SQL database) before performing any upgrade, as instructed in the <a href="/dev-docs/migration/v4-to-v5/step-by-step">step-by-step guide</a>.</p>
</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>As a Strapi Cloud customer, how can I handle the entire upgrade and deployment of my Strapi 5 application?</summary>

:::danger Warning: Don't push a Strapi 5 project to Strapi Cloud yet
Strapi Cloud is still running on Strapi v4. The following process is provided as an indication of what will happen when Strapi 5 is released as a stable version. Do not try to push your Strapi 5 beta or  Release Candidate (RC) project to Strapi Cloud yet.
:::

1. Update your code locally, following the <a href="/dev-docs/migration/v4-to-v5/step-by-step">step-by-step guide</a>.
2. Run the `yarn deploy` or `npm run deploy` commands from the [Cloud CLI](https://docs.strapi.io/cloud/cli/cloud-cli).<br/>(⚠️ *This command is currently only available to push Strapi v4 projects to Strapi Cloud. The current link to Cloud CLI documentation points to Strapi v4 stable documentation, not to Strapi 5 RC documentation.*)

Strapi Cloud will deploy the updated code in Strapi 5 and will automatically run the data migration script.

</details>
