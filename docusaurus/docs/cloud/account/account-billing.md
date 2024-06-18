---
title: Account billing details
displayed_sidebar: cloudSidebar
description: Manage billing details for Strapi Cloud account.
canonicalUrl: https://docs.strapi.io/cloud/account/account-billing.html
---

# Account billing details 

Through the *Profile* page, accessible by clicking on your profile picture on the top right hand corner of the interface then clicking on **Profile**, you can access the *Billing* tab. It displays and enables you to modify the billing details and payment method set for the account. This information will by default be reused for every new project created with your Strapi Cloud account.

<ThemedImage
  alt="Billing tab of Profile page"
  sources={{
      light: '/img/assets/cloud/account-billing2.png',
      dark: '/img/assets/cloud/account-billing2_DARK.png',
    }}
/>

## Managing your payment method

The *Payment method* section of the *Billing* tab allows you to manage the credit cards that can be used for the Strapi Cloud projects. 

:::note
The Payment method section can only be accessible once the mandatory fields of the Billing details section have been filled in.
:::

### Adding a new credit card

1. In the *Payment method* section of the *Billing* tab, click on the **Add card** button.
2. Fill in the following fields:

| Field name | Description |
| --- | --- |
| Card Number | Write the number of the credit card to add as payment method. |
| Expires | Write the expiration date of the credit card. |
| CVC | Write the 3-numbers code displayed at the back of the credit card. |

3. Click on the **Save** button.

:::tip
The first credit card to be added as payment method for the account will by default be the primary one. It is however possible to define another credit card as primary by clicking on the ![Menu icon](/img/assets/icons/more.svg) icon, then **Switch as primary**.
:::

### Deleting a credit card

To remove a credit card from the list of payment methods for the account:

1. Click on the ![Menu icon](/img/assets/icons/more.svg) icon of the credit card you wish to delete.
2. Click **Remove card**. The card is immediately deleted.

:::note
You cannot delete the primary card as at least one credit card must be available as payment method, and the primary card is by default that one. If the credit card you wish to delete is currently the primary card, you must first define another credit card as primary, then delete it.
:::