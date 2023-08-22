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
- Delete account: to permanently delete your Strapi Cloud account (see [Deleting Strapi Cloud account](#deleting-strapi-cloud-account)).

<ThemedImage
  alt="General tab of Profile page"
  sources={{
    light: '/img/assets/cloud/account-deletion.png',
    dark: '/img/assets/cloud/account-deletion_DARK.png',
  }}
/>

<!--
### Modifying profile details

1. In the *Details* section of the *General* tab, modify the information of your choice:

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Name            | Write your full name in the textbox.                                     |
    | Email           | Write your complete email address in the textbox.                        |
    
2. Click on the **Save** button.
-->

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
    <img src="/img/assets/cloud/manage-login.png" alt="Manage subscriptions login" width="400px" />
    

2. Enter the billing email address associated with your account and click **Continue**. A one-time password will be sent to the email address.

3. Enter the one-time password and click **Continue**. The **Manage Subscriptions** page will appear.
    <img src="/img/assets/cloud/manage-subscriptions.png" alt="Manage subscriptions" width="400px" />

4. From here you can view and edit your:
    * Active Subscription
    * Account Information
    * Billing & Shipping Addresses
    * Payment Methods
    * Billing History

#### Active subscription

Click on the active subscription tile to view the details of your subscription:

<img src="/img/assets/cloud/subscription-details.png" alt="Active subscription" width="400px" />

Here you can view your current subscription plan, and any additional add-ons, as well as the monthly billed amount.

You can also:

* Edit your **Project Name**
* Update your **Shipping Details**, the mailing/billing address associated with your subscription
* [Edit your subscription](#edit-subscription)
* **Cancel Subscription**

##### Edit subscription

Click the **Edit Subscription** button to change your subscription plan or add-ons:
<img src="/img/assets/cloud/edit-subscription.png" alt="Edit subscription" width="400px" />

Use the **Change** button to select a different subscription plan: either **Pro** or **Team**. 

Use the **Add Addons** buttons to add additional seats to your plan:
<img src="/img/assets/cloud/add-addons.png" alt="Adding seats" width="400px" />

Click **Update Subscription** to save your changes.
