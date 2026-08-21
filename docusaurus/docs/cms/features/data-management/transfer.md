---
title: Data transfer
description: Transfer data using the Strapi CLI
displayed_sidebar: cmsSidebar
canonicalUrl: https://docs.strapi.io/cms/features/data-management/transfer.html
pagination_prev: cms/features/data-management/export
pagination_next: cms/features/draft-and-publish
tags:
- data management system
- data transfer
- strapi transfer
---

# Data transfer

<Tldr>

The `strapi transfer` command streams data between two Strapi instances with identical schemas, transferring content, files, and configuration using transfer tokens for authorization and authentication.

</Tldr>


The `strapi transfer` command is part of the [Data Management feature](/cms/features/data-management) and streams your data from one Strapi instance to another Strapi instance. The `transfer` command uses strict schema matching, meaning your two Strapi instances need to be exact copies of each other except for the contained data. The default `transfer` command transfers your content (entities and relations), files (assets), project configuration, and schemas. The command allows you to transfer data:

- from a local Strapi instance to a remote Strapi instance
- from a remote Strapi instance to a local Strapi instance

The following documentation details the available options to customize your data transfer. The transfer command and all of the available options are run using the [Strapi CLI](/cms/cli#strapi-transfer).

:::caution

* If you are using an SQLite database in the destination instance other database connections will be blocked while the `transfer` operation is running.
* Admin users and API tokens are not transferred.
* The command fails if your project uses websockets or Socket.io. See [Troubleshooting](#troubleshooting).

:::

The CLI command consists of the following arguments:

| Option         | Description                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--to`         | Full URL of the `/admin` endpoint on the destination Strapi instance<br />(e.g. `--to https://my-beautiful-strapi-website/admin`)            |
| `--to-token`   | Transfer token from the Strapi destination instance.                                                                                         |
| `--from`       | Full URL of the `/admin` endpoint of the remote Strapi instance to pull data from (e.g., `--from https://my-beautiful-strapi-website/admin`) |
| `--from-token` | Transfer token from the Strapi source instance.                                                                                              |
| `--force`      | Automatically answer "yes" to all prompts, including potentially destructive requests, and run non-interactively.                            |
| `--exclude`    | Exclude data using comma-separated data types. The available types are: `content`, `files`, `config`, and `media-library` (excludes both upload binaries and upload content type records). |
| `--only`       | Include only these data. The available types are: `content`, `files`, and `config`.                                                          |
| `--exclude-content-types` | Comma-separated list of content-type UIDs to exclude. Both entity records and relation links touching an excluded type are skipped. |
| `--only-content-types` | Comma-separated list of content-type UIDs to include. Only entity records and relation links for the listed types are transferred. |
| `--throttle` | Time in milliseconds to inject an artificial delay between each transferred entity. |
| `--no-checksums` | Disable end-to-end SHA-256 checksum verification for assets. Checksum verification is enabled by default when both the source and destination instances support it. |
| `--verbose` | Enable verbose logs. |

Either `--to` or `--from` is required, and you cannot pass both.

:::tip Tips
* To get familiar with the command before running it against a remote instance, see [Test a data transfer locally](/cms/features/data-management/transfer-locally).
* It might be convenient to store your transfer tokens into [environment variables](/cms/configurations/environment) to avoid copying/pasting. Just ensure that these tokens are not pushed to public repositories.
:::

## Generate a transfer token

:::prerequisites
A salt transfer token should be defined in the [admin panel configuration](/cms/configurations/admin-panel) file.
:::

The `strapi transfer` command requires a transfer token issued by the destination instance. To generate a transfer token in the admin panel use the instructions in the [User Guide](/cms/features/data-management#admin-panel-settings).

Transfer tokens are [managed from the admin panel](/cms/features/data-management#admin-panel-settings), where you can also manage role-based permissions to tokens including `view`, `create`, `read`, `regenerate`, and `delete`.

## Setup and run the data transfer

Initiating a data transfer depends on whether you want to push data to a remote instance or to pull data from the remote:

:::caution
The remote Strapi instance must be running with the `start` command, not the `develop` command.
:::

<Tabs>

<TabItem value="push" label="Push data to remote">

  1. Start the Strapi server for the destination instance.
  2. In a new terminal window, navigate to the root directory of the source instance.
  3. Run the following minimal command to initiate the transfer, ensuring `destinationURL` is the full URL to the admin panel (i.e., the URL includes the `/admin` part):

    <Tabs groupId="yarn-npm">

    <TabItem value="yarn" label="yarn">

    ```bash
    yarn strapi transfer --to destinationURL
    ```

    </TabItem>

    <TabItem value="npm" label="npm">

    ```bash
    npm run strapi transfer -- --to destinationURL
    ```

    </TabItem>

    </Tabs>
  
  4. Add the transfer token when prompted to do so.
  5. Answer **Yes** or **No** to the CLI prompt: "The transfer will delete existing data from the remote Strapi! Are you sure you want to proceed?"

</TabItem>

<TabItem value="pull" label="Pull data from remote">

1. Start the Strapi server for the source instance.
2. In a new terminal window, navigate to the root directory of the destination instance.
  3. Run the following minimal command to initiate the transfer, ensuring `remoteURL` is the full URL to the admin panel (i.e., the URL includes the `/admin` part):

  <Tabs groupId="yarn-npm">

  <TabItem value="yarn" label="yarn">

  ```bash
  yarn strapi transfer --from remoteURL
  ```

  </TabItem>

  <TabItem value="npm" label="npm">

  ```bash
  npm run strapi transfer -- --from remoteURL
  ```

  </TabItem>

  </Tabs>

4. Add the transfer token when prompted to do so.
5. Answer **Yes** or **No** to the CLI prompt: "The transfer will delete all the local Strapi assets and its database. Are you sure you want to proceed?".

</TabItem>
</Tabs>

Once the transfer starts, the command reports live progress in the terminal, including preparation steps, per-stage progress, and timing with an estimated time remaining.

## What a transfer replaces and preserves

<VersionBadge version="5.52.2" tooltip="The preserve-versus-replace behavior described below is clarified and logged by the CLI since Strapi 5.52.2." />

`--only` and `--exclude` narrow the scope of a transfer. Both take a comma-separated string with no spaces between the types: `content`, `files`, and `config`, plus `media-library` for `--exclude` only. Schemas can never be excluded, as schema matching is used for `strapi transfer`.

When you use either option, only the stages you name are affected on the destination:

- **Omitted stages are preserved.** When a stage is not transferred, the destination data for that stage is left untouched.
- **Transferred stages are replaced.** Any stage you include in the transfer fully replaces the destination data for that stage, except for admin types and ignored types such as `plugin::content-releases.release`, which are always preserved.

Stage filtering and content-type filtering are independent and can be combined. Stage filters (`--only` and `--exclude`) select which kinds of data move. Content-type filters (`--only-content-types` and `--exclude-content-types`) narrow which content types move within the content stage.

### Example: refresh content while preserving destination config

To refresh only content from a source instance while keeping the destination instance's configuration:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --to-token my-transfer-token --only content
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --to-token my-transfer-token --only content
```

</TabItem>

</Tabs>

Each preset maps to transfer stages: `content` covers entities and links, meaning content-type rows, including media library database records, and their relations. `files` covers the assets stage, meaning the upload binaries under `public/uploads`. `config` covers the core store and webhooks. Schemas are always transferred, independently of these presets.

:::warning
Media is split across two presets. The `files` preset covers only the binaries, while the media library database records (`plugin::upload.file` and `plugin::upload.folder`) belong to `content`. So `--exclude files` alone only skips the assets stage: the records still transfer, and the destination can end up with records pointing to binaries that were never transferred. To preserve both, use `--exclude media-library`.
:::

| Flags | Transferred | Preserved on the destination |
|-------|-------------|------------------------------|
| Default `strapi transfer` | Content, files, config | Admin and ignored types only |
| `--only content` | Content | Config and upload binaries |
| `--only files` | Files | Content and config |
| `--only config` | Config | Content and files |
| `--only content,files` | Content and files | Config |
| `--exclude content` | Files and config | Content |
| `--exclude files` | Content and config | Upload binaries |
| `--exclude media-library` | Content without upload types, and config | Upload binaries, `plugin::upload.file`, and `plugin::upload.folder` |

### Example: only transfer files

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --only files
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --only files
```

</TabItem>

</Tabs>

### Example: exclude files from transfer

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --exclude files
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --exclude files
```

</TabItem>

</Tabs>

## Filter content types during transfer

<VersionBadge version="5.51.0" />

The `--exclude-content-types` and `--only-content-types` options let you scope a transfer to specific content types. Both options accept a comma-separated list of content-type UIDs (for example, `api::article.article`). Unknown UIDs are validated against the Strapi schema at startup. Both entity records and any relation links touching an excluded type are skipped automatically.

:::warning Warning: Restore behavior
- When you use `--exclude-content-types`, data for the excluded types is **preserved** on the destination: they are not wiped before the transfer.
- When you use `--only-content-types`, the pre-transfer wipe is scoped to only the listed UIDs, leaving all other content on the destination in place.
:::

### Example: exclude specific content types from transfer

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --to-token my-transfer-token \
  --exclude-content-types api::article.article
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --to-token my-transfer-token \
  --exclude-content-types api::article.article
```

</TabItem>

</Tabs>

### Example: transfer only specific content types

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --to-token my-transfer-token \
  --only-content-types api::article.article,api::category.category
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --to-token my-transfer-token \
  --only-content-types api::article.article,api::category.category
```

</TabItem>

</Tabs>

## Bypass all `transfer` command line prompts

When using the `strapi transfer` command, you are required to confirm that the transfer will delete the existing database contents. The `--force` flag allows you to bypass this prompt. This option is useful for implementing `strapi transfer` programmatically. You must pass the `--to-token` option with the transfer token if you use the `--force` option.

:::caution
The `--force` option bypasses all warnings about content deletion. The deletion only covers the stages that are actually transferred: if you filter stages with `--only` or `--exclude`, the omitted stages are preserved. See [What a transfer replaces and preserves](#what-a-transfer-replaces-and-preserves).
:::

### Example: bypass the `transfer` command line prompts with `--force`

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --to-token my-transfer-token --force
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --to-token my-transfer-token --force
```

</TabItem>

</Tabs>

## Tune transfer performance and verification

Two options adjust how a transfer runs rather than what it carries:

- `--no-checksums` disables the end-to-end SHA-256 checksum verification applied to assets. Verification is enabled by default whenever both the source and the destination support it, and it is what guarantees that assets arrive intact, so disable it only when you are troubleshooting.
- `--verbose` prints detailed logs, which is useful when a transfer fails without an obvious cause.

When pulling with `--from`, asset streaming also depends on the `transfer.remote.assetIdleTimeoutMs` server option, which caps how long an asset stream may go without forward progress before the transfer aborts. It defaults to `300000`, meaning 5 minutes. See the [server configuration documentation](/cms/configurations/server).

### Example: disable checksum verification

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn strapi transfer --to https://example.com/admin --to-token my-transfer-token \
  --no-checksums
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm run strapi transfer -- --to https://example.com/admin --to-token my-transfer-token \
  --no-checksums
```

</TabItem>

</Tabs>

## Disable remote data transfer

Remote data transfer is disabled with the `transfer.remote.enabled` option in the [server configuration](/cms/configurations/server) file. Combined with the [RBAC permissions](/cms/features/rbac#configuring-roles-permissions) available in the admin panel, this can help you secure your Strapi application.

```js title="/config/server.js"
module.exports = ({ env }) => ({
  // …
  transfer: {
    remote: {
      enabled: false,
    },
  },
});
```

:::caution
In Strapi v4 this was controlled by the `STRAPI_DISABLE_REMOTE_DATA_TRANSFER` environment variable, which is no longer supported: setting it now logs a warning and has no effect. See [Removed support for some environment options](/cms/migration/v4-to-v5/breaking-changes/removed-support-for-some-env-options).
:::

## Troubleshooting

**A transfer behind an nginx reverse proxy fails.** When nginx proxies requests into a localhost, the transfer can fail if headers are not forwarded. Ensure all the headers are forwarded correctly by changing the configuration file in `/etc/nginx/sites-available/yourdomain` as follows:

```
server {
    listen 80;
    server_name <yourdomain>;
    location / {
        proxy_pass http://localhost:1337;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        include proxy_params;
    }
}
```

**A connection is refused when targeting `localhost`.** Try changing the address to <ExternalLink to="http://127.0.0.1:1337/admin" text="http://127.0.0.1:1337/admin"/>.

**The transfer fails and the project uses websockets.** The `transfer` command fails when websockets or Socket.io are in use. Temporarily disable them, or ensure the websocket server runs on a different port than the Strapi server, or on a specific route within Strapi.

