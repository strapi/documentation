---
title: Previewing content
description: With the Preview feature, you can preview your front-end directly from the Content Manager
displayedSidebar: userSidebar
tags:
- content manager
- preview
---

# Previewing content <BetaBadge />

With the Preview feature, you can preview your front end application directly from Strapi's admin panel. This is helpful to see how updates to your content in the Edit View of the Content Manager will affect the final result.

<!-- TODO: add a dark mode GIF -->
<ThemedImage
  alt="Previewing content"
  sources={{
    light: '/img/assets/content-manager/previewing-content.gif',
    dark: '/img/assets/content-manager/previewing-content.gif',
  }}
/>

:::prerequisites
- The Strapi admin panel user should have read permissions for the content-type.
- While the Preview feature is in beta, it should be enabled with the `future.preview` feature flag set to `true` in `config/features` (see [Developer Docs](/dev-docs/configurations/features)).
- The Preview feature should be configured in the code of the `config/admin` file (see [Developer Docs](/dev-docs/preview)).
- A front-end application should already be created and running so you can preview it.
:::

When the Preview feature is properly set up, an **Open preview** button is visible on the right in the Edit View of the Content Manager. Clicking it will display the preview of your content as it will appear in your front-end application, but directly within Strapi's the admin panel:

<!-- TODO: add a dark mode screenshot -->
<ThemedImage
  alt="Previewing content"
  sources={{
    light: '/img/assets/content-manager/previewing-content.png',
    dark: '/img/assets/content-manager/previewing-content.png',
  }}
/>

From the Preview screen, you can:

- click the close button ![Close button](/img/assets/icons/close-icon.svg) in the upper left corner to go back to the Edit View of the Content Manager,
- switch between previewing the draft and the published version (if [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) is enabled for the content-type),
- and click the link icon ![Link icon](/img/assets/icons/v5/Link.svg) in the upper right corner to copy the preview link. Depending on the preview tab you are currently viewing, this will either copy the link to the preview of the draft or the published version.

:::note
In the Edit view of the Content Manager, the Open preview button will be disabled if you have unsaved changes. Save your latest changes and you should be able to preview content again.
:::
