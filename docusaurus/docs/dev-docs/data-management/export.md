---
title: Data export
description: Export data using the Strapi CLI
displayed_sidebar: devDocsSidebar
canonicalUrl: https://docs.strapi.io/dev-docs/data-management/export.html
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

The `strapi export` command is used to export data from a local Strapi instance. By default, the `strapi export` command exports data as an encrypted and compressed `tar.gz.enc` file which includes:

- the project configuration,
- entities: all of your content,
- links: relations between your entities,
- assets: files stored in the uploads folder,
- schemas,
- the `metadata.json` file.

The following documentation details the available options to customize your data export. The export command and all of the available options are run using the [Strapi CLI](/dev-docs/cli#strapi-export).

:::caution
* Admin users and API tokens are not exported.
* Media from a 3rd party provider (e.g., Cloudinary or AWS S3) are not included in the export as those files do not exist in the upload folders.

:::

The CLI command consists of the following arguments:

| Option         | Description                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `-f, --file <file>` | Name to use for the exported file (without extensions). |
| `-k, --key <string>` | Provide encryption key in command instead of using the prompt. |
| `--no-encrypt` |  Disables the encryption of the output file. |
| `--no-compress` | Disables gzip compression of output file. |
| `--exclude`    | Exclude data using comma-separated data types. The available types are: `content`, `files`, and `config`.                                    |
| `--only`       | Include only these data. The available types are: `content`, `files`, and `config`.                                                          |
| `--verbose` | Enable verbose logs. |

:::

## Name the export file

Exported data are contained in a `.tar` file that is automatically named using the format `export_YYYYMMDDHHMMSS`. You can optionally name the exported file by passing the `--file` or `-f` option with the `strapi export` command. Do not include a file extension as one will be set automatically depending on options provided.

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
Strong encryption keys are encouraged to protect sensitive data in your project. [OpenSSL](https://www.openssl.org/) is a resource for generating encryption keys. The following example commands generate encryption keys in a terminal:

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
