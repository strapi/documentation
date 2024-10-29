---
title: Managing individual assets
description: Instructions on how to manage assets uploaded to the Media Library, including editing, moving, and deleting assets, and cropping images.
tags:
- admin panel
- Content Manager
- Content-type Builder
- images
- media library
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'
import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Managing individual assets

The Media Library allows managing assets, which includes modifying assets' file details and location, downloading and copying the link of the assets file, and deleting assets. Image files can also be cropped. To manage an asset, click on its Edit <Icon name="pencil-simple" /> button.

## Editing assets

Clicking on the edit <Icon name="pencil-simple" /> button of an asset opens up a "Details" window, with all the available options.

<ThemedImage
  alt="Annotated asset details window screenshot"
  sources={{
    light: '/img/assets/media-library/media-library_asset-details.png',
    dark: '/img/assets/media-library/media-library_asset-details_DARK.png',
  }}
/>

- On the left, above the preview of the asset, control buttons <ScreenshotNumberReference number="1" /> allow performing various actions:
  - click on the delete button <Icon name="trash"/> to delete the asset,
  - click on the download button <Icon name="download-simple" classes="ph-bold"/> to download the asset,
  - click on the copy link button <Icon name="link" classes="ph-bold"/> to copy the asset's link to the clipboard,
  - optionally, click on the crop button <Icon name="crop" classes="ph-bold"/> to enter cropping mode for the image (see [cropping images](#cropping-images)).
- On the right, meta data for the asset is displayed at the top of the window <ScreenshotNumberReference number="2" /> and the fields below can be used to update the _File name_, _Alternative text_, _Caption_ and _Location_ (see [organizing assets with folders](/user-docs/media-library/organizing-assets-with-folders.md)) for the asset <ScreenshotNumberReference number="3" />.
- At the bottom, the **Replace Media** button <ScreenshotNumberReference number="4" /> can be used to replace the asset file but keep the existing content of the other editable fields, and the **Finish** button is used to confirm any updates to the fields.

## Moving assets

An individual asset can be moved to a folder when editing its details.

To move an asset:

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be moved.
2. In the window that pops up, click the _Location_ field and choose a different folder from the drop-down list.
3. Click **Save** to confirm.

:::note
Assets can also be moved to other folders from the main view of the Media Library (see [organizing assets with folders](/user-docs/media-library/organizing-assets-with-folders.md#moving-assets-to-a-folder)). This includes the ability to move several assets simultaneously.
:::

## Cropping images

Images can be cropped when editing the asset's details.

To crop an image:

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be cropped.
2. In the window that pops up, click the crop button <Icon name="crop" classes="ph-bold"/> to enter cropping mode.
3. Crop the image using handles in the corners to resize the frame. The frame can also be moved by drag & drop.
4. Click the crop <Icon name="check" classes="ph-bold"/> button to validate the new dimensions, and choose either to **crop the original asset** or to **duplicate & crop the asset** (i.e. to create a copy with the new dimensions while keeping the original asset untouched). Alternatively, click the stop cropping <Icon name="x" classes="ph-bold"/> button to cancel and quit cropping mode.
<!-- TODO: ask devs because there seems to be a bug/unintuitive behavior:  choosing crop the original asset does not quit cropping mode 😅  -->
5. Click **Finish** to save changes to the file.

## Deleting assets

An individual asset can be deleted when editing its details.

To delete an asset:

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be deleted.
2. In the window that pops up, click the delete button <Icon name="trash"/> in the control buttons bar above the asset's preview.
3. Click **Confirm**.

:::tip
Assets can also be deleted individually or in bulk from the main view of the Media Library. Select assets by clicking on their checkbox in the top left corner, then click the Delete icon <Icon name="trash"/> at the top of the window, below the filters and sorting options.
:::
