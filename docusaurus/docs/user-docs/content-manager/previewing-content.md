---
title: Previewing content
description: With the Preview feature, you can preview your front-end directly from the Content Manager
displayedSidebar: userSidebar
tags:
- content manager
- preview
---

# Previewing content <NewBadge />

With the Preview feature, you can preview your front end application directly from Strapi's admin panel. This is helpful to see how updates to your content in the Edit View of the Content Manager will affect the final result.

:::prerequisites
- The Strapi admin panel user should have read permissions for the content-type.
- The Preview feature should be configured in the code of the `config/admin` file (see [Developer Docs](/dev-docs/preview)).
- A front-end application should already be created and running so you can preview it.
- Additionally, the side panel is only available if you installed strapi with the beta flag, with the following command: `npx create-strapi@beta`.
:::

Once the Preview feature is properly set up, an **Open preview** button is visible on the right in the Edit View of the Content Manager. Clicking it will display a side panel with the preview of your content as it will appear in your front-end application, but directly within Strapi's the admin panel.

<!-- TODO: add a dark mode screenshot -->
<ThemedImage
  alt="Previewing content"
  sources={{
    light: '/img/assets/content-manager/previewing-content2.gif',
    dark: '/img/assets/content-manager/previewing-content2.gif',
  }}
/>

Once the Preview is open, you can:

- click the close button ![Close button](/img/assets/icons/close-icon.svg) in the upper left corner to go back to the Edit View of the Content Manager,
- switch between previewing the draft and the published version (if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled for the content-type),
- and click the link icon ![Link icon](/img/assets/icons/v5/Link.svg) in the upper right corner to copy the preview link. Depending on the preview tab you are currently viewing, this will either copy the link to the preview of the draft or the published version.

Additionally, you can:
- with <GrowthBadge /> and <EnterpriseBadge /> plans, expand the side panel by clicking on the <Icon name="arrow-line-left" classes="ph-bold" /> button to make the Preview full screen,
- and, with the <EnterpriseBadge /> plan, use buttons at the top right of the editor to define the assignee and stage for the [Review Workflows feature](/user-docs/content-manager/reviewing-content) if enabled.

:::info
Please note that the side panel for Preview is currently in beta and only accessible if you installed strapi with the beta flag, with the following command: `npx create-strapi@beta`.
:::

:::note
In the Edit view of the Content Manager, the Open preview button will be disabled if you have unsaved changes. Save your latest changes and you should be able to preview content again.
:::
