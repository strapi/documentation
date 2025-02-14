---
title: Data import 
description: Import data using the Strapi CLI
displayed_sidebar: cmsSidebar
canonicalUrl: https://docs.strapi.io/cms/data-management/import.html
tags:
- data management system
- data import
- exclude option
- force option
- metadata.json file
- strapi import
- tar.gz.enc file 
---

# Data import

The `strapi import` command is part of the [Data Management feature](/cms/features/data-management) and used to import data from a file. By default, the `strapi import` command imports data from an encrypted and compressed `tar.gz.enc` file which includes:

- the project configuration,
- entities: all of your content,
- links: relations between your entities,
- assets: files stored in the uploads folder,
- schemas,
- the `metadata.json` file.

The following documentation details the available options to customize your data import. The import command and all of the available options are run using the [Strapi CLI](/cms/cli#strapi-import).

:::warning

- `strapi import` deletes all existing data, including the database and uploads directory, before importing the backup file.
- The source and target schemas must match to successfully use `strapi import`, meaning all content types must be identical.
- Restored data does not include the `Admin users` table, which means that `createdBy` and `updatedBy` are empty in a restored instance.  

:::

## Specify the import file

To import data into a Strapi instance use the `strapi import` command in the destination project root directory. Specify the file to be imported using the `-f` or `--file` option. The filename, extension, and path are required. If the file is encrypted, you are prompted for the encryption key before the import starts.

### Example: Minimum command to import data from a file in the Strapi project root

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi import -f /path/to/my/file/export_20221213105643.tar.gz.enc
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi import -- -f /path/to/my/file/export_20221213105643.tar.gz.enc
```

</TabItem>

</Tabs>

## Provide an encryption key

If you are importing data from an encrypted file the encryption key can be passed with the `strapi import` command by using the `-k` or `--key` option.

### Example: Pass the encryption key with the `strapi import` command

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi import -f /path/to/my/file/export_20221213105643.tar.gz.enc --key my-encryption-key
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi import -- -f /path/to/my/file/export_20221213105643.tar.gz.enc --key my-encryption-key
```

</TabItem>

</Tabs>

## Bypass all command line prompts

When using the `strapi import` command, you are required to confirm that the import will delete the existing database contents. The `--force` flag allows you to bypass this prompt. This option is useful for implementing `strapi import` programmatically. For programmatic use, you must also pass the `--key` option for encrypted files.

### Example of the `--force` option

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi import -f /path/to/my/file/export_20221213105643.tar.gz.enc --force --key my-encryption-key
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi import -- -f /path/to/my/file/export_20221213105643.tar.gz.enc --force --key my-encryption-key
```

</TabItem>

</Tabs>

## Exclude data types during import

The default `strapi import` command imports your content (entities and relations), files (assets), project configuration, and schemas. The `--exclude` option allows you to exclude content, files, and the project configuration by passing these items in a comma-separated string with no spaces between the types. You can't exclude the schemas, as schema matching is used for `strapi import`.

:::warning
Any types excluded from the import will be deleted in your target instance. For example, if you exclude `config` the project configuration in your target instance will be deleted.
:::

:::note
Media such as images consist of the file (asset) and the entity in the database. If you use the `--exclude` flag to remove assets, the database records are still included, and could render as broken links.
:::

### Example: exclude assets from an import

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi import -f /path/to/my/file/export_20221213105643.tar.gz.enc --exclude files
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm strapi import -- -f /path/to/my/file/export_20221213105643.tar.gz.enc --exclude files
```

</TabItem>

</Tabs>

## Include only specified data types during import

The default `strapi import` command imports your content (entities and relations), files (assets), project configuration, and schemas. The `--only` option allows you to export only the listed items by passing a comma-separated string  with no spaces between the types. The available values are `content`, `files`, and `config`. Schemas are always imported, as schema matching is used for `strapi import`.

:::note
Media such as images consist of the file (asset) and the entity in the database. If you use the `--only` flag to import `content` the asset database records are still included, and could render as broken links.
:::

### Example: import only the project configuration

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi import -f /path/to/my/file/export_20221213105643.tar.gz.enc --only config
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm strapi import -- -f /path/to/my/file/export_20221213105643.tar.gz.enc --only config
```

</TabItem>

</Tabs>

<FeedbackPlaceholder />
