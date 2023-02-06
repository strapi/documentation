---
title: Upload - Strapi Developer Docs
description: Upload any kind of file on your server or external providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/upload.html
---

# Upload

The Upload plugin is the backend powering the Media Library plugin available by default in the Strapi admin panel. Using either the Media Library from the admin panel or the upload API directly, you can upload any kind of file for use in your Strapi application.

By default Strapi provides a [provider](../development/providers.md) that uploads files to a local directory. Additional providers are available should you want to upload your files to another location.

The providers maintained by Strapi include:

- [Amazon S3](https://market.strapi.io/providers/@strapi-provider-upload-aws-s3)
- [Cloudinary](https://market.strapi.io/providers/@strapi-provider-upload-cloudinary)
- [Local](https://www.npmjs.com/package/@strapi/provider-upload-local)

## Configuration

This section details configuration options for the default upload provider. If using another provider (e.g. AWS S3 or Cloudinary), see the available configuration parameters in that provider's documentation.

### Local server

By default Strapi accepts `localServer` configurations for locally uploaded files. These will be passed as the options for [koa-static](https://github.com/koajs/static).

You can provide them by creating or editing the `./config/plugins.js` file. The following example sets the `max-age` header.

<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/plugins.js

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

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/plugins.ts

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

</code-block>

</code-group>

### Max file size

Currently the Strapi middleware in charge of parsing requests needs to be configured to support file sizes larger than the default of 200MB in addition to provider options passed to the upload plugin for sizeLimit.

:::caution
You may also need to adjust any upstream proxies, load balancers, or firewalls to allow for larger file sizes.<br>
(e.g. [Nginx](http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size) has a config setting called `client_max_body_size` that will need to be adjusted since it's default is only 1mb.)
:::

The library we use is [`koa-body`](https://github.com/dlau/koa-body), and it uses the [`node-formidable`](https://github.com/felixge/node-formidable) library to process files.

You can pass configuration to the middleware directly by setting it in the [`body` middleware](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#body) configuration in `./config/middlewares.js`:

<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/middlewares.js

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

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/middlewares.ts

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

</code-block>

</code-group>

In addition to the middleware configuration, you can pass the `sizeLimit`, which is an integer in bytes, in the [plugin configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) in `./config/plugins.js`:

<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/plugins.js

module.exports = {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
    }
  }
};
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/plugins.ts

export default {
  // ...
  upload: {
    config: {
      providerOptions: {
        sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
      }
    }
  }
};
```

</code-block>

</code-group>

### Responsive Images

When the `Enable responsive friendly upload` setting is enabled in the settings panel the plugin will generate the following responsive image sizes:
| Name    | Largest Dimension |
| :------ | :--------- |
| large   | 1000px     |
| medium  | 750px      |
| small   | 500px      |

These sizes can be overridden in `./config/plugins.js`:

<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/plugins.js

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

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/plugins.ts

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

</code-block>

</code-group>


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

::: note
[Folders](/user-docs/latest/media-library/organizing-assets-with-folders.md) are an admin panel feature and are not part of the REST or the GraphQL API. Files uploaded through the REST or GraphQL API are located in the automatically created "API Uploads" folder.
:::

## Examples

### Upload files

Upload one or more files to your application.

The following parameters are accepted:

- `files`: The file(s) to upload. The value(s) can be a Buffer or Stream.

<code-group>

<code-block title="BROWSER">

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

</code-block>

<code-block title="NODE.JS">

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

</code-block>

</code-group>

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

```json
// path: ./src/api/restaurant/content-types/restaurant/schema.json

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

The corresponding code would be:

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

### Upload files at entry creation

You can also add files during your entry creation.

For example, given the `Restaurant` model attributes:

```json
// path: ./src/api/restaurant/content-types/restaurant/schema.json

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

The corresponding code would be:

```html
<form>
  <!-- Can be multiple files if you setup "collection" instead of "model" -->
  <input type="text" name="name" />
  <input type="file" name="cover" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {};
    const formData = new FormData();

    form.elements
      .forEach(({ name, type, value, files, ...element }) => {
        if (!['submit', 'file'].includes(type)) {
          data[name] = value;
        } else if (type === 'file') {
          files.forEach((file) => {
            formData.append(`files.${name}`, file, file.name);
          });
        }
      });

    formData.append('data', JSON.stringify(data));

    await fetch('/api/restaurants', {
      method: 'post',
      body: formData
    });
  });
</script>
```

Your entry data has to be contained in a `data` key and you need to `JSON.stringify` this object. The keys for files need to be prefixed with `files` (e.g. for a cover attribute: `files.cover`).

::: tip
If you want to upload files for a repeatable component, you will have to specify the zero-based index of the item you want to add the file to, using the following syntax: `files.my_component_name[the_index].attribute_name`. For instance, if you put 3 components and the file is for the second one, the index will be 1.
:::

:::caution
You have to send FormData in your request body.
:::

### Models definition

Adding a file attribute to a model (or the model of another plugin) is like adding a new association.

In the first example below, you will be able to upload and attach one file to the avatar attribute.

```json
// path: ./src/api/restaurant/content-types/restaurant/schema.json

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

```json
// path: ./src/api/restaurant/content-types/restaurant/schema.json

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
