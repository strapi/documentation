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

<UpdatedBadge /> Strapi Cloud offers 1 Free plan and 3 paid plans: Essential, Pro and Scale (see [Pricing page](https://strapi.io/pricing-cloud)). The table below summarizes Strapi Cloud usage-based pricing plans, for general features and usage:

| Feature                          | Free  | Essential | Pro | Scale |
| -------------------------------- | ----- | --------- | --- | ----- |
| **Database Entries**             | 500   | Unlimited* | Unlimited* | Unlimited* |
| **Asset Storage**               | 10GB  | 50GB      | 250GB | 1,000GB |
| **Asset Bandwidth (per month)** | 10GB  | 50GB      | 500GB | 1,000GB |
| **API Requests (per month)**     | 10,000 | 100,000 | 1,000,000 | 10,000,000 |
|  |  |  |  |  |
| **Backups**                      | N/A | N/A | Weekly | Daily |
| **Custom domains**               | N/A | Included | Included | Included | 
| **Environments**                 | N/A | N/A | 0 included (up to 99 extra) | 1 included (up to 99 extra) |
| **Emails (per month)**           | 100 | Unlimited* | Unlimited* | Unlimited* |

:::strapi Additional information on usage and features
- General features & usage:
  - Database entries are the number of entries in your database.
  - Asset storage is the amount of storage used by your assets.
  - Asset bandwidth is the amount of bandwidth used by your assets.
  - API requests are the number of requests made to your APIs. This includes requests to the GraphQL and REST APIs, excluding requests for file and media assets counted towards CDN bandwidth and storage.
- Cloud specific feature:
  - Backups refers to the automatic backups of Strapi Cloud projects (see [Backups documentation](/cloud/projects/settings#backups) for more information on the feature).
  - Custom domains refer to the ability to define a custom domain for your Strapi Cloud (see [Custom domains](/cloud/projects/settings#connecting-a-custom-domain)).
  - Environments refers to the number of environments included in the plan on top of the default production environment (see [Environments](/cloud/projects/settings#environments) documentation for more information on the feature).
:::

:::info Scale-to-zero and cold start on the Free plan
On the Free plan, projects automatically scale down to zero after a short period of inactivity. When the application is accessed again—either through the frontend or via an API request—it may take a few seconds (up to a minute) before a response is returned.
Upgrading to a paid plan disables scaling to zero and cold starts, resulting in instant response times at all times.
:::

## Environments management

Environments are isolated instances of your Strapi Cloud project. All projects have a default production environment, but other additional environments can be configured for projects on a Pro or Scale plan, from the *Environments* tab of a project's settings (see [Environments](/cloud/projects/settings#environments)). There is no limit to the number of additional environments that can be configured for a Strapi Cloud project.

The usage limits of additional environments are the same as for the project's production environment (e.g. an additional environment on the Pro plan will be limited at 250GB for asset storage, and overages will be charged the same way as for the production environment). Note however that the asset bandwidth and API calls are project-based, not environment-based, so these usage limits do not change even with additional environments.
 
## Billing

Billing is based on the usage of your Strapi Cloud account and projects. You will be billed monthly for the usage of your account and applications. You can view your usage and billing information in the <ExternalLink to="https://cloud.strapi.io/profile/billing" text="Billing"/> section of your Strapi Cloud account.

### Overages

:::caution
Overages are not allowed on the Free plan.
:::

If you exceed the limits of your plan for API Requests, Asset Bandwidth, or Asset Storage, you will be charged for the corresponding overages. 

For example, if you exceed the 500GB limit in asset bandwidth of the Pro plan, you will be charged for the excess bandwidth at the end of the current billing period or on project deletion. Overages are not prorated and are charged in full.

Overages are charged according to the following rates:

| Feature | Rate |
| --- | --- |
| **API Requests** | $1.50 / 25k requests |
| **Asset Bandwidth** | $30.00 / 100GB |
| **Asset Storage** | $0.60 / GB per month |

### Project suspension

Projects may end up in a **Suspended** state for various reasons, including: not paying the invoice, exceeding the limits of your free plan, or violating the <ExternalLink to="https://strapi.io/cloud-legal" text="terms of service"/>. 

If your project is suspended, you will no longer be able to access the application or trigger new deployments. You will also be unable to access the Strapi admin panel.

You can view the status of your project in the <ExternalLink to="https://cloud.strapi.io/projects" text="Projects"/> section of your Strapi Cloud account and you will be notified by email.

:::warning
If you do not resolve the issue within 30 days, your suspended project will be deleted and all data will be permanently lost. To avoid this situation, you will be sent a first email when your project becomes suspended, then another email every 5 days until one week left, to remind you to solve the issue. The last week before the deletion of the project, you will be sent 3 more emails: 6 days, 3 days and 1 day before your project is finally deleted.
:::

#### Project suspension for exceeding the Free plan limits

When a project hosted with the Free plan exceeds either the API requests or the Asset Bandwidth limits, it will be suspended until the monthly allowance resets at the beginning of the following month.

While the project is suspended:

- Users cannot trigger new deployments
- Access to the application is blocked
- Users cannot make changes to the project’s settings

To reactivate the project immediately, users can upgrade to a paid plan.

#### Project suspension after subscription cancellation

If you don't pay the invoice, the subscription of your project will automatically be canceled and the project will be suspended. You can reactivate the subscription through the billing modal (see [Edit subscription](/cloud/account/account-billing#account-billing)).

1. Log into the billing modal and go to the *Subscription details* of the subscription associated with the suspended project. You should see a warning message confirming that the subscription was canceled for the following reason: "Not Paid".
2. Go back to the homepage of the billing modal, listing subscriptions and billing options.
3. Go to *Payment methods* and add a new, working card to pay the invoice. As soon as the invoice is paid, your project will automatically be reactivated.

#### Project suspension for other reasons

If your project was suspended for reasons other than unpaid invoice leading to subscription cancellation, you may not have the possibility to reactivate your project yourself. You should receive an email with instructions on how to resolve the issue. If you do not receive the email notification, please contact [Strapi Support](mailto:support@strapi.io).
