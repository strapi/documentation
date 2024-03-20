---
title: Usage information
description: We are committed to providing a solution, with Strapi, that exceeds the expectations of the users and community. We are also committed to continuing to develop and make Strapi even better than it is today.
sidebarDepth: 0

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
- Should we focus our efforts on being compatible with Node 16? Maybe our community uses version 16 in greater percentages than the global Node.js community?
- And more...

Without these metrics, we wouldn't be able to make the right choices as we continue to move forward with the roadmap and provide what you, the community and users, are asking for.

## Collected data

The following data is collected:

- Unique project ID (generated with UUID)
- Unique machine ID (generated with [node-machine-id](https://www.npmjs.com/package/node-machine-id))
- Environment state (development, staging, production)
- System information (OS)
- Build configurations

:::caution GDPR
Any identifiable data collected and aggregated is of a non-sensitive nature. We are compliant with the European GDPR recommendations (see our [Privacy Policy](https://strapi.io/privacy)). We do not collect databases configurations, password or custom variables. Any data collected (as above) is secured, encrypted and then anonymized.
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

```jsx
//disable telemetry in a Strapi application

yarn strapi telemetry:disable

```

</TabItem>

<TabItem value="npm" label="npm">

```jsx
//disable telemetry in a Strapi application

npm run strapi telemetry:disable

```

</TabItem>

</Tabs>

Alternatively, the `strapi.telemetryDisabled: true` flag in the project `package.json` file will also disable data collection.

Data collection can later be re-enabled by deleting the flag or setting it to false, or by using the `telemetry:enable` command.

:::note
If you have any questions or concerns regarding data collection, please contact us at the following email address [privacy@strapi.io](mailto:privacy@strapi.io).
:::
