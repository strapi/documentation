---
title: Introduction to Releases
description: Introduction to the Releases plugin that enable content managers to group entries to publish/unpublish simultaneously
---

# Releases <FutureBadge /> <EnterpriseBadge /> <CloudTeamBadge/> <CloudProBadge />

:::strapi Experimental feature enabled with a Future flag
Releases is currently only available as an experimental, future flag for <EnterpriseBadge /> users. See [future flags](/dev-docs/configurations/future-flags) documentation for instructions on how to enable a future flag.
:::

Releases enable content managers to group several entries to publish/unpublish them simultanously. Entries can be grouped by content type or locale, facilitating review and editing before publication.

<!-- TODO: add actual screenshots for both light and dark modes -->
<ThemedImage
  alt="List of Releases"
  sources={{
    light: '/img/assets/releases/releases-overview.png',
    dark: '/img/assets/releases/releases-overview.png',
  }}
/>

<!-- TODO: annotate screenshots to add numbers -->

<!-- TODO: update Releases icon with the neutral version -->
Administrators can access Releases from ![Releases icon](/img/assets/icons/releases.svg) _Releases_ in the main navigation of the admin panel.

From the Releases view, it is possible to:

<!-- TODO: add numbers to reflect screenshot -->
- [create a new release](/user-docs/releases/creating-a-release)
- view active and archived releases
- click on a release to [manage its content](/user-docs/releases/managing-a-release)

:::info
It's not currently possible to schedule the publication of a release, so releases should be published manually. Automatic scheduling will be added in a future version of Strapi.
:::
