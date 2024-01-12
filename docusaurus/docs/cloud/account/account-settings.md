---
title: Profile settings
displayed_sidebar: cloudSidebar
description: Manage Strapi Cloud account settings.
canonicalUrl: https://docs.strapi.io/cloud/account/account-settings.html
---

# Profile settings

The *Profile* page enables you to manage your account details and preferences. It is accessible by clicking on your profile picture, on the top right hand corner of the interface, and **Profile**.

There are 3 tabs available in the *Profile* interface: [*General*](#general), [*Preferences*](#preferences) and *Billing* (the latter is documented in the [Account billing details](/cloud/account/account-billing) section of this documentation).

## General

The *General* tab enables you to edit the following details for your account profile:

- Details: to see the name associated with your account.
- Connected accounts: to manage Google, GitHub and GitLab accounts connected with your Strapi Cloud account (see [Managing connected accounts](#managing-connected-accounts)).
- Delete account: to permanently delete your Strapi Cloud account (see [Deleting Strapi Cloud account](#deleting-strapi-cloud-account)).

<ThemedImage
  alt="General tab of Profile page"
  sources={{
    light: '/img/assets/cloud/settings-general.png',
    dark: '/img/assets/cloud/settings-general_DARK.png',
  }}
/>

### Managing connected accounts

You can connect a Google, GitLab and GitHub account to your Strapi Cloud account. The _Connected accounts_ section lists accounts that are currently connected to your Strapi Cloud account. From there you can also connect a new Google, GitLab and GitHub account if one is not already connected.

To connect a new Google, GitLab or GitHub account to your Strapi Cloud account, click on the **Connect account** button and follow the next steps on the corresponding website.

You can also click on the three dots button of a connected account and click on the "Manage on" button to manage your GitHub, GitLab or Google account directly on the corresponding website.

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
