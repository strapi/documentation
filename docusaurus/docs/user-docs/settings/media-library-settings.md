---
sidebar_position: 3
title: Media Library
tags:
- admin panel
- media library
- plugins
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Configuring the Media Library

The [Media Library](/user-docs/media-library) displays all assets uploaded in the Strapi application. The Media Library settings allow controlling the format, file size, and orientation of uploaded assets. Those settings can be configured from <Icon name="gear-six" /> *Settings > Global settings > Media Library*.

<ThemedImage
  alt="Media Library settings"
  sources={{
    light: '/img/assets/settings/settings_media-library.png',
    dark: '/img/assets/settings/settings_media-library_DARK.png',
  }}
/>

To configure the Media Library settings:

1. Go to the *Global settings > Media Library* sub-section of the settings interface.
2. Define your chosen new settings:

    | Setting name   | Instructions   | Default value |
    | -------------------------- | ----------------------- |---------------|
    | Responsive friendly upload | Enabling this option will generate multiple formats (small, medium and large) of the uploaded asset. | True          |
    | Size optimization          | Enabling this option will reduce the image size and slightly reduce its quality.                     | True          |
    | Auto orientation           | Enabling this option will automatically rotate the image according to EXIF orientation tag.          | False         |

3. Click on the **Save** button.
