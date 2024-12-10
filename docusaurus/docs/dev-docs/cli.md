---
title: Command Line Interface
displayed_sidebar: devDocsSidebar
description: Strapi comes with a full featured Command Line Interface (CLI) which lets you scaffold and manage your project in seconds.
tags:
  - Command Line Interface (CLI)
  - strapi develop
  - strapi start
  - strapi build
  - strapi export
  - strapi import
  - strapi transfer
  - strapi report
---

# Command Line Interface (CLI)

Strapi comes with a full featured Command Line Interface (CLI) which lets you scaffold and manage your project in seconds. The CLI works with both the `yarn` and `npm` package managers.

:::caution
Interactive commands such as `strapi admin:create-user` don't display prompts with `npm`. A fix for the `npm` package manager is anticipated by March 2023. In the meantime, consider using the `yarn` package manager.
:::

:::note
It is recommended to install Strapi locally only, which requires prefixing all of the following `strapi` commands with the package manager used for the project setup (e.g `npm run strapi help` or `yarn strapi help`) or a dedicated node package executor (e.g. `npx strapi help`).

To pass options with `npm` use the syntax: `npm run strapi <command> -- --<option>`.

To pass options with `yarn` use the syntax: `yarn strapi <command> --<option>`
:::

<details>
<summary>ℹ️ Strapi v4 CLI commands removed from Strapi 5:</summary>

The `strapi install`, `strapi uninstall`, `strapi new`, and `strapi watch-admin` commands from Strapi v4 have been removed in Strapi 5:

