---
title: Data export
description: Export data using the Strapi CLI
displayed_sidebar: cmsSidebar
canonicalUrl: https://docs.strapi.io/cms/data-management/export.html
pagination_prev: cms/data-management/import
pagination_next: cms/data-management/transfer
tags:
- configure data encryption
- data management system
- data export
- disable data compression
- exclude option
- metadata.json file
- relations
- strapi export
- tar.gz.enc file 
---

# Data export

<VersionBadge version="4.6.0" />

The `strapi export` command is part of the [Data Management feature](/cms/features/data-management) and used to export data from a local Strapi instance. By default, the `strapi export` command exports data as an encrypted and compressed `tar.gz.enc` file which includes:

- the project configuration,
- entities: all of your content,
- links: relations between your entities,
- assets: files stored in the uploads folder,
- schemas,
- the `metadata.json` file.

The following documentation details the available options to customize your data export. The export command and all of the available options are run using the [Strapi CLI](/cms/cli#strapi-export).

:::caution
* Admin users and API tokens are not exported.
:::

## Understand the exported archive

The exported `.tar` archive contains a flat structure of numbered <ExternalLink to="https://jsonlines.org/" text="JSON lines" /> files arranged in folders for each exported resource:

```text
export_202401011230.tar
├── metadata.json
├── configuration/
│   └── configuration_00001.jsonl
├── entities/
│   └── entities_00001.jsonl
├── links/
│   └── links_00001.jsonl
└── schemas/
    └── schemas_00001.jsonl
```

Each folder (except for `metadata.json`) contains one or more `.jsonl` files named sequentially (e.g., `entities_00001.jsonl`). Each line in these `.jsonl` files represents a single record, making the archive convenient for line‑by‑line processing or conversion to formats such as CSV. To inspect these files directly, export without compression or encryption:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn strapi export --no-encrypt --no-compress -f my-export
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run strapi export -- --no-encrypt --no-compress -f my-export
```

</TabItem>

</Tabs>

The command above creates `my-export.tar` in the project root. After extracting the archive (`tar -xf my-export.tar`), open any `.jsonl` file to view individual records.

:::note
Large datasets are automatically split across multiple `.jsonl` files. The `maxSizeJsonl` provider option controls the maximum size of each file.
:::

## Export to a directory

<VersionBadge version="5.42.0" />

By default, `strapi export` produces a `.tar` archive. Pass `--format dir` to write the export as an unpacked directory instead. The directory uses the same layout as the archive (`metadata.json`, `schemas/`, `entities/`, `links/`, `configuration/`, `assets/`), making the exported data readable and diffable without extracting an archive first.

Directory exports do not support encryption or compression. You must pass `--no-encrypt` explicitly:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn strapi export --format dir --no-encrypt -f my-export
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm run strapi export -- --format dir --no-encrypt -f my-export
```

</TabItem>

</Tabs>

The command creates a `my-export` directory in the project root containing all exported data.

:::tip
The directory format is useful when you want to commit exported data to version control. JSON and JSONL files appear as regular text diffs, making changes visible in pull requests.
:::

## Name the export file

Exported data are contained in a `.tar` file (or a directory when using `--format dir`) that is automatically named using the format `export_YYYYMMDDHHMMSS`. You can optionally name the exported file or directory by passing the `--file` or `-f` option with the `strapi export` command. Do not include a file extension for archive exports, as one is set automatically depending on options provided. For directory exports, the value of `-f` is used as the output directory path.

### Example: Export data with a custom filename

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi export --file my-strapi-export
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi export -- --file my-strapi-export
```

</TabItem>

</Tabs>

## Configure data encryption

The default `strapi export` command encrypts your project data using `aes-128-ecb` encryption and adds the file extension `.enc`. To use encryption you need to pass an encryption key using the `-k` or `--key` option or enter an encryption key when prompted. The encryption key is a `string` with no minimum character count.

:::tip Encryption keys
Strong encryption keys are encouraged to protect sensitive data in your project. <ExternalLink to="https://www.openssl.org/" text="OpenSSL"/> is a resource for generating encryption keys. The following example commands generate encryption keys in a terminal:

<Tabs>

<TabItem value="mac" label="Mac/Linux">

```bash
openssl rand -base64 48
```

</TabItem>

<TabItem value="windows" label="Windows">

```bash
node -p "require('crypto').randomBytes(48).toString('base64');"
```

</TabItem>

</Tabs>

:::

To disable encryption, pass the `--no-encrypt` option with the `strapi export` command.

### Example: Export data without encryption

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi export --no-encrypt
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi export -- --no-encrypt
```

</TabItem>

</Tabs>

### Example: Export data with the encryption `--key` option

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi export --key my-encryption-key
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi export -- --key my-encryption-key
```

</TabItem>

</Tabs>

## Disable data compression

The default `strapi export` command compresses your project data using `gzip` compression and adds the `.gz` file extension.

To disable compression, pass the `--no-compress` option with the `strapi export` command.

### Example: Export data without compression

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi export --no-compress
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi export -- --no-compress
```

</TabItem>

</Tabs>

## Export only selected types of data

The default `strapi export` command exports your content (entities and relations), files (assets), project configuration, and schemas. The `--only` option allows you to export only the listed items by passing a comma-separated string  with no spaces between the types. The available values are `content`, `files`, and `config`. Schemas are always exported, as schema matching is used for `strapi import`.

:::note
Media such as images consist of the file (asset) and the entity in the database. If you use the `--only` flag to export `content`, the asset database records are still included, and could render as broken links.
:::

### Example: Export only entities and relations
<br/>

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi export --only content
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi export -- --only content
```

</TabItem>

</Tabs>

## Exclude items from export

The default `strapi export` command exports your content (entities and relations), files (assets), project configuration, and schemas. The `--exclude` option allows you to exclude content, files, and the project configuration by passing these items in a comma-separated string with no spaces between the types. You can't exclude the schemas, as schema matching is used for `strapi import`.

:::note
Media such as images consist of the file (asset) and the entity in the database. If you use the `--exclude` flag to remove assets, the database records are still included, and could render as broken links.
:::

### Example: Export data excluding assets, entities, and relations

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi export --exclude files,content
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi export -- --exclude files,content
```

</TabItem>

</Tabs>

<FeedbackPlaceholder />
