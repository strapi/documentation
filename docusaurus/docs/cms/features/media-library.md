---
title: Media Library
displayed_sidebar: cmsSidebar
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

:::strapi New Media Library available in <BetaBadge/>
Strapi has completely reworked the Media Library UI. It is available as a beta feature <VersionBadge version="5.52.2+" noTooltip /> for the next few weeks, before it becomes the default UI. Enable it by setting the `future.betaMediaLibrary` property to `true` in the `config/features` file:

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/config/features.js"
module.exports = () => ({
  future: {
    // highlight-next-line
    betaMediaLibrary: true,
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/features.ts"
export default () => ({
  future: {
    // highlight-next-line
    betaMediaLibrary: true,
  },
});
```

</TabItem>
</Tabs>

Restart your Strapi application after the configuration change. Set the property to `false` and restart Strapi to go back to the previous UI: no asset, folder or setting is lost when you switch either way.

The [Usage](#usage) section of this page describes the new UI. The [Configuration](#configuration) section applies to both. The guided tour above still shows the previous UI.

The flag only changes the <Icon name="images" /> Media Library page of the admin panel. The following are not affected and still behave as documented:

- the media field of the <Icon name="feather" /> Content Manager, which still opens the previous asset picker,
- the <Icon name="gear-six" /> _Settings > Global Settings > Media Library_ page,
- the [Upload REST API](/cms/api/rest/upload).

You can <ExternalLink text="read more about the beta here" to="https://strapi.notion.site/Media-Library-Beta-Release-3c78f3598074810dbad6f2addfa25b6f" /> and report any issue you run into on the <ExternalLink text="strapi/strapi repository" to="https://github.com/strapi/strapi/issues" />.
:::

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

:::caution With the beta Media Library enabled
The <Icon name="gear-six" /> button and the view configuration page are not available while the `betaMediaLibrary` future flag is enabled, because the beta Media Library replaces both settings:

- assets load as you scroll instead of being paginated, so there is no page size to define,
- the sort order is chosen from the toolbar and stored in the page URL (see [sorting assets](#sorting-assets)).

Both settings still apply to the media field of the <Icon name="feather" /> Content Manager. To change them, set the flag back to `false` temporarily.
:::

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
| `sizeLimit`                                  | Maximum file size in bytes (see [max file size](#max-file-size)) | Integer | `1000000000`<br/><br/>(1 GB in bytes) |
| `breakpoints`             | Allows to override the breakpoints sizes at which responsive images are generated when the "Responsive friendly upload" option is set to `true` (see [responsive images](#responsive-images)) | Object | `{ large: 1000, medium: 750, small: 500 }` |
| `sharp`             | Configures <ExternalLink to="https://sharp.pixelplumbing.com/" text="sharp"/> image processing options (see [sharp configuration](#sharp-configuration)) | Object | `{ cache: false, concurrency: 1 }` |
| `security`             | Configures validation rules for uploaded files to enhance media security (see [security](#security)) | Object | - |
| `concurrentUploadSize` | Maximum number of files processed in parallel by the server during a bulk upload (see [concurrent file uploads](#concurrent-file-uploads)). Must be an integer >= 1. | Integer | `1` |
| `concurrentUploadRequests` | Maximum number of files uploaded in parallel by the admin panel during a bulk upload (see [concurrent file uploads](#concurrent-file-uploads)). Must be an integer >= 1. | Integer | `1` |

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
      sharp: {
        cache: true,
        concurrency: 4,
      },
      security: {
        allowedTypes: ['image/*', 'application/*'],
        deniedTypes: ['application/x-sh', 'application/x-dosexec']
      },
      concurrentUploadSize: 5,
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
      sharp: {
        cache: true,
        concurrency: 4,
      },
      security: {
        allowedTypes: ['image/*', 'application/*'],
        deniedTypes: ['application/x-sh', 'application/x-dosexec']
      },
      concurrentUploadSize: 5,
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

:::note Strapi Cloud
On Strapi Cloud, upload size limits are enforced at the infrastructure level. They cannot be raised via the `strapi::body` middleware config. See [Upload size limits for Strapi Cloud](/cloud/advanced/upload-size-limits) for per-plan values and the memory-based recommendation for image uploads.
:::

The Strapi middleware in charge of parsing requests needs to be configured to support file sizes larger than the default of 1 GB. This must be done in addition to provider options passed to the Upload package for `sizeLimit`.

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

```ts title="/config/middlewares.ts"
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

```ts title="/config/plugins.ts"
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
Only files matching the defined security rules are uploaded.

The `security` configuration provides 2 options: `allowedTypes` or `deniedTypes`, which let you control which file types can or cannot be uploaded.

:::tip New projects
Apps scaffolded with `create-strapi-app` include a pre-configured `security` block in the generated `config/plugins.*` file. See the *Security defaults generated by `create-strapi-app`* details block below for the full lists.
:::

##### SVG uploads

Since Strapi <VersionBadge version="5.52.2+" noTooltip />, `image/svg+xml` is part of the `deniedTypes` generated by `create-strapi-app`, so SVG uploads are refused even though they match the `image/*` wildcard in `allowedTypes`. An explicit `deniedTypes` entry always takes precedence over a wildcard in `allowedTypes`.

SVG files can embed browser-active content such as scripts and event handlers, which is why they are denied by default. This affects newly generated projects only: existing projects keep their current configuration unless you add the same entry yourself.

To accept SVG uploads, remove `image/svg+xml` from `deniedTypes` in your `config/plugins.*` file. Serve the resulting files from a domain that does not share cookies or local storage with your application, or with a `Content-Disposition: attachment` header, so an uploaded SVG cannot run scripts in the context of your site.

:::note
You can use `allowedTypes` and `deniedTypes` separately or together to fine-tune which files are accepted. Files must match an allowed type and must not match any denied type. If you use a wildcard like `*` in `allowedTypes`, you can narrow down the validation by specifying exceptions in `deniedTypes`.
:::

You can provide them by creating or editing [the `/config/plugins` file](/cms/configurations/plugins). The following is an example of how to combine `allowedTypes` and `deniedTypes`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = {
  // ...
  upload: {
    config: {
      security: {
        allowedTypes: ['image/*', 'application/*'],
        deniedTypes: ['application/x-sh', 'application/x-dosexec']
      },
    }
  }
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
export default {
  // ...
  upload: {
    config: {
      security: {
        allowedTypes: ['image/*', 'application/*'],
        deniedTypes: ['application/x-sh', 'application/x-dosexec']
      },
    }
  }
};
```

</TabItem>

</Tabs>

<details>
<summary>Security defaults generated by <code>create-strapi-app</code></summary>

New projects declare the 2 lists as separate variables and pass them to the `upload` plugin, alongside the other generated plugin configuration:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"
import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  // ...
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
```

</TabItem>

</Tabs>

</details>

#### Upload request timeout

By default, the value of `strapi.server.httpServer.requestTimeout` is set to 330 seconds. This includes uploads.

To make it possible for users with slow internet connection to upload large files, it might be required to increase this timeout limit. The recommended way to do it is by setting the `http.serverOptions.requestTimeout` parameter in [the `config/servers` file](/cms/configurations/server).

An alternate method is to set the `requestTimeout` value in [the `bootstrap` function](/cms/configurations/functions#bootstrap) that runs before Strapi gets started. This is useful in cases where it needs to change programmatically, for example to temporarily disable and re-enable it:

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

#### Concurrent file uploads {#concurrent-file-uploads}

2 options control how many files Strapi handles at the same time during a bulk upload:

| Parameter | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| `concurrentUploadRequests` | Number of files the admin panel uploads to the server in parallel. | Integer | `1` |
| `concurrentUploadSize` | Number of files the server processes in parallel within a single upload request. | Integer | `1` |

Both default to `1`, so files are uploaded and processed one at a time. Raising either value makes bulk uploads faster at the cost of higher memory usage on the client and on the server respectively.

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/config/plugins.js"
module.exports = () => ({
  upload: {
    config: {
      // highlight-start
      concurrentUploadRequests: 4,
      concurrentUploadSize: 2,
      // highlight-end
    },
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/plugins.ts"
export default () => ({
  upload: {
    config: {
      // highlight-start
      concurrentUploadRequests: 4,
      concurrentUploadSize: 2,
      // highlight-end
    },
  },
});
```

</TabItem>
</Tabs>

:::caution
Both values must be integers greater than or equal to 1. Any other value, `0` included, prevents Strapi from starting.
:::

:::note
`concurrentUploadRequests` is read by the admin panel of the beta Media Library. With the `betaMediaLibrary` future flag disabled, files are uploaded one at a time whatever the value.
:::

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

```ts title="/config/plugins.ts"
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

#### Sharp configuration

The `sharp` option configures the <ExternalLink to="https://sharp.pixelplumbing.com/" text="sharp"/> image processing library used for generating responsive image formats. Adjusting these settings can help reduce memory usage during image processing, which is particularly useful for memory-constrained environments.

| Parameter | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| `cache` | Enables or disables <ExternalLink to="https://sharp.pixelplumbing.com/api-utility#cache" text="libvips' operation cache"/>. Disabling the cache reduces memory usage. | Boolean | `false` |
| `concurrency` | Sets the number of threads <ExternalLink to="https://sharp.pixelplumbing.com/api-utility#concurrency" text="libvips uses for image processing"/>. Lower values reduce peak memory usage but may slow down processing. | Integer | `1` |

The default values (`cache: false`, `concurrency: 1`) are optimized for low memory usage. For environments with more available memory, you can enable caching and increase concurrency to improve image processing performance:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  upload: {
    config: {
      sharp: {
        cache: true,
        concurrency: 4,
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
      sharp: {
        cache: true,
        concurrency: 4,
      },
    },
  },
});
```

</TabItem>

</Tabs>

## Usage

**Path to use the feature:** <Icon name="images" /> Media Library

The Media Library displays all assets uploaded in the application, either via the <Icon name="images" /> Media Library itself or via the <Icon name="feather" /> Content Manager when managing a media field.

Assets uploaded to the Media Library can be inserted into content-types using the [Content Manager](/cms/features/content-manager#creating--writing-content).

:::info
Strapi supports uploading images from the admin panel or programmatically. From the API, you can send a multipart/form-data request to `/api/upload` with the image file and optional `fileInfo` metadata for captions and alt text (see [REST API documentation](/cms/api/rest/upload#upload-files) for more information).
:::

### Interface overview

<ThemedImage
  alt="Media Library interface, annotated"
  sources={{
    light: '/img/assets/media-library/media-library_ui-overview.png',
    dark: '/img/assets/media-library/media-library_ui-overview_DARK.png',
  }}
/>

The Media Library is organized in the following areas:

- A **folder tree** <ScreenshotNumberReference number="1" /> on the left lists _Home_ and the full folder hierarchy. Clicking a folder displays its content, and clicking the <Icon name="caret-right" classes="ph-bold" /> button next to a folder name expands or collapses its subfolders (see [navigating folders](#navigating-folders)).
- The **page title** <ScreenshotNumberReference number="2" /> names the location you are currently browsing, either _Home_ or a folder name, followed by the number of assets it contains.
- The **New** button <ScreenshotNumberReference number="3" /> creates a folder or uploads assets (see [adding assets](#adding-assets) and [organizing assets with folders](#organizing-assets-with-folders)).
- The **toolbar** <Icon name="funnel-simple" classes="ph-bold" /> <Icon name="magnifying-glass" classes="ph-bold" /> <ScreenshotNumberReference number="4" /> filters, searches and sorts the list, and switches between the grid view <Icon name="squares-four" /> and the table view <Icon name="list" classes="ph-bold" /> (see [finding assets](#finding-assets) and [switching views](#switching-views)).
- The **list** <ScreenshotNumberReference number="5" /> displays the folders and assets of the current location. Additional assets load as you scroll.

Each folder and asset in the list has a checkbox to select it (see [selecting items](#selecting-items)) and a <Icon name="dots-three" classes="ph-bold" /> **More actions** button that opens a menu of actions for that single item (see [asset and folder actions](#item-actions)).

:::note
The Media Library stores what you are looking at in the page URL: the current folder, search term, filters, sort order, and open asset. Copying the URL and sharing it with another user of the same Strapi project gives them the same view.
:::

#### Switching views

The list displays either as a grid of cards or as a table. Click **Grid view** <Icon name="squares-four" /> or **Table view** <Icon name="list" classes="ph-bold" /> in the toolbar to switch. Your choice is remembered in your browser for the next visit.

The table view displays a _name_, _Creation Date_, _Last Modified_ and _size_ column for each item, along with a **Select all** checkbox in the header row and the <Icon name="dots-three" classes="ph-bold" /> **More actions** button. Assets that are missing a caption or an alternative text are flagged with a warning icon.

<ThemedImage
  alt="Media Library table view"
  sources={{
    light: '/img/assets/media-library/media-library_table-view.png',
    dark: '/img/assets/media-library/media-library_table-view_DARK.png',
  }}
/>

:::note
Column headers in the table view are labels, not sort controls. Use the toolbar's **Sort** menu to change the order (see [sorting assets](#sorting-assets)).
:::

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

SVG files are denied by default in projects generated with Strapi <VersionBadge version="5.52.2+" noTooltip /> and later, even though they match the supported image types (see [SVG uploads](#svg-uploads)).

</details>

Assets are always uploaded to the location you are currently browsing. Navigate to the target folder before uploading, or move the assets afterwards (see [moving assets and folders](#moving-items)).

There are 3 ways to add assets.

#### Uploading files from your computer

<ThemedImage
  alt="New button menu"
  sources={{
    light: '/img/assets/media-library/media-library_new-menu.png',
    dark: '/img/assets/media-library/media-library_new-menu_DARK.png',
  }}
/>

1. Click the **New** button in the upper right corner of the Media Library.
2. Click **File upload**.
3. Select one or several files in your system's file browser and confirm.

The upload starts immediately and its progress is reported in the upload dialog (see [following upload progress](#upload-progress)).

#### Uploading files by drag and drop

Drag one or several files from your computer onto the Media Library. A **Drop here to upload to** overlay confirms the destination folder before you release them.

<ThemedImage
  alt="Drag and drop upload overlay"
  sources={{
    light: '/img/assets/media-library/media-library_drag-drop-upload.png',
    dark: '/img/assets/media-library/media-library_drag-drop-upload_DARK.png',
  }}
/>

#### Uploading files from a URL

1. Click the **New** button in the upper right corner of the Media Library.
2. Click **File upload from URL**.
3. In the _URL(s)_ field, type or paste up to 20 URLs, one per line.
4. Click **Upload**.

Strapi downloads each file server-side and adds it to the current folder.

:::caution
URLs must use the `http` or `https` protocol, and must resolve to a publicly reachable address. URLs that resolve to a private or internal address, such as `localhost` or an address on your own network, are rejected to prevent server-side request forgery.
:::

#### Following upload progress {#upload-progress}

Uploads are reported in a dialog that lists every file of the batch with its own status, such as _Queued_, _Uploading..._ or _Uploaded_.

<ThemedImage
  alt="Upload progress dialog"
  sources={{
    light: '/img/assets/media-library/media-library_upload-progress.png',
    dark: '/img/assets/media-library/media-library_upload-progress_DARK.png',
  }}
/>

The dialog is available throughout the admin panel, not only in the Media Library, so you can navigate to another part of Strapi while a batch uploads. It offers the following controls:

| Control | Description |
| --- | --- |
| **Minimize** / **Maximize** | Collapses the dialog to a summary line, or expands it again. |
| **Cancel all** | Stops the whole batch. Files already uploaded are kept. |
| **Retry** | Restarts the files that failed. |
| **Close** | Dismisses the dialog once the batch is finished. |

Dropping more files while a batch is running adds them to that batch.

By default, files are uploaded one at a time. Increase [`concurrentUploadRequests`](#concurrent-file-uploads) to upload several files in parallel.

#### Automatically generating metadata with Strapi AI {#ai-powered-metadata-generation}
<GrowthBadge />

[When enabled](/cms/configurations/admin-panel#strapi-ai), Strapi AI automatically generates alternative text and captions for images uploaded to the Media Library, helping you improve content accessibility and SEO. The upload dialog reports the outcome for each file, such as _Uploaded • Metadata generated_ or _Upload complete • Metadata generation skipped_.

AI metadata generation only works with PNG, JPEG, WebP, HEIC and HEIF images. Other file types, including SVG, TIFF and GIF, are reported as skipped. The feature is enabled by default, but can be disabled in the [Media Library settings](#configuring-settings) if needed.

Metadata can also be generated for images that already exist in the library, either from the [Media Library settings](#configuring-settings) for images that lack alternative text or captions, or with the **Create metadata** bulk action for a specific selection (see [generating metadata in bulk](#bulk-metadata)).

<ThemedImage
  alt="AI metadata retroactive generation"
  sources={{
    light: '/img/assets/media-library/media-library_ai-metadata-retroactive.png',
    dark: '/img/assets/media-library/media-library_ai-metadata-retroactive_DARK.png',
  }}
/>

:::note Strapi AI credits
<StrapiAiCredits />
:::

### Finding assets

#### Searching assets

Type in the toolbar's **Search** field to find assets and folders by name.

<ThemedImage
  alt="Media Library search results"
  sources={{
    light: '/img/assets/media-library/media-library_search-results.png',
    dark: '/img/assets/media-library/media-library_search-results_DARK.png',
  }}
/>

The search covers the whole library, not only the folder you are browsing, and it returns both folders and assets. The page title becomes _Search results for "your term"_ followed by the number of folders and assets found.

To leave the search, click **Clear** next to the search field, or navigate to a folder in the folder tree.

#### Filtering assets

Click the **Filter** button in the toolbar to narrow the list. 3 filter fields are available:

| Filter field | Available values |
| --- | --- |
| _Type_ | _Folder_, _Picture_, _Audio_, _Video_, _Document_ |
| _Creation date_ | A relative preset, from _1 day ago_ to _1 year ago_, or a custom date range |
| _Last modified_ | A relative preset, from _1 day ago_ to _1 year ago_ |

<ThemedImage
  alt="Media Library filter menu"
  sources={{
    light: '/img/assets/media-library/media-library_filter-menu.png',
    dark: '/img/assets/media-library/media-library_filter-menu_DARK.png',
  }}
/>

To filter the list:

1. Click the **Filter** button in the toolbar.
2. Click a filter field.
3. Click a value. The list updates and the filter is added below the toolbar as a badge that reads, for instance, _Type is Picture_.
4. (_optional_) Repeat for another field. Several filters combine with an AND logic, so only the items matching every filter are displayed.

Each field supports a condition, which you change by clicking the condition segment of its badge:

| Filter field | Available conditions |
| --- | --- |
| _Type_ | _is_, _is not_ |
| _Creation date_, _Last modified_ | _is exactly_, _within the last_, _not within the last_ |

To remove a filter, click the <Icon name="x" classes="ph-bold" /> button on its badge. To remove all of them at once, click **Clear filters**.

:::note
Filters apply to the location you are browsing, not to the whole library. Use the [search](#searching-assets) to look across all folders.
:::

:::caution
A _Type_ filter also decides whether folders are displayed: filtering on any type other than _Folder_ hides all folders, and filtering on _Folder_ hides all assets.
:::

#### Sorting assets

Click the **Sort** button in the toolbar to change the order of the list. The button label always names the active rule, for instance _Sort: Most recent updates_.

<ThemedImage
  alt="Media Library sort menu"
  sources={{
    light: '/img/assets/media-library/media-library_sort-menu.png',
    dark: '/img/assets/media-library/media-library_sort-menu_DARK.png',
  }}
/>

The _Sort_ section offers 6 mutually exclusive rules: _Oldest uploads_, _Most recent updates_ (the default), _A to Z_, _Z to A_, _File size ascending_, and _File size descending_.

In the table view, an additional _Folders_ section controls where folders are displayed:

| Option | Description |
| --- | --- |
| _On top_ | Folders are grouped above the assets. This is the default. |
| _Mixed with files_ | Folders are interleaved with the assets, following the active sort rule. |

:::note
The grid view always groups folders above the assets, so the _Folders_ section is only displayed in the table view.
:::

### Managing individual assets {#managing-assets}

Click an asset in the list to open its details panel on the right side of the interface. The list stays visible and usable behind the panel.

<ThemedImage
  alt="Asset details panel"
  sources={{
    light: '/img/assets/media-library/media-library_asset-drawer.png',
    dark: '/img/assets/media-library/media-library_asset-drawer_DARK.png',
  }}
/>

The panel is organized as follows:

- A preview of the asset, with a <Icon name="crop" classes="ph-bold" /> **Crop** button for images (see [cropping images and setting a focus area](#cropping-images)).
- A read-only _File info_ section listing the _Creation date_, _Last updated_, _Created by_, _Size_, _Dimensions_, _Extension_ and _Asset ID_ of the asset.
- Editable fields: _File name_, _Location_, _Caption_ and _Alternative text_. Captions and alternative texts can be set on any file type, not only images.
- A row of action buttons at the bottom: <Icon name="trash" /> **Delete this file**, <Icon name="link" classes="ph-bold" /> **Copy link**, <Icon name="download-simple" /> **Download** and <Icon name="arrows-clockwise" classes="ph-bold" /> **Replace this file**, next to the **Save changes** button.

To edit an asset:

1. Click the asset in the list.
2. Update the _File name_, _Location_, _Caption_ or _Alternative text_ fields.
3. Click **Save changes**.

:::tip
The _Location_ field is the quickest way to move a single asset to another folder. See [moving assets and folders](#moving-items) for the other options.
:::

#### Asset and folder actions {#item-actions}

The <Icon name="dots-three" classes="ph-bold" /> **More actions** button on an asset or a folder opens a menu that acts on that item only, whatever is selected elsewhere in the list.

| Asset actions | Folder actions |
| --- | --- |
| **Replace media** | **Copy link to folder** |
| **Copy link to media** | **Rename folder** |
| **Download media** | **Move to folder** |
| **Move to folder** | **Delete folder** |
| **Delete** | |

#### Cropping images and setting a focus area {#cropping-images}

Cropping an image and choosing which part of it must always remain visible are done in the same editor. The focus area, also called focal point, keeps the most important part of an image visible when the image is cropped or resized by your front end.

<ThemedImage
  alt="Crop and focus area editor"
  sources={{
    light: '/img/assets/media-library/media-library_crop-focus.png',
    dark: '/img/assets/media-library/media-library_crop-focus_DARK.png',
  }}
/>

1. Click an image in the list to open its details panel.
2. Click the <Icon name="crop" classes="ph-bold" /> **Crop** button on the preview. The _Crop & Focus area_ editor opens.
3. Define the crop area by dragging the handles in the corners of the rectangle, or by typing exact values in the _Width (px)_ and _Height (px)_ fields. Click the <Icon name="link" classes="ph-bold" /> **Lock aspect ratio** button to resize both dimensions together.
4. Define the focus area by dragging the circle inside the crop rectangle, or by typing exact values in the _X_ and _Y_ fields.
5. Save your changes:
    - Click **Apply** to crop the original asset. The asset keeps its ID, so content already using it is updated.
    - Click **Save as copy** to keep the original untouched and create a new asset in the same folder. The copy inherits the caption and the alternative text of the original.

    Alternatively, click **Cancel** to leave the editor without changing anything.

:::note
The focus area is stored on the asset and returned by the API as a `focalPoint` value, so your front end can use it when it crops or resizes the image.
:::

:::note
The numeric fields are hidden on small screens. Set the crop and focus areas by dragging the rectangle and the circle directly on the image instead.
:::

#### Replacing an asset file

Replacing swaps the file behind an asset while keeping the asset itself, so every content entry already pointing at it keeps working.

1. Click the asset in the list to open its details panel.
2. Click the <Icon name="arrows-clockwise" classes="ph-bold" /> **Replace this file** button.
3. Click **Continue** in the confirmation dialog.
4. Select the new file in your system's file browser and confirm.

:::caution
The previous file is permanently replaced and cannot be recovered.
:::

#### Downloading assets and copying links

In the details panel of an asset, click the <Icon name="download-simple" /> **Download** button to save the file to your computer, or the <Icon name="link" classes="ph-bold" /> **Copy link** button to copy its URL to the clipboard. Both actions are also available from the asset's <Icon name="dots-three" classes="ph-bold" /> **More actions** menu.

#### Deleting assets

1. Click the asset in the list to open its details panel.
2. Click the <Icon name="trash" /> **Delete this file** button.
3. Click **Confirm**.

:::caution
Deleted files cannot be recovered. If a file is currently in use, the linked content breaks and image containers are left empty.
:::

Assets can also be deleted in bulk (see [deleting items in bulk](#bulk-delete)).

### Selecting several items and using bulk actions

#### Selecting items {#selecting-items}

Click the checkbox of a folder or an asset to select it. Assets and folders can be selected together.

<ThemedImage
  alt="Bulk actions bar"
  sources={{
    light: '/img/assets/media-library/media-library_bulk-actions.png',
    dark: '/img/assets/media-library/media-library_bulk-actions_DARK.png',
  }}
/>

The following shortcuts speed up selection:

| Shortcut | Description |
| --- | --- |
| `Cmd`/`Ctrl` + click | Adds an item to the selection or removes it. |
| `Shift` + click | Selects every item between the last selected item and the clicked one. |
| **Select all** checkbox | In the table view only, selects every item currently displayed. |

As soon as one item is selected, a bar reporting the number of selected items and offering the bulk actions is displayed at the bottom of the interface. Click **Clear selection** to empty it.

:::note
The selection survives switching between the grid and the table view, but it is emptied when you navigate to another folder or change the search, filters or sort order.
:::

#### Moving items in bulk {#bulk-move}

1. Select the assets and folders to move.
2. Click the **Move** button in the bulk actions bar.
3. In the _Move elements to_ dialog, select the destination in the _Location_ list.
4. Click **Move**.

Items can also be moved by drag and drop (see [moving assets and folders](#moving-items)).

#### Deleting items in bulk {#bulk-delete}

1. Select the assets and folders to delete.
2. Click the **Delete** button in the bulk actions bar.
3. Click **Confirm** in the dialog.

:::caution
Deleting a folder also deletes everything it contains, including its subfolders and their assets. None of it can be recovered.
:::

#### Generating metadata in bulk {#bulk-metadata}
<GrowthBadge />

When [Strapi AI](/cms/configurations/admin-panel#strapi-ai) is enabled, a **Create metadata** button in the bulk actions bar generates alternative texts and captions for the selected images.

1. Select the images to describe.
2. Click the **Create metadata** button in the bulk actions bar.

Metadata can be generated for up to 40 assets at a time. Only images are supported: selected folders are ignored, and selected files of another type are reported as skipped.

### Organizing assets with folders

Folders in the Media Library help you organize uploaded assets. From the Media Library, it is possible to browse folders, create new folders, rename them, move assets and folders, and delete folders.

:::note
Folders follow the permission system of assets (see [Users & Permissions feature](/cms/features/users-permissions)). It is not yet possible to define specific permissions for a folder.
:::

#### Navigating folders {#navigating-folders}

The folder tree on the left side of the interface lists the whole folder hierarchy.

<ThemedImage
  alt="Navigating folders with the folder tree"
  sources={{
    light: '/img/assets/media-library/media-library_folder-navigation.png',
    dark: '/img/assets/media-library/media-library_folder-navigation_DARK.png',
  }}
/>

- Click a folder name to display its content. The page title becomes the folder name followed by the number of assets it contains.
- Click the <Icon name="caret-right" classes="ph-bold" /> button next to a folder name to expand or collapse its subfolders.
- Click <Icon name="house" /> **Home** to go back to the root of the library.
- Click a folder in the list to open it, as with the folder tree.

There is no limit to how deep your folder hierarchy can go. The folder tree expands automatically to reveal the folder you are browsing.

#### Adding folders

1. Navigate to the location where the folder must be created.
2. Click the **New** button in the upper right corner of the Media Library.
3. Click **New folder**.
4. Type a name in the _Folder name_ field.
5. Click **Create folder**.

:::note
The dialog title names the parent folder, for instance _New folder in Home_. To create the folder somewhere else, cancel, navigate to the intended parent, and start again.
:::

#### Moving assets and folders {#moving-items}

Assets and folders can be moved in 3 ways:

- **By drag and drop**, which is the fastest for a few items. Drag an asset or a folder onto a folder in the list, or onto a folder of the folder tree, including <Icon name="house" /> **Home**. Hovering a folder of the tree for a moment expands it, so you can drop items into a subfolder in one gesture. Dragging one item of a selection moves the whole selection.
- **With the Move dialog**, which is best for many items at once (see [moving items in bulk](#bulk-move)). It is also available for a single item from its <Icon name="dots-three" classes="ph-bold" /> **More actions** menu.
- **From the details panel** of an asset, by changing its _Location_ field (see [managing individual assets](#managing-assets)).

:::note
A folder cannot be moved into itself or into one of its own subfolders. Invalid destinations are refused while you drag.
:::

:::tip
Drag and drop uses the pointer. To move items with the keyboard, use the **Move to folder** action of the <Icon name="dots-three" classes="ph-bold" /> **More actions** menu instead.
:::

#### Renaming folders

1. Click the <Icon name="dots-three" classes="ph-bold" /> **More actions** button of the folder.
2. Click **Rename folder**.
3. Type the new name in the _Folder name_ field.
4. Click **Save**.

:::note
2 folders sharing the same parent cannot have the same name.
:::

#### Deleting folders

1. Click the <Icon name="dots-three" classes="ph-bold" /> **More actions** button of the folder.
2. Click **Delete folder**.
3. Click **Confirm**.

:::caution
Deleting a folder also deletes its subfolders and every asset they contain. None of it can be recovered.
:::

Folders can also be deleted in bulk, together with assets (see [deleting items in bulk](#bulk-delete)).

### Usage with the REST API

The Media Library feature has some endpoints that can accessed through Strapi's REST API:

<CustomDocCardsWrapper>
<CustomDocCard icon="cube" title="Upload with the REST API" description="Learn how to use the Strapi's REST API to upload files through your code." link="/cms/api/rest/upload"/>
</CustomDocCardsWrapper>

### Use public assets in your code {#public-assets}

Public assets are static files (e.g., images, video, CSS files, etc.) that you want to make accessible to the outside world.

Because an API may need to serve static assets, every new Strapi project includes by default a folder named `/public`. Any file located in this directory is accessible if the request's path doesn't match any other defined route and if it matches a public file name (e.g. an image named `company-logo.png` in `/public/` is accessible through `/company-logo.png` URL).

:::tip
`index.html` files are served if the request corresponds to a folder name (`/pictures` url will try to serve `public/pictures/index.html` file).
:::

:::caution
The dotfiles are not exposed. It means that every file name that starts with `.`, such as `.htaccess` or `.gitignore`, are not served.
:::
