---
title: Migrating from Strapi v4 to v5
# description: todo
unlisted: true
tags:
- breaking changes
- upgrade tool
- upgrade to Strapi 5
---

import DoNotMigrateYet from '/docs/snippets/_do-not-migrate-to-v5-yet.md'
import TempUpgradeRCtag from '/docs/snippets/temp-upgrade-rc.md'
const detailsStyle = {backgroundColor: 'transparent', border: 'solid 1px #4945ff' }
const summaryStyle = {fontSize: '18px'}

# Upgrading from Strapi v4 to Strapi 5

The latest major version of Strapi is Strapi 5, which is currently provided as a Release Candidate (RC) version, not as a stable version yet.

<DoNotMigrateYet />

The present page is meant to be used as an entry point to guide you through the whole upgrade process from Strapi v4 to Strapi 5, and helps you:

- handle the most [common use cases](#common-use-cases),
- and access [additional resources](#additional-resources) such as the full list of breaking changes and dedicated upgrade resources for specific topics.

## Common use cases

The following questions and their answers should help you cover most common use cases. If your Strapi code is deeply customized or if you have specific needs, you might also need to look at [additional resources](#additional-resources).

<details style={detailsStyle}>
<summary style={summaryStyle}>How can I handle the upgrade and the installation of the latest dependencies? How can I handle the breaking changes in the code and adapt my code to Strapi 5?</summary>

Strapi provides a tool, the [upgrade tool](/dev-docs/upgrade-tool). The upgrade tool is a command line tool with some commands allows to handle the upgrade of the dependencies and the execution of **codemods** <Codemods/>.

The steps to execute slightly differ depending on whether your Strapi application is already running the latest minor and patch version of Strapi v4 or if it is still running on an older version.

<details>
<summary>How to find my current Strapi version number?</summary>

You can find the current version number of your Strapi application:

- either in the admin panel, by going to _Settings > Global Settings > Overview_ and looking at the Strapi version number printed in the Details section:

  <ThemedImage
    alt="Finding your Strapi version number in the admin panel"
    sources={{
      light: '/img/assets/migration/strapi-version-number.png',
      dark: '/img/assets/migration/strapi-version-number_DARK.png'
    }}
  />

- or by running `yarn strapi version` or `npm run strapi version` in the terminal, from the folder where your Strapi project is located.

</details>

The latest version number of Strapi v4 that was released by the Strapi core team can be found on [npm](https://www.npmjs.com/package/@strapi/strapi) or on [GitHub](https://github.com/strapi/strapi/releases).

<Tabs>
<TabItem value="major" label="Already running the latest minor version">

1. Run the upgrade tool with the `major` command to reach Strapi 5.0.0:

    ```sh
    npx @strapi/upgrade major
    ```

   <TempUpgradeRCtag />

    The command will execute:
    * the update and installation of the dependencies of Strapi 5,
    * and the codemods provided to handle the breaking changes that come with Strapi 5.

2. Run the application with `yarn develop` or `npm run develop` to adapt the database to the latest breaking changes.

3. Test the results of the automatic upgrade and check how your application upgraded to Strapi 5 behaves. You might need to use [additional resources](#additional-resources) to have a fully-working Strapi 5 application.

</TabItem>
<TabItem value="minor" label="Running an older minor version">

1. Run the upgrade tool with the `minor` command to reach the latest minor and patch version of Strapi v4:

    ```sh
    npx @strapi/upgrade minor
    ```

   <TempUpgradeRCtag />

2. Run the upgrade tool with the `major` command to reach Strapi 5.0.0:

    ```sh
    npx @strapi/upgrade major
    ```

    The command will execute:
    * the update and installation of the dependencies of Strapi 5,
    * and the codemods provided to handle the breaking changes that come with Strapi 5.

   <TempUpgradeRCtag />

3. Run the application with `yarn develop` or `npm run develop` to adapt the database to the latest breaking changes.

4. Test the results of the automatic upgrade and check how your application upgraded to Strapi 5 behaves. You might need to use [additional resources](#additional-resources) to have a fully-working Strapi 5 application.

</TabItem>
</Tabs>

</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>How can I handle the data migration, ensuring that in Strapi 5 the application will still be working?</summary>
Strapi 5 integrates a data migration script that is run once the application starts for the first time in Strapi 5.
</details>

<details style={detailsStyle}>
<summary style={summaryStyle}>As a Strapi Cloud customer, how can I handle the entire upgrade and deployment of my Strapi 5 application?</summary>

:::danger Warning: Don't push a Strapi 5 project to Strapi Cloud yet
Strapi Cloud is still running on Strapi v4. The following process is provided as an indication of what will happen when Strapi 5 is released as a stable version. Do not try to push your Strapi 5 beta or  Release Candidate (RC) project to Strapi Cloud yet.
:::

1. Update your code locally, automatically with the [upgrade tool](/dev-docs/upgrade-tool) or manually when the fully automatic upgrade is not possible. If you need to manually update your code, be sure to read the [breaking changes list](/dev-docs/migration/v4-to-v5/breaking-changes) and [specific upgrade resources](/dev-docs/migration/v4-to-v5/guides/introduction).
2. Run the `yarn deploy` or `npm run deploy` commands from the [Cloud CLI](https://docs.strapi.io/cloud/cli/cloud-cli).<br/>(⚠️ *This command is currently only available to push Strapi v4 projects to Strapi Cloud. The current link to Cloud CLI documentation points to Strapi v4 stable documentation, not to Strapi 5 RC documentation.*)

Strapi Cloud will deploy the updated code in Strapi 5 and will automatically run the data migration script.

</details>

## Additional resources

The following additional resources will help you upgrade your application and plugins if you have customized your Strapi v4 code in ways that make the automatic upgrade to Strapi 5 not 100% possible:

<CustomDocCardsWrapper>
<CustomDocCard emoji="" title="Breaking changes list" description="Read more about the differences between Strapi v4 and v5 and the resulting breaking changes." link="/dev-docs/migration/v4-to-v5/breaking-changes" />
<CustomDocCard emoji="" title="Specific upgrade resources" description="Handle specific use cases: Plugins migration, helper-plugin deprecation, Entity Service API deprecation." link="/dev-docs/migration/v4-to-v5/guides/introduction" />
</CustomDocCardsWrapper>
