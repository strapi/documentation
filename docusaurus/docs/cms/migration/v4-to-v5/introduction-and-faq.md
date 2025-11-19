---
title: Upgrading to Strapi 5 - Introduction and FAQ
description: Learn more about how to upgrade to Strapi 5
sidebar_label: Introduction and FAQ
pagination_prev: cms/upgrades
pagination_next: cms/migration/v4-to-v5/step-by-step
tags:
- upgrade to Strapi 5
---

# Upgrading to Strapi 5: Introduction and FAQ

The latest major version of Strapi is Strapi 5. Strapi v4 is still supported until April 2026.

Whenever you feel ready to upgrade to Strapi 5, the present page will help you. It lists all available resources for upgrading from Strapi 4 to Strapi 5 and answers general questions you might have.

## Available resources

All of the following available resources will help you upgrade your application and plugins to Strapi 5, from the most common to the most specific use cases:

<CustomDocCard emoji="1️⃣" title="Step-by-step guide" description="Read this guide first to get an overview of the upgrade process." link="/cms/migration/v4-to-v5/step-by-step" />
<CustomDocCard emoji="2️⃣" title="Upgrade tool reference" description="Learn more about how the upgrade tool can automatically migrate some parts of your Strapi v4 application to Strapi 5." link="/cms/upgrade-tool" />
<CustomDocCard emoji="3️⃣" title="Breaking changes list" description="Read more about the differences between Strapi v4 and v5, the resulting breaking changes, and how to handle them manually or with the help of the codemods provided with the upgrade tool." link="/cms/migration/v4-to-v5/breaking-changes" />
<CustomDocCard emoji="4️⃣" title="Specific resources" description="Handle specific use cases such as the deprecation of the Entity Service API in favor of the new Document Service API, the plugins migration, and the deprecation of the helper-plugin." link="/cms/migration/v4-to-v5/additional-resources/introduction" />

## Frequently asked questions

The following questions and their answers should help you cover the most common use cases:

<details style={{backgroundColor: 'transparent', border: 'solid 1px #4945ff' }}>
<summary style={{fontSize: '18px'}}>How can I handle the upgrade and the installation of the latest dependencies?<br/>How can I handle the breaking changes in the code and adapt my code to Strapi 5?</summary>

Strapi provides an [upgrade tool](/cms/upgrade-tool) to ease the process. The upgrade tool is a command line tool with some commands that handle the upgrade of the dependencies and the execution of **codemods** <Codemods/>.

Follow the <a href="/cms/migration/v4-to-v5/step-by-step">step-by-step guide</a> to learn how to use this tool in the context of upgrading to Strapi 5.

Strapi 5 docs also provide a [complete breaking changes database](/cms/migration/v4-to-v5/breaking-changes) and [dedicated resources](/cms/migration/v4-to-v5/additional-resources/introduction) to cover specific use cases.
<br/>

</details>

<details style={{backgroundColor: 'transparent', border: 'solid 1px #4945ff' }}>
<summary style={{fontSize: '18px'}}>How can I handle the data migration, ensuring that in Strapi 5 the application will still be working?</summary>
<p>Strapi 5 integrates a series of data migration scripts that are run once the application starts for the first time in Strapi 5.</p>
<p>However, please <strong>always backup your database</strong> (found at <code style={{color: 'rgb(73, 69, 255)', backgroundColor: 'rgb(240, 240, 255)'}}>.tmp/data.db</code> by default if using a SQL database) before performing any upgrade, as instructed in the <a href="/cms/migration/v4-to-v5/step-by-step">step-by-step guide</a>.</p>
<br/>
</details>

<details style={{backgroundColor: 'transparent', border: 'solid 1px #4945ff' }}>
<summary style={{fontSize: '18px'}}>As a Strapi Cloud customer, how can I handle the entire upgrade and deployment of my Strapi 5 application?</summary>

1. [Create a backup](/cloud/projects/settings#backups) and update your code locally, following the <a href="/cms/migration/v4-to-v5/step-by-step">step-by-step guide</a>.
2. Run the `yarn deploy` or `npm run deploy` commands from the [Cloud CLI](/cloud/cli/cloud-cli).<br/>

Strapi Cloud will deploy the updated code in Strapi 5 and will automatically run the data migration script.
<br/>

</details>

<details style={{backgroundColor: 'transparent', border: 'solid 1px #4945ff' }}>
<summary style={{fontSize: '18px'}}>How do I keep the legacy <code>attributes</code> wrapper during the migration?</summary>

- For REST clients, add the `Strapi-Response-Format: v4` header while you refactor your code. The [new response format breaking change](/cms/migration/v4-to-v5/breaking-changes/new-response-format#use-the-compatibility-header-while-migrating) shows where to add the header in `curl`, `fetch`, and Axios requests.
- For GraphQL clients, enable `v4CompatibilityMode` and follow the steps of the [GraphQL API migration documentation](/cms/migration/v4-to-v5/breaking-changes/graphql-api-updated#migration) to gradually remove `attributes`.
- REST responses continue to expose both `id` (legacy) and [`documentId`](/cms/migration/v4-to-v5/breaking-changes/use-document-id) when the header is enabled. GraphQL never exposes numeric `id`, so update your queries to use `documentId` even before you turn compatibility mode off.

Once every consumer reads the flattened format, remove the header so Strapi emits the Strapi 5 response shape by default.
<br/>

</details>
