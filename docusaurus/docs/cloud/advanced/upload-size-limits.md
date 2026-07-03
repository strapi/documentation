---
title: Upload size limits for Strapi Cloud
displayed_sidebar: cloudSidebar
description: Reference for the file size and memory-based upload limits that apply to Strapi Cloud projects.
canonicalUrl: https://docs.strapi.io/cloud/advanced/upload-size-limits.html
tags:
- configuration
- upload provider
- Media Library
- Strapi Cloud
- Strapi Cloud configuration
- Strapi Cloud project
---

# Upload size limits for Strapi Cloud

<Tldr>
Non-image files are capped at 200 MB on all plans. Image files have a memory-based recommended maximum that varies by format, plan, and Media Library settings. To upload larger images, disable Responsive friendly upload and Size optimization.
</Tldr>

Strapi Cloud applies 2 distinct limits to uploads. The first is a hard maximum file size, enforced at the infrastructure level for non-image files. The second is a memory-based recommendation for image files that depends on your CMS settings.

## Maximum upload file size for non-image files

Non-image uploads are capped at 200 MB on all Strapi Cloud plans. The cap is enforced at the infrastructure level and cannot be overridden via the `strapi::body` middleware configuration.

## Recommended maximum upload size for image files

Image uploads are subject to an additional, memory-driven recommendation that is independent of the non-image cap and varies by image format.

:::tip Uploading a large image?
To upload an image larger than the recommended maximum, disable both Responsive friendly upload and Size optimization in the [Media Library settings](/cms/features/media-library#configuring-settings). The CMS then stores the source file as-is without in-process processing, which raises the recommended maximum (see the _Processing off_ values in the tables below).
:::

When Responsive friendly upload and Size optimization are both enabled in the [Media Library settings](/cms/features/media-library#configuring-settings), the CMS resizes the source image and generates a set of thumbnails (small, medium, large) in the instance's memory before persisting them. This processing happens in-process, regardless of the configured upload provider.

Switching to a third-party provider (Amazon S3, Cloudinary, etc.) is not a workaround. The resize and thumbnail generation step still runs inside the Strapi Cloud instance and still requires memory proportional to the source image dimensions.

Actual memory usage depends on the image dimensions, format, and your Media Library settings. The values in the following tables are a recommendation, not a hard limit. Uploads above the recommended size are likely to cause the instance to run out of memory and restart.

The recommendation depends on whether Responsive friendly upload and Size optimization are enabled in the [Media Library settings](/cms/features/media-library#configuring-settings):

- _Processing on_: both settings enabled, with the default `small`, `medium`, and `large` sizes. Strapi generates the thumbnails in memory, so the safe upload size is lower.
- _Processing off_: both settings disabled. The source image is stored as-is with no in-process processing, so the safe upload size is higher.

Recommended maximum image size, expressed in megapixels (MP), per format and plan:

<Tabs groupId="processing">
<TabItem value="on" label="Processing on">

| Format | Essential | Pro & Scale |
|--------|------------------|-------------|
| JPEG   | 26 MP            | 135 MP      |
| PNG    | 10 MP            | 90 MP       |
| WebP   | 4 MP             | 12 MP       |
| TIFF   | 24 MP            | 125 MP      |
| AVIF   | 92 MP            | 92 MP       |

</TabItem>
<TabItem value="off" label="Processing off">

| Format | Essential | Pro & Scale |
|--------|------------------|-------------|
| JPEG   | 224 MP           | 265 MP      |
| PNG    | 24 MP            | 115 MP      |
| WebP   | 15 MP            | 40 MP       |
| TIFF   | 24 MP            | 125 MP      |
| AVIF   | 96 MP            | 96 MP       |

</TabItem>
</Tabs>

:::note Converting pixels to megapixels
The number of megapixels of an image is its width multiplied by its height in pixels, divided by 1,000,000. The pixel dimensions that match a given megapixel count depend on the aspect ratio. For a square image, 1 MP is roughly 1000×1000 px, 4 MP is roughly 2000×2000 px, and 100 MP is roughly 10000×10000 px.
:::

:::strapi Configuring a provider
To configure external storage such as Amazon S3 or Cloudinary, see [Upload Provider Configuration for Strapi Cloud](/cloud/advanced/upload).
:::
