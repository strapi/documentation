---
title: Upload plugin
displayed_sidebar: cmsSidebar
description: Upload any kind of file on your server or external providers.
tags:
- localServer
- provider
- plugins
- Upload plugin
- REST API 

---

# Upload plugin

The Upload plugin is the backend powering the Media Library available by default in the Strapi admin panel. The Upload plugin is installed by default and can not be uninstalled. Using either the Media Library from the admin panel or the upload API directly, you can upload any kind of file for use in your Strapi application.

By default Strapi provides a [provider](/cms/providers) that uploads files to a local directory, which by default will be `public/uploads/` in your Strapi project. Additional providers are available should you want to upload your files to another location.

The providers maintained by Strapi include:

- <ExternalLink to="https://market.strapi.io/providers/@strapi-provider-upload-aws-s3" text="Amazon S3"/>
- <ExternalLink to="https://market.strapi.io/providers/@strapi-provider-upload-cloudinary" text="Cloudinary"/>
- <ExternalLink to="https://www.npmjs.com/package/@strapi/provider-upload-local" text="Local"/>

## Configuration

This section details configuration options for the default upload provider. If using another provider (e.g. AWS S3 or Cloudinary), see the available configuration parameters in that provider's documentation.

### Local server

By default Strapi accepts `localServer` configurations for locally uploaded files. These will be passed as the options for <ExternalLink to="https://github.com/koajs/static" text="koa-static"/>.

You can provide them by creating or editing the `./config/plugins.js` file. The following example sets the `max-age` header.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/plugins.js"

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

```ts title="./config/plugins.ts"

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

### Max file size

Currently the Strapi middleware in charge of parsing requests needs to be configured to support file sizes larger than the default of 200MB in addition to provider options passed to the upload plugin for sizeLimit.

:::caution
You may also need to adjust any upstream proxies, load balancers, or firewalls to allow for larger file sizes.<br/>
(e.g. <ExternalLink to="http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size" text="Nginx"/> has a config setting called `client_max_body_size` that will need to be adjusted since it's default is only 1mb.)
:::

The library we use is <ExternalLink to="https://github.com/dlau/koa-body" text="`koa-body`"/>, and it uses the <ExternalLink to="https://github.com/felixge/node-formidable" text="`node-formidable`"/> library to process files.

You can pass configuration to the middleware directly by setting it in the [`body` middleware](/cms/configurations/middlewares#body) configuration in `./config/middlewares.js`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./config/middlewares.js"

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

```js title="path: ./config/middlewares.ts"

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

In addition to the middleware configuration, you can pass the `sizeLimit`, which is an integer in bytes, in the [plugin configuration](/cms/configurations/plugins) in `./config/plugins.js`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./config/plugins.js"

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

```js title="path: ./config/plugins.ts"

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

### Limit concurrent uploads

By default, Strapi does not limit concurrent uploads into the media library. On low ram environments, you might face some Out Of Memory (OOM). This setting is dedicated to limit the concurrency of uploads to 1 to reduce the stress on the ram with sharp

<Tabs>

<TabItem value="typescript" label="TypeScript">

```js title="path: ./config/plugins.ts"

export default {
  // ...
  upload: {
    config: {
      limitConcurrentUploads: true
    }
  }
};
```

</TabItem>

</Tabs>


### Upload request timeout

By default, the value of `strapi.server.httpServer.requestTimeout` is set to 330 seconds. This includes uploads. To make it possible for users with slow internet connection to upload large files, it might be required to increase this timeout limit. The recommended way to do it is by setting the `http.serverOptions.requestTimeout` parameter in the `config/server.js|ts` file (see [server configuration](/cms/configurations/server).
An alternate method is to set the `requestTimeout` value in the `bootstrap` function that runs before Strapi gets started. This is useful in cases where it needs to change programmatically — for example, to temporarily disable and re-enable it:


<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./index.js"

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

```ts title="path: ./index.ts"

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


### Responsive Images

When the `Enable responsive friendly upload` setting is enabled in the settings panel the plugin will generate the following responsive image sizes:

| Name    | Largest Dimension |
| :------ | :--------- |
| large   | 1000px     |
| medium  | 750px      |
| small   | 500px      |

These sizes can be overridden in `./config/plugins.js`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./config/plugins.js"

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

