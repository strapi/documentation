---
sidebar_label: 'Information on billing & usage'
displayed_sidebar: cloudSidebar
sidebar_position: 3
---

# Information on billing & usage

This page contains general information related to the usage and billing of your Strapi Cloud account and projects.

Strapi Cloud offers up to 5 free 14-day trial projects, which can be activated anytime, even if you have existing paid projects. Project trials do not need to run simultaneously. Strapi Cloud also offers 3 paid plans: Developer, Pro, and Team (see [Pricing page](https://strapi.io/pricing-cloud)). The table below summarises Strapi Cloud usage-based pricing tiers, for general features & usage, CMS features and Cloud specific features:

| Feature | Free Trial | Developer | Pro | Team |
| --- | --- | --- | --- | --- |
| **Seats** | 10 | 1 | 5 | 10 |
| **Database Entries**  | 1,000 | 1,000 | 100,000 | 1,000,000 |
| **Assets Storage** | 5GB | 15GB | 150GB | 500GB |
| **Assets Bandwidth** | 50GB | 50GB per month | 500GB per month | 1,000GB per month |
| **API Requests** | 10,000 | 100,000 | 1,000,000 | 10,000,000 |
|  |  |  |  |  |
| **Audit Logs** | 7 days retention | N/A | N/A | 7 days retention |
| **Releases** | 3 pending releases | N/A | N/A | 3 pending releases |
| **Review Workflows** | up to 2 | N/A | N/A | up to 2 |
|  |  |  |  |  |
| **Backups** | N/A | N/A | Weekly | Weekly |

:::strapi Additional information on usage and features
- General features & usage:
  - Seats are the maximum number of users that can access the Strapi admin panel.
  - Database entries are the number of entries in your database.
  - Assets storage is the amount of storage used by your assets.
  - Assets bandwidth is the amount of bandwidth used by your assets.
  - API requests are the number of requests made to your APIs. This includes requests made to the GraphQL and REST APIs.
- CMS features:
  - Audit Logs refers to the maximum number of days for which the feature retains the activities that happened (see [Audit Logs in User Guide](/user-docs/settings/audit-logs) for more information).
  - Releases refers to the maximum number of pending releases that can be created (see [Releases in User Guide](/user-docs/releases/introduction) for more information).
  - Review Workflows refers to the maximum number of workflows that can be created and used (see [Review Workflows in User Guide](/user-docs/settings/review-workflows) for more information).
- Cloud specific feature: Backups refers to the automatic backups of Strapi Cloud projects (see [dedicated page in Cloud documentation](/cloud/projects/settings#backups) for more information).
:::

## Seats management

Seats represent the maximum number of users that can access the Strapi admin panel. Each plan comes with a default number of seats. 

You can add more seats either by upgrading to a higher plan, or manually adding individual seats as desired. Seats can be added from the **Billing & Usage** tab of a project's settings (see [Managing project's number of seats](/cloud/projects/settings#managing-projects-number-of-seats)).

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

If you don't pay the invoice, the subscription of your project will automatically be cancelled and the project will be suspended. You can reactivate the subscription through the billing modal (see [Edit subscription](/cloud/account/account-billing#edit-subscription)).

1. Log into the billing modal and go to the *Subscription details* of the subscription associated with the suspended project. You should see a warning message confirming that the subscription was canceled for the following reason: "Not Paid".
2. Go back to the homepage of the billing modal, listing subscriptions and billing options.
3. Go to *Payment methods* and add a new, working card to pay the invoice. As soon as the invoice is paid, your project will automatically be reactivated.

#### Project suspension for other reasons

If your project was suspended for reasons other than unpaid invoice leading to subscription cancellation, you may not have the possibility to reactivate your project yourself. You should receive an email with instructions on how to resolve the issue. If you do not receive the email notification, please contact [Strapi Support](mailto:support@strapi.io).
