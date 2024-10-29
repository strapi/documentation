---
sidebar_label: 'Usage & Billing'
displayed_sidebar: cloudSidebar
sidebar_position: 3
tags:
- audit logs
- billing details
- overages
- project suspension
- seats management
- Strapi Cloud
---

# Information on billing & usage

This page contains general information related to the usage and billing of your Strapi Cloud account and projects.

Strapi Cloud offers a free 14 days trial for all new accounts, and 3 paid plans: Developer, Pro and Team (see [Pricing page](https://strapi.io/pricing-cloud)). The table below summarises Strapi Cloud usage-based pricing tiers, for general features & usage, CMS features and Cloud specific features:

| Feature | Free Trial | Developer | Pro | Team |
| --- | --- | --- | --- | --- |
| **Seats** | 10 (up to 10 extra) | 1 (up to 3 extra) | 5 (up to 20 extra) | 10 (up to 50 extra) |
| **Database Entries**  | 1,000 | 1,000 | 100,000 | 1,000,000 |
| **Assets Storage** | 5GB | 15GB | 150GB | 500GB |
| **Assets Bandwidth** | 50GB | 50GB per month | 500GB per month | 1,000GB per month |
| **API Requests** | 10,000 | 100,000 | 1,000,000 | 10,000,000 |
|  |  |  |  |  |
| **Audit Logs** | 7 days retention | N/A | N/A | 7 days retention |
| **Releases** | 3 pending releases | N/A | N/A | 3 pending releases |
| **Review Workflows** | up to 2 | N/A | N/A | up to 2 |
| **Content History** | 14 days retention | N/A | 14 days retention | 90 days retention |
|  |  |  |  |  |
| **Backups** | N/A | N/A | Weekly | Daily |
| **Environments** | N/A | N/A | 0 included (up to 99 extra) | 1 included (up to 99 extra) |

:::strapi Additional information on usage and features
- General features & usage:
  - Seats are the maximum number of users that can access the Strapi admin panel.
  - Database entries are the number of entries in your database.
  - Assets storage is the amount of storage used by your assets.
  - Assets bandwidth is the amount of bandwidth used by your assets.
  - API requests are the number of requests made to your APIs. This includes requests to the GraphQL and REST APIs, excluding requests for file and media assets counted towards CDN bandwidth and storage.
- CMS features:
  - Audit Logs refers to the maximum number of days for which the feature retains the activities that happened (see [Audit Logs in User Guide](/user-docs/settings/audit-logs) for more information).
  - Releases refers to the maximum number of pending releases that can be created (see [Releases in User Guide](/user-docs/releases/introduction) for more information).
  - Review Workflows refers to the maximum number of workflows that can be created and used (see [Review Workflows in User Guide](/user-docs/settings/review-workflows) for more information).
  - Content History refers to the maximum numbers of days kept in history (see [Content History in User Guide](/user-docs/content-manager/working-with-content-history))
- Cloud specific feature:
  - Backups refers to the automatic backups of Strapi Cloud projects (see [Backups documentation](/cloud/projects/settings#backups) for more information on the feature).
  - Environments refers to the number of environments included in the plan on top of the default production environment (see [Environments](/cloud/projects/settings#environments) documentation for more information on the feature).
:::

## Environments management

Environments are isolated instances of your Strapi Cloud project. All projects have a default production environment, but other additional environments can be configured for projects on a Pro or Team plan, from the *Environments* tab of a project's settings (see [Environments](/cloud/projects/settings#environments)). There is no limit to the number of additional environments that can be configured for a Strapi Cloud project.

The usage limits of additional environments are the same as for the project's production environment (e.g. an additional environment on the Pro plan will be limited at 150GB for assets storage, and overages will be charged the same way as for the production environment). Note however that the assets bandwidth and API calls are project-based, not environment-based, so these usage limits do not change even with additional environments.

## Seats management

Seats represent the maximum number of users that can access the Strapi admin panel. Each plan comes with a default number of seats. 

You can add more seats either by upgrading to a higher plan, or manually adding individual seats as desired. Seats can be added from the <Icon name="credit-card" /> *Billing & Usage* tab of a project's settings (see [Managing project's number of seats](/cloud/projects/settings#managing-projects-number-of-seats)).

There is however a maximum number of seats that can be added per plan:

| Plan | Maximum Seats |
| --- | --- |
| **Free Trial** | 10 |
| **Developer** | 3 |
| **Pro** | 20 |
| **Team** | 50 |

 
## Billing

Billing is based on the usage of your Strapi Cloud account and projects. You will be billed monthly for the usage of your account and applications. You can view your usage and billing information in the [Billing](https://cloud.strapi.io/profile/billing) section of your Strapi Cloud account.

### Overages

If you exceed the limits of your plan for API Requests, Asset Bandwidth, or Asset Storage, you will be charged for the corresponding overages. 

For example, if you exceed the 500GB limit in asset bandwidth of the Pro plan, you will be charged for the excess bandwidth at the end of the current billing period or on project deletion. Overages are not prorated and are charged in full.

Overages are charged according to the following rates:

| Feature | Rate |
| --- | --- |
| **API Requests** | $1.50 / 25k requests |
| **Asset Bandwidth** | $30.00 / 100GB |
| **Asset Storage** | $0.60 / GB per month |

### Project suspension

Projects may end up in a **Suspended** state for various reasons, including: not paying the invoice, exceeding the limits of your free trial plan, or violating the [terms of service](https://strapi.io/cloud-legal). 

If your project is suspended, you will no longer be able to access the application or trigger new deployments. You will also be unable to access the Strapi admin panel.

You can view the status of your project in the [Projects](https://cloud.strapi.io/projects) section of your Strapi Cloud account and you will be notified by email.

:::warning
If you do not resolve the issue within 30 days, your suspended project will be deleted and all data will be permanently lost. To avoid this situation, you will be sent a first email when your project becomes suspended, then another email every 5 days until one week left, to remind you to solve the issue. The last week before the deletion of the project, you will be sent 3 more emails: 6 days, 3 days and 1 day before your project is finally deleted.
:::

#### Project suspension after subscription cancellation

If you don't pay the invoice, the subscription of your project will automatically be cancelled and the project will be suspended. You can reactivate the subscription through the billing modal (see [Edit subscription](/cloud/account/account-billing#account-billing)).

1. Log into the billing modal and go to the *Subscription details* of the subscription associated with the suspended project. You should see a warning message confirming that the subscription was canceled for the following reason: "Not Paid".
2. Go back to the homepage of the billing modal, listing subscriptions and billing options.
3. Go to *Payment methods* and add a new, working card to pay the invoice. As soon as the invoice is paid, your project will automatically be reactivated.

#### Project suspension for other reasons

If your project was suspended for reasons other than unpaid invoice leading to subscription cancellation, you may not have the possibility to reactivate your project yourself. You should receive an email with instructions on how to resolve the issue. If you do not receive the email notification, please contact [Strapi Support](mailto:support@strapi.io).
