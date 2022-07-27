---
title: Upload - Strapi Developer Docs
description: Upload any kind of file on your server or external providers.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/upload.html
---

# Upload

The Upload plugin is the backend powering the Media Library plugin available by default in the Strapi admin panel. Using either the Media Library from the admin panel or the upload API directly, you can upload any kind of file for use in your Strapi application.

By default Strapi provides a [provider](../development/providers.md) that uploads files to a local directory. Additional providers are available should you want to upload your files to another location.

The providers maintained by Strapi include:

- [Amazon S3](https://www.npmjs.com/package/@strapi/provider-upload-aws-s3)
- [Cloudinary](https://www.npmjs.com/package/@strapi/provider-upload-cloudinary)
- [Local](https://www.npmjs.com/package/@strapi/provider-upload-local)
- [Rackspace](https://www.npmjs.com/package/@strapi/provider-upload-rackspace)

## Configuration

This section details configuration options for the default upload provider. If using another provider (e.g. AWS S3 or Rackspace), see the available configuration parameters in that provider's documentation.

### Local server

By default Strapi accepts `localServer` configurations for locally uploaded files. These will be passed as the options for [koa-static](https://github.com/koajs/static).

You can provide them by creating or editing the `./config/plugins.js` file. The following example sets the `max-age` header.

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

module.exports = {
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
};
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/middlewares.js

export default {
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
};
```

</code-block>

</code-group>

In addition to the middleware configuration, you can pass the `sizeLimit`, which is an integer in bytes, in the `providerOptions` of the [plugin configuration](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md) in `./config/plugins.js`:

```js
// path: ./config/plugins.js
module.exports = {
  // ...
  upload: {
    config: {
      providerOptions: {
        sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
      }
    }
  }
}
```

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
If you want to upload files for a component, you will have to specify the index of the item you want to add the file to: `files.my_component_name[the_index].attribute_name`
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

## Using a provider

By default Strapi provides a provider that uploads files to a local directory. You might want to upload your files to another provider like AWS S3.

Below are the providers maintained by the Strapi team:

- [Amazon S3](https://www.npmjs.com/package/@strapi/provider-upload-aws-s3)
- [Cloudinary](https://www.npmjs.com/package/@strapi/provider-upload-cloudinary)
- [Local](https://www.npmjs.com/package/@strapi/provider-upload-local)
- [Rackspace](https://www.npmjs.com/package/@strapi/provider-upload-rackspace)

You can also find additional community maintained providers on [NPM](https://www.npmjs.com/).

To install a new provider run:

<code-group>

<code-block title="NPM">
```sh
npm install @strapi/provider-upload-aws-s3 --save
```
</code-block>

<code-block title="YARN">
```sh
yarn add @strapi/provider-upload-aws-s3
```
</code-block>

</code-group>

### Local server

By default Strapi accepts `localServer` configurations for locally uploaded files. They will be passed as the options for [koa-static](https://github.com/koajs/static).

You can provide them by create or edit the file at `./config/plugins.js`. The example below set `max-age` header.

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

export default ({ env })=>({
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

### Enabling the provider

To enable the provider, create or edit the file at `./config/plugins.js`

::: note
When using community providers, pass the full package name to the `provider` key (e.g. `provider: 'strapi-provider-upload-google-cloud-storage'`). Only Strapi-maintained providers can use the shortcode format (e.g. `provider: 'aws-s3'`).
:::

<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
  // ...
});
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/plugins.ts

export default ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
  // ...
});
```

</code-block>

</code-group>

Make sure to read the provider's `README` to know what are the possible parameters.

:::caution
Strapi has a default Security Middleware that has a very strict `contentSecurityPolicy` that limits loading images and media to `"'self'"` only, see the example configuration on the provider page or take a look at our [middleware documentation](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#loading-order) for more information.
:::

### Configuration per environment

When configuring your upload provider you might want to change the configuration based on the `NODE_ENV` environment variable or use environment specific credentials.

You can set a specific configuration in the `./config/env/{env}/plugins.js` configuration file and it will be used to overwrite the one in the default configuration.

## Create providers

You can create a Node.js module to implement a custom provider. Read the official documentation [here](https://docs.npmjs.com/creating-node-js-modules).

Your provider needs to export the following interface:

<code-group>

<code-block title="JAVASCRIPT">

```js
module.exports = {
  init(providerOptions) {
    // init your provider if necessary

    return {
      upload(file) {
        // upload the file in the provider
        // file content is accessible by `file.buffer`
      },
      uploadStream(file) {
        // upload the file in the provider
        // file content is accessible by `file.stream`
      },
      delete(file) {
        // delete the file in the provider
      },
    };
  },
};
```

</code-block>

<code-block title="TYPESCRIPT">

```js
export default {
  init(providerOptions) {
    // init your provider if necessary

    return {
      upload(file) {
        // upload the file in the provider
        // file content is accessible by `file.buffer`
      },
      uploadStream(file) {
        // upload the file in the provider
        // file content is accessible by `file.stream`
      },
      delete(file) {
        // delete the file in the provider
      },
    };
  },
};
```
</code-block>

</code-group>


:::tip
For performance reasons, the upload plugin will only use the `uploadStream` function if it exists, otherwise it will fallback on the `upload` function.
:::

You can then publish it to make it available to the community.

### Create a local provider

If you want to create your own provider without publishing it on **npm** you can follow these steps:

1. Create a `./providers/upload-{provider-name}` folder in your root application folder.
2. Create your provider as explained in the [documentation](#create-providers) above.
3. Update your `package.json` to link your `upload-{provider-name}` dependency to point to the [local path](https://docs.npmjs.com/files/package.json#local-paths) of your provider:

```json
// path: ./package.json

{
  ...
  "dependencies": {
    ...
    "@strapi/provider-upload-{provider-name}": "file:providers/upload-{provider-name}"
    ...
  }
}
```

4. Update the Upload plugin configuration:

<code-group>

<code-block title="JAVASCRIPT">

```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: '{provider-name}',
      providerOptions: {},
    },
  },
  // ...
});
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/plugins.ts

export default ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: '{provider-name}',
      providerOptions: {},
    },
  },
  // ...
});
```
</code-block>

</code-group>


5. Run `yarn install` or `npm install` to install your new custom provider.
