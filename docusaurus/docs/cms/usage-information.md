---
title: Usage information
description: We are committed to providing a solution, with Strapi, that exceeds the expectations of the users and community. We are also committed to continuing to develop and make Strapi even better than it is today.
sidebarDepth: 0
tags:
- collected data
- telemetry
- GDPR
- UUID
---

# Collected Usage Information

We are committed to providing a solution, with Strapi, that exceeds the expectations of the users and community. We are also committed to continuing to develop and make Strapi even better than it is today. To that end, Strapi contains a feature in which non-sensitive data is collected. This data is collectively aggregated for all our users, which when taken together give us a better global understanding of how users are interacting and using Strapi. We will never share the data collected in any way that would identify our Customers or their users; if shared, this data will always be anonymous.

## Context

The number of developers using Strapi is growing significantly. As mentioned earlier, we are committed to providing the best experience to our users. We will always continue to do hands-on UI/UX testing, surveys, issue tracking, roadmap votes, etc... and otherwise talk with the Strapi Community while striving to understand and deliver what is being asked for and what is needed, by any means available.

However, these above actions alone are often insufficient to maintain an overall picture of some aspects of the global usage of Strapi and its features. Globally aggregated data helps us answer and make choices around questions like these:

- Are our users using a particular feature or not? For those who are using it, what do they use it for? Is it activated and used alongside another plugin? Which specific plugin? Or something else, like, only in development/production?
- How long does setting up a project take? If the global install time increases, does it mean that users are encountering issues or the process is simply too complicated?
- What type of errors our users are facing?
- What are the most used plugins?
- And more...

Without these metrics, we wouldn't be able to make the right choices as we continue to move forward with the roadmap and provide what you, the community and users, are asking for.

## Collected data

The following data is collected:

- Unique project ID (generated with UUID)
- Unique machine ID (generated with <ExternalLink to="https://www.npmjs.com/package/node-machine-id" text="node-machine-id"/>)
- Environment state (development, staging, production)
- System information (OS)
- Build configurations

:::caution GDPR
Any identifiable data collected and aggregated is of a non-sensitive nature. We are compliant with the European GDPR recommendations (see our <ExternalLink to="https://strapi.io/privacy" text="Privacy Policy"/>). We do not collect databases configurations, password or custom variables. Any data collected (as above) is secured, encrypted and then anonymized.
:::

:::note
If you check the box "Keep me updated about new features & upcoming improvements (by doing this, you accept the terms and the privacy policy)" on the first registration screen, your email address, first name, and role in the company will be sent to our marketing team.

These data are used for marketing-related purposes only (e.g., the Strapi newsletter) and are not sent to Strapi's telemetry system. This collected usage information is opt-out by default: the data aren't sent if you don't check the box.
:::

### Opt-out

:::caution
Strapi previously recommended disabling data collection by removing the `uuid` property in the `package.json` file located in the project root. While this method will still work it is discouraged since the `uuid` might be required for certain project functionality and adding a `uuid` at a later date would re-enable data collection without informing the user.
:::

The default data collection feature can be disabled using the following CLI command:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```sh
yarn strapi telemetry:disable
```

</TabItem>

<TabItem value="npm" label="NPM">

```sh
npm run strapi telemetry:disable
```

</TabItem>

</Tabs>

Alternatively, the `strapi.telemetryDisabled: true` flag in the project `package.json` file will also disable data collection.

Data collection can later be re-enabled by deleting the flag or setting it to false, or by using the `telemetry:enable` command.

:::note
If you have any questions or concerns regarding data collection, please contact us at the following email address [privacy@strapi.io](mailto:privacy@strapi.io).
:::

## Search analytics for docs.strapi.io

To improve our documentation, the public website at `docs.strapi.io` collects anonymous search usage metrics using Meilisearch Cloud. These metrics help us understand how the search performs and where we can make it better:

- Total searches
- Total users (estimated)
- Most searched keywords
- Searches without results

To make the “Total users” metric more accurate while preserving privacy, the site creates a pseudonymous identifier and stores it in the browser’s localStorage under the `msUserId` key. This identifier:

- Is randomly generated and contains no personal data
- Rotates monthly on first visit of each new month (calendar month, UTC)
- Is sent only with documentation search requests as the `X-MS-USER-ID` header to Meilisearch Cloud
- Is not used for any other purpose and is not shared with third parties beyond Meilisearch processing the search

Respecting privacy choices:

- If the browser’s Do Not Track setting is enabled, the site does not create or send this identifier
- You can remove the identifier at any time by clearing the `msUserId` entry from your browser’s localStorage for `docs.strapi.io`

Notes:

- We currently do not send click-through or conversion events to Meilisearch. Only the metrics listed above are collected.
