---
title: Data export-import transfer system - Strapi Developer Docs
description: Import, export, and transfer data using the Strapi CLI
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/export-import.html
---

# Data Export-Import Transfer System <BetaBadge />

:::callout 🚧 Feature under development
The data export-import transfer system in under development. Not all use cases are covered by the initial release. You can provide feedback about desired functionality on the [Strapi feedback website](feedback.strapi.io).
:::

Occasionally you need to move data out of or into a Strapi instance. The data export-import transfer system allows you to efficiently extract data from an existing instance or archive and import that data into a separate instance. Strapi provides CLI-based commands that allow you to export and import data using providers. Common use cases include:

- creating a data backup,
- restoring data from a backup
<!-- transferring data between environments such as staging and production,
 moving assets from one hosting solution to another, such as locally hosted to an S3 bucket. -->

 The following documentation details examples of how to use the `strapi export` and `strapi import` commands.

:::strapi Using the Command Line Interface (CLI)
The `strapi export` CLI command and all of the available options are listed in the [Command Line Interface documentation](/developer-docs/latest/developer-resources/cli/CLI#strapi-export.md).
:::

## Export data using the CLI tool

The `strapi export` command by default exports data as an encrypted and compressed `tar.gz` file. The default export command exports:

- the project configuration,
- entities,
- links,
- assets,
- schemas,
- `metadata.json` file.

### Name the export file

Exported data are contained in a `.tar` file that is automatically named using the format `export_time-date-stamp`. You can optionally name the exported file by passing the `--file` or `-f` option with the `strapi export` command. Do not include a file extension.

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

The default `strapi export` command encrypts your project data using `aes-128-ecb` encryption. To use encryption you need to pass an encryption key using the `-k` or `--key` option or enter an encryption key when prompted. The encryption key is a `string` with no minimum character count.

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

The default `strapi export` command compresses your project data using `gzip` compression.

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

<!-- ### Declare the maximum file size

The default maximum size of each internal backup `jsonl` file is 256MB. To customize the maximum `jsonl` file size, pass the `--max-size-jsonl` option with the `strapi export` command.

#### Example: Set the maximum `jsonl` file size to 100MB
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi export --max-size-jsonl 100
```

</code-block>

<code-block title="NPM">

```bash
npm strapi export --max-size-jsonl 100
```

</code-block>
</code-group> -->

<!-- ### Exclude files -->

## Import data using the CLI tool

To import data into a Strapi instance use the `strapi import` command in the project root directory. Specify the file to be imported using the `-f` or `--file` option. The filename, extension, and path are required.
 
#### Example: Minimum command to import data from a file in the Strapi project root
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz
```

</code-block>

<code-block title="NPM">

```bash
npm strapi import -f export_20221213105643.tar.gz
```

</code-block>
</code-group>

### Provide an encryption key

If you are importing data from an encrypted file the encryption key can be passed with the `strapi import` command by using the `-k` or `--key` option. If you do not pass the encryption key with the `strapi import` command you will be prompted for the encryption key before the import starts.

#### Example: Pass the encryption key with the `strapi import` command
<br/>
<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz --key my-encryption-key
```

</code-block>

<code-block title="NPM">

```bash
npm strapi import -f export_20221213105643.tar.gz --key my-encryption-key
```

</code-block>
</code-group>

<!-- ### Declare a conflict strategy

Currently, the default and only conflict strategy is `restore`, which deletes all of the data in your local Strapi instance and then loads the data from the imported file. You do not need to declare the `restore` value.

### Declare a version strategy

The `--versionStrategy` option specifies how strictly the imported file Strapi version and the local instance Strapi version must match. The available values are:

| value  | description                                                                                           |
|--------|-------------------------------------------------------------------------------------------------------|
| exact  | (Default) Strapi and plugin versions must match between source and destination                        |
| major  | major version must match                                                                              |
| minor  | minor and major version must match                                                                    |
| patch  | patch, minor, and major version must match (for example, rejects 4.1.1 vs 4.1.1-beta)                 |
| ignore | bypass version check                                                                                  |

### Declare a schema strategy

The `--schemaStrategy` option specifies how strictly the schemas must match between the source and destination. The available values are:

| value  | description                                                                                           |
|--------|-------------------------------------------------------------------------------------------------------|
| exact  | (Default) Schemas (content-types) must exactly match between source and destination.                            |
| strict | Allows differences between `private`, `required`, and `configurable` attributes. Schemas must exist and match in all other ways.                                                                            |

#### Example: Customized command to import data

The following code example imports the `export_20221213105643.tar.gz` file located in the instance root directory. It uses the `patch` version strategy and the `strict` schema strategy.

<code-group>
<code-block title="YARN">

```bash
yarn strapi import -f export_20221213105643.tar.gz --versionStrategy patch --schemaStrategy strict
```

</code-block>

<code-block title="NPM">

```bash
npm strapi import -f export_20221213105643.tar.gz --versionStrategy patch --schemaStrategy strict
```

</code-block>
</code-group>

::: -->
