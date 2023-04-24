---
sidebar_position: 3
title: Media Library
---

# Configuring the Media Library

The [Media Library](/user-docs/media-library) displays all assets uploaded in the Strapi application. The Media Library settings allow controlling the format, file size, and orientation of uploaded assets. Those settings can be configured from ![Settings icon](/img/assets/icons/settings.svg) *Settings > Global settings > Media Library*.

![Media Library settings](/img/assets/settings/settings_media-library.png)

To configure the Media Library settings:

1. Go to the *Global settings > Media Library* sub-section of the settings interface.
2. Define your chosen new settings:

    | Setting name   | Instructions   | Default value |
    | -------------------------- | ----------------------- |---------------|
    | Responsive friendly upload | Enabling this option will generate multiple formats (small, medium and large) of the uploaded asset. | True          |
    | Size optimization          | Enabling this option will reduce the image size and slightly reduce its quality.                     | True          |
    | Auto orientation           | Enabling this option will automatically rotate the image according to EXIF orientation tag.          | False         |

3. Click on the **Save** button.