| Strapi v4 command         | Strapi 5 equivalent                                                                                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strapi install [plugin]` | Use the npx command corresponding to the plugin (found on the Marketplace, see [User Guide](/user-docs/plugins/installing-plugins-via-marketplace))                                                |
| `strapi new`              | Use the equivalent yarn or npx command to create a new Strapi project (see [CLI installation guide](/dev-docs/installation/cli))                                                                   |
| `strapi watch-admin`      | `yarn develop` or `npm run develop` always starts the Strapi server in "watch-admin" mode. To disable this in Strapi 5, run `yarn develop --no-watch-admin` or `npm run develop --no-watch-admin`. |

</details>

## strapi develop

**Alias**: `dev`

Start a Strapi application with auto-reloading enabled.

Strapi modifies/creates files at runtime and needs to restart when new files are created. To achieve this, `strapi develop` adds a file watcher and restarts the application when necessary.

Strapi also adds middlewares to support HMR (Hot Module Replacement) for the administration panel. This allows you to customize the administration panel without having to restart the application or run a separate server.

```shell
strapi develop
options: [--no-build |--no-watch-admin |--browser |--debug |--silent]
```

- **strapi develop --open**<br/>
  Starts your application with auto-reloading enabled & open your default browser with the administration panel running.
- **strapi develop --no-watch-admin**<br/>
  Prevents the server from auto-reload when changes are made to the admin panel code.
- [DEPRECATED] **strapi develop --no-build**<br/>
  Starts your application with the auto-reloading enabled and skip the administration panel build process
- [DEPRECATED] **strapi develop --watch-admin**<br/>
  Starts your application with the auto-reloading enabled and the front-end development server. It allows you to customize the administration panel.
- [DEPRECATED] **strapi develop --watch-admin --browser 'google chrome'**<br/>
  Starts your application with the auto-reloading enabled and the front-end development server. It allows you to customize the administration panel. Provide a browser name to use instead of the default one, `false` means stop opening the browser.

:::warning
You should never use this command to run a Strapi application in production.
:::

## strapi start

Start a Strapi application with auto-reloading disabled.

This command is to run a Strapi application without restarts and file writes, primarily for use in production.
Certain features such as the Content-type Builder are disabled in the `strapi start` mode because they require application restarts. The `start` command can be prefaced with [environment variables](/dev-docs/configurations/environment#strapi) to customize the application start.

## strapi build

Builds your admin panel.

```bash
strapi build
```

| Option              | Type | Description                                              |
| ------------------- | :--: | -------------------------------------------------------- |
| `-d, --debug`       |  -   | Enable debugging mode with verbose logs (default: false) |
| `--minify`          |  -   | Minify the output (default: true)                        |
| `--no-optimization` |  -   | [DEPRECATED]: use minify instead                         |
| `--silent`          |  -   | Don't log anything (default: false)                      |
| `--sourcemaps`      |  -   | Produce sourcemaps (default: false)                      |
| `--stats`           |  -   | Print build statistics to the console (default: false)   |

## strapi login

Logs in to Strapi Cloud (see [Cloud CLI](/cloud/cli/cloud-cli#strapi-login) documentation).

## strapi logout

Logs out from Strapi Cloud (see [Cloud CLI](/cloud/cli/cloud-cli#strapi-logout) documentation).

## strapi deploy

Deploys to Strapi Cloud (see [Cloud CLI](/cloud/cli/cloud-cli#strapi-deploy) documentation).

## strapi export

[Exports your project data](/dev-docs/data-management). The default settings create a `.tar` file, compressed using `gzip` and encrypted using `aes-128-ecb`.

```bash
strapi export
```

The exported file is automatically named using the format `export_YYYYMMDDHHMMSS` with the current date and timestamp. Alternately, you can specify the filename using the `-f` or `--file` flag. The following table provides all of the available options as command line flags:

| Option              |  Type  | Description                                                                                                                |
| ------------------- | :----: | -------------------------------------------------------------------------------------------------------------------------- |
| `‑‑no‑encrypt`      |   -    | Disables file encryption and disables the `key` option.                                                                    |
| `‑‑no‑compress`     |   -    | Disables file compression.                                                                                                 |
| `-k`, <br/>`--key`  | string | Passes the encryption key as part of the `export` command. <br/> The `--key` option can't be combined with `--no-encrypt`. |
| `-f`, <br/>`--file` | string | Specifies the export filename. Do not include a file extension.                                                            |
| `--exclude`         | string | Exclude data using comma-separated data types. The available types are: `content`, `files`, and `config`.                  |
| `--only`            | string | Include only these data. The available types are: `content`, `files`, and `config`.                                        |
| `-h`, <br/>`--help` |   -    | Displays help for the `strapi export` command.                                                                             |

**Examples**

```bash title="Examples of strapi export:"
# export your data with the default options and the filename myData, which results in a file named myData.tar.gz.enc.
strapi export -f myData

# export your data without encryption.
strapi export --no-encrypt
```

## strapi import

[Imports data](/dev-docs/data-management) into your project. The imported data must originate from another Strapi application. You must pass the `--file` option to specify the filename and location for the import action.

```bash
strapi import
```

| Option         | Type   | Description                                                               |
| -------------- | ------ | ------------------------------------------------------------------------- |
| `-k,` `--key`  | string | Provide the encryption key in the command instead of a subsequent prompt. |
| `-f`, `--file` | string | Path and filename with extension for the data to be imported.             |
| `-h`, `--help` | -      | Display the `strapi import` help commands.                                |

**Examples**

```bash title="Example of strapi import:"

