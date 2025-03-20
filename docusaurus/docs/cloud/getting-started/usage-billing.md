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

Strapi Cloud offers a free 14 days trial for all new accounts, and 3 paid plans: Essential, Pro and Scale (see [Pricing page](https://strapi.io/pricing-cloud)). The table below summarises Strapi Cloud usage-based pricing tiers, for general features & usage and Cloud specific features:

| Feature | Free Trial | Essential | Pro | Scale |
| --- | --- | --- | --- | --- |
| **Database Entries**  | 2,500 | Unlimited* | Unlimited* | Unlimited* |
| **Assets Storage** | 25GB | 50GB | 250GB | 1000GB |
| **Assets Bandwidth (per month)** | 25GB | 50GB | 500GB | 1,000GB |
| **API Requests** | 10,000 | 100,000 | 1,000,000 | 10,000,000 |
|  |  |  |  |  |
| **Backups** | N/A | N/A | Weekly | Daily |
| **Environments** | N/A | N/A | 0 included (up to 99 extra) | 1 included (up to 99 extra) |
| **Emails (per month)** | 100 | Unlimited* | Unlimited* | Unlimited* |

:::strapi Additional information on usage and features
- General features & usage:
  - Database entries are the number of entries in your database.
  - Assets storage is the amount of storage used by your assets.
  - Assets bandwidth is the amount of bandwidth used by your assets.
  - API requests are the number of requests made to your APIs. This includes requests to the GraphQL and REST APIs, excluding requests for file and media assets counted towards CDN bandwidth and storage.
- Cloud specific feature:
  - Backups refers to the automatic backups of Strapi Cloud projects (see [Backups documentation](/cloud/projects/settings#backups) for more information on the feature).
  - Environments refers to the number of environments included in the plan on top of the default production environment (see [Environments](/cloud/projects/settings#environments) documentation for more information on the feature).
:::

## Environments management

Environments are isolated instances of your Strapi Cloud project. All projects have a default production environment, but other additional environments can be configured for projects on a Pro or Scale plan, from the *Environments* tab of a project's settings (see [Environments](/cloud/projects/settings#environments)). There is no limit to the number of additional environments that can be configured for a Strapi Cloud project.

The usage limits of additional environments are the same as for the project's production environment (e.g. an additional environment on the Pro plan will be limited at 150GB for assets storage, and overages will be charged the same way as for the production environment). Note however that the assets bandwidth and API calls are project-based, not environment-based, so these usage limits do not change even with additional environments.

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

If you don't pay the invoice, the subscription of your project will automatically be cancelled and the project will be suspended. You can reactivate the subscription through the billing modal (see [Edit subscription](/cloud/account/account-billing)).

1. Log into the billing modal and go to the *Subscription details* of the subscription associated with the suspended project. You should see a warning message confirming that the subscription was canceled for the following reason: "Not Paid".
2. Go back to the homepage of the billing modal, listing subscriptions and billing options.
3. Go to *Payment methods* and add a new, working card to pay the invoice. As soon as the invoice is paid, your project will automatically be reactivated.

#### Project suspension for other reasons

If your project was suspended for reasons other than unpaid invoice leading to subscription cancellation, you may not have the possibility to reactivate your project yourself. You should receive an email with instructions on how to resolve the issue. If you do not receive the email notification, please contact [Strapi Support](mailto:support@strapi.io).
