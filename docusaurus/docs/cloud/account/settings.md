---
title: Account Settings
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/account/settings.html
---

# Account profile

The *Profile* page enables you to manage your account details and preferences. It is accessible by clicking on your profile picture, on the top right hand corner of the interface, and **Profile**. There are 3 tabs available in the *Profile* interface: *General*, *Preferences* and *Billing*.

## General

The *General* tab enables you to edit the following details for your account profile:

- Details: to see the name associated with your account.
- Connected accounts: to manage Google and GitHub accounts connected with your Strapi Cloud account.
- Delete account: to permanently delete your Strapi Cloud account (see [Deleting Strapi Cloud account](#deleting-strapi-cloud-account)).

<!-- TODO: replace with screenshot with connected accounts -->

<ThemedImage
  alt="General tab of Profile page"
  sources={{
    light: '/img/assets/cloud/settings-general.png',
    dark: '/img/assets/cloud/settings-general_DARK.png',
  }}
/>

### Managing connected accounts

You can connect a Google account and a GitHub account to your Strapi Cloud account. The _Connected accounts_ section lists accounts that are currently connected to your Strapi Cloud account. From there you can also connect a new Google or GitHub account if one is not already connected.

To connect a new Google or GitHub account to your Strapi Cloud account, click on the **Connect account** button and follow the next steps on the corresponding website.

You can also click on the three dots button of a connected account and click on the "Manage on" button to manage your GitHub or Google account directly on the corresponding website.

### Deleting Strapi Cloud account

You can delete your Strapi Cloud account, but it will be permanent and irreversible. All associated projects and their data will be deleted as well and the subscriptions for the projects will automatically be canceled.

1. In the *Delete account* section of the *General* tab, click on the **Delete account** button.
2. In the dialog, type `DELETE` in the textbox.
3. Confirm the deletion of your account by clicking on the **Delete** button.

## Preferences

The *Preferences* tab enables you to choose the appearance of your Strapi Cloud dashboard: either the Light or Dark theme.

<ThemedImage
  alt="Preferences tab of Profile page"
  sources={{
    light: '/img/assets/cloud/account-preferences.png',
    dark: '/img/assets/cloud/account-preferences_DARK.png',
  }}
/>

## Billing

The *Billing* tab displays your billing information and enables you to update your payment method.

<ThemedImage
  alt="Billing tab of Profile page"
  sources={{
    light: '/img/assets/cloud/account-billing2.png',
    dark: '/img/assets/cloud/account-billing2_DARK.png',
  }}
/>

### Managing subscriptions

Using the **Manage subscriptions** button, you can view and manage your subscriptions, account and billing information, and payment method.

1. Click the **Manage subscriptions** button. A login modal will appear. 

2. Enter the billing email address associated with your account and click **Continue**. A one-time password will be sent to the email address.

3. Enter the one-time password and click **Continue**. The **Manage Subscriptions** modal will appear. From here, you can:
  
    - view and edit your subscriptions by clicking on the active subscription(s) tile(s): change project name, update shipping details, [edit current subscription](#edit-subscription) and [cancel current subscription](#cancel-subscription)
    - view and edit your Account Information: email, password, company name
    - view and edit your Billing & Shipping Addresses
    - view and edit your Payment Methods and add new ones
    - access your Billing History and download your invoices

  <ThemedImage
    alt="Subscriptions management modal"
    sources={{
      light: '/img/assets/cloud/manage-subscriptions.png',
      dark: '/img/assets/cloud/manage-subscriptions_DARK.png',
    }}
  />

### Edit subscription

From the subscription management modal, you can view and modify any current subscription.

<ThemedImage
  alt="Subscription edition modal"
  sources={{
    light: '/img/assets/cloud/edit-subscription-modal.png',
    dark: '/img/assets/cloud/edit-subscription-modal_DARK.png',
  }}
/>

1. Click on an active subscription tile (e.g. "Strapi Cloud Pro $99.00" located above the subscriptions management links such as *Account Information*, *Billing & Shipping Addresses*). You will be redirected to your subscription details.
2. Click on the **Edit Subscription** link.
3. If you only want to add addons (e.g. additional seats), click on the **Add Addons** button.
4. If you want to change plan (e.g. from Pro plan to Team plan), click on **Change** and select a new plan.
5. Confirm your modifications by clicking on the **Update Subscription** button at the bottom of the modal.

### Cancel subscription

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