# import your data with the default parameters and pass an encryption key:
strapi import -f your-filepath-and-filename --key my-key
```

## strapi transfer

[Transfers data](/dev-docs/data-management/transfer) between 2 Strapi instances. This command is primarily intended for use between a local instance and a remote instance or 2 remote instances. The `transfer` command requires a Transfer token, which is generated in the destination instance Admin panel. See the [User Guide](/user-docs/settings/transfer-tokens) for detailed documentation on creating Transfer tokens.

:::caution
The destination Strapi instance should be running with the `start` command and not the `develop` command.
:::

| Option                       | Description                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--to [destinationURL]`      | Full URL of the `/admin` endpoint on the destination Strapi instance<br />(e.g. `--to https://my-beautiful-strapi-website/admin`)                 |
| `--to-token [transferToken]` | Transfer token for the remote Strapi destination                                                                                                  |
| `--from [sourceURL]`         | Full URL of the `/admin` endpoint of the remote Strapi instance to pull data from<br />(e.g., `--from https://my-beautiful-strapi-website/admin`) |
| `‑‑from‑token`               | Transfer token from the Strapi source instance.                                                                                                   |
| `--force`                    | Automatically answer "yes" to all prompts, including potentially destructive requests, and run non-interactively.                                 |
| `--exclude`                  | Exclude data using comma-separated data types. The available types are: `content`, `files`, and `config`.                                         |
| `--only`                     | Include only these data. The available types are: `content`, `files`, and `config`.                                                               |
| `-h`, `--help`               | Displays the commands for `strapi transfer`.                                                                                                      |

:::caution
Either `--to` or `--from` is required, but it's not currently allowed to enter both or neither.
:::

**Example**

```bash
strapi transfer --to http://example.com/admin --to-token my-transfer-token
```

## strapi report

Prints out debug information useful for debugging and required when reporting an issue.

| Option                 | Description                   |
| ---------------------- | ----------------------------- |
| `-u`, `--uuid`         | Includes the project UUID     |
| `-d`, `--dependencies` | Includes project dependencies |
| `--all`                | Logs all the data             |

**Examples**

To include the project UUID and dependencies in the output:

```bash
strapi report --uuid --dependencies
```

To log everything, use the `--all` option:

```bash
strapi report --all
```

## strapi configuration:dump

**Alias**: `config:dump`

Dumps configurations to a file or stdout to help you migrate to production.

The dump format will be a JSON array.

```bash title="strapi configuration:dump"

Options:
  -f, --file <file>  Output file, default output is stdout
  -p, --pretty       Format the output JSON with indentation and line breaks (default: false)
```

**Examples**

- `strapi configuration:dump -f dump.json`
- `strapi config:dump --file dump.json`
- `strapi config:dump > dump.json`

All these examples are equivalent.

:::caution
When configuring your application you often enter credentials for third party services (e.g authentication providers). Be aware that those credentials will also be dumped into the output of this command.
In case of doubt, you should avoid committing the dump file into a versioning system. Here are some methods you can explore:

- Copy the file directly to the environment you want and run the restore command there.
- Put the file in a secure location and download it at deploy time with the right credentials.
- Encrypt the file before committing and decrypt it when running the restore command.

:::

## strapi configuration:restore

**Alias**: `config:restore`

Restores a configuration dump into your application.

The input format must be a JSON array.

```bash
strapi configuration:restore

Options:
  -f, --file <file>          Input file, default input is stdin
  -s, --strategy <strategy>  Strategy name, one of: "replace", "merge", "keep". Defaults to: "replace"
```

**Examples**

- `strapi configuration:restore -f dump.json`
- `strapi config:restore --file dump.json -s replace`
- `cat dump.json | strapi config:restore`
- `strapi config:restore < dump.json`

All these examples are equivalent.

**Strategies**

When running the restore command, you can choose from three different strategies:

- **replace**: Will create missing keys and replace existing ones.
- **merge**: Will create missing keys and merge existing keys with their new value.
- **keep**: Will create missing keys and keep existing keys as is.

## strapi admin:create-user

**Alias** `admin:create`

Creates an administrator.
Administrator's first name, last name, email, and password can be:

- passed as options
- or set interactively if you call the command without passing any option.

**Example**

```bash

strapi admin:create-user --firstname=Kai --lastname=Doe --email=chef@strapi.io --password=Gourmet1234
```

**Options**

| Option          | Type   | Description                        | Required |
| --------------- | ------ | ---------------------------------- | -------- |
| -f, --firstname | string | The administrator's first name     | Yes      |
| -l, --lastname  | string | The administrator's last name      | No       |
| -e, --email     | string | The administrator's email          | Yes      |
| -p, --password  | string | New password for the administrator | No       |
| -h, --help      |        | display help for command           |          |

