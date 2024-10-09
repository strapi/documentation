---
title: User Guide fundamentals
displayed_sidebar: userDocsSidebar
description: Here are some concepts to keep in mind
tags:
- concepts
- environment
- Strapi version
- license 
- Strapi Cloud plan
- future flag
- roles and permissions
- admin panel
---

Before going any further into this user guide, we recommend you to acknowledge the main concepts below. They will help you to understand how Strapi works, and ensure a smooth Strapi experience.

- **Development, Staging or Production Environment** <br/> When you start working on your application, it is in a development environment, which is the status for the content structure and application configuration. After deploying your application, it is in production or staging environment. This status change impacts how you can use your Strapi application, as some features are only available in development environment, such as the Content-type Builder. In this user guide the availability or not of a feature, depending on the application status, is always mentioned in the feature's introduction.

- **Versions** <br/> Strapi is constantly evolving and growing. This implies that new releases are quite frequent, to improve what is already available but also to add new features to Strapi. For every new Strapi version, we communicate through our main channels and by sending notifications both on your terminal (when launching your Strapi application), and on your application's admin panel. We always recommend to use the latest version. However, we always keep live both the documentation of the current Strapi version, and the documentation of the previous major version — the latter being officially and actively maintained for up to 12 months after the release of the newest Strapi version.

- **License and Pricing Plans** <br/> As a Strapi user you have the choice between using the Community Edition, which is entirely free, or the [Enterprise Edition](https://strapi.io/pricing-self-hosted). In this user guide, if a feature is only available for the Enterprise Edition, an <EnterpriseBadge /> badge is displayed beside the section's title. Strapi can also be hosted on Strapi Cloud by subscribing to a tier that meets the functionality, support, and customization options specified on [Strapi Cloud](https://strapi.io/pricing-cloud). In this user guide, the <CloudDevBadge />, <CloudProBadge />, and <CloudTeamBadge /> badges can be displayed beside a section's title to indicate the feature is available on the tier.

- **Future flags** <br/> Some incoming Strapi features are not yet ready to be shipped to all users, but Strapi still offers community users the opportunity to provide early feedback on these new features or changes. This feedback is invaluable in enhancing the feature before the final release. Such experimental features are indicated by a <FeatureFlagBadge /> badge throughout the documentation and enabling these features requires enabling the corresponding future flags (see [Developer Docs](/dev-docs/configurations/features#enabling-a-future-flag)).

- **Roles and Permissions** <br/> Some features of the admin panel, as well as the content managed with Strapi itself, are ruled by a system of permissions. From your Strapi admin panel, you have the possibility to define, at a detailed level, the roles and permissions of all administrators and end users. In this user guide, all features and possible options are documented. It is however possible, depending on your role and permissions, that you may not be able to access all these features and options. In that case, please refer to the main Super Admin of your Strapi application.

With all this in mind, you should be ready to start your Strapi experience!
