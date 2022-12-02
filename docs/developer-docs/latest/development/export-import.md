---
title: Data export-import transfer system - Strapi Developer Docs
description: Import, export, and transfer data using the Strapi CLI
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/export-import.html
---

<!-- more details including the file structure of exp data on this page-->
# Data Export-Import System <BetaBadge />

Occasionally you need to move data out of or into a Strapi instance. The data export-import feature allows you to efficiently extract data from an existing instance and import that data into a separate instance. Strapi provides a CLI-based tool that allows you to export and import data. Common use cases include:

- creating a data backup,
- transferring data between environments such as staging and production,
- moving assets from one hosting solution to another, such as locally hosted to an S3 bucket.

 The following documentation details examples of how to use the `strapi export` and `strapi import` commands.

:::strapi
The `strapi export` CLI command and all of the available options are listed in the [Command Line Interface documentation](/developer-docs/latest/developer-resources/cli/CLI#strapi-export.md).
:::

## Export data using the CLI tool

The `strapi export` command by default exports data as an encrypted and compressed `tar.gz` file.

- encrypt outcome
- filter content
- exclude files
- compress outcome
- other

`yarn strapi export`

## Export data structure

The exported data is broken down into 6 categories:
- configuration, which contains zzz,
- entities, which contains zzz,
- links, which contains zzz,
- assets, which contains
- schemas, which contains zzz,
- `metadata.json`, which contains xsss.

## Import data using the CLI tool

```sh
yarn strapi import -f my-file-name --key my-encryption-key --conflictStrategy abort --schemaComparison strict

```

- decrypt outcome
- decompress outcome,
- other
