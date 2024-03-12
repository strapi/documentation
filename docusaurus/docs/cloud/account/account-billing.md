---
title: Account billing details
displayed_sidebar: cloudSidebar
description: Manage billing details for Strapi Cloud account.
canonicalUrl: https://docs.strapi.io/cloud/account/account-billing.html
---

# Account billing details 

Through the *Profile* page, accessible by clicking on your profile picture on the top right hand corner of the interface then clicking on **Profile**, you can access the *Billing* tab.

The *Billing* tab displays and enables you to modify the billing details and payment method set for the account. This information will by default be reused for every new project created with your Strapi Cloud account.

:::note
The Payment method section can only be accessible once the mandatory fields of the Billing details section have been filled in.
:::

<ThemedImage
  alt="Billing tab of Profile page"
  sources={{
      light: '/img/assets/cloud/account-billing2.png',
      dark: '/img/assets/cloud/account-billing2_DARK.png',
    }}
/>

## Managing subscriptions

Using the **Manage subscriptions** button in the *Billing* tab, you can:

- view and edit your subscriptions by clicking on the active subscription(s) tile(s): change project name, update shipping details, [edit current subscription](#edit-subscription) and [cancel current subscription](#cancel-subscription),
- view and edit your Account Information: email, password and company name,
- view and edit your Billing & Shipping Addresses,
- view and edit your Payment Methods and add new ones,
- access your Billing History and download your invoices.

<ThemedImage
  alt="Subscriptions management modal"
  sources={{
        light: '/img/assets/cloud/manage-subscriptions.png',
        dark: '/img/assets/cloud/manage-subscriptions_DARK.png',
      }}
/>

## Edit subscription

From the subscription management modal, you can view and modify any current subscription. This includes upgrading or downgrading to another plan.

:::caution
If you choose to downgrade to another plan but your current usage exceeds the limits of that plan, you are taking the risk of getting charged for the overages. Not also that you may lose access to some features: for example, downgrading to the Developer plan which doesn't include the Backups feature, would make you lose all your project's backups. Please refer to [Usage & Billing](/cloud/getting-started/usage-billing) for more information.
:::

<ThemedImage
  alt="Subscription edition modal"
  sources={{
      light: '/img/assets/cloud/edit-subscription-modal.png',
      dark: '/img/assets/cloud/edit-subscription-modal_DARK.png',
    }}
/>

1. Click on an active subscription tile (e.g. "Strapi Cloud Pro $99.00" located above the subscriptions management links such as _Account Information_, _Billing & Shipping Addresses_). You will be redirected to your subscription details.
2. Click on the **Edit Subscription** link.
3. If you only want to add addons (e.g. additional seats), click on the **Add Addons** button.
4. If you want to change plan, whether it is a plan upgrade or a downgrade (e.g. from Pro plan to Team plan, or from Pro plan to Developer plan), click on **Change** and select a new plan.
5. Confirm your modifications by clicking on the **Update Subscription** button at the bottom of the modal.

## Cancel subscription

<ThemedImage
  alt="Subscription cancellation modal"
  sources={{
    light: '/img/assets/cloud/cancel-subscription-modal.png',
    dark: '/img/assets/cloud/cancel-subscription-modal_DARK.png',
    }}
/>

1. Click on an active subscription tile (e.g. "Strapi Cloud Pro $99.OO"). You will be redirected to your subscription details.
2. Click on the **Cancel Subscription** link.
3. Select the reason of your cancellation from the drop-down menu, and optionally add a comment in the textbox.
4. Confirm your choice by clicking on the **Confirm Cancellation** button.
