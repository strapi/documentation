---
title: Features and plans
description: See which Strapi CMS features are available on the Community, Growth, and Enterprise plans, for self-hosted and Strapi Cloud projects.
displayed_sidebar: cmsSidebar
tags:
- features
- introduction
- Growth plan
- Enterprise feature
- Strapi Cloud
---

# Features and plans

<Tldr>
Strapi CMS features are available on 3 plans: Community, Growth, and Enterprise. The plan comes from a CMS license key and works the same way on self-hosted and Strapi Cloud projects. The table on this page lists every feature and the plans that include it.
</Tldr>

Strapi CMS comes with 3 plans:

- Community: the free and open-source core of Strapi, under the MIT license.
- <GrowthBadge noTooltip />: adds Strapi AI, Live Preview, Releases, and Content History.
- <EnterpriseBadge noTooltip />: includes everything in Growth, plus Single Sign-On, Review Workflows, Audit Logs, and Enterprise plugins.

In the sidebar, a badge next to a feature shows the plan it requires. Hover over the badge to see details.

## Self-hosted and Strapi Cloud projects

The CMS plan and the hosting of a project are 2 separate choices. A project without a CMS license key uses the Community plan, whether it is self-hosted or hosted on Strapi Cloud.

- A self-hosted project uses the plan of its CMS license key. Growth and Enterprise license keys are available in the [billing portal](/cms/billing-portal#viewing-and-saving-a-cms-license-key).
- A Strapi Cloud project has a hosting plan (Starter, Pro, or Business) that defines resources such as API requests, asset storage, and backups (see [Usage & billing](/cloud/getting-started/usage-billing)). The hosting plan does not include Growth or Enterprise features: these features require a CMS license key added to the Cloud project (see [Adding a CMS license key](/cloud/projects/settings#adding-cms-license-key)).

## Features by plan

Core features, such as the [admin panel](/cms/features/admin-panel), the [Content Manager](/cms/features/content-manager), and the [Content-Type Builder](/cms/features/content-type-builder), are available on all plans. The following table lists the other features:

| Feature | Community | Growth | Enterprise |
| --- | --- | --- | --- |
| [Admin tokens](/cms/features/admin-tokens) | ✅ | ✅ | ✅ |
| [API Tokens](/cms/features/api-tokens) | ✅ | ✅ | ✅ |
| [Audit Logs](/cms/features/audit-logs) | - | - | ✅ |
| [Content History](/cms/features/content-history) | - | 14-day retention | 30-day retention, up to 90 days |
| [Custom Fields](/cms/features/custom-fields) | ✅ | ✅ | ✅ |
| [Data Management](/cms/features/data-management) | ✅ | ✅ | ✅ |
| [Draft & Publish](/cms/features/draft-and-publish) | ✅ | ✅ | ✅ |
| [Email](/cms/features/email) | ✅ | ✅ | ✅ |
| [Enterprise plugins](/cms/plugins/installing-enterprise-plugins) | - | - | ✅ |
| [Internationalization (i18n)](/cms/features/internationalization) | ✅ | ✅ | ✅ |
| [MCP server](/cms/features/strapi-mcp-server) | ✅ | ✅ | ✅ |
| [Media Library](/cms/features/media-library) | ✅ | ✅ | ✅ |
| [Preview](/cms/features/preview) | ✅ | ✅, with Live Preview | ✅, with Live Preview |
| [Releases](/cms/features/releases) | - | ✅ | ✅ |
| [Review Workflows](/cms/features/review-workflows) | - | - | ✅ |
| [Role-Based Access Control (RBAC)](/cms/features/rbac) | ✅ | ✅ | ✅ |
| [Single Sign-On (SSO)](/cms/features/sso) | - | Add-on | ✅ |
| [Strapi AI](/cms/ai/for-content-managers) | - | Strapi-managed, with 1,000 credits per month | With your own AI key, through the [Bring your own AI key plugin](/cms/plugins/byok) |
| [Users & Permissions](/cms/features/users-permissions) | ✅ | ✅ | ✅ |

Strapi AI enhances [Internationalization](/cms/features/internationalization#ai-powered-internationalization), the [Media Library](/cms/features/media-library#ai-powered-metadata-generation), and the [Content-Type Builder](/cms/features/content-type-builder#strapi-ai). The Content-Type Builder AI assistant is only available with Strapi-managed AI, on the Growth plan.

For prices, support levels, and compliance documents such as the SOC 2 report, see the <ExternalLink to="https://strapi.io/pricing-cms" text="Strapi pricing page"/>. Enterprise plans are available through the <ExternalLink to="https://strapi.io/contact-sales" text="Strapi sales team"/>.
