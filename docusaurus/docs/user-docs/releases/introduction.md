---
title: Introduction to Releases
description: Introduction to the Releases feature that enables content managers to organize entries to publish/unpublish simultaneously
---

# Releases <EnterpriseBadge /> <CloudTeamBadge/> <FutureBadge /> <AlphaBadge/>

Releases enables content managers to organize entries into containers that can perform publish and unpublish actions simultaneously. A release can contain entries from different content types and can mix locales.
<!-- TODO: comment out once it's available — grouping is not available with the alpha release -->
<!-- Entries can be grouped by content type or locale, facilitating review and editing before publication. -->

Releases is currently only available as an experimental feature. To enable it, set the appropriate future flag. See <a href="/dev-docs/configurations/features">future flags</a> documentation for instructions on how to enable a future flag.

<ThemedImage
  alt="List of Releases"
  sources={{
    light: '/img/assets/releases/releases-overview.png',
    dark: '/img/assets/releases/releases-overview_DARK.png',
  }}
/>

<!-- TODO: update Releases icon with the neutral version -->
Administrators can access Releases from ![Releases icon](/img/assets/icons/releases.svg) _Releases_ in the main navigation of the admin panel.

From the Releases view, it is possible to:

<!-- TODO: add numbers to reflect screenshot -->
- [create a new release](/user-docs/releases/creating-a-release)
- view pending and done releases
- click on a release to [manage its content](/user-docs/releases/managing-a-release)

:::info
It's not currently possible to schedule the publication of a release, so releases should be published manually. Automatic scheduling will be added in a future version of Strapi.
:::
