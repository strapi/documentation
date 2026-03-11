---
sidebar_label: 'Cloud fundamentals'
displayed_sidebar: cloudSidebar
slug: /cloud/cloud-fundamentals
sidebar_position: 1
tags:
- Strapi Cloud
- concepts
---

# Strapi Cloud fundamentals

Before going any further into this Strapi Cloud documentation, we recommend you to acknowledge the main concepts below. They will help you to understand how Strapi Cloud works, and ensure a smooth Strapi Cloud experience.

- **Hosting Platform** <br/> Strapi Cloud is a hosting platform that allows to deploy already existing Strapi projects created with Strapi CMS (Content Management System). Strapi Cloud is *not* the SaaS (<ExternalLink to="https://en.wikipedia.org/wiki/Software_as_a_service" text="Software-as-a-Service" />) version of Strapi CMS and should rather be considered as a PaaS (<ExternalLink to="https://en.wikipedia.org/wiki/Platform_as_a_service" text="Platform-as-a-Service" />). Feel free to refer to the [CMS documentation](https://docs.strapi.io/cms/intro) to learn more about Strapi CMS.

- **Strapi Cloud Pricing Plans** <br/> As a Strapi Cloud user you have the choice between 4 plans: Free, Essential, Pro and Scale. Depending on the plan, you have access to different functionalities, support and customization options (see [Pricing page](https://strapi.io/pricing-cloud) for more details). In this Strapi Cloud documentation, the <CloudEssentialBadge />, <CloudProBadge />, and <CloudScaleBadge /> badges can be displayed below a section's title to indicate that the feature is only available starting from the corresponding paid plan. If no badge is shown, the feature is available on the Free plan.

- **Types of Strapi Cloud users** <br/> There can be 2 types of users on a Strapi Cloud project: owners and maintainers. The owner is the one who has created the project and has therefore access to all features and options for the project. Maintainers are users who have been invited to contribute to an already created project by its owner. Maintainers, as documented in the [Collaboration](/cloud/projects/collaboration) page, cannot view and access all features and options from the Strapi Cloud dashboard.

- **Support** <br/> The level of support provided by the Strapi Support team depends on the Strapi Cloud plan you subscribed for. The Free plan does not include access to support. The Essential and Pro plans include Basic support while the Scale plan includes Standard support. Please refer to the [dedicated support article](https://support.strapi.io/support/solutions/articles/67000680833-what-is-supported-by-the-strapi-team#Not-Supported) for all details regarding support levels.

- **API access in Strapi Cloud vs self-hosted** <br/> The REST and GraphQL APIs behave the same on Strapi Cloud and on self-hosted servers. The only differences are the URLs:
    - Base API domain: On Strapi Cloud, your API uses the domain of the environment (e.g. `https://<project>.strapiapp.com/api/...`), or your custom domain if you set one (see [Domains documentation](/cloud/projects/settings#domains)). A self-hosted project would use whatever domain you expose.
    - Media Library URLs: Media fields in REST and GraphQL responses from Strapi Cloud always use the project media domain (e.g. `<project>.media.strapiapp.com`), even when you access the API through a custom domain. Self-hosted projects return URLs from the configured upload provider, so the domain can match your own site or CDN. When you move a project from self-hosted to Strapi Cloud, make sure your frontend reads the absolute URLs returned by the API or accepts the Strapi Cloud media domain.