```js title="path: ./config/plugins.ts"

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

## Endpoints

<style lang="stylus">
#endpoint-table
  table
    display table
    width 100%

  tr
    border none
    &:nth-child(2n)
      background-color white

  tbody
    tr
      border-top 1px solid #dfe2e5

  th, td
    border none
    padding 1.2em 1em
    border-right 1px solid #dfe2e5
    &:last-child
      border-right none
</style>

<div id="endpoint-table">

| Method | Path                  | Description         |
| :----- | :-------------------- | :------------------ |
| GET    | /api/upload/files     | Get a list of files |
| GET    | /api/upload/files/:id | Get a specific file |
| POST   | /api/upload           | Upload files        |
| POST   | /api/upload?id=x      | Update fileInfo    |
| DELETE | /api/upload/files/:id | Delete a file       |

</div>

:::note Notes
- [Folders](/cms/features/media-library#organizing-assets-with-folders) are an admin panel-only feature and are not part of the Content API (REST or GraphQL). Files uploaded through REST are located in the automatically created "API Uploads" folder.
- The GraphQL API does not support uploading media files. To upload files, use the REST API or directly add files from the [Media Library](/cms/features/media-library) in the admin panel. Some GraphQL mutations to update or delete uploaded media files are still possible (see [GraphQL API documentation](/cms/api/graphql#mutations-on-media-files) for details).
:::

## Examples

<br/>

### Upload files

Upload one or more files to your application.

The following parameters are accepted:

- `files`: The file(s) to upload. The value(s) can be a Buffer or Stream.

<Tabs>
<TabItem value="browser" label="BROWSER">

```html
<form>
  <!-- Can be multiple files -->
  <input type="file" name="files" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch('/api/upload', {
      method: 'post',
      body: new FormData(e.target)
    });
  });
</script>
```

</TabItem>

<TabItem value="node.js" label="NODE.JS">

```js
import { FormData } from 'formdata-node';
import fetch, { blobFrom } from 'node-fetch';

const file = await blobFrom('./1.png', 'image/png');
const form = new FormData();

form.append('files', file, "1.png");

const response = await fetch('http://localhost:1337/api/upload', {
  method: 'post',
  body: form,
});

```

</TabItem>

</Tabs>

:::caution
You have to send FormData in your request body.
:::

### Upload entry files

Upload one or more files that will be linked to a specific entry.

The following parameters are accepted:

| Parameter | Description |
| --------- | ----------- |
|`files`    | The file(s) to upload. The value(s) can be a Buffer or Stream. |
|`path` (optional) | The folder where the file(s) will be uploaded to (only supported on strapi-provider-upload-aws-s3). |
| `refId` | The ID of the entry which the file(s) will be linked to. |
| `ref` | The unique ID (uid) of the model which the file(s) will be linked to (see more below). |
| `source` (optional) | The name of the plugin where the model is located. |
| `field` | The field of the entry which the file(s) will be precisely linked to. |

For example, given the `Restaurant` model attributes:

```json title="path: ./src/api/restaurant/content-types/restaurant/schema.json"

{
  // ...
  "attributes": {
    "name": {
      "type": "string"
    },
    "cover": {
      "type": "media",
      "multiple": false,
    }
  }
// ...
}
```

The corresponding code is be:

```html
<form>
  <!-- Can be multiple files if you setup "collection" instead of "model" -->
  <input type="file" name="files" />
  <input type="text" name="ref" value="api::restaurant.restaurant" />
  <input type="text" name="refId" value="5c126648c7415f0c0ef1bccd" />
  <input type="text" name="field" value="cover" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    await fetch('/api/upload', {
      method: 'post',
      body: new FormData(e.target)
    });
  });
</script>
```

:::caution
You have to send FormData in your request body.
:::

### Models definition

Adding a file attribute to a model (or the model of another plugin) is like adding a new association.

In the first example below, you will be able to upload and attach one file to the avatar attribute.

```json title="path: ./src/api/restaurant/content-types/restaurant/schema.json"

{
  // ...
  {
    "attributes": {
      "pseudo": {
        "type": "string",
        "required": true
      },
      "email": {
        "type": "email",
        "required": true,
        "unique": true
      },
      "avatar": {
        "type": "media",
        "multiple": false,
      }
    }
  }
  // ...
}

```

In our second example, you can upload and attach multiple pictures to the restaurant.

```json title="path: ./src/api/restaurant/content-types/restaurant/schema.json"

{
  // ...
  {
    "attributes": {
      "name": {
        "type": "string",
        "required": true
      },
      "covers": {
        "type": "media",
        "multiple": true,
      }
    }
  }
  // ...
}
```

### Update fileInfo

Update a file in your application.

The following parameters are accepted:

- `fileInfo`: The fileInfo to update.

```js
import { FormData } from 'formdata-node';
import fetch from 'node-fetch';

const fileId = 50;
const newFileData = {
  alternativeText: 'My new alternative text for this image!',
};

const form = new FormData();

form.append('fileInfo', JSON.stringify(newFileData));

const response = await fetch(`http://localhost:1337/api/upload?id=${fileId}`, {
  method: 'post',
  body: form,
});

```
