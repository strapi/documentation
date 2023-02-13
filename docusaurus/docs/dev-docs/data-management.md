---
title: Data management system 
description: Import, export, and transfer data using the Strapi CLI
displayed_sidebar: devDocsSidebar
canonicalUrl: https://docs.strapi.io/dev-docs/data-management.html
---

# Data Management System

:::callout 🚧 Feature under development
The data management system is under development. Not all use cases are covered by the initial release. You can provide feedback about desired functionality on the [Strapi feedback website](https://feedback.strapi.io). The feature is available in v4.6.0 and later versions.

:::

Occasionally you need to move data out of or into a Strapi instance. The data management system allows you to efficiently extract data from an existing instance or archive and import that data into a separate instance. Additionally, the data management system allows you to transfer data between a local Strapi instance and a remote Strapi instance. Strapi provides CLI-based commands that allow you to export, import, and transfer data. Common use cases include:

- [creating a data backup](/dev-docs/data-management/export),
- [restoring data from a backup](/dev-docs/data-management/import),
- [transfer data from a local to remote instance](/dev-docs/data-management/transfer).

 The following documentation details examples of how to use the [`strapi export`](/dev-docs/data-management/export), [`strapi import`](/dev-docs/data-management/import), and [`strapi transfer`](/dev-docs/data-management/transfer) commands.

:::strapi Command Line Interface (CLI) shortcut
If you want to skip the details and examples the `strapi export`, `strapi import`, and `strapi tranfer` CLI commands with all of the available options are documented in the [Command Line Interface documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-export).
:::

:::caution
Interactive CLI commands do not currently work with the `npm` package manager. For `strapi export` and `strapi import` this means the encryption key prompt is not visible in the CLI. A fix is anticipated by early March 2023. In the meantime consider using the `yarn` package manager.
:::

<FeedbackPlaceholder />
