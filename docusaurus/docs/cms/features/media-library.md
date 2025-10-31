---
title: Media Library
sidebar_position: 1
description: Learn to use the Media Library which allows to display and manage all assets uploaded in the application.
toc_max_heading_level: 5
tags:
- admin panel
- features
- media library
---

import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';
import MediaLibraryProvidersList from '/docs/snippets/media-library-providers-list.md';
import StrapiAiCredits from '/docs/snippets/strapi-ai-credits.md'

# Media Library

<Tldr>
Media Library centralizes all uploaded assets with search, filters, and folder organization. This documentation includes provider options, upload workflows, and explanations on inserting media into content.
</Tldr>

The <Icon name="images" /> Media Library is the Strapi feature that displays all assets uploaded in the Strapi application and allows users to manage them.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Minimum "Access the Media Library" permission in Roles > Plugins - Upload</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available and activated by default</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<Guideflow lightId="mk6z26zaqp" darkId="9r2m74otok"/>

## Configuration

Some configuration options for the Media Library are available in the admin panel, and some are handled via your Strapi project's code.

### Admin panel configuration

In the admin panel, some Media Library settings are available via the Global Settings to manage the format, file size, and orientation of uploaded assets. It is also possible, directly via the Media Library to configure the view.

#### Configuring settings

**Path to configure the feature:** <Icon name="gear-six" /> Settings > Global Settings > Media Library.

