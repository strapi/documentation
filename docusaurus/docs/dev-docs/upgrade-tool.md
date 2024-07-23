---
title: Upgrade tool
description: The Strapi upgrade tool is a CLI command that helps automatically upgrading to a new Strapi version.
displayed_sidebar: devDocsSidebar
pagination_next: dev-docs/migration/v4-to-v5/breaking-changes
sidebar_label: Upgrade tool reference
tags:
- major version
- minor version
- patch version
- semantic versioning
- upgrade tool
- version types
---

import DoNotMigrateYet from '/docs/snippets/_do-not-migrate-to-v5-yet.md'

# Upgrade tool

The upgrade tool assists Strapi users in upgrading their Strapi application dependencies and code to a specific version.

Running the upgrade tool triggers the update of the application dependencies, their installation, and the execution of a series of **codemods** <Codemods/> that automatically edit the application codebase according to the breaking changes introduced up until the targeted version.

The upgrade tool is a Strapi package and can be run from the CLI.

<DoNotMigrateYet />


## Version types

Strapi version numbers respect the [semantic versioning](https://semver.org/) conventions:

<ThemedImage
  alt="Version numbers explained"
  sources={{
    light: '/img/assets/update-migration/version-numbers.png',
    dark: '/img/assets/update-migration/version-numbers_DARK.png',
  }}
/>

- The first number is the **major** version number.
- The second number is the **minor** version number.
- The third number is the **patch** version number.

The upgrade tool allows upgrading to a major, minor, or patch version.

What the upgrade tool will do depends on the latest existing version and the command you run. For instance, if the latest Strapi v4 version is v4.16.6:

| My Strapi application is currently on… | If I run… | My Strapi application will be upgraded to … |
|----|----|----|
| v4.14.1 | `npx @strapi/upgrade patch` | v4.14.6<br/><br/>(because v4.14.6 is the latest patch version for the v4.14 minor version) |
| v4.14.1 | `npx @strapi/upgrade minor` | v4.16.2 |
| v4.14.1 | `npx @strapi/upgrade major` | Nothing.<br/><br/>I first need to run `npx @strapi/upgrade minor` to upgrade to v4.16.2. |
| v4.16.2 | `npx @strapi/upgrade major` | v5.0.0  |

## Upgrade to a major version

Run the upgrade tool with the `major` parameter to upgrade the project to the next major version of Strapi:

```bash
npx @strapi/upgrade major
```

During the upgrade process, the application dependencies are updated and installed, and the related codemods are executed.

:::note
If your application is not already running the latest minor and patch version in the current major, the `major` upgrade is prevented, and you will first need to upgrade to the latest [minor.patch](#upgrade-to-a-minor-version) version in the current major version. This means that moving from v4.14.4 to v5.0.0 is a 2-step process because the latest v4 version is v4.16.2.
:::

## Upgrade to a minor version

Run the upgrade tool with the `minor` parameter to upgrade the project to the latest minor and patch version of Strapi:

```bash
npx @strapi/upgrade minor
```

During the upgrade process, the project dependencies are updated and installed, and the related codemods are executed (if any).

## Upgrade to a patch version

Run the upgrade tool with the `patch` parameter to upgrade the project to the latest patch version in the current minor and major version of Strapi:

```bash
npx @strapi/upgrade patch
```

During the upgrade process, the project dependencies are updated and installed, and the related codemods are executed (if any).

## Run codemods only

Run the upgrade tool with the `codemods` parameter to execute a utility that allows selecting the codemods to be executed. With this command, only the codemods are run, the dependencies are not updated nor installed.

To view a list of the available codemods, use the `ls` command:

```bash
npx @strapi/upgrade codemods ls
```

To select from a list of available codemods and run them, use the `run` command:

```bash
npx @strapi/upgrade codemods run
```

To run only a specific codemod, use `run` followed by a UID found from the `ls` command:

```bash
npx @strapi/upgrade codemods run 5.0.0-strapi-codemod-uid
```

## Options

The `npx @strapi/upgrade [major|minor|patch]` commands can accept the following options:

| Option                                                                                  | Description                                                                     | Default  |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------|----------|
| [`-n, --dry`](#simulate-the-upgrade-without-updating-any-files-dry-run)                 | [Simulate](#simulate-the-upgrade-without-updating-any-files-dry-run) the upgrade without updating any files | false    |
| [`-d, --debug`](#get-detailed-debugging-information)                                    | Get [more logs](#get-detailed-debugging-information) in debug mode              | false    |
| [`-s, --silent`](#execute-the-upgrade-silently)                                         | [Don't log anything](#execute-the-upgrade-silently)                             | false    |
| [`-p, --project-path <project-path>`](#select-a-path-for-the-strapi-application-folder) | [Path](#select-a-path-for-the-strapi-application-folder) to the Strapi project  | -        |
| [`-y, --yes`](#answer-yes-to-every-prompt)                                              | Automatically [answer "yes"](#answer-yes-to-every-prompt) to every prompt       | false    |

The following options can be run either with the `npx @strapi/upgrade` command alone or with the `npx @strapi/upgrade [major|minor|patch]` commands:

| Option                                                                   | Description                                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [`-V, --version`](#get-the-current-version)                              | Output the [version number](#get-the-current-version)            |
| [`-h, --help`](#get-help)                                                | [Print](#get-help) command line options                          |

### Simulate the upgrade without updating any files (dry run)

When passing the `-n` or `--dry` option, the codemods are executed without actually editing the files. The package.json will not be modified, and the dependencies will not be re-installed. Using this option allows simulating the upgrade of the codebase, checking the outcomes without applying any changes:

Examples:

```bash
npx @strapi/upgrade major --dry
npx @strapi/upgrade minor --dry
npx @strapi/upgrade patch --dry
```

### Select a path for the Strapi application folder

When passing the `-p` or `--project-path` option followed by a valid path you can specify in which folder the Strapi application is located.

Example:

```bash
npx @strapi/upgrade major -p /path/to/the/Strapi/application/folder
```

### Get the current version

When passing the `--version` option (or its `-V` shorthand), the current version of the upgrade tool is logged.

Example:

```sh
$ npx @strapi/upgrade -V
4.15.1
```

### Get detailed debugging information

When passing the `--debug` option (or its `-d` shorthand), the upgrade tool provides more detailed logs while running:

```bash
npx @strapi/upgrade --debug
```

### Execute the upgrade silently

When passing the `--silent` option (or its `-s` shorthand), the tool executes the upgrade without providing any log:

```bash
npx @strapi/upgrade --silent
```

### Answer yes to every prompt

When passing the `--yes` option (or its `-y` shorthand), the tool automatically answers "yes" to every prompt:

```bash
npx @strapi/upgrade --yes`
```

### Get help

When passing the `--help` option (or its `-h` shorthand), help information is displayed, listing the available options:

Examples:

<Tabs>
<TabItem value="upgrade" label="General help for the upgrade tool">

```sh
$ npx @strapi/upgrade -h
Usage: upgrade <command> [options]

Options:
 -V, --version    output the version number
 -h, --help       Print command line options

Commands:
 major [options]  Upgrade to the next available major version of Strapi
 minor [options]  Upgrade to ...
 patch [options]  Upgrade to ...
 help [command]   Print options for a specific command

```

</TabItem>

<TabItem value="major" label="Specific help for upgrade major">

```sh
$ npx @strapi/upgrade major -h
Usage: upgrade major [options]

Upgrade to the next available major version of Strapi

Options:
  -p, --project-path <project-path>  Path to the Strapi project
  -n, --dry                          Simulate the upgrade without updating any files (default: false)
  -d, --debug                        Get more logs in debug mode (default: false)
  -s, --silent                       Don't log anything (default: false)
  -h, --help                         Display help for command
  -y, --yes                          Automatically answer yes to every prompt
```

</TabItem>
</Tabs>
