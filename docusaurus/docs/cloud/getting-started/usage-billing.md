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

# Cloud billing & usage

<Tldr>

Strapi Cloud offers three plans (Essential, Pro, and Scale) with usage-based pricing that varies by API requests, asset storage, and bandwidth, plus overages charged monthly; projects may be suspended for unpaid invoices or plan violations.

</Tldr>


This page contains general information related to the usage and billing of your Strapi Cloud account and projects.

Strapi Cloud offers 3 plans: Essential, Pro, and Scale (see [Pricing page](https://strapi.io/pricing-cloud)). The table below summarizes Strapi Cloud usage-based pricing plans, for general features and usage:

| Feature                          | Essential | Pro | Scale |
| -------------------------------- | --------- | --- | ----- |
| **Database Entries**             | Unlimited* | Unlimited* | Unlimited* |
| **Asset Storage**               | 50GB      | 250GB | 1,000GB |
| **Asset Bandwidth (per month)** | 50GB      | 500GB | 1,000GB |
| **API Requests (per month)**     | 50,000 | 1,000,000 | 10,000,000 |
|  |  |  |  |
| **Backups**                      | N/A | Weekly | Daily |
| **Custom domains**               | Included | Included | Included | 
| **Environments**                 | N/A | 0 included (up to 99 extra) | 1 included (up to 99 extra) |
| **Emails (per month)**           | Unlimited* | Unlimited* | Unlimited* |

:::strapi Additional information on usage and features
- General features & usage:
  - Database entries are the number of entries in your database.
  - Asset storage is the amount of storage used by your assets.
  - Asset bandwidth is the amount of bandwidth used by your assets.
  - API requests are the number of requests made to your APIs. This includes requests to the GraphQL and REST APIs, excluding requests for file and media assets counted towards CDN bandwidth and storage. All API requests are counted towards your monthly usage, regardless of the response type.
- Cloud specific feature:
  - Backups refers to the automatic backups of Strapi Cloud projects (see [Backups documentation](/cloud/projects/settings#backups) for more information on the feature).
  - Custom domains refer to the ability to define a custom domain for your Strapi Cloud (see [Custom domains](/cloud/projects/settings#connecting-a-custom-domain)).
  - Environments refers to the number of environments included in the plan on top of the default production environment (see [Environments](/cloud/projects/settings#environments) documentation for more information on the feature). 
:::

## Environments management

Environments are isolated instances of your Strapi Cloud project. All projects have a default production environment, but other additional environments can be configured for projects on a Pro or Scale plan, from the *Environments* tab of the project settings (see [Environments](/cloud/projects/settings#environments)). There is no limit to the number of additional environments that can be configured for a Strapi Cloud project.

The usage limits of additional environments are the same as for the project's production environment (e.g. an additional environment on the Pro plan will be limited at 250GB for asset storage, and overages will be charged the same way as for the production environment). Note however that the asset bandwidth and API calls are project-based, not environment-based, so these usage limits do not change even with additional environments.
 
## Billing

Billing is based on the usage of your Strapi Cloud projects. Project plans and addons are either billed monthly or yearly, depending on your billing cycle, while overages are billed monthly. You can view your usage and billing information in the *Billing & Usage* section of your project settings.

### Taxes

For billing addresses in the US, UK, Canada, India, and EU, local taxes may be added to your invoices. Tax amounts are calculated based on your billing address and VAT/Tax ID status, and are displayed during checkout and on invoices.

You can add or update your VAT/Tax ID from your [Account Billing](/cloud/account/account-billing) settings.

### Overages

If you exceed the limits of your plan for API Requests, Asset Bandwidth, or Asset Storage, you will be charged for the corresponding overages. 

For example, if you exceed the 500GB limit in asset bandwidth of the Pro plan, you will be charged for the excess bandwidth at the end of the current billing period or on project deletion. Overages are not prorated and are charged in full.

Overages are charged monthly, according to the following rates:

| Feature | Rate |
| --- | --- |
| **API Requests** | $1.50 / 25k requests |
| **Asset Bandwidth** | $30.00 / 100GB |
| **Asset Storage** | $0.60 / GB per month |

### Project suspension

Projects may end up in a **Suspended** state for various reasons, including unpaid invoices or violating Strapi Cloud's <ExternalLink to="https://strapi.io/cloud-legal" text="terms of service"/>. 

If your project is suspended, you will no longer be able to access the Strapi admin panel, nor trigger new deployments. A banner will appear in your project's dashboard, indicating the cause of the suspension. You will also be notified by email.

#### Project suspension due to billing issues

If you have unpaid invoices, the subscription of your project will automatically be canceled and the project suspended. 

To reactivate your project subscription:

1. Click the **Pay now** button in the project banner, or in *Settings > Billing & Usage*
2. Pay your overdue invoice(s) on the external payment page
3. Wait up to 1 minute for your project to reactivate

<ThemedImage
  alt="Reactivate subscription"
  sources={{
    light: '/img/assets/cloud/settings-reactivate.png',
    dark: '/img/assets/cloud/settings-reactivate_DARK.png',
  }}
/>

:::warning
If you do not resolve the issue within 30 days, your suspended project will be deleted and all its data will be permanently lost.
:::

#### Project suspension for other reasons

If your project was suspended for reasons other than unpaid invoice leading to subscription cancellation, you may not have the possibility to reactivate your project yourself. You should receive an email with instructions on how to resolve the issue. If you do not receive the email notification, please contact the <ExternalLink to="https://support.strapi.io/support/home" text="Strapi Support platform"/>.

### Subscription cancellation

If you want to cancel your Strapi Cloud subscription, you have 2 options:

- either delete your project (see [Deleting Strapi Cloud project](/cloud/projects/settings#deleting-a-strapi-cloud-project) documentation),
- or completely delete your account (see [Deleting Strapi Cloud account](/cloud/account/account-settings#deleting-strapi-cloud-account) documentation).
