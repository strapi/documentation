---
title: Billing portal
displayed_sidebar: cmsSidebar
description: "Use the Strapi billing portal to manage your Growth subscription: seats, SSO, payment methods, invoices, cancellation, and reactivation."
tags:
- billing
- Growth subscription
- manage subscription
---

import TaxesNote from '/docs/snippets/billing-taxes-note.md'

# Billing portal
<GrowthBadge /> <EnterpriseBadge />

<Tldr>
The Strapi billing portal is where you can view all Strapi subscriptions and manage payment methods, billing details, and invoices. Only Growth subscriptions can be managed in the portal; Cloud and Enterprise subscriptions are view-only.
</Tldr>

The [Strapi billing portal](https://billing.strapi.io) is where you view and manage billing for your Strapi subscriptions. For all subscriptions, you can update payment methods, edit billing details, and download invoices.

While you can view all subscriptions in the portal, only Growth subscriptions can be managed directly there. Cloud subscriptions are managed in the [Strapi Cloud dashboard](/cloud/projects/settings#plans). To change Enterprise contract terms, [contact sales](mailto:sales@strapi.io).

## Signing in to the billing portal

To sign in:

1. Enter the email address you used at purchase or for CLI authentication.
2. Enter the 6-digit code sent to your inbox.
3. If your email is linked to multiple billing accounts, select the account you want to manage.

## Subscriptions

The *Subscriptions* tab displays all your Strapi subscriptions.

<ThemedImage
alt="Billing portal screenshot: subscriptions"
sources={{
    light: '/img/assets/billing-portal/billing-portal-subscriptions.png',
    dark: '/img/assets/billing-portal/billing-portal-subscriptions_DARK.png',
}}
/>

Subscriptions are grouped into the following sections:

- **In trial**: Trial subscriptions that have not yet converted to paid.
- **Active**: Active subscriptions.
- **Scheduled for cancellation**: Subscriptions scheduled to be canceled at the end of the current billing period.
- **Canceled**: Fully canceled subscriptions.

Each subscription card shows the plan name, product family, status, price, billing period (monthly or yearly), renewal or trial end date, and subscription ID. Next to the subscription ID, Cloud subscriptions show the Cloud project name and Growth subscriptions show the CMS project ID linked to the license.

### Activating an in-trial Growth subscription

Before you activate, make sure to add a payment method in the [Payment methods](#payment-methods) tab and complete your [Billing details](#billing-details) profile.

To activate a subscription:

1. Click **Activate subscription** in the *In trial* section.
2. In the *Manage subscription* modal, set the desired seat count and choose if the plan should include the SSO add-on.
3. Click **Continue** to review the charge summary.
4. Click **Activate now** to confirm.

:::note
Growth subscriptions must include a minimum of 3 seats.
:::

### Changing seats and add-ons on a Growth subscription

To update the seat count or add-ons of an active Growth subscription:

1. Click **Manage subscription**.
2. In the *Manage subscription* modal, adjust the seat count and included add-ons as needed.
3. Click **Continue** to review the charge summary.
4. Click **Confirm** to apply the changes.
 
:::note
When you add seats or enable the SSO add-on, the change applies immediately. You are charged a prorated amount for the remainder of the current billing period.

When you remove seats or disable the SSO add-on, the change takes effect at the next renewal. Your current seat count and add-ons stay active until then.

If you add seats and disable SSO in the same change, the seat increase applies immediately with a prorated charge. SSO removal is still deferred to the next renewal.
:::

### Canceling a Growth subscription

To cancel an active Growth subscription:

1. Click **Cancel subscription**.
2. In the *Cancel subscription* dialog, click **Confirm** to schedule the cancellation.

Cancellations are effective at the end of the billing period. While the change is pending, you can undo the scheduled cancellation and reactivate your subscription.

You can also reactivate a canceled subscription even after the cancellation has taken effect. To reactivate, click **Reactivate** on the subscription card and follow the steps.

## Payment methods

The *Payment methods* tab lets you manage the payment cards used for your subscriptions.

<ThemedImage
alt="Billing portal screenshot: payment methods"
sources={{
    light: '/img/assets/billing-portal/billing-portal-payment-methods.png',
    dark: '/img/assets/billing-portal/billing-portal-payment-methods_DARK.png',
}}
/>

### Adding a new card

To add a new card:
1. Click **Add card**.
2. In the *Add payment method* dialog, enter the card number, expiration date, and CVV/CVC.
3. Optionally, tick **Set as default payment method**.
4. Click **Save**.

:::note
The default card will be used for all subscription-related transactions, including add-ons and overages.
:::

### Updating or removing a card

To update an existing payment card:

1. Click the <Icon name="dots-three-outline" /> icon of the payment card you want to edit.
2. Do one of the following:
   - Click **Set as default** to make this your default card.
   - Click **Edit card**, update the card number, expiration date, and CVV/CVC, then click **Save**.

To remove an existing payment card:

1. Click the <Icon name="dots-three-outline" /> icon of the payment card you want to delete.
2. Click **Remove card**.
3. Click **Confirm** in the *Remove payment method* dialog.

:::caution
You cannot remove your default card. In cases where a secondary card is attached to a subscription (e.g. for Cloud subscriptions), removing the card will automatically cancel all the subscriptions attached to that card.
:::

## Billing details

The *Billing details* tab lets you view and edit account billing information. Required fields in this section must be completed to activate a trial subscription.

<ThemedImage
alt="Billing portal screenshot: billing details"
sources={{
    light: '/img/assets/billing-portal/billing-portal-billing-details.png',
    dark: '/img/assets/billing-portal/billing-portal-billing-details_DARK.png',
}}
/>

:::note
<TaxesNote />
:::

## Invoices

The *Invoices* tab displays all invoices for your Strapi subscriptions and their status.

<ThemedImage
alt="Billing portal screenshot: invoices"
sources={{
    light: '/img/assets/billing-portal/billing-portal-invoices.png',
    dark: '/img/assets/billing-portal/billing-portal-invoices_DARK.png',
}}
/>

Invoices can have any of the following statuses:
- **Paid**: the payment has been received and the invoice is available, no additional action is required.
- **Pending**: the invoice is not complete or validated yet or the payment didn't go through and needs to be fixed.
- **Unpaid**: the payment has failed and won't automatically be retried.
- **Voided**: the invoice has been canceled.

Click the ![download icon](/img/assets/icons/download.svg) icon to download an invoice.
