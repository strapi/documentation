---
title: Account Settings
displayed_sidebar: cloudSidebar
description: View and manage your projects on Strapi Cloud.
canonicalUrl: https://docs.strapi.io/cloud/account/settings.html
---

# Account Settings

The *Account Settings* page enables you to manage your account details and preferences. There are three tabs available: *General*, *Preferences* and *Billing*.

## General

The *General* tab enables you to edit the following options for your account:

- Details: to modify the display name associated with your account.
- Connected Git repository: to change the branch of the GitHub repository used for your project.
- Delete project: to permanently delete your Strapi Cloud account.

<!-- Add screenshot here -->

### Modifying GitHub repository branch

The GitHub repository branch and base directory for a Strapi Cloud project are by default chosen at the creation of the project (see [Creating a project](/cloud/getting-started/deployment)). Both can afterwards be edited via the account settings.

1. In the *Connected Git repository* section of the *General* tab, click on the **Edit** button.
2. In the *Edit Git settings* dialog, edit the available options of your choice:

    | Setting name    | Instructions                                                             |
    | --------------- | ------------------------------------------------------------------------ |
    | Selected branch | Choose a branch from the drop-down list.                                 |
    | Base directory  | Write the path of the base directory in the textbox.                     |
    | Deploy the project on every commit pushed to this branch | Check the box to automatically trigger a new deployment whenever a new commit is pushed to the selected branch. |

3. Click on the **Save** button.

<!--
### Deleting Strapi Cloud account

Document project deletion
-->

## Preferences

The **Preferences** tab enables you to edit the following details for your account:

* **Appearance**: Choose between the **Light** and **Dark** themes.

## Billing

The **Billing** tab displays your billing information and enables you to update your payment method.

![Account billing settings](/img/assets/cloud/account-billing.png)

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