1. Define your chosen new Media Library settings:

    | Setting name   | Instructions   | Default value |
    | -------------------------- | ----------------------- |---------------|
    | Generate AI captions and alt texts automatically on upload! | Enabling this option will turn on [AI&#8209;powered metadata generation](#ai-powered-metadata-generation) <GrowthBadge /> | True |
    Responsive friendly upload | Enabling this option will generate multiple formats (small, medium and large) of the uploaded asset.<br/>Default sizes for each format can be [configured through the code](#responsive-images). | True          |
    | Size optimization          | Enabling this option will reduce the image size and slightly reduce its quality.                     | True          |
    | Auto orientation           | Enabling this option will automatically rotate the image according to EXIF orientation tag.          | False         |

2. Click on the **Save** button.

<ThemedImage
  alt="Media Library settings"
  sources={{
    light: '/img/assets/settings/settings_media-library-2.png',
    dark: '/img/assets/settings/settings_media-library-2_DARK.png',
  }}
/>

#### Configuring the view

**Path to configure the feature:** <Icon name="images" /> Media Library

1. Click on the <Icon name="gear-six" /> button just above the list of folders and assets, on the right side of the interface.
2. Configure the Media Library view, following the instructions below:
    | Setting name              | Instructions                                                              |
    | ------------------------- | ------------------------------------------------------------------------- |
    | Entries per page          | Use the dropdown to define the number of assets displayed by default per page. |
    | Default sort order        | Use the dropdown to define the default order in which assets are displayed. This can be overriden when sorting assets in the Media Library. |

:::note
Both settings are used as the defaults in the Media Library and in the Content Manager's media upload modal. These settings are global across the entire Strapi project for all users.
:::

<ThemedImage
  alt="Configure the view"
  sources={{
    light: '/img/assets/media-library/media-library_configure-the-view.png',
    dark: '/img/assets/media-library/media-library_configure-the-view_DARK.png',
  }}
/>

### Code-based configuration

The Media Library is powered in the backend server by the Upload package, which can be configured and extended through providers.

#### Providers

<MediaLibraryProvidersList />

If you need to install other providers or create your own, please refer to the following guide:

<CustomDocCardsWrapper>
<CustomDocCard icon="plug" title="Media Library Providers" link="/cms/configurations/media-library-providers" description="Learn how you can add additional providers or create your own." />
</CustomDocCardsWrapper>

:::info
Code-based configuration instructions on the present page detail options for the default upload provider. If using another provider, please refer to the available configuration parameters in that provider's documentation.
:::

#### Available options

When using the default upload provider, the following specific configuration options can be declared in an `upload.config` object within [the `config/plugins` file](/cms/configurations/plugins). All parameters are optional:

| Parameter                                   | Description                                                                                                         | Type    | Default |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| `providerOptions.localServer`        | Options that will be passed to <ExternalLink to="https://github.com/koajs/static" text="koa-static"/> upon which the Upload server is build (see [local server configuration](#local-server)) | Object  | -       |
| `sizeLimit`                                  | Maximum file size in bytes (see [max file size](#max-file-size)) | Integer | `209715200`<br/><br/>(200 MB in bytes, i.e., 200 x 1024 x 1024 bytes) |
| `breakpoints`             | Allows to override the breakpoints sizes at which responsive images are generated when the "Responsive friendly upload" option is set to `true` (see [responsive images](#responsive-images)) | Object | `{ large: 1000, medium: 750, small: 500 }` |
| `security`             | Configures validation rules for uploaded files to enhance media security | Object | - |

:::note
The Upload request timeout is defined in the server options, not in the Upload plugin options, as it's not specific to the Upload plugin but is applied to the whole Strapi server instance (see [upload request timeout](#upload-request-timeout)).
:::

:::note
If you wish to override the image function to generate custom file names, please refer to the [Plugins extension](/cms/plugins-development/plugins-extension#within-the-extensions-folder) documentation.
:::

#### Example custom configuration

The following is an example of a custom configuration for the Upload plugin when using the default upload provider:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env })=>({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
      sizeLimit: 250 * 1024 * 1024, // 256mb in bytes
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
      security: {
        allowedTypes: ['image/*', 'application/pdf'],
        deniedTypes: ['application/x-sh', 'application/x-dosexec']
      },
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
export default () => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
      sizeLimit: 250 * 1024 * 1024, // 256mb in bytes
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
      security: {
        allowedTypes: ['image/*', 'application/pdf'],
        deniedTypes: ['application/x-sh', 'application/x-dosexec']
      },
    },
  },
})
```

</TabItem>

</Tabs>

#### Local server

By default Strapi accepts `localServer` configurations for locally uploaded files. These will be passed as the options for <ExternalLink to="https://github.com/koajs/static" text="koa-static"/>.

You can provide them by creating or editing [the `/config/plugins` file](/cms/configurations/plugins). The following example sets the `max-age` header:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env })=>({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
export default ({ env }) => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
    },
  },
});
```
</TabItem>

</Tabs>

#### Max file size

The Strapi middleware in charge of parsing requests needs to be configured to support file sizes larger than the default of 200MB. This must be done in addition to provider options passed to the Upload package for `sizeLimit`.

:::caution
You may also need to adjust any upstream proxies, load balancers, or firewalls to allow for larger file sizes. For instance, <ExternalLink to="http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size" text="Nginx"/> has a configuration setting called `client_max_body_size` that must be adjusted, since its default is only 1mb.
:::

The middleware used by the Upload package is [the `body` middleware](/cms/configurations/middlewares#body). You can pass configuration to the middleware directly by setting it in the `/config/middlewares` file:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/middlewares.js"
module.exports = [
  // ...
  {
    name: "strapi::body",
    config: {
      formLimit: "256mb", // modify form body
      jsonLimit: "256mb", // modify JSON body
      textLimit: "256mb", // modify text body
      formidable: {
        maxFileSize: 250 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
      },
    },
  },
  // ...
];
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```js title="/config/middlewares.ts"
export default [
  // ...
  {
    name: "strapi::body",
    config: {
      formLimit: "256mb", // modify form body
      jsonLimit: "256mb", // modify JSON body
      textLimit: "256mb", // modify text body
      formidable: {
        maxFileSize: 250 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
      },
    },
  },
  // ...
];
```

</TabItem>

</Tabs>

In addition to the middleware configuration, you can pass the `sizeLimit`, which is an integer in bytes, in the [/config/plugins file](/cms/configurations/plugins):

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
    }
  }
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```js title="/config/plugins.ts"
export default {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
    }
  }
};
```

</TabItem>

</Tabs>

#### Security

The Upload plugin validates files based on their actual MIME type rather than the declared file extension.
Only files matching the defined security rules are uploaded; others are filtered out.

The `security` configuration provides 2 options: `allowedTypes` or `deniedTypes`, which let you control which file types can or cannot be uploaded.

:::note
It's best to define either `allowedTypes` or `deniedTypes`, not both, to avoid conflicts in file validation logic.
:::

You can provide them by creating or editing [the `/config/plugins` file](/cms/configurations/plugins). The following example sets the `allowedTypes` filter:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = {
  // ...
  upload: {
    config: {
      security: {
        allowedTypes: ['image/*', 'application/pdf']
      },
    }
  }
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```js title="/config/plugins.ts"
export default {
  // ...
  upload: {
    config: {
      security: {
        allowedTypes: ['image/*', 'application/pdf']
      },
    }
  }
};
```

</TabItem>

</Tabs>

#### Upload request timeout

By default, the value of `strapi.server.httpServer.requestTimeout` is set to 330 seconds. This includes uploads.

To make it possible for users with slow internet connection to upload large files, it might be required to increase this timeout limit. The recommended way to do it is by setting the `http.serverOptions.requestTimeout` parameter in [the `config/servers` file](/cms/configurations/server).

An alternate method is to set the `requestTimeout` value in [the `bootstrap` function](/cms/configurations/functions#bootstrap) that runs before Strapi gets started. This is useful in cases where it needs to change programmatically—for example, to temporarily disable and re-enable it:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/index.js"
module.exports = {

  //...

  bootstrap({ strapi }) {
    // Set the requestTimeout to 1,800,000 milliseconds (30 minutes):
    strapi.server.httpServer.requestTimeout = 30 * 60 * 1000;
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/index.ts"
export default {

  //...

  bootstrap({ strapi }) {
    // Set the requestTimeout to 1,800,000 milliseconds (30 minutes):
    strapi.server.httpServer.requestTimeout = 30 * 60 * 1000;
  },
};
```

</TabItem>

</Tabs>

#### Responsive Images

When the [`Responsive friendly upload` admin panel setting](#admin-panel-configuration) is enabled, the plugin will generate the following responsive image sizes:

| Name    | Largest dimension |
| :------ | :--------- |
| large   | 1000px     |
| medium  | 750px      |
| small   | 500px      |

These sizes can be overridden in `/config/plugins`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  upload: {
    config: {
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```js title="/config/plugins.ts"
export default ({ env }) => ({
  upload: {
    config: {
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
    },
  },
});
```

</TabItem>

</Tabs>

:::caution
Breakpoint changes will only apply to new images, existing images will not be resized or have new sizes generated.
:::

## Usage

**Path to use the feature:** <Icon name="images" /> Media Library

The Media Library displays all assets uploaded in the application, either via the <Icon name="images" /> Media Library itself or via the <Icon name="feather" /> Content Manager when managing a media field.

Assets uploaded to the Media Library can be inserted into content-types using the [Content Manager](/cms/features/content-manager#creating--writing-content).

<ThemedImage
  alt="Media Library overview, annotated"
  sources={{
    light: '/img/assets/media-library/media-library_overview2.png',
    dark: '/img/assets/media-library/media-library_overview2_DARK.png',
  }}
/>

From the Media Library, it is possible to:

- upload a new asset (see [adding assets](/cms/features/media-library#adding-assets)) or create a new folder (see [organizing assets with folders](/cms/features/media-library#organizing-assets-with-folders)) <ScreenshotNumberReference number="1" />,
- sort the assets and folders or set filters <ScreenshotNumberReference number="2" /> to find assets and folders more easily,
- toggle between the list view <Icon name="list" classes="ph-bold"/> and the grid view <Icon name="squares-four"/> to display assets, access settings <Icon name="gear-six" /> to [configure the view](#configuring-the-view), and make a textual search <Icon name="magnifying-glass" classes="ph-bold" /> <ScreenshotNumberReference number="3" /> to find a specific asset or folder,
- and view, navigate through, and manage folders <ScreenshotNumberReference number="4" />.

:::tip
Click the search icon <Icon name="magnifying-glass" classes="ph-bold" /> on the right side of the user interface to use a text search and find one of your assets or folders more quickly!
:::

<!--
### Filtering assets

Right above the list of folders and assets, on the left side of the interface, a !<Icon name="funnel-simple" classes="ph-bold" /> **Filters** button is displayed. It allows setting one or more condition-based filters, which add to one another (i.e. if you set several conditions, only the assets that match all the conditions will be displayed).

<ThemedImage
  alt="Filters"
  sources={{
    light: '/img/assets/media-library/media-library_filters.png',
    dark: '/img/assets/media-library/media-library_filters_DARK.png',
  }}
/>

To set a new filter:

1. Click on the !<Icon name="funnel-simple" classes="ph-bold" /> **Filters** button.
2. Click on the 1st drop-down list to choose the field on which the condition will be applied.
3. Click on the 2nd drop-down list to choose the type of condition to apply.
4. For conditions based on the type of asset to filter, click on the 3rd drop-down list and choose a file type to include or exclude. For conditions based on date and time (i.e. _createdAt_ or _updatedAt_ fields), click on the left field to select a date and click on the right field to select a time.
5. Click on the **Add filter** button.

:::note
When active, filters are displayed next to the !<Icon name="funnel-simple" classes="ph-bold" /> **Filters** button. They can be removed by clicking on the delete icon <Icon name="x" />.
:::
-->

<!--
### Sorting assets

<ThemedImage
  alt="Sort"
  sources={{
    light: '/img/assets/media-library/media-library_sort.png',
    dark: '/img/assets/media-library/media-library_sort_DARK.png',
  }}
/>

Just above the list of folders and assets and next to the !<Icon name="funnel-simple" classes="ph-bold" /> **Filters** button, on the left side of the interface, a drop-down button is displayed. It allows to sort the assets by upload date, alphabetical order or date of update. Click on the drop-down button and select an option in the list to automatically display the sorted assets.
-->

### Adding assets

<details>
<summary>List of media types and extensions supported by the Media Library</summary>

| Media type | Supported extensions                                            |
| ---------- | --------------------------------------------------------------- |
| Image      | - JPEG<br />- PNG<br />- GIF<br />- SVG<br />- TIFF<br />- ICO<br />- DVU   |
| Video      | - MPEG<br />- MP4<br />- MOV (Quicktime)<br />- WMV<br />- AVI<br />- FLV |
| Audio      | - MP3<br />- WAV<br />- OGG                                         |
| File       | - CSV<br />- ZIP<br />- PDF<br />- XLS, XLSX<br />- JSON                |
<br/>

</details>

1. Click the **Add new assets** button in the upper right corner of the Media Library.
2. Choose whether you want to upload the new asset from your computer or from an URL:
    - from the computer, either drag & drop the asset directly or browse files on your system,
    - from an URL, type or copy and paste an URL(s) in the _URL_ field, making sure multiple URLs are separated by carriage returns, then click **Next**.
3. (optional) Click the edit button <Icon name="pencil-simple" /> to view asset metadata and define a _File name_, _Alternative text_ and a _Caption_ for the asset (see [Managing individual assets](#managing-assets)).
4. (optional) Add more assets by clicking **Add new assets** and going back to step 2.
5. Click on **Upload assets to the library**.

<ThemedImage
  alt="Add new assets window"
  sources={{
    light: '/img/assets/media-library/media-library_add-new-assets.png',
    dark: '/img/assets/media-library/media-library_add-new-assets_DARK.png',
  }}
/>

#### Automatically generating metadata with Strapi AI <NewBadge /> {#ai-powered-metadata-generation}
<GrowthBadge />

[When enabled](/cms/configurations/admin-panel#strapi-ai), Strapi AI automatically generates alternative text and captions for images uploaded to the Media Library, helping you improve content accessibility and SEO. A modal window displays the AI-generated alternative text and caption, allowing you to review the metadata and modify it if needed:

<ThemedImage
  alt="AI metadata review modal"
  sources={{
    light: '/img/assets/media-library/media-library_ai-metadata.png',
    dark: '/img/assets/media-library/media-library_ai-metadata_DARK.png',
  }}
/>

AI metadata generation only works with images, not files or videos. The feature is enabled by default, but can be disabled in the [Media Library settings](#configuring-settings) if needed.

<StrapiAiCredits />

### Managing individual assets {#managing-assets}

The Media Library allows managing assets, which includes modifying assets' file details and location, downloading and copying the link of the assets file, and deleting assets. Image files can also be cropped.

#### Editing assets

Click on the edit <Icon name="pencil-simple" /> button of an asset to open up the "Details" window, where all the available asset management options are available.

<ThemedImage
  alt="Annotated asset details window screenshot"
  sources={{
    light: '/img/assets/media-library/media-library_asset-details.png',
    dark: '/img/assets/media-library/media-library_asset-details_DARK.png',
  }}
/>

- On the left, above the preview of the asset, control buttons <ScreenshotNumberReference number="1" /> allow performing various actions:
  - click on the delete button <Icon name="trash" /> to delete the asset,
  - click on the download button <Icon name="download-simple"  /> to download the asset,
  - click on the copy link button <Icon name="link" classes="ph-bold" /> to copy the asset's link to the clipboard,
  - optionally, click on the crop button <Icon name="crop" classes="ph-bold" /> to enter cropping mode for the image (see [Cropping images](#cropping-images)).
- On the right, meta data for the asset is displayed at the top of the window <ScreenshotNumberReference number="2" /> and the fields below can be used to update the _File name_, _Alternative text_, _Caption_ and _Location_ (see [Organizing assets with folders](#organizing-assets-with-folders)) for the asset <ScreenshotNumberReference number="3" />.
- At the bottom, the **Replace Media** button <ScreenshotNumberReference number="4" /> can be used to replace the asset file but keep the existing content of the other editable fields, and the **Finish** button is used to confirm any updates to the fields.

#### Moving assets

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be moved.
2. In the window that pops up, click the _Location_ field and choose a different folder from the drop-down list.
3. Click **Save** to confirm.

:::note
Assets can also be moved to other folders from the main view of the Media Library (see [Organizing assets with folders](#organizing-assets-with-folders)). This includes the ability to move several assets simultaneously.
:::

#### Cropping images

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be cropped.
2. In the window that pops up, click the crop button <Icon name="crop" classes="ph-bold" /> to enter cropping mode.
3. Crop the image using handles in the corners to resize the frame. The frame can also be moved by drag & drop.
4. Click the crop <Icon name="check" classes="ph-bold" /> button to validate the new dimensions, and choose either to **crop the original asset** or to **duplicate & crop the asset** (i.e. to create a copy with the new dimensions while keeping the original asset untouched). Alternatively, click the stop cropping <Icon name="x" classes="ph-bold" /> button to cancel and quit cropping mode.
<!-- TODO: ask devs because there seems to be a bug/unintuitive behavior:  choosing crop the original asset does not quit cropping mode 😅  -->
5. Click **Finish** to save changes to the file.

#### Deleting assets

1. Click on the edit <Icon name="pencil-simple" /> button for the asset to be deleted.
2. In the window that pops up, click the delete button <Icon name="trash" /> in the control buttons bar above the asset's preview.
3. Click **Confirm**.

:::tip
Assets can also be deleted individually or in bulk from the main view of the Media Library. Select assets by clicking on their checkbox in the top left corner, then click the Delete icon <Icon name="trash" /> at the top of the window, below the filters and sorting options.
:::

### Organizing assets with folders

Folders in the Media Library help you organize uploaded assets. Folders sit at the top of the Media Library view or are accessible from the Media field popup when using the [Content Manager](/cms/features/content-manager).

From the Media Library, it is possible to view the list of folders and browse a folder's content, create new folders, edit an existing folder, move assets to a folder, and delete a folder.

:::note
Folders follow the permission system of assets (see [Users & Permissions feature](/cms/features/users-permissions)). It is not yet possible to define specific permissions for a folder.
:::

By default, the Media Library displays folders and assets created at the root level. Clicking a folder navigates to this folder, and displays the following elements:

- the folder title and breadcrumbs to navigate to a parent folder <ScreenshotNumberReference number="1" />
- the subfolders <ScreenshotNumberReference number="2" /> the current folder contains
- all assets <ScreenshotNumberReference number="3" /> from this folder

<ThemedImage
  alt="Media library one folder deep, with back button and updated folder title"
  sources={{
    light: '/img/assets/media-library/media-library_folder-content.png',
    dark: '/img/assets/media-library/media-library_folder-content_DARK.png',
  }}
/>

From this dedicated folder view, folders and assets can be managed, filtered, sorted and searched just like from the main Media Library.

To navigate back to the parent folder, one level up, use the **Back** button at the top of the interface.

:::tip
The breadcrumb navigation can also be used to go back to a parent folder: click on a folder name to directly jump to it or click on the 3 dots `/img.` and select a parent folder from the drop-down list.
:::

#### Adding folders

1. Click on **Add new folder** in the upper right of the Media Library interface.
2. In the window that pops up, type a name for the new folder in the _Name_ field.
3. (optional) In the _Location_ drop-down list, choose a location for the new folder. The default location is the active folder.
4. Click **Create**.

:::note
There is no limit to how deep your folders hierarchy can go, but bear in mind it might take some effort to reach a deeply nested subfolder, as the Media Library currently has no visual hierarchy indication. Searching for files using the <Icon name="magnifying-glass" classes="ph-bold" /> on the right side of the user interface might be a faster alternative to finding the asset you are looking for.
:::

#### Moving assets to a folder

Assets and folders can be moved to another folder from the root view of the Media Library or from any view for a dedicated folder.

1. Select assets and folder to be moved, by clicking the checkbox on the left of the folder name or clicking the asset itself.
2. Click the <Icon name="folder" /> **Move** button at the top of the interface.
3. In the _Move elements to_ pop-up window, select the new folder from the _Location_ drop-down list.
4. Click **Move**.

<ThemedImage
  alt="'Move elements to' popup"
  sources={{
    light: '/img/assets/media-library/media-library_move-assets.png',
    dark: '/img/assets/media-library/media-library_move-assets_DARK.png',
  }}
/>

#### Editing folders

Once created, a folder can be renamed, moved or deleted.

1. In the Folders part of the Media library, hover the folder to be edited and click its edit button <Icon name="pencil-simple" />.
2. In the window that pops up, update the name and location with the _Name_ field and _Location_ drop-down list, respectively.
3. Click **Save**.

#### Deleting folders

Deleting a folder can be done either from the list of folders of the Media Library, or when editing a single folder.

1. Click the checkbox on the left of the folder name. Multiple folders can be selected.
2. Click the <Icon name="trash" /> **Delete** button above the Folders list.
3. In the _Confirmation_ dialog, click **Confirm**.

:::note
A single folder can also be deleted when editing it: hover the folder, click on its edit icon <Icon name="pencil-simple" />, and in the window that pops up, click the **Delete folder** button and confirm the deletion.
:::

### Usage with the REST API

The Media Library feature has some endpoints that can accessed through Strapi's REST API:

<CustomDocCardsWrapper>
<CustomDocCard icon="cube" title="Upload with the REST API" description="Learn how to use the Strapi's REST API to upload files through your code." link="/cms/api/rest/upload"/>
</CustomDocCardsWrapper>

### Use public assets in your code {#public-assets}

Public assets are static files (e.g., images, video, CSS files, etc.) that you want to make accessible to the outside world.

Because an API may need to serve static assets, every new Strapi project includes by default a folder named `/public`. Any file located in this directory is accessible if the request's path doesn't match any other defined route and if it matches a public file name (e.g. an image named `company-logo.png` in `./public/` is accessible through `/company-logo.png` URL).

:::tip
`index.html` files are served if the request corresponds to a folder name (`/pictures` url will try to serve `public/pictures/index.html` file).
:::

:::caution
The dotfiles are not exposed. It means that every file name that starts with `.`, such as `.htaccess` or `.gitignore`, are not served.
:::