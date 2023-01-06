---
title: Data Management System - Strapi Developer Docs
description: Import, export, and transfer data using the Strapi CLI
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/export-import.html
---

# Data Management System <BetaBadge />

:::callout 🚧 Feature under development
The data management system is under development. Not all use cases are covered by the initial release. You can provide feedback about desired functionality on the [Strapi feedback website](https://feedback.strapi.io).
:::

Occasionally you need to move data out of or into a Strapi instance. The data management system allows you to efficiently extract data from an existing instance or archive and import that data into a separate instance. Strapi provides CLI-based commands that allow you to export and import data. Common use cases include:

- creating a data backup,
- restoring data from a backup.

 The following documentation details examples of how to use the `strapi export` and `strapi import` commands.

:::strapi Using the Command Line Interface (CLI)
The `strapi export` and `strapi import` CLI commands with all of the available options are listed in the [Command Line Interface documentation](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-export).
:::

## Export data using the CLI tool

The `strapi export` command by default exports data as an encrypted and compressed `tar.gz` file. The default export command exports:

- the project configuration,
- entities: all of your content,
- links: relations between your entities,
- assets: files stored in the uploads folder,
- schemas,
- the `metadata.json` file.

:::caution
Admin users and API tokens are not exported.
:::

### Name the export file

Exported data are contained in a `.tar` file that is automatically named using the format `export_YYYYMMDDHHMMSS`. You can optionally name the exported file by passing the `--file` or `-f` option with the `strapi export` command. Do not include a file extension.

#### Example: Export data with a custom filename
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --file my-strapi-export
```

</code-block>

<code-block title="NPM">

```bash
npm strapi export  --file my-strapi-export
```

</code-block>
</code-group>

### Configure data encryption

The default `strapi export` command encrypts your project data using `aes-128-ecb` encryption and adds the file extension `.enc`. To use encryption you need to pass an encryption key using the `-k` or `--key` option or enter an encryption key when prompted. The encryption key is a `string` with no minimum character count.

:::tip Encryption keys
Strong encryption keys are encouraged to protect sensitive data in your project. [OpenSSL](https://www.openssl.org/) is a resource for generating encryption keys.
:::

To disable encryption, pass the `--no-encrypt` option with the `strapi export` command.

#### Example: Export data without encryption

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --no-encrypt
```

</code-block>

<code-block title="NPM">

```bash
npm strapi export --no-encrypt
```

</code-block>
</code-group>

#### Example: Export data with the encryption `--key` option

<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --key my-encryption-key
```

</code-block>

<code-block title="NPM">

```bash
npm strapi export --key my-encryption-key
```

</code-block>
</code-group>

### Disable data compression

The default `strapi export` command compresses your project data using `gzip` compression and adds the `.gz` file extension.

To disable compression, pass the `--no-compress` option with the `strapi export` command.

#### Example: Export data without compression
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --no-compress
```

</code-block>

<code-block title="NPM">

```bash
npm strapi export --no-compress
```

</code-block>
</code-group>

## Import data using the CLI tool

:::warning
`strapi import` will delete all of the existing data prior to importing the backup file. Restored data does not include the `users` table, which means that `createdBy` and `updatedBy` are empty in a restored instance.  
:::

To import data into a Strapi instance use the `strapi import` command in the project root directory. Specify the file to be imported using the `-f` or `--file` option. The filename, extension, and path are required. If the file is encrypted, you will be prompted for the encryption key before the import starts.
 
#### Example: Minimum command to import data from a file in the Strapi project root
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz.enc
```

</code-block>

<code-block title="NPM">

```bash
npm strapi import -f export_20221213105643.tar.gz.enc
```

</code-block>
</code-group>

### Provide an encryption key

If you are importing data from an encrypted file the encryption key can be passed with the `strapi import` command by using the `-k` or `--key` option.

#### Example: Pass the encryption key with the `strapi import` command
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz.enc --key my-encryption-key
```

</code-block>

<code-block title="NPM">

```bash
npm strapi import -f export_20221213105643.tar.gz.enc --key my-encryption-key
```

</code-block>
</code-group>
