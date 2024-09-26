---
title: Creating a release
description: Instructions to create a release from the admin panel
tags:
- admin panel
- Enterprise feature
- Releases feature
- Strapi Cloud
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Creating a release  <EnterpriseBadge /> <CloudTeamBadge />

The ![Releases icon](/img/assets/icons/v5/PaperPlane.svg) [Releases](/user-docs/releases/introduction) page allows creating new releases that will be used to organize entries.

<!-- TODO: update screenshot to show scheduling -->
<ThemedImage
  alt="Adding a new release"
  sources={{
    light: '/img/assets/releases/new-release.png',
    dark: '/img/assets/releases/new-release_DARK.png',
  }}
/>

<br /><br />

To create a new release:

1. Click the ![Plus icon](/img/assets/icons/v5/Plus.svg) **New Release** button in the upper right corner of the Releases page.  
2. Give the release a name.
3. (_optional_) If you want to schedule the release publication instead of publishing the release manually, check the **Schedule release** checkbox and define the date, time, and timezone for publication. Scheduling is currently a <FutureBadge /> feature (see [scheduling a release](/user-docs/releases/managing-a-release#scheduling-a-release-) for details).
4. Click the **Continue** button.

Adding entries to a release must be done from the Content Manager. You can add a single entry to a release while creating or editing the entry [in the edit view](/user-docs/content-manager/adding-content-to-releases).

<!-- TODO: for later, when multiple addition is implemented, probably in 4.20 -->
<!-- 
Adding entries to a release must be done from the Content Manager:

- You can add multiple entries to a release [from the list view](/user-docs/content-manager/adding-content-to-releases#adding-multiple-entries-to-a-release).
- You can also add a single entry to a release while creating or editing the entry [in the edit view](/user-docs/content-manager/adding-content-to-releases#adding-a-single-entry-to-a-release). -->
