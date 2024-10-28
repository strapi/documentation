---
title: Data management system 
description: Import, export, and transfer data using the Strapi CLI
displayed_sidebar: cmsSidebar
keywords: 
  - DEITS
tags:
- data management system
- introduction
- strapi export
- strapi import
- strapi transfer
---

# Data Management System

Occasionally, you need to move data out of or into a Strapi instance. This is possible with the data management system which uses CLI-based commands:

- Use [`strapi export`](/dev-docs/data-management/export) to create a data backup, for archive purposes or to import it in another instance.
- Use [`strapi import`](/dev-docs/data-management/import) to restore data from a backup.
- Use [`strapi transfer`](/dev-docs/data-management/transfer) to transfer data between local and/or remote instances.

The following documentation gives explanations and examples for the export, import, and transfer commands, while the [CLI reference documentation](/dev-docs/cli#strapi-export) lists all available flags in a condensed format.

:::caution
Interactive CLI commands do not currently work with the `npm` package manager. For `strapi export` and `strapi import` this means the encryption key prompt is not visible in the CLI. In the meantime consider using the `yarn` package manager.
:::
