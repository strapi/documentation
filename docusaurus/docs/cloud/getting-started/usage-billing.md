---
sidebar_label: 'Usage & Billing'
displayed_sidebar: cloudSidebar
sidebar_position: 1
---

# Usage & Billing

This page contains general information related to the usage and billing of your Strapi Cloud account and applications. Strapi Cloud offers a free 7-day trial for all new accounts and two paid plans: **Pro** and **Team**.

The usage-based pricing for Strapi Cloud is based on the following criteria and limits:

| Feature | Free | Pro | Team |
| --- | --- | --- | --- |
| **CMS Seats** | 10 | 10 | 20 |
| **Database Entries** | 100,000 | 100,000 | 1,000,000 |
| **Database Storage** | 1GB | 1GB | 20GB |
| **Assets Storage** | 100GB | 150GB | 500GB |
| **Assets Bandwidth** | 5GB | 500GB | 1,000GB |
| **API Requests** | 10,000 | 1,000,000 | 2,000,000 |
| **Audit Logs** | 7 days retention | N/A | 7 days retention |

Where:

- **CMS Seats** are the number of users that can access the Strapi Admin Panel.
- **Database Entries** are the number of entries in your database.
- **Database Storage** is the amount of storage used by your database.
- **Assets Storage** is the amount of storage used by your assets.
- **Assets Bandwidth** is the amount of bandwidth used by your assets. 
- **API Requests** are the number of requests made to your APIs. This includes requests made to the GraphQL and REST APIs.

## Billing

Billing is based on the usage of your Strapi Cloud account and applications. You will be billed monthly for the usage of your account and applications. You can view your usage and billing information in the [Billing](https://cloud.strapi.io/profile/billing) section of your Strapi Cloud account.

### Overages

If you exceed the limits of your plan, you will be charged for the overage. For example, if you exceed the limit of 100,000 database entries on the Pro plan, you will be charged for the excess DB entries over 100,000 at the end of the current billing period.

Overages are billed according to the following rates:

| Feature | Pro | Team |
| :--- | ---: | ---: |
| **API Requests** | TODO  | $1.50 / 25k requests |
| **Asset Bandwidth** | TODO | $25.00 / 100GB |
| **Asset Storage** | TODO | $2.00/GB per month |

### Project suspension

Projects may end up in a **Suspended** state for various reasons, including violating the [terms of service](https://strapi.io/cloud-legal) or exceeding the limits of your free trial plan. 

If your project is suspended, you will no longer be able to access the application or trigger new deployments. You will also be unable to access the Strapi Admin Panel. You can view the status of your project in the [Projects](https://cloud.strapi.io/projects) section of your Strapi Cloud account.

Owners of suspended projects will receive an email notification with instructions on how to resolve the issue. If you do not receive an email notification, please contact [Strapi Support](mailto:support@strapi.io).

If you do not resolve the issue within 10 days, your project will be deleted and all data will be permanently lost.