## strapi admin:reset-user-password

**Alias** `admin:reset-password`

Reset an admin user's password.
You can pass the email and new password as options or set them interactively if you call the command without passing the options.

**Example**

```bash

strapi admin:reset-user-password --email=chef@strapi.io --password=Gourmet1234
```

**Options**

| Option         | Type   | Description               |
| -------------- | ------ | ------------------------- |
| -e, --email    | string | The user email            |
| -p, --password | string | New password for the user |
| -h, --help     |        | display help for command  |

## strapi generate

Run a fully interactive CLI to generate APIs, [controllers](/dev-docs/backend-customization/controllers), [content-types](/dev-docs/backend-customization/models), [plugins](/dev-docs/plugins/development/create-a-plugin), [policies](/dev-docs/backend-customization/policies), [middlewares](/dev-docs/backend-customization/middlewares) and [services](/dev-docs/backend-customization/services), and [migrations](/dev-docs/database-migrations).

```bash
strapi generate
```

## strapi templates:generate

Create a template from the current Strapi project.

```bash
strapi templates:generate <path>
```

- **strapi templates:generate &#60;path&#62;**<br/>
  Generates a Strapi template at `<path>`

  Example: `strapi templates:generate ../strapi-template-name` will copy the required files and folders to a `template` directory inside `../strapi-template-name`

## strapi ts:generate-types {#ts-generate}

Generate [TypeScript](/dev-docs/typescript) typings for the project schemas.

```bash
strapi ts:generate-types
```

- **strapi ts:generate-types --debug**<br />
  Generate typings with the debug mode enabled, displaying a detailed table of the generated schemas.
- **strapi ts:generate-types --silent** or **strapi ts:generate-types -s**<br/>
  Generate typings with the silent mode enabled, completely removing all the logs in the terminal. Cannot be combined with `debug`
- **strapi ts:generate-types --out-dir &#60;path&#62;** or **strapi ts:generate-types -o &#60;path&#62;**<br/>
  Generate typings specifying the output directory in which the file will be created.

:::caution
Strapi requires the project types to be generated in the `types` directory for them to work. The `--out-dir` option should not be used for most cases. However, it can be useful for cases such as generating a second copy to compare the difference between your existing and updated types after changing your content structure.
:::

## strapi routes:list

Display a list of all the available [routes](/dev-docs/backend-customization/routes).

```bash
strapi routes:list
```

## strapi policies:list

Display a list of all the registered [policies](/dev-docs/backend-customization/policies).

```bash
strapi policies:list
```

## strapi middlewares:list

Display a list of all the registered [middlewares](/dev-docs/backend-customization/middlewares).

```bash
strapi middlewares:list
```

## strapi content-types:list

Display a list of all the existing [content-types](/dev-docs/backend-customization/models).

```bash
strapi content-types:list
```

## strapi hooks:list

Display a list of all the available hooks.

```bash
strapi hooks:list
```

## strapi controllers:list

Display a list of all the registered [controllers](/dev-docs/backend-customization/controllers).

```bash
strapi controllers:list
```

## strapi services:list

Display a list of all the registered [services](/dev-docs/backend-customization/services).

```bash
strapi services:list
```

## strapi telemetry:disable

Disable data collection for the project (see [Usage Information](/dev-docs/usage-information)).

```bash
strapi telemetry:disable
```

## strapi telemetry:enable

Re-enable data collection for the project after it was disabled (see [Usage Information](/dev-docs/usage-information)).

```bash
strapi telemetry:enable
```

## strapi console

Start the server and eval commands in your application in real time.

```bash
strapi console
```

## strapi version

Print the currently installed Strapi version.
It will output the current globally installed version if this command is strapi is installed globally, or the current version of Strapi within a Strapi project if the command is run from a given folder containing a Strapi project.

```bash
strapi version
```

## strapi help

List CLI commands.

```bash
strapi help
```
