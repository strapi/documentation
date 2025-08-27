---
title: Account billing details
displayed_sidebar: cloudSidebar
description: Manage billing details for Strapi Cloud account.
canonicalUrl: https://docs.strapi.io/cloud/account/account-billing.html
tags:
- billing details
- cancel subscription
- edit subscription
- manage subscription
- Strapi Cloud
- Strapi Cloud project
---

import InvoiceStatus from '/docs/snippets/invoices-statuses.md'

# Account billing & invoices 

Testing...

## Account billing

The <Icon name="credit-card" /> *Billing* tab displays and enables you to modify the billing details and payment method set for the account.

<ThemedImage
  alt="Billing tab of Profile page"
  sources={{
      light: '/img/assets/cloud/account-billing2.png',
      dark: '/img/assets/cloud/account-billing2_DARK.png',
    }}
/>

The *Payment method* section of the <Icon name="credit-card" /> *Billing* tab allows you to manage the credit cards that can be used for the Strapi Cloud projects. The *Billing details* section requires to be filled in, at least for the mandatory fields, as this information will be the default billing details for all Strapi Cloud projects related to your account.

### Adding a new credit card

1. In the *Payment method* section of the <Icon name="credit-card" /> *Billing* tab, click on the **Add card** button.
2. Fill in the following fields:

| Field name | Description |
| --- | --- |
| Card Number | Write the number of the credit card to add as payment method. |
| Expires | Write the expiration date of the credit card. |
| CVC | Write the 3-numbers code displayed at the back of the credit card. |

3. Click on the **Save** button.

:::tip
The first credit card to be added as payment method for the account will by default be the primary one. It is however possible to define another credit card as primary by clicking on the <Icon name="dots-three-outline" /> icon, then **Switch as primary**.
:::

### Deleting a credit card

To remove a credit card from the list of payment methods for the account:

1. Click on the <Icon name="dots-three-outline" /> icon of the credit card you wish to delete.
2. Click **Remove card**. The card is immediately deleted.

:::note
You cannot delete the primary card as at least one credit card must be available as payment method, and the primary card is by default that one. If the credit card you wish to delete is currently the primary card, you must first define another credit card as primary, then delete it.
:::

## Account invoices

The <Icon name="invoice" /> *Invoices* tab displays the complete list of invoices for all your Strapi Cloud projects.

<ThemedImage
  alt="Invoices tab of Profile page"
  sources={{
      light: '/img/assets/cloud/account-invoices.png',
      dark: '/img/assets/cloud/account-invoices_DARK.png',
    }}
/>

<InvoiceStatus components={props.components} />

:::strapi Invoices are also available per project.
In the *Settings > Invoices* tab of any project, you will find the invoices for that project only. Feel free to check the [dedicated documentation](/cloud/projects/settings#invoices).
:::
