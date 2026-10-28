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
- Growth <GrowthBadge noTooltip />: Adds Strapi AI, Live Preview, Releases, and Content History.
- Enterprise <EnterpriseBadge noTooltip />: Adds Single Sign-On, Review Workflows, Audit Logs, and Enterprise plugins to the Growth features. Strapi AI is not part of the base plan: it is available as an add-on.

## Self-hosted and Strapi Cloud projects

The CMS plan and the hosting of a project are 2 separate choices. A project without a CMS license key uses the Community plan, whether it is self-hosted or hosted on Strapi Cloud.

- A self-hosted project uses the plan of its CMS license key. Growth and Enterprise license keys are available in the [billing portal](/cms/billing-portal).
- A Strapi Cloud project has a hosting plan (Starter, Pro, or Business) that defines resources such as API requests, asset storage, and backups (see [Cloud usage & billing](/cloud/getting-started/usage-billing)). The hosting plan does not include Growth or Enterprise features: these features require a CMS license key added to the Cloud project (see [Adding a CMS license key](/cloud/projects/settings#adding-cms-license-key)).

## Features by plan

Core features, such as the [admin panel](/cms/features/admin-panel), the [Content Manager](/cms/features/content-manager), and the [Content-Type Builder](/cms/features/content-type-builder), are available on all plans. The following table lists the other features, starting with the features available on all plans and ending with the features that require a plan:

| Feature | Community | Growth | Enterprise |
| --- | --- | --- | --- |
| [Admin tokens](/cms/features/admin-tokens) | ✅ | ✅ | ✅ |
| [API Tokens](/cms/features/api-tokens) | ✅ | ✅ | ✅ |
| [Custom Fields](/cms/features/custom-fields) | ✅ | ✅ | ✅ |
| [Data Management](/cms/features/data-management) | ✅ | ✅ | ✅ |
| [Draft & Publish](/cms/features/draft-and-publish) | ✅ | ✅ | ✅ |
| [Email](/cms/features/email) | ✅ | ✅ | ✅ |
| [Internationalization (i18n)](/cms/features/internationalization) | ✅ | ✅ | ✅ |
| [MCP server](/cms/features/strapi-mcp-server) | ✅ | ✅ | ✅ |
| [Media Library](/cms/features/media-library) | ✅ | ✅ | ✅ |
| [Role-Based Access Control (RBAC)](/cms/features/rbac) | ✅ | ✅ | ✅ |
| [Users & Permissions](/cms/features/users-permissions) | ✅ | ✅ | ✅ |
| [Preview](/cms/features/preview) | ✅ | ✅<br/>adds [Live Preview](/cms/features/preview#live-preview) | ✅<br/>adds [Live Preview](/cms/features/preview#live-preview) |
| [Content History](/cms/features/content-history) | - | 14-day retention | 30-day retention, up to 90 days |
| [Releases](/cms/features/releases) | - | ✅ | ✅ |
| [Strapi AI](/cms/ai/for-content-managers) | - | Strapi-managed, with 1,000 credits per month | Available as an add-on,<br/>with your own AI key through the [Bring your own AI key plugin](/cms/plugins/strapi-ai-enterprise) |
| [Single Sign-On (SSO)](/cms/features/sso) | - | Available as an add-on | ✅ |
| [Audit Logs](/cms/features/audit-logs) | - | - | ✅ |
| [Enterprise plugins](/cms/plugins/installing-enterprise-plugins) | - | - | ✅ |
| [Review Workflows](/cms/features/review-workflows) | - | - | ✅ |

Strapi AI enhances [Internationalization](/cms/features/internationalization#ai-powered-internationalization), the [Media Library](/cms/features/media-library#ai-powered-metadata-generation), and the [Content-Type Builder](/cms/features/content-type-builder#strapi-ai). The Content-Type Builder AI assistant is only available with Strapi-managed AI, on the Growth plan. On the Enterprise plan, all Strapi AI features require the AI add-on.

For prices, support levels, and compliance documents such as the SOC 2 report, see the <ExternalLink to="https://strapi.io/pricing-cms" text="Strapi pricing page"/>. Enterprise plans are available through the <ExternalLink to="https://strapi.io/contact-sales" text="Strapi sales team"/>.
